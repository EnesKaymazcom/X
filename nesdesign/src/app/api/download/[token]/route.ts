import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';

const prisma = new PrismaClient();

// Dijital ürün indirme
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const session = await getServerSession();
    const token = params.token;

    // Token'a göre sipariş öğesini bul
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        downloadUrl: {
          contains: token,
        },
      },
      include: {
        product: true,
        order: true,
      },
    });

    if (!orderItem) {
      return NextResponse.json(
        { error: 'Geçersiz indirme bağlantısı' },
        { status: 404 }
      );
    }

    // Sipariş durumunu kontrol et
    if (orderItem.order.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Sipariş henüz tamamlanmadı' },
        { status: 403 }
      );
    }

    // Son kullanma tarihini kontrol et
    if (orderItem.expiresAt && new Date(orderItem.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'İndirme bağlantısının süresi dolmuş' },
        { status: 403 }
      );
    }

    // Kullanıcı kimliği doğrulaması (opsiyonel)
    if (session?.user?.id) {
      // Sipariş sahibi mi kontrol et
      if (orderItem.buyerId !== session.user.id) {
        // Admin değilse erişimi reddet
        if (session.user.role !== 'ADMIN') {
          return NextResponse.json(
            { error: 'Bu dosyaya erişim izniniz yok' },
            { status: 403 }
          );
        }
      }
    }

    // İndirme sayısını artır
    await prisma.orderItem.update({
      where: { id: orderItem.id },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });

    // Ürünün indirme bağlantısına yönlendir
    return NextResponse.redirect(orderItem.product.downloadUrl);
  } catch (error) {
    console.error('İndirme işlemi sırasında hata:', error);
    return NextResponse.json(
      { error: 'İndirme işlemi sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
