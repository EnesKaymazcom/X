import { ReactNode } from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Admin Panel - NesDesign E-Commerce',
  description: 'Admin panel for NesDesign E-Commerce platform',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-base-200">
      {/* Sidebar */}
      <aside className="w-64 bg-base-100 shadow-md">
        <div className="p-4 border-b border-base-300">
          <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link href="/admin" className="block p-2 rounded hover:bg-base-300 transition-colors">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/admin/products" className="block p-2 rounded hover:bg-base-300 transition-colors">
                Ürünler
              </Link>
            </li>
            <li>
              <Link href="/admin/categories" className="block p-2 rounded hover:bg-base-300 transition-colors">
                Kategoriler
              </Link>
            </li>
            <li>
              <Link href="/admin/orders" className="block p-2 rounded hover:bg-base-300 transition-colors">
                Siparişler
              </Link>
            </li>
            <li>
              <Link href="/admin/users" className="block p-2 rounded hover:bg-base-300 transition-colors">
                Kullanıcılar
              </Link>
            </li>
            <li className="pt-4 mt-4 border-t border-base-300">
              <Link href="/" className="flex items-center p-2 rounded hover:bg-base-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Siteye Dön
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
