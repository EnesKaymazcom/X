'use client'

import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@repo/ui/button'

export default function Dashboard() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Yükleniyor...</p>
        
        <style jsx>{`
          .loading-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #f5f5f5;
          }
          
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e0e0e0;
            border-top: 4px solid #2e7d32;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          p {
            color: #666;
            font-size: 16px;
          }
        `}</style>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Fishivo Dashboard</h1>
          <div className="user-info">
            <span>Hoşgeldin, {user.email}</span>
            <Button onClick={handleSignOut} variant="outline">
              Çıkış Yap
            </Button>
          </div>
        </div>
      </header>
      
      <main className="dashboard-main">
        <div className="dashboard-content">
          <div className="welcome-card">
            <h2>🎣 Fishivo'ya Hoşgeldiniz!</h2>
            <p>
              Balık tutma deneyimlerinizi paylaşmaya ve diğer balıkçıların 
              hikayelerini keşfetmeye hazır mısınız?
            </p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📍</div>
              <h3>Balık Noktaları</h3>
              <p>En iyi balık tutma noktalarını keşfedin ve paylaşın</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📸</div>
              <h3>Avlarınızı Paylaşın</h3>
              <p>Yakaladığınız balıkların fotoğraflarını paylaşın</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Topluluk</h3>
              <p>Diğer balıkçılarla bağlantı kurun ve deneyim paylaşın</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>İstatistikler</h3>
              <p>Balık tutma aktivitelerinizi takip edin</p>
            </div>
          </div>
        </div>
      </main>
      
      <style jsx>{`
        .dashboard-container {
          min-height: 100vh;
          background: #f8f9fa;
        }
        
        .dashboard-header {
          background: white;
          border-bottom: 1px solid #e0e0e0;
          padding: 20px 0;
        }
        
        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .dashboard-header h1 {
          color: #2e7d32;
          font-size: 28px;
          font-weight: 700;
          margin: 0;
        }
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        .user-info span {
          color: #666;
          font-weight: 500;
        }
        
        .dashboard-main {
          padding: 40px 0;
        }
        
        .dashboard-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        .welcome-card {
          background: white;
          border-radius: 12px;
          padding: 40px;
          margin-bottom: 40px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        
        .welcome-card h2 {
          color: #2e7d32;
          font-size: 32px;
          margin: 0 0 15px 0;
        }
        
        .welcome-card p {
          color: #666;
          font-size: 18px;
          line-height: 1.6;
          margin: 0;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }
        
        .feature-card {
          background: white;
          border-radius: 12px;
          padding: 30px;
          text-align: center;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
        }
        
        .feature-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }
        
        .feature-card h3 {
          color: #2e7d32;
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 10px 0;
        }
        
        .feature-card p {
          color: #666;
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
        }
        
        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }
          
          .user-info {
            flex-direction: column;
            gap: 10px;
          }
          
          .welcome-card {
            padding: 30px 20px;
          }
          
          .welcome-card h2 {
            font-size: 24px;
          }
          
          .welcome-card p {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  )
}