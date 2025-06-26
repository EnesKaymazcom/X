'use client';

import { useState } from 'react';

type AddToCartProps = {
  productId: string;
  className?: string;
  showQuantity?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onAddToCart?: (productId: string, quantity: number) => void;
};

const AddToCart = ({
  productId,
  className = '',
  showQuantity = false,
  size = 'md',
  onAddToCart
}: AddToCartProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const handleAddToCart = async () => {
    setIsAdding(true);

    try {
      // Gerçek API çağrısı
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ürün sepete eklenirken bir hata oluştu.');
      }

      // Callback fonksiyonu varsa çağır
      if (onAddToCart) {
        onAddToCart(productId, quantity);
      }

      setIsAdding(false);
      setShowSuccess(true);

      // 3 saniye sonra başarı mesajını kaldır
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Sepete ekleme hatası:', err);
      setIsAdding(false);
      alert('Ürün sepete eklenirken bir hata oluştu.');
    }
  };

  // Buton boyutuna göre sınıflar
  const buttonSizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  const iconSizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';

  return (
    <div className={`${className}`}>
      {showQuantity && (
        <div className="flex items-center gap-2 mb-3">
          <button
            className={`btn btn-square btn-outline ${size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : ''}`}
            onClick={decreaseQuantity}
            disabled={quantity <= 1 || isAdding}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={iconSizeClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
            </svg>
          </button>
          <span className={`w-10 text-center font-bold ${size === 'lg' ? 'text-lg' : ''}`}>{quantity}</span>
          <button
            className={`btn btn-square btn-outline ${size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : ''}`}
            onClick={increaseQuantity}
            disabled={isAdding}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={iconSizeClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      )}

      <button
        className={`btn btn-primary ${buttonSizeClass} ${isAdding ? 'loading' : ''}`}
        onClick={handleAddToCart}
        disabled={isAdding}
      >
        {!isAdding && (
          <svg xmlns="http://www.w3.org/2000/svg" className={`${iconSizeClass} mr-1`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )}
        {isAdding ? 'Ekleniyor...' : showSuccess ? 'Eklendi!' : 'Sepete Ekle'}
      </button>
    </div>
  );
};

export default AddToCart;
