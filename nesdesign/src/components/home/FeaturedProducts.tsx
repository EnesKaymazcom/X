'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AddToCart from '@/components/ui/AddToCart';
import { formatPrice } from '@/lib/utils';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  slug?: string;
  featured?: boolean;
  fileFormat?: string;
  fileSize?: string;
  templateType?: string;
  category: {
    id: string;
    name: string;
    slug?: string;
  };
};

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Ürünleri API'den getir
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?featured=true&limit=8');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Ürünler yüklenirken bir hata oluştu.');
        }

        // API'den gelen ürünleri kullan
        if (data.products && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          // Eski API yapısı için uyumluluk
          setProducts(Array.isArray(data) ? data.slice(0, 8) : []);
        }

        setLoading(false);
      } catch (err) {
        console.error('Ürünler yüklenirken hata:', err);
        setError(err instanceof Error ? err.message : 'Ürünler yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);



  if (loading) {
    return (
      <section className="mb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Öne Çıkan Ürünler</h2>
          <p className="text-base-content/80 max-w-2xl mx-auto">
            En çok tercih edilen ve en yeni dijital ürünlerimizi keşfedin. Projelerinize profesyonellik katacak şablonlar.
          </p>
        </div>
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Öne Çıkan Ürünler</h2>
          <p className="text-base-content/80 max-w-2xl mx-auto">
            En çok tercih edilen ve en yeni dijital ürünlerimizi keşfedin. Projelerinize profesyonellik katacak şablonlar.
          </p>
        </div>
        <div className="alert alert-error shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-bold">Hata!</h3>
            <div className="text-xs">{error}</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-4">Öne Çıkan Ürünler</h2>
        <p className="text-base-content/80 max-w-2xl mx-auto">
          En çok tercih edilen ve en yeni dijital ürünlerimizi keşfedin. Projelerinize profesyonellik katacak şablonlar.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-base-content/70">Henüz öne çıkan ürün bulunmamaktadır.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <figure className="h-64 relative overflow-hidden">
                <div className="absolute top-2 right-2 z-10 flex gap-1">
                  {product.featured && <div className="badge badge-primary">Öne Çıkan</div>}
                  {product.fileFormat && (
                    <div className="badge badge-secondary">{product.fileFormat}</div>
                  )}
                </div>
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-110"
                />
              </figure>
              <div className="card-body p-4">
                <div className="flex justify-between items-center">
                  <Link
                    href={`/categories/${product.category.slug || product.category.id}`}
                    className="badge badge-outline badge-secondary"
                  >
                    {product.category.name}
                  </Link>
                  {product.templateType && (
                    <div className="badge badge-outline">{product.templateType}</div>
                  )}
                </div>
                <h2 className="card-title mt-2">
                  <Link href={`/products/${product.slug || product.id}`} className="hover:text-primary transition">
                    {product.name}
                  </Link>
                </h2>
                <p className="text-base-content/70 text-sm line-clamp-2">{product.description || 'Ürün açıklaması bulunmamaktadır.'}</p>
                <div className="flex justify-between items-center mt-4">
                  <div>
                    <span className="text-xl font-bold text-primary">{formatPrice(product.price)}</span>
                    {product.fileSize && (
                      <span className="text-xs ml-2 opacity-70">{product.fileSize}</span>
                    )}
                  </div>
                  <AddToCart productId={product.id} size="sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-12">
        <Link
          href="/products"
          className="btn btn-primary btn-wide"
        >
          Tüm Ürünleri Gör
        </Link>
      </div>
    </section>
  );
};

export default FeaturedProducts;
