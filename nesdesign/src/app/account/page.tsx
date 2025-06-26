'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';

// Sipariş tipi
type Order = {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

// Sipariş öğesi tipi
type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  isDigital: boolean;
  downloadUrl?: string;
  downloadCount: number;
  expiresAt?: string;
  product: {
    id: string;
    name: string;
    image: string;
  };
  order: {
    createdAt: string;
    status: string;
  };
};

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'profile');

  const [orders, setOrders] = useState<Order[]>([]);
  const [downloads, setDownloads] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState({
    orders: false,
    downloads: false
  });

  // Oturum kontrolü
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?redirect=/account');
    }
  }, [status, router]);

  // URL parametresinden sekme değiştiğinde state'i güncelle
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Siparişleri getir
  useEffect(() => {
    if (status === 'authenticated' && activeTab === 'orders') {
      const fetchOrders = async () => {
        setLoading(prev => ({ ...prev, orders: true }));
        try {
          const response = await fetch('/api/user/orders');
          if (response.ok) {
            const data = await response.json();
            setOrders(data);
          }
        } catch (error) {
          console.error('Siparişler getirilirken hata:', error);
        } finally {
          setLoading(prev => ({ ...prev, orders: false }));
        }
      };

      fetchOrders();
    }
  }, [status, activeTab]);

  // İndirmeleri getir
  useEffect(() => {
    if (status === 'authenticated' && activeTab === 'downloads') {
      const fetchDownloads = async () => {
        setLoading(prev => ({ ...prev, downloads: true }));
        try {
          const response = await fetch('/api/user/downloads');
          if (response.ok) {
            const data = await response.json();
            setDownloads(data);
          }
        } catch (error) {
          console.error('İndirmeler getirilirken hata:', error);
        } finally {
          setLoading(prev => ({ ...prev, downloads: false }));
        }
      };

      fetchDownloads();
    }
  }, [status, activeTab]);

  // Oturum yükleniyorsa
  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="mt-4">Oturum bilgileri yükleniyor...</p>
      </div>
    );
  }

  // Oturum açılmamışsa
  if (status === 'unauthenticated') {
    return null; // useEffect ile yönlendirme yapılacak
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Hesabım</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-base-200 rounded-xl p-6 sticky top-24">
            <div className="flex items-center gap-4 mb-6">
              <div className="avatar">
                <div className="w-16 rounded-full">
                  <Image
                    src={session?.user?.image || 'https://placehold.co/100x100?text=User'}
                    alt={session?.user?.name || 'Kullanıcı'}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold">{session?.user?.name}</h2>
                <p className="text-sm text-base-content/70">{session?.user?.email}</p>
              </div>
            </div>

            <ul className="menu bg-base-200 rounded-box w-full">
              <li>
                <a
                  className={activeTab === 'profile' ? 'active' : ''}
                  onClick={() => setActiveTab('profile')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profil
                </a>
              </li>
              <li>
                <a
                  className={activeTab === 'orders' ? 'active' : ''}
                  onClick={() => setActiveTab('orders')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Siparişlerim
                </a>
              </li>
              <li>
                <a
                  className={activeTab === 'downloads' ? 'active' : ''}
                  onClick={() => setActiveTab('downloads')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  İndirmelerim
                </a>
              </li>
              <li>
                <a
                  className={activeTab === 'settings' ? 'active' : ''}
                  onClick={() => setActiveTab('settings')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Ayarlar
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-base-200 rounded-xl p-6">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Profil Bilgileri</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Ad Soyad</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={session?.user?.name || ''}
                      readOnly
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">E-posta</span>
                    </label>
                    <input
                      type="email"
                      className="input input-bordered"
                      value={session?.user?.email || ''}
                      readOnly
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">Profil Resmi</h3>

                  <div className="flex items-center gap-4">
                    <div className="avatar">
                      <div className="w-24 rounded-full">
                        <Image
                          src={session?.user?.image || 'https://placehold.co/100x100?text=User'}
                          alt={session?.user?.name || 'Kullanıcı'}
                          width={96}
                          height={96}
                          className="object-cover"
                        />
                      </div>
                    </div>

                    <button className="btn btn-outline">
                      Resim Değiştir
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Siparişlerim</h2>

                {loading.orders ? (
                  <div className="text-center py-8">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                    <p className="mt-4">Siparişler yükleniyor...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8 bg-base-100 rounded-xl p-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <h3 className="text-xl font-bold mt-4">Henüz Siparişiniz Yok</h3>
                    <p className="mt-2 text-base-content/70">Dijital ürünlerimize göz atarak alışverişe başlayabilirsiniz.</p>
                    <Link href="/products" className="btn btn-primary mt-4">
                      Ürünlere Göz At
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table w-full">
                      <thead>
                        <tr>
                          <th>Sipariş No</th>
                          <th>Tarih</th>
                          <th>Tutar</th>
                          <th>Durum</th>
                          <th>İşlem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => {
                          // Sipariş durumunu Türkçe'ye çevir
                          const statusMap: Record<string, { text: string, color: string }> = {
                            'PENDING': { text: 'Bekliyor', color: 'badge-warning' },
                            'PROCESSING': { text: 'İşleniyor', color: 'badge-info' },
                            'COMPLETED': { text: 'Tamamlandı', color: 'badge-success' },
                            'CANCELLED': { text: 'İptal Edildi', color: 'badge-error' },
                          };

                          const status = statusMap[order.status] || { text: order.status, color: 'badge-ghost' };
                          const orderDate = new Date(order.createdAt).toLocaleDateString('tr-TR');

                          return (
                            <tr key={order.id}>
                              <td>{order.id.substring(0, 8)}</td>
                              <td>{orderDate}</td>
                              <td>{formatPrice(order.total)}</td>
                              <td>
                                <div className={`badge ${status.color}`}>{status.text}</div>
                              </td>
                              <td>
                                <Link href={`/account/orders/${order.id}`} className="btn btn-xs btn-outline">
                                  Detay
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'downloads' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">İndirmelerim</h2>

                {loading.downloads ? (
                  <div className="text-center py-8">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                    <p className="mt-4">İndirmeler yükleniyor...</p>
                  </div>
                ) : downloads.length === 0 ? (
                  <div className="text-center py-8 bg-base-100 rounded-xl p-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <h3 className="text-xl font-bold mt-4">Henüz İndirmeniz Yok</h3>
                    <p className="mt-2 text-base-content/70">Dijital ürünlerimize göz atarak alışverişe başlayabilirsiniz.</p>
                    <Link href="/products" className="btn btn-primary mt-4">
                      Ürünlere Göz At
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {downloads.map((download) => {
                      const purchaseDate = new Date(download.order.createdAt).toLocaleDateString('tr-TR');

                      return (
                        <div key={download.id} className="card card-side bg-base-100 shadow-xl">
                          <figure className="w-1/4">
                            <Image
                              src={download.product.image}
                              alt={download.product.name}
                              width={150}
                              height={150}
                              className="object-cover h-full"
                            />
                          </figure>
                          <div className="card-body">
                            <h2 className="card-title">{download.product.name}</h2>
                            <p>Satın alma tarihi: {purchaseDate}</p>
                            {download.expiresAt && (
                              <p className="text-sm text-base-content/70">
                                Son indirme tarihi: {new Date(download.expiresAt).toLocaleDateString('tr-TR')}
                              </p>
                            )}
                            <div className="card-actions justify-end">
                              <a
                                href={download.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                İndir
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Hesap Ayarları</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-4">Şifre Değiştir</h3>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Mevcut Şifre</span>
                        </label>
                        <input
                          type="password"
                          className="input input-bordered"
                        />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Yeni Şifre</span>
                        </label>
                        <input
                          type="password"
                          className="input input-bordered"
                        />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Yeni Şifre Tekrar</span>
                        </label>
                        <input
                          type="password"
                          className="input input-bordered"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <button className="btn btn-primary">
                        Şifreyi Güncelle
                      </button>
                    </div>
                  </div>

                  <div className="divider"></div>

                  <div>
                    <h3 className="text-xl font-bold mb-4">Bildirim Ayarları</h3>

                    <div className="form-control">
                      <label className="label cursor-pointer justify-start gap-2">
                        <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                        <span className="label-text">E-posta bildirimleri</span>
                      </label>
                    </div>

                    <div className="form-control">
                      <label className="label cursor-pointer justify-start gap-2">
                        <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                        <span className="label-text">Yeni ürün bildirimleri</span>
                      </label>
                    </div>

                    <div className="form-control">
                      <label className="label cursor-pointer justify-start gap-2">
                        <input type="checkbox" className="toggle toggle-primary" />
                        <span className="label-text">Promosyon bildirimleri</span>
                      </label>
                    </div>

                    <div className="mt-4">
                      <button className="btn btn-primary">
                        Ayarları Kaydet
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
