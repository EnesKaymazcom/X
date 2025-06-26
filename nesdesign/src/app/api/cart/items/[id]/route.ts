import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';

const prisma = new PrismaClient();

// Sepet öğesini güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    // Kullanıcı oturum açmamışsa hata döndür
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const id = params.id;
    const body = await request.json();
    const { quantity } = body;

    // Sepet öğesini bul ve kullanıcıya ait olduğunu doğrula
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: {
        cart: true,
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Sepet öğesi bulunamadı' },
        { status: 404 }
      );
    }

    if (cartItem.cart.userId !== userId) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    // Sepet öğesini güncelle
    const updatedCartItem = await prisma.cartItem.update({
      where: { id },
      data: {
        quantity: parseInt(quantity.toString()),
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    // Güncellenmiş sepeti getir
    const updatedCart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json(
      { error: 'Sepet öğesi güncellenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

// Sepet öğesini sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    // Kullanıcı oturum açmamışsa hata döndür
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const id = params.id;

    // Sepet öğesini bul ve kullanıcıya ait olduğunu doğrula
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: {
        cart: true,
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Sepet öğesi bulunamadı' },
        { status: 404 }
      );
    }

    if (cartItem.cart.userId !== userId) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    // Sepet öğesini sil
    await prisma.cartItem.delete({
      where: { id },
    });

    // Güncellenmiş sepeti getir
    const updatedCart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error('Error deleting cart item:', error);
    return NextResponse.json(
      { error: 'Sepet öğesi silinirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
