import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

const sendEmail = (payload: object) =>
  fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

export async function POST(req: NextRequest) {
  try {
    const {
      enquiryType,
      companyName,
      contactPerson,
      email,
      phone,
      quantity,
      message,
      website, // honeypot — real users never fill this
    } = await req.json();

    if (website) {
      // Bot filled the hidden field — pretend success, do nothing.
      return NextResponse.json({ success: true });
    }

    if (!enquiryType || !companyName || !contactPerson || !email || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (enquiryType !== 'wholesale' && enquiryType !== 'corporate') {
      return NextResponse.json({ error: 'Invalid enquiry type' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from('bulk_order_enquiries').insert({
      enquiry_type: enquiryType,
      company_name: companyName,
      contact_person: contactPerson,
      email,
      phone,
      quantity,
      message,
    });

    if (error) {
      console.error('Failed to save bulk order enquiry:', error);
      return NextResponse.json({ error: 'Failed to save enquiry' }, { status: 500 });
    }

    if (process.env.NEXT_PUBLIC_EMAILJS_CONTACT_TEMPLATE_ID) {
      // Reuses the existing "Reach Us" contact template/service (its own template
      // is limited by EmailJS's free-tier template cap) — mapped into its existing
      // name/email/phone/enquiryType/location/message fields so it works with zero
      // template changes. company_name/contact_person/quantity are sent alongside
      // too, so the template can optionally display them if those tags are added later.
      sendEmail({
        service_id: process.env.NEXT_PUBLIC_EMAILJS_CONTACT_SERVICE_ID,
        template_id: process.env.NEXT_PUBLIC_EMAILJS_CONTACT_TEMPLATE_ID,
        user_id: process.env.NEXT_PUBLIC_EMAILJS_CONTACT_PUBLIC_KEY,
        accessToken: process.env.EMAILJS_PRIVATE_KEY,
        template_params: {
          name: `${contactPerson} — ${companyName}`,
          email,
          phone,
          enquiryType,
          location: 'Bulk Order Enquiry',
          message: `Quantity needed: ${quantity || 'Not specified'}\n\n${message || '(no message)'}`,
          company_name: companyName,
          contact_person: contactPerson,
          quantity: quantity || 'Not specified',
        },
      }).catch((err) => console.error('Bulk order notification email failed:', err));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Bulk order enquiry error:', err);
    return NextResponse.json({ error: 'Failed to submit enquiry' }, { status: 500 });
  }
}
