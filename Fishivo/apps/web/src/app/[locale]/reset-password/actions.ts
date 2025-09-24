'use server'

import { createSupabaseActionClient } from '@fishivo/api/client/supabase.server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const UpdatePasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Şifre en az 8 karakter olmalı')
    .regex(/[A-Z]/, 'En az bir büyük harf içermeli')
    .regex(/[a-z]/, 'En az bir küçük harf içermeli')
    .regex(/[0-9]/, 'En az bir rakam içermeli'),
})

export async function updatePasswordAction(prevState: any, formData: FormData) {
  const password = formData.get('password') as string
  const locale = formData.get('locale') as string || 'tr'

  // Validate password
  const validatedFields = UpdatePasswordSchema.safeParse({ password })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    }
  }

  const supabase = await createSupabaseActionClient()

  try {
    // First check if we have a valid session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      console.error('No session for password update:', sessionError)
      return {
        errors: { _form: ['Oturum süresi dolmuş. Lütfen şifre sıfırlama işlemini yeniden başlatın.'] },
        success: false,
      }
    }

    // Update the user's password
    const { error: updateError } = await supabase.auth.updateUser({
      password: validatedFields.data.password,
    })

    if (updateError) {
      console.error('Password update error:', updateError)
      
      let errorMessage = 'Şifre güncellenemedi'
      
      if (updateError.message.includes('same as the old')) {
        errorMessage = 'Yeni şifreniz eski şifrenizle aynı olamaz'
      } else if (updateError.message.includes('weak')) {
        errorMessage = 'Şifreniz çok zayıf. Daha güçlü bir şifre seçin.'
      }
      
      return {
        errors: { _form: [errorMessage] },
        success: false,
      }
    }

    // Sign out the user after password update (security best practice)
    await supabase.auth.signOut()

    // Return success
    return {
      success: true,
      message: 'Şifreniz başarıyla güncellendi. Lütfen yeni şifrenizle giriş yapın.',
    }
  } catch (error) {
    console.error('Unexpected error during password update:', error)
    return {
      errors: { _form: ['Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.'] },
      success: false,
    }
  }
}