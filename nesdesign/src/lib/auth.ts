import { getServerSession } from 'next-auth/next';
import { hash } from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Kullanıcı kaydı yapar
 * @param email Kullanıcı e-posta adresi
 * @param password Kullanıcı şifresi
 * @param name Kullanıcı adı (opsiyonel)
 * @returns Oluşturulan kullanıcı
 */
export async function registerUser(email: string, password: string, name?: string) {
  // E-posta adresinin kullanımda olup olmadığını kontrol et
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('Bu e-posta adresi zaten kullanımda');
  }

  // Şifreyi hashle
  const hashedPassword = await hash(password, 10);

  // Kullanıcıyı oluştur
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: name || email.split('@')[0], // İsim verilmezse e-postadan al
      role: 'USER', // Varsayılan rol
    },
  });

  // Kullanıcı için boş bir sepet oluştur
  await prisma.cart.create({
    data: {
      userId: user.id,
    },
  });

  // Hassas bilgileri kaldır
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Kullanıcının admin olup olmadığını kontrol eder
 * @param userId Kullanıcı ID'si
 * @returns Kullanıcı admin mi?
 */
export async function isAdmin(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return user?.role === 'ADMIN';
}

/**
 * Oturum açmış kullanıcıyı getirir
 * @returns Oturum açmış kullanıcı veya null
 */
export async function getAuthUser() {
  const session = await getServerSession();
  return session?.user || null;
}

/**
 * Kullanıcının sepetini getirir
 * @param userId Kullanıcı ID'si
 * @returns Kullanıcının sepeti
 */
export async function getUserCart(userId: string) {
  const cart = await prisma.cart.findUnique({
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

  return cart;
}
