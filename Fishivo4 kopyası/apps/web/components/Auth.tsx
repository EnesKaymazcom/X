'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/supabase'

interface AuthComponentProps {
  redirectTo?: string
}

export default function AuthComponent({ redirectTo }: AuthComponentProps) {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Fishivo'ya Hoşgeldiniz</h1>
          <p>Balık tutma deneyimlerinizi paylaşın ve keşfedin</p>
        </div>
        
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#2e7d32',
                  brandAccent: '#1b5e20',
                  brandButtonText: 'white',
                  defaultButtonBackground: '#f5f5f5',
                  defaultButtonBackgroundHover: '#e0e0e0',
                  inputBackground: 'white',
                  inputBorder: '#d1d5db',
                  inputBorderHover: '#2e7d32',
                  inputBorderFocus: '#2e7d32'
                }
              }
            },
            className: {
              container: 'auth-widget',
              button: 'auth-button',
              input: 'auth-input'
            }
          }}
          providers={['google', 'github']}
          redirectTo={redirectTo || `${window.location.origin}/dashboard`}
          onlyThirdPartyProviders={false}
          magicLink={true}
          showLinks={true}
          localization={{
            variables: {
              sign_in: {
                email_label: 'E-posta',
                password_label: 'Şifre',
                button_label: 'Giriş Yap',
                loading_button_label: 'Giriş yapılıyor...',
                social_provider_text: '{{provider}} ile giriş yap',
                link_text: 'Zaten hesabınız var mı? Giriş yapın'
              },
              sign_up: {
                email_label: 'E-posta',
                password_label: 'Şifre',
                button_label: 'Kayıt Ol',
                loading_button_label: 'Kayıt olunuyor...',
                social_provider_text: '{{provider}} ile kayıt ol',
                link_text: 'Hesabınız yok mu? Kayıt olun'
              },
              magic_link: {
                email_input_label: 'E-posta adresi',
                button_label: 'Magic Link Gönder',
                loading_button_label: 'Gönderiliyor...',
                link_text: 'Magic link ile giriş yap',
                confirmation_text: 'E-posta adresinizi kontrol edin'
              },
              forgotten_password: {
                email_label: 'E-posta adresi',
                button_label: 'Şifre sıfırlama linki gönder',
                loading_button_label: 'Gönderiliyor...',
                link_text: 'Şifrenizi mi unuttunuz?',
                confirmation_text: 'Şifre sıfırlama linki gönderildi'
              }
            }
          }}
        />
      </div>
      
      <style jsx>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
          padding: 20px;
        }
        
        .auth-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          padding: 40px;
          width: 100%;
          max-width: 400px;
        }
        
        .auth-header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .auth-header h1 {
          color: #2e7d32;
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 10px 0;
        }
        
        .auth-header p {
          color: #666;
          font-size: 16px;
          margin: 0;
        }
        
        :global(.auth-widget) {
          width: 100%;
        }
        
        :global(.auth-button) {
          border-radius: 8px !important;
          font-weight: 600 !important;
          transition: all 0.2s ease !important;
        }
        
        :global(.auth-input) {
          border-radius: 8px !important;
          border: 2px solid #e0e0e0 !important;
          transition: border-color 0.2s ease !important;
        }
        
        :global(.auth-input:focus) {
          border-color: #2e7d32 !important;
          box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1) !important;
        }
      `}</style>
    </div>
  )
}