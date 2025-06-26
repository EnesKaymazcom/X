import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';

const prisma = new PrismaClient();

// Kullanıcının indirmelerini getir
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Kullanıcının satın aldığı dijital ürünleri getir
    const downloads = await prisma.orderItem.findMany({
      where: {
        buyerId: userId,
        isDigital: true,
        order: {
          status: 'COMPLETED',
        },
      },
      include: {
        product: true,
        order: {
          select: {
            createdAt: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(downloads);
  } catch (error) {
    console.error('İndirmeler getirilirken hata:', error);
    return NextResponse.json(
      { error: 'İndirmeler getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
