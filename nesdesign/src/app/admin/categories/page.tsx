'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

type Category = {
  id: string;
  name: string;
  productCount?: number;
  createdAt: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Kategoriler yüklenirken bir hata oluştu.');
        }

        setCategories(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (err) {
        console.error('Kategoriler yüklenirken hata:', err);
        setError(err instanceof Error ? err.message : 'Kategoriler yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Tarih formatı
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kategori Yönetimi</h1>
        <Link
          href="/admin/categories/new"
          className="btn btn-secondary"
        >
          Yeni Kategori Ekle
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg text-secondary"></span>
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
                  <th>Kategori Adı</th>
                  <th>Ürün Sayısı</th>
                  <th>Oluşturulma Tarihi</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      Henüz kategori bulunmuyor.
                    </td>
                  </tr>
                ) : (
                  categories.map((category, index) => (
                    <motion.tr
                      key={category.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <td className="text-sm">{category.id.substring(0, 8)}...</td>
                      <td>{category.name}</td>
                      <td>
                        <span className="badge badge-secondary">
                          {category.productCount || 0}
                        </span>
                      </td>
                      <td>{category.createdAt ? formatDate(category.createdAt) : '-'}</td>
                      <td>
                        <div className="flex space-x-2">
                          <Link href={`/admin/categories/${category.id}`} className="btn btn-sm btn-info">
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
