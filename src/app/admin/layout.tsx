import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';
import AdminSidebar from './AdminSidebar';

async function getUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get('x-pathname') ?? '';
  if (pathname === '/admin/login') return <>{children}</>;

  const user = await getUser();
  // Customers can also be logged in (via OTP) — only app_metadata.role === 'admin'
  // grants access here, since app_metadata can't be set by the user themselves.
  if (!user || user.app_metadata?.role !== 'admin') redirect('/admin/login');

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar userEmail={user.email ?? ''} />
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}
