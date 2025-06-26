'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';

type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: {
      id: string;
      name: string;
    };
  };
};

type Cart = {
  id: string;
  userId: string;
  items: CartItem[];
};

export default function CheckoutPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  
  const router = useRouter();
  const { data: session, status } = useSession();

  // Sepeti getir
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch('/api/cart');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Sepet getirilirken bir hata oluştu');
        }
        
        setCart(data);
      } catch (error) {
        console.error('Sepet getirilirken hata:', error);
        setError('Sepet getirilirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCart();
  }, []);

  // Oturum kontrolü
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?redirect=/checkout');
    }
  }, [status, router]);

  // Ödeme işlemi
  const handlePayment = async () => {
    if (!cart || !session?.user?.id) return;
    
    setProcessingPayment(true);
    setError('');
    
    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartId: cart.id,
          paymentMethod,
          userId: session.user.id,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Ödeme işlemi sırasında bir hata oluştu');
      }
      
      // Başarılı ödeme
      setPaymentSuccess(true);
      setOrderId(data.order.id);
      
      // Sepeti güncelle
      setCart(prev => ({
        ...prev!,
        items: [],
      }));
    } catch (error: any) {
      console.error('Ödeme işlemi sırasında hata:', error);
      setError(error.message || 'Ödeme işlemi sırasında bir hata oluştu');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Toplam tutarı hesaplama
  const subtotal = cart?.items.reduce((total, item) => total + (item.product.price * item.quantity), 0) || 0;
  const total = subtotal;

  // Oturum yükleniyorsa
  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="mt-4">Oturum bilgileri yükleniyor...</p>
      </div>
    );
  }

  // Başarılı ödeme ekranı
  if (paymentSuccess) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-base-200 p-8 rounded-xl shadow-lg">
            <div className="text-success text-5xl mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">Ödeme Başarılı!</h1>
            <p className="text-xl mb-6">Siparişiniz başarıyla oluşturuldu.</p>
            
            <div className="bg-base-300 p-4 rounded-lg mb-6">
              <p className="font-semibold">Sipariş Numarası:</p>
              <p className="text-primary font-mono text-lg">{orderId}</p>
            </div>
            
            <p className="mb-8">
              Dijital ürünlerinize hesabınızdan erişebilirsiniz. Ayrıca e-posta adresinize indirme bağlantıları gönderilecektir.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/account/orders" className="btn btn-primary">
                Siparişlerim
              </Link>
              <Link href="/" className="btn btn-outline">
                Ana Sayfaya Dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Ödeme</h1>
      
      {loading ? (
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4">Sepet bilgileri yükleniyor...</p>
        </div>
      ) : error ? (
        <div className="alert alert-error max-w-2xl mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      ) : !cart || cart.items.length === 0 ? (
        <div className="text-center max-w-2xl mx-auto">
          <div className="bg-base-200 p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Sepetiniz Boş</h2>
            <p className="mb-6">Ödeme yapmak için sepetinize ürün ekleyin.</p>
            <Link href="/products" className="btn btn-primary">
              Ürünlere Göz At
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sipariş Özeti */}
          <div className="lg:col-span-2">
            <div className="bg-base-200 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Sipariş Özeti</h2>
              
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Ürün</th>
                      <th>Fiyat</th>
                      <th>Adet</th>
                      <th>Toplam</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar">
                              <div className="mask mask-squircle w-12 h-12">
                                <Image
                                  src={item.product.image}
                                  alt={item.product.name}
                                  width={48}
                                  height={48}
                                  className="object-cover"
                                />
                              </div>
                            </div>
                            <div>
                              <div className="font-bold">{item.product.name}</div>
                              <div className="text-sm opacity-70">{item.product.category.name}</div>
                            </div>
                          </div>
                        </td>
                        <td>{formatPrice(item.product.price)}</td>
                        <td>{item.quantity}</td>
                        <td>{formatPrice(item.product.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th colSpan={3} className="text-right">Toplam:</th>
                      <th>{formatPrice(total)}</th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
          
          {/* Ödeme Bilgileri */}
          <div>
            <div className="bg-base-200 rounded-xl p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Ödeme Bilgileri</h2>
              
              {error && (
                <div className="alert alert-error mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}
              
              <div className="form-control mb-4">
                <label className="label cursor-pointer justify-start gap-2">
                  <input
                    type="radio"
                    name="payment-method"
                    className="radio radio-primary"
                    checked={paymentMethod === 'credit_card'}
                    onChange={() => setPaymentMethod('credit_card')}
                  />
                  <span className="label-text">Kredi Kartı</span>
                </label>
              </div>
              
              <div className="form-control mb-4">
                <label className="label cursor-pointer justify-start gap-2">
                  <input
                    type="radio"
                    name="payment-method"
                    className="radio radio-primary"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={() => setPaymentMethod('bank_transfer')}
                  />
                  <span className="label-text">Banka Havalesi</span>
                </label>
              </div>
              
              <div className="divider my-4"></div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-base-content/70">Ara Toplam</span>
                  <span className="font-bold">{formatPrice(subtotal)}</span>
                </div>
                
                <div className="divider my-2"></div>
                
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Toplam</span>
                  <span className="font-bold text-primary">{formatPrice(total)}</span>
                </div>
              </div>
              
              <button
                className={`btn btn-primary btn-block ${processingPayment ? 'loading' : ''}`}
                onClick={handlePayment}
                disabled={processingPayment}
              >
                {processingPayment ? 'İşleniyor...' : 'Ödemeyi Tamamla'}
              </button>
              
              <p className="text-xs text-center mt-4 text-base-content/70">
                Ödemeyi tamamlayarak <Link href="/terms" className="link">Kullanım Şartları</Link> ve <Link href="/privacy" className="link">Gizlilik Politikası</Link>'nı kabul etmiş olursunuz.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
