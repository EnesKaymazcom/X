'use server'

import { createSupabaseActionClient } from '@fishivo/api/client/supabase.server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const SignInSchema = z.object({
  email: z.string().email('Geçerli bir email adresi girin'),
  password: z.string().min(1, 'Şifre gerekli'),
})

const SignUpSchema = z.object({
  email: z.string().email('Geçerli bir email adresi girin'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalı'),
  username: z.string().min(3, 'Kullanıcı adı en az 3 karakter olmalı'),
  firstName: z.string().min(1, 'Ad gerekli'),
  lastName: z.string().min(1, 'Soyad gerekli'),
})

export async function signInAction(prevState: any, formData: FormData) {
  const validatedFields = SignInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    }
  }

  const { email, password } = validatedFields.data
  const supabase = await createSupabaseActionClient()

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      let errorMessage = 'Giriş yapılamadı'
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'E-posta adresi veya şifre hatalı'
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'E-posta adresinizi doğrulamanız gerekiyor'
      } else if (error.message.includes('Too many requests')) {
        errorMessage = 'Çok fazla deneme. Lütfen daha sonra tekrar deneyin'
      }

      return {
        errors: { _form: [errorMessage] },
        success: false,
      }
    }

    if (!data.user) {
      return {
        errors: { _form: ['Beklenmeyen hata oluştu'] },
        success: false,
      }
    }

    return {
      success: true,
      user: data.user,
    }
  } catch (error) {
    return {
      errors: { _form: ['Bir hata oluştu. Lütfen tekrar deneyin.'] },
      success: false,
    }
  }
}

export async function signUpAction(prevState: any, formData: FormData) {
  const validatedFields = SignUpSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    username: formData.get('username'),
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    }
  }

  const { email, password, username, firstName, lastName } = validatedFields.data
  const locale = formData.get('locale') as string || 'tr'
  const supabase = await createSupabaseActionClient()

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          first_name: firstName,
          last_name: lastName,
          locale: locale,
        },
      },
    })

    if (error) {
      let errorMessage = 'Kayıt oluşturulamadı'
      
      if (error.message.includes('User already registered')) {
        errorMessage = 'Bu e-posta adresi zaten kayıtlı'
      } else if (error.message.includes('Password should be at least')) {
        errorMessage = 'Şifre en az 6 karakter olmalı'
      }

      return {
        errors: { _form: [errorMessage] },
        success: false,
      }
    }

    return {
      success: true,
      needsVerification: !data.session,
      user: data.user,
    }
  } catch (error) {
    return {
      errors: { _form: ['Bir hata oluştu. Lütfen tekrar deneyin.'] },
      success: false,
    }
  }
}

export async function signOutAction() {
  const supabase = await createSupabaseActionClient()
  
  try {
    await supabase.auth.signOut()
    return { success: true }
  } catch (error) {
    return { success: false, error: error }
  }
}

export async function signInWithOAuthAction(provider: 'google' | 'facebook') {
  const supabase = await createSupabaseActionClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    return {
      error: error.message,
    }
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function forgotPasswordAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const locale = formData.get('locale') as string || 'tr'
  
  if (!email) {
    return {
      errors: { _form: ['E-posta adresi gerekli'] },
      success: false,
    }
  }

  const supabase = await createSupabaseActionClient()
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm?type=recovery&next=/${locale}/reset-password`,
    })

    if (error) {
      console.error('Password reset error:', error)
      
      let errorMessage = 'Şifre sıfırlama e-postası gönderilemedi'
      
      if (error.message.includes('rate limit')) {
        errorMessage = 'Çok fazla istek. Lütfen birkaç dakika bekleyip tekrar deneyin.'
      } else if (error.message.includes('not found')) {
        errorMessage = 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.'
      }
      
      return {
        errors: { _form: [errorMessage] },
        success: false,
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      errors: { _form: ['Beklenmeyen bir hata oluştu'] },
      success: false,
    }
  }
}