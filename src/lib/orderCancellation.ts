const CANCEL_WINDOW_DAYS = 2;
const CANCEL_WINDOW_MS = CANCEL_WINDOW_DAYS * 24 * 60 * 60 * 1000;

interface CancellableOrder {
  status: string;
  confirmed_at: string | null;
  delivered_at: string | null;
}

// Cancellable for 2 days from confirmation (covers 'confirmed' and 'processing' — still
// just being prepared), turns off once it ships (can't intercept a package in transit),
// then reopens as a return window for 2 days after delivery.
//
// Missing timestamps are handled asymmetrically on purpose: orders placed before the
// confirmed_at/delivered_at columns existed have confirmed_at = null even though they
// were confirmed long ago, so a missing confirmed_at fails OPEN (stays cancellable,
// preserving today's behavior for old orders) — but 'delivered' was never cancellable
// before this feature existed at all, so a missing delivered_at fails CLOSED.
export function isWithinCancelWindow(order: CancellableOrder): boolean {
  const now = Date.now();
  if (order.status === 'confirmed' || order.status === 'processing') {
    if (!order.confirmed_at) return true;
    return now - new Date(order.confirmed_at).getTime() <= CANCEL_WINDOW_MS;
  }
  if (order.status === 'delivered') {
    if (!order.delivered_at) return false;
    return now - new Date(order.delivered_at).getTime() <= CANCEL_WINDOW_MS;
  }
  return false;
}
