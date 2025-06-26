'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Kategori ve ürün tipleri
type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: Category;
  categoryId: string;
  downloadUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Ürünler yüklenirken bir hata oluştu.');
        }

        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (err) {
        console.error('Ürünler yüklenirken hata:', err);
        setError(err instanceof Error ? err.message : 'Ürünler yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Fiyat formatı
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ürün Yönetimi</h1>
        <Link
          href="/admin/products/new"
          className="btn btn-primary"
        >
          Yeni Ürün Ekle
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : error ? (
        <div className="alert alert-error shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-bold">Hata!</h3>
            <div className="text-xs">{error}</div>
          </div>
        </div>
      ) : (
        <motion.div
          className="bg-base-100 rounded-lg shadow-md overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Resim</th>
                  <th>Ürün Adı</th>
                  <th>Kategori</th>
                  <th>Fiyat</th>
                  <th>İndirme Linki</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      Henüz ürün bulunmuyor.
                    </td>
                  </tr>
                ) : (
                  products.map((product, index) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <td className="text-sm">{product.id.substring(0, 8)}...</td>
                      <td>
                        <div className="avatar">
                          <div className="w-12 h-12 rounded-md">
                            {product.image && (
                              <Image
                                src={product.image}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="object-cover"
                              />
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{product.name}</td>
                      <td>{product.category?.name || 'Kategori Yok'}</td>
                      <td>{formatPrice(product.price)}</td>
                      <td>
                        {product.downloadUrl ? (
                          <a
                            href={product.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline truncate max-w-xs block"
                          >
                            {product.downloadUrl.substring(0, 30)}...
                          </a>
                        ) : (
                          <span className="text-error">Link yok</span>
                        )}
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          <Link href={`/admin/products/${product.id}`} className="btn btn-sm btn-info">
                            Düzenle
                          </Link>
                          <button className="btn btn-sm btn-error">
                            Sil
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
