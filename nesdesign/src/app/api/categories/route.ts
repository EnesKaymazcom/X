import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { slugify } from '@/lib/utils';

const prisma = new PrismaClient();

// Tüm kategorileri getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Filtreler
    const featured = searchParams.get('featured');
    const withProducts = searchParams.get('withProducts');
    const slug = searchParams.get('slug');

    // Filtreleme koşulları
    const where: any = {};

    if (featured === 'true') {
      where.featured = true;
    }

    if (slug) {
      where.slug = slug;
    }

    // Kategorileri getir
    const categories = await prisma.category.findMany({
      where,
      include: {
        _count: {
          select: {
            products: true,
          },
        },
        ...(withProducts === 'true' && {
          products: {
            take: 4, // Her kategori için en fazla 4 ürün
            orderBy: {
              createdAt: 'desc'
            }
          }
        })
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Kategoriler getirilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

// Yeni kategori ekle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, description, image, featured } = body;

    // Slug oluştur
    const slug = slugify(name);

    // Kategori oluştur
    const category = await prisma.category.create({
      data: {
        name,
        description,
        image,
        featured: featured || false,
        slug
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Kategori oluşturulurken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
