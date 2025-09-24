'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTranslation } from '@/lib/i18n'
import { useLocale } from '@/lib/i18n'
import { TypographySmall, TypographyP } from '@/lib/typography'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu'
import { 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  MessageSquare, 
  Heart, 
  Share2,
  Calendar,
  MapPin,
  Fish,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface PostCardProps {
  post: {
    id: string
    title?: string
    content: string
    image_url?: string
    created_at: string
    updated_at?: string
    status?: 'draft' | 'published' | 'archived' | 'banned'
    author: {
      id: string
      username: string
      full_name?: string
      avatar_url?: string
      is_pro?: boolean
    }
    stats?: {
      views: number
      likes: number
      comments: number
      shares?: number
    }
    location?: string
    category?: string
    tags?: string[]
  }
  variant?: 'default' | 'compact' | 'detailed'
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onView?: (id: string) => void
  onStatusChange?: (id: string, status: string) => void
  className?: string
}

export function PostCard({ 
  post, 
  variant = 'default',
  onEdit, 
  onDelete, 
  onView,
  onStatusChange,
  className 
}: PostCardProps) {
  const { t } = useTranslation()
  const { locale } = useLocale()
  
  const statusConfig = {
    draft: { label: t('status.draft'), variant: 'secondary' as const, icon: Clock },
    published: { label: t('status.published'), variant: 'default' as const, icon: CheckCircle },
    archived: { label: t('status.archived'), variant: 'outline' as const, icon: AlertCircle },
    banned: { label: t('status.banned'), variant: 'destructive' as const, icon: AlertCircle }
  }

  const status = post.status || 'published'
  const StatusIcon = statusConfig[status].icon

  // Compact variant for list views
  if (variant === 'compact') {
    return (
      <Card className={cn("hover:shadow-md transition-shadow", className)}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Thumbnail */}
            {post.image_url && (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={post.image_url}
                  alt={post.title || 'Post image'}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  {post.title && (
                    <h4 className="font-semibold line-clamp-1">{post.title}</h4>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {post.content}
                  </p>
                  
                  {/* Meta */}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Avatar className="w-4 h-4">
                        <AvatarImage src={post.author.avatar_url} />
                        <AvatarFallback>{post.author.username[0]}</AvatarFallback>
                      </Avatar>
                      {post.author.username}
                    </span>
                    <span>{new Date(post.created_at).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')}</span>
                    {post.stats && (
                      <>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {post.stats.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {post.stats.likes}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Badge variant={statusConfig[status].variant} className="text-xs">
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusConfig[status].label}
                  </Badge>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(post.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          {t('actions.view')}
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(post.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          {t('actions.edit')}
                        </DropdownMenuItem>
                      )}
                      {onStatusChange && (
                        <>
                          <DropdownMenuSeparator />
                          {status !== 'published' && (
                            <DropdownMenuItem onClick={() => onStatusChange(post.id, 'published')}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              {t('actions.publish')}
                            </DropdownMenuItem>
                          )}
                          {status !== 'archived' && (
                            <DropdownMenuItem onClick={() => onStatusChange(post.id, 'archived')}>
                              <AlertCircle className="mr-2 h-4 w-4" />
                              {t('actions.archive')}
                            </DropdownMenuItem>
                          )}
                        </>
                      )}
                      {onDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onDelete(post.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('common.delete')}
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Default variant
  return (
    <Card className={cn("overflow-hidden hover:shadow-lg transition-shadow", className)}>
      {/* Image */}
      {post.image_url && (
        <div className="relative h-48 w-full">
          <Image
            src={post.image_url}
            alt={post.title || 'Post image'}
            fill
            className="object-cover"
          />
          <div className="absolute top-2 right-2">
            <Badge variant={statusConfig[status].variant} className="shadow-sm">
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig[status].label}
            </Badge>
          </div>
        </div>
      )}
      
      <CardHeader className="pb-3">
        {/* Author */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.author.avatar_url} />
              <AvatarFallback>{post.author.username[0]}</AvatarFallback>
            </Avatar>
            <div>
              <TypographyP className="font-medium">{post.author.full_name || post.author.username}</TypographyP>
              <TypographySmall className="text-muted-foreground">@{post.author.username}</TypographySmall>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={() => onView(post.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  {t('shared.common.ui.view')}
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(post.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  {t('action.edit')}
                </DropdownMenuItem>
              )}
              {onStatusChange && (
                <>
                  <DropdownMenuSeparator />
                  {status !== 'published' && (
                    <DropdownMenuItem onClick={() => onStatusChange(post.id, 'published')}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {t('shared.common.ui.publish')}
                    </DropdownMenuItem>
                  )}
                  {status !== 'archived' && (
                    <DropdownMenuItem onClick={() => onStatusChange(post.id, 'archived')}>
                      <AlertCircle className="mr-2 h-4 w-4" />
                      {t('actions.archive')}
                    </DropdownMenuItem>
                  )}
                  {status !== 'banned' && (
                    <DropdownMenuItem onClick={() => onStatusChange(post.id, 'banned')}>
                      <AlertCircle className="mr-2 h-4 w-4" />
                      {t('actions.ban')}
                    </DropdownMenuItem>
                  )}
                </>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete(post.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('shared.common.delete')}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        {/* Title & Content */}
        {post.title && (
          <h3 className="font-semibold text-lg mb-2 line-clamp-1">{post.title}</h3>
        )}
        <p className="text-sm text-muted-foreground line-clamp-3">
          {post.content}
        </p>
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {post.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Metadata */}
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(post.created_at).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')}
          </span>
          {post.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {post.location}
            </span>
          )}
          {post.category && (
            <span className="flex items-center gap-1">
              <Fish className="w-3 h-3" />
              {post.category}
            </span>
          )}
        </div>
      </CardContent>
      
      {/* Stats Footer */}
      {post.stats && (
        <CardFooter className="border-t pt-3">
          <div className="flex items-center justify-between w-full text-sm">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                <Eye className="w-4 h-4" />
                <span>{post.stats.views}</span>
              </button>
              <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                <Heart className="w-4 h-4" />
                <span>{post.stats.likes}</span>
              </button>
              <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                <MessageSquare className="w-4 h-4" />
                <span>{post.stats.comments}</span>
              </button>
              {post.stats.shares !== undefined && (
                <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span>{post.stats.shares}</span>
                </button>
              )}
            </div>
            
            {variant === 'detailed' && (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => onView?.(post.id)}>
                  {t('actions.details')}
                </Button>
                <Button size="sm" onClick={() => onEdit?.(post.id)}>
                  {t('action.edit')}
                </Button>
              </div>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}