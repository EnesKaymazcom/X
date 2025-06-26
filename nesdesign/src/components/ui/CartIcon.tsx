'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type CartIconProps = {
  className?: string;
};

const CartIcon = ({ className = '' }: CartIconProps) => {
  const [itemCount, setItemCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Gerçek API çağrısı
  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        // Sepet verilerini getir
        const response = await fetch('/api/cart');
        const data = await response.json();

        if (response.ok && data.items) {
          // Sepetteki toplam ürün sayısını hesapla
          const totalItems = data.items.reduce((total: number, item: any) => total + item.quantity, 0);
          setItemCount(totalItems);
        }
      } catch (err) {
        console.error('Sepet sayısı yüklenirken bir hata oluştu:', err);
      }
    };

    fetchCartCount();

    // Sepet değişikliklerini dinlemek için bir interval oluştur
    const interval = setInterval(fetchCartCount, 5000);

    // Temizleme fonksiyonu
    return () => clearInterval(interval);
  }, []);

  return (
    <Link
      href="/cart"
      className={`btn btn-ghost btn-circle hover:bg-base-200 relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="indicator">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {itemCount > 0 && (
          <span className="badge badge-sm indicator-item badge-primary">{itemCount}</span>
        )}
      </div>

      {/* Hover Tooltip */}
      {isHovered && itemCount > 0 && (
        <div className="absolute top-full right-0 mt-2 w-64 p-4 bg-base-200 shadow-xl rounded-xl z-50 text-left">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold">Sepetiniz</span>
            <span className="text-sm">{itemCount} ürün</span>
          </div>
          <div className="divider my-1"></div>
          <div className="text-center mt-2">
            <Link href="/cart" className="btn btn-primary btn-sm btn-block">
              Sepete Git
            </Link>
          </div>
        </div>
      )}
    </Link>
  );
};

export default CartIcon;
