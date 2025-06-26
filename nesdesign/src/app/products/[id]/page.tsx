'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { formatPrice } from '@/lib/utils';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: {
    id: string;
    name: string;
    slug?: string;
  };
  categoryId: string;
  image: string;
  details?: string;
  features?: string[];
  gallery?: string[];
  slug?: string;
  isDigital?: boolean;
  fileFormat?: string;
  fileSize?: string;
  templateType?: string;
  compatibility?: string[];
  tags?: string[];
  downloadUrl?: string;
  demoUrl?: string;
};

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // Gerçek API çağrısı
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Ürün detaylarını getir
        const response = await fetch(`/api/products/${productId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Ürün yüklenirken bir hata oluştu.');
        }

        setProduct(data);

        // İlgili ürünleri getir (aynı kategorideki diğer ürünler)
        const relatedResponse = await fetch(`/api/products?category=${data.categoryId}`);
        const relatedData = await relatedResponse.json();

        if (relatedResponse.ok) {
          // Mevcut ürünü filtrele ve en fazla 3 ürün göster
          const related = relatedData
            .filter((p: Product) => p.id !== productId)
            .slice(0, 3);

          setRelatedProducts(related);
        }

        setLoading(false);
      } catch (err) {
        console.error('Ürün yüklenirken hata:', err);
        setError(err instanceof Error ? err.message : 'Ürün yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Sepete ekle fonksiyonu
  const handleAddToCart = async () => {
    try {
      // Sepete ekleme API çağrısı
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: productId,
          quantity: quantity,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ürün sepete eklenirken bir hata oluştu.');
      }

      // Başarılı bildirimini göster
      setAddedToCart(true);

      // 3 saniye sonra bildirimi kaldır
      setTimeout(() => {
        setAddedToCart(false);
      }, 3000);
    } catch (err) {
      console.error('Sepete ekleme hatası:', err);
      alert('Ürün sepete eklenirken bir hata oluştu.');
    }
  };

  // Miktar değiştirme fonksiyonları
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };



  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-96">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="alert alert-error shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-bold">Hata!</h3>
            <div className="text-xs">{error || 'Ürün bulunamadı.'}</div>
          </div>
        </div>
        <div className="text-center mt-8">
          <Link href="/products" className="btn btn-primary">
            Ürünlere Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Sepete eklendi bildirimi */}
      {addedToCart && (
        <div className="toast toast-top toast-end z-50">
          <div className="alert alert-success">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Ürün sepete eklendi!</span>
          </div>
        </div>
      )}

      {/* Ürün Detay Bölümü */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Ürün Görselleri */}
        <div>
          <div className="relative h-96 rounded-xl overflow-hidden shadow-lg mb-4">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {product.gallery && (
            <div className="grid grid-cols-3 gap-4">
              {product.gallery.map((image, index) => (
                <div key={index} className="relative h-24 rounded-lg overflow-hidden shadow-md cursor-pointer hover:opacity-80 transition">
                  <Image
                    src={image}
                    alt={`${product.name} - Görsel ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ürün Bilgileri */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Link
              href={`/categories/${product.category.slug || product.category.id}`}
              className="badge badge-outline badge-secondary"
            >
              {product.category.name}
            </Link>
            {product.fileFormat && (
              <div className="badge badge-secondary">{product.fileFormat}</div>
            )}
            {product.templateType && (
              <div className="badge badge-outline">{product.templateType}</div>
            )}
            <div className="rating rating-sm">
              <input type="radio" name="rating-product" className="mask mask-star-2 bg-primary" readOnly checked />
              <input type="radio" name="rating-product" className="mask mask-star-2 bg-primary" readOnly checked />
              <input type="radio" name="rating-product" className="mask mask-star-2 bg-primary" readOnly checked />
              <input type="radio" name="rating-product" className="mask mask-star-2 bg-primary" readOnly checked />
              <input type="radio" name="rating-product" className="mask mask-star-2 bg-primary" readOnly />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>

          <div className="flex items-center gap-2 mb-6">
            <p className="text-2xl font-bold text-primary">
              {formatPrice(product.price)}
            </p>
            {product.fileSize && (
              <span className="text-sm opacity-70 badge badge-ghost">{product.fileSize}</span>
            )}
          </div>

          <p className="text-base-content/80 mb-4">
            {product.description}
          </p>

          {product.compatibility && product.compatibility.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              <span className="text-sm font-semibold">Uyumlu: </span>
              {product.compatibility.map((item, index) => (
                <span key={index} className="badge badge-outline">{item}</span>
              ))}
            </div>
          )}

          {product.demoUrl && (
            <div className="mb-8">
              <a
                href={product.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-secondary btn-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Demo Görüntüle
              </a>
            </div>
          )}

          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center">
              <button
                className="btn btn-square btn-outline"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                </svg>
              </button>
              <span className="w-12 text-center font-bold">{quantity}</span>
              <button
                className="btn btn-square btn-outline"
                onClick={increaseQuantity}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            <div className="flex gap-2 flex-grow">
              <button
                className="btn btn-primary flex-grow"
                onClick={handleAddToCart}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Sepete Ekle
              </button>

              {product.isDigital && product.downloadUrl && (
                <button
                  className="btn btn-secondary"
                  onClick={() => window.open(product.downloadUrl, '_blank')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  İndir
                </button>
              )}
            </div>
          </div>

          <div className="divider"></div>

          {/* Ürün Detay Sekmeleri */}
          <div className="tabs tabs-boxed bg-base-200 mb-4">
            <a
              className={`tab ${activeTab === 'description' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Açıklama
            </a>
            <a
              className={`tab ${activeTab === 'features' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('features')}
            >
              Özellikler
            </a>
            {product.tags && product.tags.length > 0 && (
              <a
                className={`tab ${activeTab === 'tags' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('tags')}
              >
                Etiketler
              </a>
            )}
          </div>

          <div className="bg-base-200 p-6 rounded-xl">
            {activeTab === 'description' && (
              <div>
                <p className="text-base-content/80">
                  {product.details || product.description}
                </p>

                {product.isDigital && (
                  <div className="mt-4 p-4 bg-base-300 rounded-lg">
                    <h3 className="font-bold mb-2">Dijital Ürün Bilgileri</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {product.fileFormat && (
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                          <span>Dosya Formatı: <strong>{product.fileFormat}</strong></span>
                        </div>
                      )}
                      {product.fileSize && (
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                          </svg>
                          <span>Dosya Boyutu: <strong>{product.fileSize}</strong></span>
                        </div>
                      )}
                      {product.templateType && (
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                          </svg>
                          <span>Şablon Türü: <strong>{product.templateType}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'features' && (
              <div>
                {product.features ? (
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-base-content/80">Bu ürün için özellik bilgisi bulunmamaktadır.</p>
                )}
              </div>
            )}

            {activeTab === 'tags' && (
              <div>
                {product.tags && product.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <Link
                        key={index}
                        href={`/products?search=${encodeURIComponent(tag)}`}
                        className="badge badge-outline hover:badge-primary transition-colors duration-200"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-base-content/80">Bu ürün için etiket bilgisi bulunmamaktadır.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* İlgili Ürünler */}
      {relatedProducts.length > 0 && (
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6">İlgili Ürünler</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <div key={relatedProduct.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                <figure className="h-64 relative overflow-hidden">
                  <Image
                    src={relatedProduct.image}
                    alt={relatedProduct.name}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-110"
                  />
                </figure>
                <div className="card-body p-4">
                  <div className="flex flex-wrap justify-between items-center">
                    <Link
                      href={`/categories/${relatedProduct.category.slug || relatedProduct.category.id}`}
                      className="badge badge-outline badge-secondary"
                    >
                      {relatedProduct.category.name}
                    </Link>
                    {relatedProduct.fileFormat && (
                      <div className="badge badge-secondary">{relatedProduct.fileFormat}</div>
                    )}
                  </div>
                  <h2 className="card-title mt-2">
                    <Link href={`/products/${relatedProduct.slug || relatedProduct.id}`} className="hover:text-primary transition">
                      {relatedProduct.name}
                    </Link>
                  </h2>
                  <p className="text-base-content/70 text-sm line-clamp-2">{relatedProduct.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <div>
                      <span className="text-xl font-bold text-primary">{formatPrice(relatedProduct.price)}</span>
                      {relatedProduct.fileSize && (
                        <span className="text-xs ml-2 opacity-70">{relatedProduct.fileSize}</span>
                      )}
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => {
                      // Sepete ekle
                      fetch('/api/cart', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          productId: relatedProduct.id,
                          quantity: 1,
                        }),
                      })
                      .then(response => {
                        if (response.ok) {
                          setAddedToCart(true);
                          setTimeout(() => {
                            setAddedToCart(false);
                          }, 3000);
                        }
                      })
                      .catch(err => {
                        console.error('Sepete ekleme hatası:', err);
                      });
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                      </svg>
                      Sepete Ekle
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
