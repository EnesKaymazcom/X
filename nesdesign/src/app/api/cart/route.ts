import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';

const prisma = new PrismaClient();

// Kullanıcının sepetini getir
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    // Kullanıcı oturum açmamışsa boş sepet döndür
    if (!session?.user?.id) {
      return NextResponse.json({
        id: null,
        userId: null,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    const userId = session.user.id;

    // Kullanıcının sepetini getir
    let cart = await prisma.cart.findUnique({
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

    // Sepet yoksa oluştur
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
        },
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
    }

    return NextResponse.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Sepet getirilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

// Sepete ürün ekle
export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const { productId, quantity } = body;

    // Ürün bilgilerini getir
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Ürün bulunamadı' },
        { status: 404 }
      );
    }

    // Kullanıcının sepetini getir
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    // Sepet yoksa oluştur
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
        },
      });
    }

    // Sepette aynı ürün var mı kontrol et
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    let cartItem;

    if (existingCartItem) {
      // Varsa miktarı güncelle
      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + quantity,
        },
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      });
    } else {
      // Yoksa yeni öğe ekle
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      });
    }

    // Güncellenmiş sepeti getir
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
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
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'Ürün sepete eklenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}
