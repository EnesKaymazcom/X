import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Kategoriler - NesDesign',
  description: 'NesDesign ürün kategorileri. Web şablonları, UI kitleri, ikonlar ve daha fazlası.',
};

type Category = {
  id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
  featured: boolean;
};

export default function CategoriesPage() {
  // Simüle edilmiş kategori verileri
  const categories: Category[] = [
    {
      id: 'web-templates',
      name: 'Web Şablonları',
      description: 'Modern ve duyarlı web sitesi şablonları. E-ticaret, portföy, blog ve daha fazlası.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1115&q=80',
      productCount: 24,
      featured: true,
    },
    {
      id: 'ui-kits',
      name: 'UI Kitleri',
      description: 'Kapsamlı kullanıcı arayüzü bileşenleri koleksiyonları. Web ve mobil uygulamalar için.',
      image: 'https://images.unsplash.com/photo-1556155092-490a1ba16284?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      productCount: 18,
      featured: true,
    },
    {
      id: 'icons',
      name: 'İkonlar',
      description: 'Yüksek kaliteli ikon paketleri. Farklı stiller ve formatlar.',
      image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
      productCount: 12,
      featured: false,
    },
    {
      id: 'mobile-templates',
      name: 'Mobil Şablonlar',
      description: 'iOS ve Android için hazır mobil uygulama şablonları.',
      image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
      productCount: 15,
      featured: true,
    },
    {
      id: 'photography',
      name: 'Fotoğrafçılık',
      description: 'Fotoğraf düzenleme presetleri ve şablonları.',
      image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      productCount: 9,
      featured: false,
    },
    {
      id: 'presentations',
      name: 'Sunumlar',
      description: 'Profesyonel sunum şablonları ve slayt tasarımları.',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      productCount: 7,
      featured: false,
    },
    {
      id: 'animations',
      name: 'Animasyonlar',
      description: 'Web siteleri ve uygulamalar için hazır animasyon paketleri.',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      productCount: 11,
      featured: false,
    },
    {
      id: 'fonts',
      name: 'Fontlar',
      description: 'Premium font koleksiyonları ve tipografi paketleri.',
      image: 'https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      productCount: 14,
      featured: false,
    },
  ];

  // Öne çıkan kategoriler
  const featuredCategories = categories.filter((category) => category.featured);
  // Diğer kategoriler
  const otherCategories = categories.filter((category) => !category.featured);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Kategoriler</h1>
        <div className="h-1 w-24 bg-primary mx-auto"></div>
        <p className="mt-4 text-base-content/80 max-w-2xl mx-auto">
          Projeleriniz için ihtiyacınız olan tüm dijital ürün kategorilerini keşfedin. Yüksek kaliteli şablonlar, UI kitleri, ikonlar ve daha fazlası.
        </p>
      </div>

      {/* Öne Çıkan Kategoriler */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8">Öne Çıkan Kategoriler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredCategories.map((category) => (
            <div key={category.id} className="card lg:card-side bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <figure className="lg:w-1/2 h-64 lg:h-auto relative">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover"
                />
              </figure>
              <div className="card-body lg:w-1/2">
                <h3 className="card-title text-2xl">{category.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <div className="badge badge-primary">{category.productCount} ürün</div>
                  <div className="badge badge-outline badge-secondary">Popüler</div>
                </div>
                <p className="text-base-content/80">{category.description}</p>
                <div className="card-actions justify-end mt-4">
                  <Link href={`/categories/${category.id}`} className="btn btn-primary">
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
      </div>

      {/* Tüm Kategoriler */}
      <div>
        <h2 className="text-2xl font-bold mb-8">Tüm Kategoriler</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {otherCategories.map((category) => (
            <div key={category.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <figure className="h-48 relative">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover"
                />
              </figure>
              <div className="card-body">
                <h3 className="card-title">{category.name}</h3>
                <div className="badge badge-primary mb-2">{category.productCount} ürün</div>
                <p className="text-base-content/80 text-sm line-clamp-2">{category.description}</p>
                <div className="card-actions justify-end mt-4">
                  <Link href={`/categories/${category.id}`} className="btn btn-primary btn-sm">
                    Keşfet
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Bölümü */}
      <div className="bg-base-200 rounded-xl p-8 text-center mt-16">
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
