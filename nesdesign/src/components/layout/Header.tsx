'use client';

import Link from 'next/link';
import Image from 'next/image';
import CartIcon from '@/components/ui/CartIcon';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

const Header = () => {
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <header className="bg-base-100 border-b border-base-300 sticky top-0 z-30">
      <div className="navbar container mx-auto px-4">
        <div className="navbar-start">
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-4 shadow-lg bg-base-200 rounded-box w-52 gap-1">
              <li><Link href="/" className="font-medium hover:text-primary">Ana Sayfa</Link></li>
              <li><Link href="/products" className="font-medium hover:text-primary">Dijital Ürünler</Link></li>
              <li>
                <details>
                  <summary className="font-medium hover:text-primary">Kategoriler</summary>
                  <ul className="p-2 bg-base-200">
                    <li><Link href="/categories/wix-templates" className="font-medium hover:text-primary">Wix Şablonları</Link></li>
                    <li><Link href="/categories/framer-templates" className="font-medium hover:text-primary">Framer Şablonları</Link></li>
                    <li><Link href="/categories/nextjs-templates" className="font-medium hover:text-primary">Next.js Şablonları</Link></li>
                    <li><Link href="/categories" className="font-medium hover:text-primary">Tüm Kategoriler</Link></li>
                  </ul>
                </details>
              </li>
              <li><Link href="/blog" className="font-medium hover:text-primary">Blog</Link></li>
              <li><Link href="/about" className="font-medium hover:text-primary">Hakkımızda</Link></li>
              <li><Link href="/contact" className="font-medium hover:text-primary">İletişim</Link></li>
              <li><Link href="/admin" className="font-medium hover:text-primary">Admin Panel</Link></li>
            </ul>
          </div>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-xl font-bold text-white">N</span>
            </div>
            <span className="text-xl font-bold text-primary">NesDesign</span>
            <span className="text-xs bg-secondary text-white px-2 py-0.5 rounded">Digital</span>
          </Link>
        </div>

        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 gap-1">
            <li><Link href="/" className="font-medium hover:text-primary">Ana Sayfa</Link></li>
            <li><Link href="/products" className="font-medium hover:text-primary">Dijital Ürünler</Link></li>
            <li>
              <details>
                <summary className="font-medium hover:text-primary">Kategoriler</summary>
                <ul className="p-2 bg-base-200 rounded-box shadow-lg">
                  <li><Link href="/categories/wix-templates" className="font-medium hover:text-primary">Wix Şablonları</Link></li>
                  <li><Link href="/categories/framer-templates" className="font-medium hover:text-primary">Framer Şablonları</Link></li>
                  <li><Link href="/categories/nextjs-templates" className="font-medium hover:text-primary">Next.js Şablonları</Link></li>
                  <li><Link href="/categories" className="font-medium hover:text-primary">Tüm Kategoriler</Link></li>
                </ul>
              </details>
            </li>
            <li><Link href="/blog" className="font-medium hover:text-primary">Blog</Link></li>
            <li><Link href="/about" className="font-medium hover:text-primary">Hakkımızda</Link></li>
            <li><Link href="/contact" className="font-medium hover:text-primary">İletişim</Link></li>
          </ul>
        </div>

        <div className="navbar-end">
          <div className="flex items-center gap-2">
            <div className="dropdown dropdown-end">
              <button className="btn btn-ghost btn-circle hover:bg-base-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <div tabIndex={0} className="dropdown-content z-[1] card card-compact w-64 p-2 shadow bg-base-200 mt-3">
                <div className="card-body">
                  <form onSubmit={handleSearch}>
                    <div className="join w-full">
                      <input
                        type="text"
                        placeholder="Ürün ara..."
                        className="input input-bordered join-item w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <button type="submit" className="btn btn-primary join-item">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <CartIcon />

            {status === 'authenticated' ? (
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                  <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img
                      alt={session.user.name || 'Kullanıcı'}
                      src={session.user.image || 'https://placehold.co/100x100?text=User'}
                    />
                  </div>
                </div>
                <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-4 shadow-lg bg-base-200 rounded-box w-52 gap-1">
                  <li>
                    <Link href="/account" className="justify-between hover:text-primary">
                      Profil
                      <span className="badge badge-primary">Yeni</span>
                    </Link>
                  </li>
                  <li><Link href="/account?tab=orders" className="hover:text-primary">Siparişlerim</Link></li>
                  <li><Link href="/account?tab=downloads" className="hover:text-primary">İndirmelerim</Link></li>
                  {session.user.role === 'ADMIN' && (
                    <li><Link href="/admin" className="hover:text-primary">Admin Panel</Link></li>
                  )}
                  <li><button onClick={handleSignOut} className="hover:text-primary">Çıkış</button></li>
                </ul>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/auth/login" className="btn btn-sm btn-outline">
                  Giriş
                </Link>
                <Link href="/auth/register" className="btn btn-sm btn-primary">
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
