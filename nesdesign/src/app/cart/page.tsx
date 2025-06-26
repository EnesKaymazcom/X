'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category: string;
  productId: string;
};

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);

  // Gerçek API çağrısı
  useEffect(() => {
    const fetchCart = async () => {
      try {
        // Sepet verilerini getir
        const response = await fetch('/api/cart');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Sepet yüklenirken bir hata oluştu.');
        }

        // API'den gelen verileri CartItem formatına dönüştür
        const cartItemsFromApi: CartItem[] = data.items.map((item: any) => ({
          id: item.id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.image,
          quantity: item.quantity,
          category: item.product.category.name,
          productId: item.productId
        }));

        setCartItems(cartItemsFromApi);
        setLoading(false);
      } catch (err) {
        console.error('Sepet yüklenirken bir hata oluştu:', err);
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  // Miktar değiştirme fonksiyonu
  const updateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      // API çağrısı ile miktarı güncelle
      const response = await fetch(`/api/cart/items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity: newQuantity,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Miktar güncellenirken bir hata oluştu.');
      }

      // Yerel state'i güncelle
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (err) {
      console.error('Miktar güncelleme hatası:', err);
      alert('Miktar güncellenirken bir hata oluştu.');
    }
  };

  // Ürünü sepetten kaldırma fonksiyonu
  const removeItem = async (id: string) => {
    try {
      // API çağrısı ile ürünü sepetten kaldır
      const response = await fetch(`/api/cart/items/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ürün sepetten kaldırılırken bir hata oluştu.');
      }

      // Yerel state'i güncelle
      setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (err) {
      console.error('Ürün kaldırma hatası:', err);
      alert('Ürün sepetten kaldırılırken bir hata oluştu.');
    }
  };

  // Kupon kodu uygulama fonksiyonu
  const applyCoupon = () => {
    // Gerçek bir uygulamada burada API çağrısı yapılırdı
    if (couponCode.toLowerCase() === 'indirim20') {
      setCouponApplied(true);
      setDiscount(20); // %20 indirim
    } else {
      alert('Geçersiz kupon kodu!');
    }
  };

  // Toplam tutarı hesaplama
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const discountAmount = couponApplied ? (subtotal * discount / 100) : 0;
  const total = subtotal - discountAmount;

  // Fiyat formatı
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-16">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto text-base-content/30 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h2 className="text-3xl font-bold mb-4">Sepetiniz Boş</h2>
          <p className="text-base-content/70 max-w-md mx-auto mb-8">
            Sepetinizde henüz ürün bulunmuyor. Ürünleri keşfetmek ve sepetinize eklemek için alışverişe başlayın.
          </p>
          <Link href="/products" className="btn btn-primary btn-lg">
            Alışverişe Başla
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Sepetim</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sepet Ürünleri */}
        <div className="lg:col-span-2">
          <div className="bg-base-200 rounded-xl p-6">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ürün</th>
                    <th>Fiyat</th>
                    <th>Miktar</th>
                    <th>Toplam</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <Link href={`/products/${item.id}`} className="font-bold hover:text-primary transition">
                              {item.name}
                            </Link>
                            <div className="text-sm text-base-content/70">{item.category}</div>
                          </div>
                        </div>
                      </td>
                      <td>{formatPrice(item.price)}</td>
                      <td>
                        <div className="flex items-center">
                          <button
                            className="btn btn-xs btn-square btn-outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="w-8 text-center font-bold">{item.quantity}</span>
                          <button
                            className="btn btn-xs btn-square btn-outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="font-bold">{formatPrice(item.price * item.quantity)}</td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm text-error"
                          onClick={() => removeItem(item.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sipariş Özeti */}
        <div>
          <div className="bg-base-200 rounded-xl p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Sipariş Özeti</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-base-content/70">Ara Toplam</span>
                <span className="font-bold">{formatPrice(subtotal)}</span>
              </div>

              {couponApplied && (
                <div className="flex justify-between text-success">
                  <span>İndirim (%{discount})</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="divider my-2"></div>

              <div className="flex justify-between text-lg">
                <span className="font-bold">Toplam</span>
                <span className="font-bold text-primary">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Kupon Kodu */}
            <div className="mb-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Kupon Kodu</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Kupon kodunuzu girin"
                    className="input input-bordered w-full"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={couponApplied}
                  />
                  <button
                    className="btn btn-outline"
                    onClick={applyCoupon}
                    disabled={!couponCode || couponApplied}
                  >
                    Uygula
                  </button>
                </div>
                {couponApplied && (
                  <label className="label">
                    <span className="label-text-alt text-success">Kupon kodu başarıyla uygulandı!</span>
                  </label>
                )}
              </div>
            </div>

            {/* Ödeme Butonları */}
            <button className="btn btn-primary btn-block mb-3">
              Ödemeye Geç
            </button>

            <Link href="/products" className="btn btn-outline btn-block">
              Alışverişe Devam Et
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
