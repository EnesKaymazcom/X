import { PrismaClient, Role, FileFormat } from '@prisma/client';
// @ts-ignore
import { hash } from 'bcryptjs';
import { slugify } from '../../src/lib/utils';

const prisma = new PrismaClient();

async function main() {
  try {
    // Admin kullanıcısı oluştur
    const adminPassword = await hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@nesdesign.com' },
      update: {},
      create: {
        email: 'admin@nesdesign.com',
        name: 'Admin User',
        password: adminPassword,
        role: Role.ADMIN,
      },
    });
    console.log('Admin kullanıcısı oluşturuldu:', admin.email);

    // Test kullanıcısı oluştur
    const userPassword = await hash('user123', 10);
    const user = await prisma.user.upsert({
      where: { email: 'user@example.com' },
      update: {},
      create: {
        email: 'user@example.com',
        name: 'Test User',
        password: userPassword,
        role: Role.USER,
      },
    });
    console.log('Test kullanıcısı oluşturuldu:', user.email);

    // Kategoriler oluştur
    const categories = [
      {
        name: 'Next.js Templates',
        description: 'Modern ve hızlı web siteleri için Next.js şablonları',
        image: 'https://images.unsplash.com/photo-1557821552-17105176677c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80',
        featured: true
      },
      {
        name: 'Framer Templates',
        description: 'Etkileyici animasyonlar ve interaktif öğeler içeren Framer şablonları',
        image: 'https://images.unsplash.com/photo-1545235617-9465d2a55698?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1080&q=80',
        featured: true
      },
      {
        name: 'Wix Templates',
        description: 'Kolay özelleştirilebilir ve profesyonel Wix şablonları',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1115&q=80',
        featured: true
      },
      {
        name: 'Canva Templates',
        description: 'Sosyal medya ve sunum için profesyonel Canva şablonları',
        image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
        featured: true
      },
      {
        name: 'UI Kits',
        description: 'Web ve mobil uygulamalar için kapsamlı UI bileşenleri',
        image: 'https://images.unsplash.com/photo-1545235617-7a424c1a60cc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80',
        featured: false
      },
      {
        name: 'Landing Pages',
        description: 'Yüksek dönüşüm oranları için optimize edilmiş landing page şablonları',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        featured: false
      },
      {
        name: 'E-commerce Templates',
        description: 'Online mağazalar için optimize edilmiş e-ticaret şablonları',
        image: 'https://images.unsplash.com/photo-1556742031-c6961e8560b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        featured: false
      },
    ];

    for (const category of categories) {
      const slug = slugify(category.name);
      const createdCategory = await prisma.category.upsert({
        where: { name: category.name },
        update: {
          description: category.description,
          image: category.image,
          slug: slug,
          featured: category.featured
        },
        create: {
          ...category,
          slug: slug
        },
      });
      console.log('Kategori oluşturuldu:', createdCategory.name);
    }

    // Örnek ürünler oluştur
    const products = [
      {
        name: 'NextCommerce Pro',
        description: 'Tam özellikli e-ticaret çözümü için Next.js şablonu. SEO dostu, hızlı yükleme süresi ve modern tasarım.',
        price: 79.99,
        image: 'https://images.unsplash.com/photo-1557821552-17105176677c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80',
        categoryName: 'Next.js Templates',
        stock: 999,
      },
      {
        name: 'NextPortfolio',
        description: 'Geliştiriciler ve tasarımcılar için minimalist portföy şablonu. Kolay özelleştirme ve hızlı yükleme.',
        price: 49.99,
        image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1055&q=80',
        categoryName: 'Next.js Templates',
        stock: 999,
      },
      {
        name: 'NextBlog Ultimate',
        description: 'Blogcular için tam özellikli Next.js blog şablonu. Markdown desteği, yorum sistemi ve analitik entegrasyonu.',
        price: 59.99,
        image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        categoryName: 'Next.js Templates',
        stock: 999,
      },
      {
        name: 'FramerPortfolio Pro',
        description: 'Framer ile oluşturulmuş profesyonel portföy şablonu. Etkileyici animasyonlar ve interaktif öğeler.',
        price: 69.99,
        image: 'https://images.unsplash.com/photo-1545235617-9465d2a55698?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1080&q=80',
        categoryName: 'Framer Templates',
        stock: 999,
      },
      {
        name: 'FramerMotion UI Kit',
        description: 'Framer Motion ile oluşturulmuş kapsamlı UI bileşenleri kiti. 100+ bileşen ve 50+ sayfa şablonu.',
        price: 89.99,
        image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        categoryName: 'Framer Templates',
        stock: 999,
      },
      {
        name: 'WixBusiness Premium',
        description: 'Küçük işletmeler için profesyonel Wix şablonu. Rezervasyon sistemi, galeri ve iletişim formları dahil.',
        price: 59.99,
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1115&q=80',
        categoryName: 'Wix Templates',
        stock: 999,
      },
      {
        name: 'WixRestaurant Deluxe',
        description: 'Restoranlar için özel tasarlanmış Wix şablonu. Menü, rezervasyon ve sipariş sistemi entegrasyonu.',
        price: 69.99,
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        categoryName: 'Wix Templates',
        stock: 999,
      },
      {
        name: 'CanvaSocial Bundle',
        description: 'Sosyal medya için 200+ Canva şablonu paketi. Instagram, Facebook, Twitter ve Pinterest için tasarımlar.',
        price: 39.99,
        image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
        categoryName: 'Canva Templates',
        stock: 999,
      },
      {
        name: 'CanvaPresentation Pro',
        description: 'Profesyonel sunumlar için 50+ Canva şablonu. İş, eğitim ve pazarlama sunumları için tasarımlar.',
        price: 29.99,
        image: 'https://images.unsplash.com/photo-1633613286848-e6f43bbafb8d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        categoryName: 'Canva Templates',
        stock: 999,
      },
      {
        name: 'UI Elements Master Kit',
        description: 'Kapsamlı UI bileşenleri kiti. 500+ bileşen, 100+ sayfa şablonu ve 50+ özel ikon.',
        price: 99.99,
        image: 'https://images.unsplash.com/photo-1545235617-7a424c1a60cc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80',
        categoryName: 'UI Kits',
        stock: 999,
      },
      {
        name: 'SaaS Landing Page Kit',
        description: 'SaaS ürünleri için özel tasarlanmış landing page şablonları. A/B testi için 10 farklı versiyon.',
        price: 79.99,
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        categoryName: 'Landing Pages',
        stock: 999,
      },
      {
        name: 'E-commerce Starter Pack',
        description: 'E-ticaret siteleri için başlangıç paketi. Ürün sayfaları, sepet ve ödeme sayfaları dahil.',
        price: 89.99,
        image: 'https://images.unsplash.com/photo-1556742031-c6961e8560b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        categoryName: 'E-commerce Templates',
        stock: 999,
      },
    ];

    for (const product of products) {
      const category = await prisma.category.findUnique({
        where: { name: product.categoryName },
      });

      if (category) {
        const slug = slugify(product.name);

        // Ürünün zaten var olup olmadığını kontrol et
        const existingProduct = await prisma.product.findFirst({
          where: { name: product.name },
        });

        if (existingProduct) {
          // Ürün varsa güncelle
          const updatedProduct = await prisma.product.update({
            where: { id: existingProduct.id },
            data: {
              description: product.description,
              price: product.price,
              image: product.image,
              categoryId: category.id,
              slug: slug,
              isDigital: true,
              featured: Math.random() > 0.7, // Rastgele öne çıkan ürünler
              fileFormat: Math.random() > 0.5 ? FileFormat.ZIP : FileFormat.PDF,
              fileSize: `${Math.floor(Math.random() * 100) + 5}MB`,
              downloadUrl: `https://example.com/downloads/${slug}.zip`,
              demoUrl: `https://example.com/demo/${slug}`,
              templateType: product.categoryName.includes('Wix') ? 'Wix' :
                           product.categoryName.includes('Framer') ? 'Framer' :
                           product.categoryName.includes('Next') ? 'Next.js' : 'Other',
              compatibility: product.categoryName.includes('Wix') ? ['Wix', 'Editor X'] :
                            product.categoryName.includes('Framer') ? ['Framer'] :
                            product.categoryName.includes('Next') ? ['Next.js', 'React', 'Vercel'] :
                            ['All Platforms'],
              tags: [category.name, 'Digital Product', 'Template', product.categoryName.split(' ')[0]],
            },
          });
          console.log('Ürün güncellendi:', updatedProduct.name);
        } else {
          // Ürün yoksa oluştur
          const createdProduct = await prisma.product.create({
            data: {
              name: product.name,
              description: product.description,
              price: product.price,
              image: product.image,
              categoryId: category.id,
              slug: slug,
              isDigital: true,
              featured: Math.random() > 0.7, // Rastgele öne çıkan ürünler
              fileFormat: Math.random() > 0.5 ? FileFormat.ZIP : FileFormat.PDF,
              fileSize: `${Math.floor(Math.random() * 100) + 5}MB`,
              downloadUrl: `https://example.com/downloads/${slug}.zip`,
              demoUrl: `https://example.com/demo/${slug}`,
              templateType: product.categoryName.includes('Wix') ? 'Wix' :
                           product.categoryName.includes('Framer') ? 'Framer' :
                           product.categoryName.includes('Next') ? 'Next.js' : 'Other',
              compatibility: product.categoryName.includes('Wix') ? ['Wix', 'Editor X'] :
                            product.categoryName.includes('Framer') ? ['Framer'] :
                            product.categoryName.includes('Next') ? ['Next.js', 'React', 'Vercel'] :
                            ['All Platforms'],
              tags: [category.name, 'Digital Product', 'Template', product.categoryName.split(' ')[0]],
              gallery: [product.image], // Başlangıçta ana görsel galeri olarak da kullanılır
              galleryPublicIds: [],
              features: [
                'Kolay kurulum',
                'Tam özelleştirilebilir',
                'Mobil uyumlu',
                'SEO dostu',
                'Hızlı yükleme süresi'
              ],
            },
          });
          console.log('Ürün oluşturuldu:', createdProduct.name);
        }
      }
    }

    console.log('Seed işlemi başarıyla tamamlandı!');
  } catch (error) {
    console.error('Seed işlemi sırasında hata oluştu:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
