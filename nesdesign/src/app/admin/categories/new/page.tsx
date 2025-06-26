'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function NewCategoryPage() {
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Burada API'ye kategori adını gönderme işlemi yapılacak
    console.log('Category name:', name);
    alert('Kategori ekleme işlevi henüz uygulanmadı.');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Yeni Kategori Ekle</h1>
        <Link 
          href="/admin/categories" 
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition duration-300"
        >
          Geri Dön
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Kategori Adı
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-md transition duration-300"
            >
              Kategoriyi Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
