'use client'

import { PostCard } from '@/components/ui/post-card'
import { TypographyH2 } from '@/lib/typography'

// Example post data
const samplePost = {
  id: '1',
  title: 'Marmara Denizi\'nde Büyük Av',
  content: 'Bugün Marmara Denizi\'nde harika bir gün geçirdim. Sabah erken saatlerde denize açıldık ve toplam 5 adet lüfer yakaladık. Hava koşulları mükemmeldi ve deniz oldukça sakindi. Teknemle Büyükada açıklarına kadar gittim...',
  image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
  created_at: '2024-01-15T10:00:00Z',
  status: 'published' as const,
  author: {
    id: '123',
    username: 'denizci_mehmet',
    full_name: 'Mehmet Yılmaz',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
    is_pro: true
  },
  stats: {
    views: 1250,
    likes: 89,
    comments: 23,
    shares: 12
  },
  location: 'Marmara Denizi, İstanbul',
  category: 'Lüfer Avı',
  tags: ['lüfer', 'marmara', 'tekne', 'sabah-avı']
}

export function PostCardExamples() {
  const handleEdit = (id: string) => {
    console.log('Edit post:', id)
  }

  const handleDelete = (id: string) => {
    console.log('Delete post:', id)
  }

  const handleView = (id: string) => {
    console.log('View post:', id)
  }

  const handleStatusChange = (id: string, status: string) => {
    console.log('Change status:', id, status)
  }

  return (
    <div className="space-y-8 p-8">
      <div>
        <TypographyH2 className="mb-4">Default Post Card</TypographyH2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <PostCard 
            post={samplePost}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onStatusChange={handleStatusChange}
          />
          
          {/* Without image */}
          <PostCard 
            post={{
              ...samplePost,
              image_url: undefined,
              status: 'draft'
            }}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onStatusChange={handleStatusChange}
          />
          
          {/* Banned status */}
          <PostCard 
            post={{
              ...samplePost,
              status: 'banned',
              title: 'Yasaklanmış İçerik',
              content: 'Bu içerik topluluk kurallarına aykırı bulunduğu için yasaklanmıştır.'
            }}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>

      <div>
        <TypographyH2 className="mb-4">Compact Post Card (for lists)</TypographyH2>
        <div className="space-y-2 max-w-4xl">
          <PostCard 
            post={samplePost}
            variant="compact"
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onStatusChange={handleStatusChange}
          />
          
          <PostCard 
            post={{
              ...samplePost,
              id: '2',
              title: 'Karadeniz\'de Hamsi Sezonu',
              content: 'Hamsi sezonu başladı! Trabzon açıklarında bolca hamsi var. Hava biraz dalgalı ama av başarılı geçti.',
              status: 'published',
              stats: {
                views: 890,
                likes: 67,
                comments: 15,
                shares: 8
              }
            }}
            variant="compact"
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onStatusChange={handleStatusChange}
          />
          
          <PostCard 
            post={{
              ...samplePost,
              id: '3',
              title: undefined,
              image_url: undefined,
              content: 'Bugün hava çok güzeldi, küçük bir tekne turu yaptım. Av yapamadım ama manzara harikaydı.',
              status: 'archived',
              stats: {
                views: 234,
                likes: 12,
                comments: 3,
                shares: 1
              }
            }}
            variant="compact"
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>

      <div>
        <TypographyH2 className="mb-4">Detailed Post Card</TypographyH2>
        <div className="max-w-2xl">
          <PostCard 
            post={samplePost}
            variant="detailed"
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>
    </div>
  )
}