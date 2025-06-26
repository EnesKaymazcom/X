'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    sortBy: 'newest',
    search: '',
  });

  // Simüle edilmiş ürün verileri
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Gerçek bir API çağrısı yapılacak olsaydı burada yapılırdı
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Örnek ürün verileri
        const sampleProducts: Product[] = [
          {
            id: '1',
            name: 'Modern Web Sitesi Şablonu',
            description: 'Şık ve modern tasarıma sahip, tamamen duyarlı web sitesi şablonu.',
            price: 199.99,
            category: 'Web Şablonları',
            image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1115&q=80',
          },
          {
            id: '2',
            name: 'E-ticaret UI Kiti',
            description: 'Kapsamlı e-ticaret kullanıcı arayüzü bileşenleri koleksiyonu.',
            price: 149.99,
            category: 'UI Kitleri',
            image: 'https://images.unsplash.com/photo-1556155092-490a1ba16284?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
          },
          {
            id: '3',
            name: 'Sosyal Medya İkon Paketi',
            description: '50+ modern sosyal medya ikonu içeren paket.',
            price: 29.99,
            category: 'İkonlar',
            image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
          },
          {
            id: '4',
            name: 'Mobil Uygulama Şablonu',
            description: 'iOS ve Android için hazır mobil uygulama şablonu.',
            price: 249.99,
            category: 'Mobil Şablonlar',
            image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
          },
          {
            id: '5',
            name: 'Fotoğraf Düzenleme Presetleri',
            description: 'Profesyonel fotoğraf düzenleme presetleri paketi.',
            price: 39.99,
            category: 'Fotoğrafçılık',
            image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
          },
          {
            id: '6',
            name: 'Kurumsal Sunum Şablonu',
            description: 'Profesyonel kurumsal sunum şablonları paketi.',
            price: 59.99,
            category: 'Sunumlar',
            image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
          },
          {
            id: '7',
            name: 'Animasyon Paketi',
            description: 'Web siteleri için hazır animasyon paketi.',
            price: 79.99,
            category: 'Animasyonlar',
            image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
          },
          {
            id: '8',
            name: 'Font Koleksiyonu',
            description: '20+ premium font içeren koleksiyon.',
            price: 49.99,
            category: 'Fontlar',
            image: 'https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
          },
        ];
        
        setProducts(sampleProducts);
        setLoading(false);
      } catch (err) {
        setError('Ürünler yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filtreleme ve sıralama fonksiyonları
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filteredProducts = products
    .filter((product) => {
      // Kategori filtresi
      if (filters.category && product.category !== filters.category) {
        return false;
      }
      
      // Fiyat aralığı filtresi
      if (filters.priceRange) {
        const [min, max] = filters.priceRange.split('-').map(Number);
        if (product.price < min || (max && product.price > max)) {
          return false;
        }
      }
      
      // Arama filtresi
      if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sıralama
      switch (filters.sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'newest':
        default:
          return 0; // Varsayılan sıralama (bu örnekte rastgele)
      }
    });

  // Benzersiz kategorileri al
  const categories = [...new Set(products.map((product) => product.category))];

  // Fiyat formatı
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(price);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Ürünlerimiz</h1>
        <div className="h-1 w-24 bg-primary mx-auto"></div>
        <p className="mt-4 text-base-content/80 max-w-2xl mx-auto">
          Projeleriniz için ihtiyacınız olan tüm dijital ürünleri keşfedin. Yüksek kaliteli şablonlar, UI kitleri, ikonlar ve daha fazlası.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 mb-12">
        {/* Filtreler */}
        <div className="lg:w-1/4">
          <div className="bg-base-200 p-6 rounded-xl sticky top-4">
            <h2 className="text-xl font-bold mb-4">Filtreler</h2>
            
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Ara</span>
              </label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Ürün ara..."
                className="input input-bordered w-full"
              />
            </div>
            
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Kategori</span>
              </label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="select select-bordered w-full"
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Fiyat Aralığı</span>
              </label>
              <select
                name="priceRange"
                value={filters.priceRange}
                onChange={handleFilterChange}
                className="select select-bordered w-full"
              >
                <option value="">Tüm Fiyatlar</option>
                <option value="0-50">0 TL - 50 TL</option>
                <option value="50-100">50 TL - 100 TL</option>
                <option value="100-200">100 TL - 200 TL</option>
                <option value="200-">200 TL ve üzeri</option>
              </select>
            </div>
            
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Sırala</span>
              </label>
              <select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
                className="select select-bordered w-full"
              >
                <option value="newest">En Yeniler</option>
                <option value="price-low">Fiyat: Düşükten Yükseğe</option>
                <option value="price-high">Fiyat: Yüksekten Düşüğe</option>
                <option value="name-asc">İsim: A-Z</option>
                <option value="name-desc">İsim: Z-A</option>
              </select>
            </div>
            
            <button
              className="btn btn-outline btn-block mt-4"
              onClick={() => setFilters({
                category: '',
                priceRange: '',
                sortBy: 'newest',
                search: '',
              })}
            >
              Filtreleri Temizle
            </button>
          </div>
        </div>

        {/* Ürün Listesi */}
        <div className="lg:w-3/4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : error ? (
            <div className="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-base-content/30 mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
              </svg>
              <h3 className="text-xl font-bold mb-2">Ürün Bulunamadı</h3>
              <p className="text-base-content/70">Arama kriterlerinize uygun ürün bulunamadı. Lütfen filtrelerinizi değiştirin.</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <p className="text-base-content/70">{filteredProducts.length} ürün bulundu</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                    <figure className="h-64 relative overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-110"
                      />
                    </figure>
                    <div className="card-body">
                      <div className="flex justify-between items-center">
                        <div className="badge badge-outline">{product.category}</div>
                        <div className="rating rating-sm">
                          <input type="radio" name={`rating-${product.id}`} className="mask mask-star-2 bg-primary" readOnly checked />
                          <input type="radio" name={`rating-${product.id}`} className="mask mask-star-2 bg-primary" readOnly checked />
                          <input type="radio" name={`rating-${product.id}`} className="mask mask-star-2 bg-primary" readOnly checked />
                          <input type="radio" name={`rating-${product.id}`} className="mask mask-star-2 bg-primary" readOnly checked />
                          <input type="radio" name={`rating-${product.id}`} className="mask mask-star-2 bg-primary" readOnly />
                        </div>
                      </div>
                      <h2 className="card-title mt-2">
                        <Link href={`/products/${product.id}`} className="hover:text-primary transition">
                          {product.name}
                        </Link>
                      </h2>
                      <p className="text-base-content/70 text-sm line-clamp-2">{product.description}</p>
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-xl font-bold text-primary">{formatPrice(product.price)}</span>
                        <button className="btn btn-primary btn-sm">
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
            </>
          )}
        </div>
      </div>

      <div className="bg-base-200 rounded-xl p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Özel Tasarım mı Arıyorsunuz?</h2>
        <p className="max-w-2xl mx-auto mb-6 text-base-content/80">
          İhtiyaçlarınıza özel tasarım çözümleri için bizimle iletişime geçin. Profesyonel ekibimiz size yardımcı olmaktan mutluluk duyacaktır.
        </p>
        <Link href="/contact" className="btn btn-primary">
          Bizimle İletişime Geçin
        </Link>
      </div>
    </div>
  );
}
