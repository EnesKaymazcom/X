import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Belirli bir ürünü getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Ürün bulunamadı.' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Ürün getirilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

// Ürünü güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    const { name, description, price, categoryId, stock, image, details, features, gallery, imagePublicId, galleryPublicIds } = body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        details,
        price: parseFloat(price),
        categoryId,
        stock: parseInt(stock),
        image,
        imagePublicId,
        gallery,
        galleryPublicIds,
        features,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Ürün güncellenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

// Ürünü sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Ürün başarıyla silindi.' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Ürün silinirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
