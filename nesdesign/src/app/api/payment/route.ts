import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createPayment, createDownloadLink } from '@/lib/payment';
import { getServerSession } from 'next-auth/next';

const prisma = new PrismaClient();

// Ödeme işlemini başlat
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
    const { cartId, paymentMethod } = body;

    // Sepeti getir
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      return NextResponse.json(
        { error: 'Sepet bulunamadı' },
        { status: 404 }
      );
    }

    // Toplam tutarı hesapla
    const total = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // Ödeme işlemini başlat
    const payment = await createPayment(
      total,
      'TRY',
      'Dijital ürün satın alma',
      { cartId, userId }
    );

    // Sipariş oluştur
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        paymentMethod,
        paymentId: payment.paymentId,
        status: 'PENDING',
        isDigitalOrder: true,
        items: {
          create: await Promise.all(cart.items.map(async (item) => {
            // Her ürün için indirme bağlantısı oluştur
            const downloadInfo = await createDownloadLink(
              'new-order', // Sipariş ID henüz bilinmiyor, sonra güncellenecek
              item.product.id,
              userId
            );

            return {
              productId: item.product.id,
              quantity: item.quantity,
              price: item.product.price,
              isDigital: item.product.isDigital || true,
              downloadUrl: downloadInfo.downloadUrl,
              buyerId: userId,
              expiresAt: new Date(downloadInfo.expiresAt),
            };
          })),
        },
      },
    });

    // Sipariş oluşturulduktan sonra, indirme bağlantılarını güncelle
    for (const orderItem of order.items) {
      await prisma.orderItem.update({
        where: { id: orderItem.id },
        data: {
          downloadUrl: orderItem.downloadUrl.replace('new-order', order.id),
        },
      });
    }

    // Sepeti temizle
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        total,
        status: order.status,
        paymentId: payment.paymentId,
      },
      payment,
    });
  } catch (error) {
    console.error('Ödeme işlemi sırasında hata:', error);
    return NextResponse.json(
      { error: 'Ödeme işlemi sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
