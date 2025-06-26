import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Gerekli alanları kontrol et
    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-posta ve şifre gereklidir' },
        { status: 400 }
      );
    }

    // Şifre uzunluğunu kontrol et
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      );
    }

    // Kullanıcıyı kaydet
    const user = await registerUser(email, password, name);

    return NextResponse.json(
      { success: true, user },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Kullanıcı kaydı sırasında hata:', error);
    
    // Hata mesajını kontrol et
    if (error.message === 'Bu e-posta adresi zaten kullanımda') {
      return NextResponse.json(
        { error: error.message },
        { status: 409 } // Conflict
      );
    }
    
    return NextResponse.json(
      { error: 'Kullanıcı kaydı sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
