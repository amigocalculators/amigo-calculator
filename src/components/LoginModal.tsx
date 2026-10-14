'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import AccountLoginClient from '@/app/(site)/account/login/AccountLoginClient';

// Frido-style login overlay — reuses the same OTP form as the full /account/login
// page (that page stays as the fallback for direct links and the post-login
// redirect flows elsewhere in the site, e.g. checkout), just presented as a modal
// over whatever page the customer was already browsing.
export default function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 text-ink/70 hover:text-ink"
        >
          <X className="h-5 w-5" />
        </button>
        <AccountLoginClient next={pathname} onSuccess={onClose} />
      </div>
    </div>
  );
}
