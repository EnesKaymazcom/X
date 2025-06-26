'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    orders: 0,
    users: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Ürün sayısını getir
        const productsResponse = await fetch('/api/products');
        const productsData = await productsResponse.json();

        // Kategori sayısını getir
        const categoriesResponse = await fetch('/api/categories');
        const categoriesData = await categoriesResponse.json();

        setStats({
          products: Array.isArray(productsData) ? productsData.length : 0,
          categories: Array.isArray(categoriesData) ? categoriesData.length : 0,
          orders: 0, // Şimdilik sabit değer
          users: 0, // Şimdilik sabit değer
        });

        setLoading(false);
      } catch (error) {
        console.error('İstatistikler yüklenirken hata:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Özet Kartları */}
            <motion.div
              className="bg-base-100 p-6 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg font-semibold">Toplam Ürün</h2>
              <p className="text-3xl font-bold text-primary mt-2">{stats.products}</p>
              <Link href="/admin/products" className="text-sm text-primary hover:underline mt-2 inline-block">
                Ürünleri Yönet →
              </Link>
            </motion.div>

            <motion.div
              className="bg-base-100 p-6 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h2 className="text-lg font-semibold">Toplam Kategori</h2>
              <p className="text-3xl font-bold text-secondary mt-2">{stats.categories}</p>
              <Link href="/admin/categories" className="text-sm text-secondary hover:underline mt-2 inline-block">
                Kategorileri Yönet →
              </Link>
            </motion.div>

            <motion.div
              className="bg-base-100 p-6 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <h2 className="text-lg font-semibold">Toplam Sipariş</h2>
              <p className="text-3xl font-bold text-accent mt-2">{stats.orders}</p>
              <Link href="/admin/orders" className="text-sm text-accent hover:underline mt-2 inline-block">
                Siparişleri Yönet →
              </Link>
            </motion.div>

            <motion.div
              className="bg-base-100 p-6 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <h2 className="text-lg font-semibold">Toplam Kullanıcı</h2>
              <p className="text-3xl font-bold text-info mt-2">{stats.users}</p>
              <Link href="/admin/users" className="text-sm text-info hover:underline mt-2 inline-block">
                Kullanıcıları Yönet →
              </Link>
            </motion.div>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Son Siparişler */}
            <motion.div
              className="bg-base-100 p-6 rounded-lg shadow-md"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <h2 className="text-lg font-semibold mb-4">Son Siparişler</h2>
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Kullanıcı</th>
                      <th>Toplam</th>
                      <th>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={4} className="text-center py-4">
                        Henüz sipariş bulunmuyor.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Son Kullanıcılar */}
            <motion.div
              className="bg-base-100 p-6 rounded-lg shadow-md"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <h2 className="text-lg font-semibold mb-4">Son Kullanıcılar</h2>
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>İsim</th>
                      <th>Email</th>
                      <th>Rol</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={4} className="text-center py-4">
                        Henüz kullanıcı bulunmuyor.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
