import Razorpay from 'razorpay';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, getAuthorizedUser } from '@/lib/supabase/server';
import { getActiveGiftPromotions, isBuy2Get1Enabled } from '@/lib/promotions';
import { calculateOrderPricing } from '@/lib/orderPricing';
import { isFlashSaleLive } from '@/lib/flashSale';
import { CartItem, FlashSale } from '@/types';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

export async function POST(req: NextRequest) {
  try {
    // Checkout already required login in the UI — this closes the gap where the API
    // itself could be called directly without a session, which the flash-sale's
    // "1 per account" and lead-capture logic both depend on.
    const user = await getAuthorizedUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    const { cart, selectedOfferType, customerDetails }: {
      cart: { id: number; quantity: number }[];
      selectedOfferType: 'buy2get1' | number | null;
      customerDetails: CustomerDetails;
    } = await req.json();

    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }
    if (!customerDetails?.name || !customerDetails?.email || !customerDetails?.phone) {
      return NextResponse.json({ error: 'Missing customer details' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Real prices, fetched fresh — never trust what the client sends for money.
    const ids = cart.map((line) => line.id);
    const { data: products, error: productsError } = await supabase.from('products').select('*').in('id', ids);
    if (productsError || !products || products.length !== new Set(ids).size) {
      return NextResponse.json({ error: 'One or more products not found' }, { status: 400 });
    }

    const fullCart: CartItem[] = cart.map((line) => {
      const product = products.find((p) => p.id === line.id)!;
      return { ...product, quantity: line.quantity };
    });

    const [buy2Get1Enabled, eligibleGiftPromotions, { data: flashSaleRow }] = await Promise.all([
      isBuy2Get1Enabled(supabase),
      getActiveGiftPromotions(supabase),
      supabase.from('flash_sales').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ]);
    const flashSale = (flashSaleRow as FlashSale | null) ?? null;

    let flashEligible = false;
    if (isFlashSaleLive(flashSale)) {
      const { data: existingClaim } = await supabase
        .from('flash_sale_claims')
        .select('status')
        .eq('flash_sale_id', flashSale.id)
        .eq('user_id', user.id)
        .maybeSingle();
      flashEligible = existingClaim?.status !== 'confirmed';
    }

    const pricing = calculateOrderPricing({
      cart: fullCart,
      buy2Get1Enabled,
      eligibleGiftPromotions,
      selectedOfferType: selectedOfferType ?? null,
      flashSale,
      flashEligible,
    });

    if (pricing.total <= 0) {
      return NextResponse.json({ error: 'Invalid order total' }, { status: 400 });
    }

    const flashApplied = pricing.lines.some((line) => line.flashUnits > 0);

    // Create the Razorpay order for the server-computed total — this is the amount that
    // actually gets charged, regardless of anything the client displayed or sent.
    const order = await razorpay.orders.create({
      amount: Math.round(pricing.total * 100),
      currency: 'INR',
      receipt: 'receipt_' + Date.now(),
      notes: {
        customer_name: customerDetails.name,
        email: customerDetails.email,
        phone: customerDetails.phone,
        addressLine1: customerDetails.addressLine1,
        addressLine2: customerDetails.addressLine2 ?? '',
        city: customerDetails.city,
        state: customerDetails.state,
        pincode: customerDetails.pincode,
      },
    });

    const fullAddress = `${customerDetails.addressLine1}${customerDetails.addressLine2 ? ', ' + customerDetails.addressLine2 : ''}, ${customerDetails.city}, ${customerDetails.state} - ${customerDetails.pincode}`;

    const displayItems = [
      ...fullCart.map((item) => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity, image: item.image })),
      ...(pricing.giftItem
        ? [{ id: pricing.giftItem.id, name: pricing.giftItem.name, price: 0, quantity: pricing.giftItem.quantity, image: pricing.giftItem.image }]
        : []),
    ];

    // Persist the full computed snapshot now — verify-payment and the webhook just read
    // this row back rather than recomputing pricing a second time, so what Razorpay
    // actually charged and what's stored can never diverge.
    const { error: insertError } = await supabase.from('orders').insert({
      razorpay_order_id: order.id,
      razorpay_payment_id: '',
      customer_name: customerDetails.name,
      customer_email: customerDetails.email,
      customer_phone: customerDetails.phone,
      address: {
        line1: customerDetails.addressLine1,
        line2: customerDetails.addressLine2,
        city: customerDetails.city,
        state: customerDetails.state,
        pincode: customerDetails.pincode,
        full: fullAddress,
      },
      items: displayItems,
      subtotal: pricing.subtotal,
      discount: pricing.discount,
      total: pricing.total,
      status: 'pending',
      user_id: user.id,
      flash_sale_id: flashApplied ? flashSale!.id : null,
    });

    if (insertError) {
      console.error('Failed to save pending order:', insertError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // Interest is normally logged when the customer clicks "claim" on the product page;
    // insert defensively here too (idempotent — does nothing if a row already exists) in
    // case they reached checkout with the item in cart without that step ever firing.
    if (flashApplied) {
      await supabase
        .from('flash_sale_claims')
        .upsert({ flash_sale_id: flashSale!.id, user_id: user.id }, { onConflict: 'flash_sale_id,user_id', ignoreDuplicates: true });
    }

    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    console.error('Razorpay order creation failed:', err);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
