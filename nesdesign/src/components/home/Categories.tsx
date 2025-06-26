'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

// Kategori tipi
type Category = {
  id: string;
  name: string;
  description?: string;
  image?: string;
  slug?: string;
  _count: {
    products: number;
  };
};

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Kategorileri API'den getir
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories?featured=true');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Kategoriler yüklenirken bir hata oluştu.');
        }

        setCategories(data);
        setLoading(false);
      } catch (err) {
        console.error('Kategoriler yüklenirken hata:', err);
        setError(err instanceof Error ? err.message : 'Kategoriler yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);
  return (
    <section className="mb-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-4">Kategoriler</h2>
        <p className="text-base-content/80 max-w-2xl mx-auto">
          Projeleriniz için profesyonel tasarım şablonlarımızı keşfedin. İhtiyacınıza uygun dijital ürünleri bulun.
        </p>
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
      ) : categories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-base-content/70">Henüz kategori bulunmamaktadır.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="card w-full bg-base-100 image-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
              <figure>
                <Image
                  src={category.image || 'https://placehold.co/600x400?text=No+Image'}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-110"
                />
              </figure>
              <div className="card-body justify-end bg-gradient-to-t from-base-100 to-transparent">
                <h2 className="card-title text-white text-2xl">{category.name}</h2>
                <div className="flex items-center gap-2 mb-2">
                  <div className="badge badge-primary">{category._count?.products || 0} ürün</div>
                  <div className="badge badge-outline badge-secondary">Popüler</div>
                </div>
                <div className="card-actions justify-end">
                  <Link href={`/categories/${category.slug || category.id}`} className="btn btn-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    Keşfet
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-12">
        <Link
          href="/categories"
          className="btn btn-outline btn-primary btn-wide hover:bg-base-300"
        >
          Tüm Kategorileri Gör
        </Link>
      </div>
    </section>
  );
};

export default Categories;
