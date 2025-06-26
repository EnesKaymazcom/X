import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, FileFormat } from '@prisma/client';
import { slugify } from '@/lib/utils';

const prisma = new PrismaClient();

// Tüm ürünleri getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Filtreler
    const categoryId = searchParams.get('categoryId');
    const categorySlug = searchParams.get('categorySlug');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const templateType = searchParams.get('templateType');
    const fileFormat = searchParams.get('fileFormat');
    const sort = searchParams.get('sort') || 'createdAt_desc'; // Varsayılan sıralama

    // Sayfalama
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    // Filtreleme koşulları
    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (categorySlug) {
      where.category = {
        slug: categorySlug
      };
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ];
    }

    if (minPrice) {
      where.price = {
        ...where.price,
        gte: parseFloat(minPrice)
      };
    }

    if (maxPrice) {
      where.price = {
        ...where.price,
        lte: parseFloat(maxPrice)
      };
    }

    if (templateType) {
      where.templateType = templateType;
    }

    if (fileFormat) {
      where.fileFormat = fileFormat as FileFormat;
    }

    // Sıralama
    const [sortField, sortOrder] = sort.split('_');
    const orderBy: any = {};
    orderBy[sortField] = sortOrder;

    // Toplam ürün sayısını al
    const totalProducts = await prisma.product.count({ where });
    const totalPages = Math.ceil(totalProducts / limit);

    // Ürünleri getir
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy,
      skip,
      take: limit,
    });

    return NextResponse.json({
      products,
      pagination: {
        total: totalProducts,
        totalPages,
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Ürünler getirilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

// Yeni ürün ekle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      description,
      price,
      categoryId,
      downloadUrl,
      image
    } = body;

    console.log('Ürün ekleme isteği:', {
      name,
      description,
      price,
      categoryId,
      downloadUrl,
      image
    });

    // Kategori kontrolü
    let category;
    try {
      category = await prisma.category.findUnique({
        where: { id: categoryId }
      });

      if (!category) {
        return NextResponse.json(
          { error: `Kategori bulunamadı: ${categoryId}` },
          { status: 400 }
        );
      }

      console.log('Kategori bulundu:', category);
    } catch (e) {
      console.error('Kategori aranırken hata:', e);
      return NextResponse.json(
        { error: `Kategori aranırken bir hata oluştu: ${e instanceof Error ? e.message : 'Bilinmeyen hata'}` },
        { status: 500 }
      );
    }

    // Fiyat kontrolü
    let parsedPrice;
    try {
      parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        throw new Error('Geçersiz fiyat');
      }
    } catch (e) {
      return NextResponse.json(
        { error: 'Geçersiz fiyat formatı. Pozitif bir sayı giriniz.' },
        { status: 400 }
      );
    }

    // Image ID çıkarma
    let imagePublicId = null;
    try {
      if (image && image.includes('/')) {
        const parts = image.split('/');
        const lastPart = parts[parts.length - 1];
        imagePublicId = lastPart.split('.')[0] || null;
      }
    } catch (e) {
      console.warn('Image public ID çıkarılamadı:', e);
    }

    console.log('Ürün oluşturuluyor:', {
      name,
      description,
      price: parsedPrice,
      categoryId,
      downloadUrl,
      image,
      imagePublicId
    });

    // Slug oluştur
    const slug = slugify(name);

    // Ürün oluştur
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parsedPrice,
        categoryId,
        downloadUrl,
        image,
        imagePublicId,
        gallery: [],
        galleryPublicIds: [],
        features: [],
        slug,
        isDigital: true,
        fileFormat: body.fileFormat as FileFormat || FileFormat.ZIP,
        fileSize: body.fileSize || '10MB',
        templateType: body.templateType || 'Other',
        compatibility: body.compatibility || [],
        tags: body.tags || [],
        featured: body.featured || false,
        details: body.details || '',
        demoUrl: body.demoUrl || null
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    // Daha detaylı hata mesajı
    const errorMessage = error instanceof Error
      ? `Ürün oluşturulurken bir hata oluştu: ${error.message}`
      : 'Ürün oluşturulurken bilinmeyen bir hata oluştu.';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
