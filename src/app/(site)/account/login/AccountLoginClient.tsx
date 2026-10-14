'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Phone icon kept for when the phone-login button below is re-enabled
import { Mail, Phone, Loader2 } from 'lucide-react';

const RESEND_COOLDOWN_SECONDS = 60;

type Step = 'enter-contact' | 'enter-otp' | 'complete-profile';
type Channel = 'email' | 'phone';

type ResumeProfile = { email: string | null; phone: string | null };

export default function AccountLoginClient({ resumeProfile, next, onSuccess }: { resumeProfile?: ResumeProfile; next?: string; onSuccess?: () => void }) {
  const router = useRouter();
  const supabase = createClient();
  const destination = next ?? '/account/orders';

  const resumeChannel: Channel = resumeProfile?.email ? 'email' : 'phone';
  const resumeContact = resumeProfile?.email ?? (resumeProfile?.phone ? resumeProfile.phone.replace(/^\+91/, '') : '');

  const [step, setStep] = useState<Step>(resumeProfile ? 'complete-profile' : 'enter-contact');
  // Phone login is disabled for now (see commented-out toggle below) — always start on email
  // unless resuming a signup that was already mid-flow on a different channel.
  const [channel, setChannel] = useState<Channel>(resumeProfile ? resumeChannel : 'email');
  const [contact, setContact] = useState(resumeContact);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  // Only used on the complete-profile step, for whichever field wasn't just verified.
  const [name, setName] = useState('');
  const [otherContact, setOtherContact] = useState('');

  const toE164Phone = (phone: string) => `+91${phone}`;

  useEffect(() => {
    if (step !== 'enter-otp' || resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, resendCooldown]);

  const sendOtp = async () => {
    const { error } = channel === 'email'
      ? await supabase.auth.signInWithOtp({ email: contact })
      : await supabase.auth.signInWithOtp({ phone: toE164Phone(contact) });
    if (error) throw error;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await sendOtp();
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setStep('enter-otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setResending(true);
    try {
      await sendOtp();
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error } = channel === 'email'
      ? await supabase.auth.verifyOtp({ email: contact, token: otp, type: 'email' })
      : await supabase.auth.verifyOtp({ phone: toE164Phone(contact), token: otp, type: 'sms' });

    if (error || !data.user) {
      setLoading(false);
      setError(error?.message ?? 'Verification failed');
      return;
    }

    const { data: profile } = await supabase.from('profiles').select('id').eq('id', data.user.id).maybeSingle();
    setLoading(false);

    if (profile) {
      onSuccess?.();
      router.push(destination);
      router.refresh();
    } else {
      setStep('complete-profile');
    }
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      setError('Session expired — please start again.');
      setStep('enter-contact');
      return;
    }

    const { error } = await supabase.from('profiles').insert({
      id: user.id,
      name,
      email: channel === 'email' ? contact : otherContact,
      phone: channel === 'phone' ? contact : otherContact,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    onSuccess?.();
    router.push(destination);
    router.refresh();
  };

  return (
    <div className="w-full max-w-md rounded-2xl shadow-lg overflow-hidden">
      {/* Gold gradient header band, matching the login header look */}
      <div className="bg-gradient-to-br from-accent-400 to-accent-600 px-8 pt-8 pb-10 text-center">
        <h1 className="text-2xl font-bold text-ink">
          {step === 'complete-profile' ? 'Almost done' : 'Login to your comfort zone'}
        </h1>
        <p className="text-ink/70 text-sm mt-1">
          {step === 'enter-contact' && "Let's get started — no password needed."}
          {step === 'enter-otp' && `Enter the code sent to ${contact}`}
          {step === 'complete-profile' && 'Just a couple more details to set up your account.'}
        </p>
      </div>

      <div className="bg-white px-8 py-8 -mt-4 rounded-t-2xl relative">
        {error && <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          {step === 'enter-contact' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="flex rounded-lg border border-border-soft overflow-hidden">
                <button type="button" onClick={() => { setChannel('email'); setContact(''); }}
                  className={`flex-1 py-2.5 flex items-center justify-center gap-2 text-sm font-medium ${channel === 'email' ? 'bg-accent-500 text-ink' : 'bg-white text-ink-muted'}`}>
                  <Mail className="w-4 h-4" /> Email
                </button>
                {/* Phone login temporarily disabled (needs SMS provider + DLT registration) — uncomment to re-enable
                <button type="button" onClick={() => { setChannel('phone'); setContact(''); }}
                  className={`flex-1 py-2.5 flex items-center justify-center gap-2 text-sm font-medium ${channel === 'phone' ? 'bg-accent-500 text-ink' : 'bg-white text-ink-muted'}`}>
                  <Phone className="w-4 h-4" /> Phone
                </button>
                */}
              </div>

              {channel === 'email' ? (
                <input type="email" required placeholder="you@example.com" value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border-soft focus:ring-2 focus:ring-accent-500 outline-none" />
              ) : (
                <input type="tel" required placeholder="10-digit mobile number" pattern="[0-9]{10}" value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border-soft focus:ring-2 focus:ring-accent-500 outline-none" />
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-accent-500 text-ink py-3 rounded-lg font-semibold hover:bg-accent-600 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Send OTP
              </button>

              <p className="text-xs text-ink-muted text-center">
                By continuing, you agree to our Terms &amp; Privacy Policy.
              </p>
            </form>
          )}

          {step === 'enter-otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input type="text" required inputMode="numeric" placeholder="Enter the code" value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border-soft focus:ring-2 focus:ring-accent-500 outline-none text-center tracking-widest text-lg" />
              <button type="submit" disabled={loading}
                className="w-full bg-accent-500 text-ink py-3 rounded-lg font-semibold hover:bg-accent-600 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Verify
              </button>
              <button type="button" onClick={handleResendOtp} disabled={resendCooldown > 0 || resending}
                className="w-full text-sm font-medium text-accent-600 hover:text-accent-700 disabled:text-ink-muted flex items-center justify-center gap-2">
                {resending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
              </button>
              <button type="button" onClick={() => { setStep('enter-contact'); setOtp(''); setError(''); setResendCooldown(0); }}
                className="w-full text-sm text-ink-muted hover:text-ink">
                Use a different email/phone
              </button>
            </form>
          )}

          {step === 'complete-profile' && (
            <form onSubmit={handleCompleteProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Your Name</label>
                <input required value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border-soft focus:ring-2 focus:ring-accent-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  {channel === 'email' ? 'Phone Number' : 'Email'}
                </label>
                {channel === 'email' ? (
                  <input type="tel" required placeholder="10-digit mobile number" pattern="[0-9]{10}" value={otherContact}
                    onChange={(e) => setOtherContact(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border-soft focus:ring-2 focus:ring-accent-500 outline-none" />
                ) : (
                  <input type="email" required placeholder="you@example.com" value={otherContact}
                    onChange={(e) => setOtherContact(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border-soft focus:ring-2 focus:ring-accent-500 outline-none" />
                )}
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-accent-500 text-ink py-3 rounded-lg font-semibold hover:bg-accent-600 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Finish
              </button>
            </form>
          )}
      </div>
    </div>
  );
}
