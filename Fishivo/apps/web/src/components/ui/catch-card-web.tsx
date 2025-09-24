'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Heart, MessageCircle, Share2, MapPin, Fish, 
  UserPlus, User, MoreVertical, ChevronLeft, ChevronRight,
  Flag, Ban
} from 'lucide-react'
import { Button } from './button'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'
import { ProBadge } from './pro-badge'
import { Card, CardContent } from './card'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './dialog'

interface CatchCardWebProps {
  postData: {
    id: string
    slug: string
    title?: string
    images?: string[]
    image_url?: string
    user: {
      id: string
      username: string
      full_name?: string
      avatar_url?: string
      location?: string
      is_pro?: boolean
    }
    likes: number
    comments: number
    isLiked: boolean
    created_at: string
    fish_species?: string
    currentUserId?: string
  }
  locale: string
  timeAgo: string
  onLike: () => void
  onShare: () => void
  isLikeLoading: boolean
}

export function CatchCardWeb({ 
  postData, 
  locale, 
  timeAgo, 
  onLike, 
  onShare, 
  isLikeLoading 
}: CatchCardWebProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)

  // Görselleri hazırla
  const images = postData.images && postData.images.length > 0 
    ? postData.images 
    : postData.image_url 
    ? [postData.image_url] 
    : []

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)
  }

  const handleNextImage = () => {
    setCurrentImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)
  }

  const handleReport = () => {
    toast.success(locale === 'tr' ? 'Şikayet alındı' : 'Report received')
  }

  const handleBlock = () => {
    toast.success(locale === 'tr' ? 'Kullanıcı engellendi' : 'User blocked')
  }

  const handleShareFromMenu = () => {
    setIsMoreMenuOpen(false)
    onShare()
  }

  return (
    <>
      <Card className="overflow-hidden shadow-sm">
        <CardContent className="p-0">
        {/* User Header */}
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between">
            <Link 
              href={`/${locale}/${postData.user.username}`}
              className="flex items-center gap-3 flex-1"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={postData.user.avatar_url} />
                <AvatarFallback>
                  {postData.user.full_name?.[0] || postData.user.username?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    {postData.user.full_name || postData.user.username}
                  </span>
                  {postData.user.is_pro && <ProBadge variant="icon" />}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>{postData.user.location || 'Unknown location'}</span>
                </div>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant={isFollowing ? "secondary" : "default"}
                onClick={() => setIsFollowing(!isFollowing)}
                className={!isFollowing ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                {isFollowing ? (
                  <>
                    <User className="w-4 h-4 mr-1" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-1" />
                    Follow
                  </>
                )}
              </Button>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={onShare}>
                    <Share2 className="mr-2 h-4 w-4" />
                    <span>{locale === 'tr' ? 'Paylaş' : 'Share'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleReport}>
                    <Flag className="mr-2 h-4 w-4 text-red-500" />
                    <span>{locale === 'tr' ? 'Şikayet Et' : 'Report'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleBlock}>
                    <Ban className="mr-2 h-4 w-4 text-orange-500" />
                    <span>{locale === 'tr' ? 'Engelle' : 'Block'}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Images Container */}
        {images.length > 0 && (
          <div className="relative bg-black/5">
            {/* Ana Görsel */}
            <div className="relative overflow-hidden">
              <img
                src={images[currentImageIndex]}
                alt={postData.fish_species || 'Catch'}
                className="w-full h-auto object-contain max-h-[600px]"
              />
              
              {/* Navigation Buttons - Sadece birden fazla görsel varsa */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              {images.length > 1 && (
                <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-medium">
                  {currentImageIndex + 1}/{images.length}
                </div>
              )}
            </div>

            {/* Dots Indicator */}
            {images.length > 1 && (
              <div className="flex justify-center gap-2 py-3">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      index === currentImageIndex 
                        ? "bg-primary" 
                        : "bg-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions Bar */}
        <div className="px-4 py-3 border-t">
          <div className="flex items-center gap-6">
            <button 
              onClick={onLike}
              disabled={isLikeLoading}
              className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
            >
              <Heart className={cn(
                "w-5 h-5", 
                postData.isLiked && "fill-red-500 text-red-500"
              )} />
              {postData.likes > 0 && (
                <span className="font-medium">{postData.likes}</span>
              )}
            </button>
            
            <button className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
              <MessageCircle className="w-5 h-5" />
              {postData.comments > 0 && (
                <span className="font-medium">{postData.comments}</span>
              )}
            </button>
            
            <button 
              onClick={onShare}
              className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* More Options Dialog */}
    <Dialog open={isMoreMenuOpen} onOpenChange={setIsMoreMenuOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {locale === 'tr' ? 'Seçenekler' : 'Options'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 py-4">
          <Button
            variant="ghost"
            className="justify-start gap-3 h-12"
            onClick={handleReport}
          >
            <Flag className="h-5 w-5 text-red-500" />
            <span>{locale === 'tr' ? 'Şikayet Et' : 'Report'}</span>
          </Button>
          
          <Button
            variant="ghost"
            className="justify-start gap-3 h-12"
            onClick={handleBlock}
          >
            <Ban className="h-5 w-5 text-orange-500" />
            <span>{locale === 'tr' ? 'Engelle' : 'Block'}</span>
          </Button>
          
          <Button
            variant="ghost"
            className="justify-start gap-3 h-12"
            onClick={handleShareFromMenu}
          >
            <Share2 className="h-5 w-5" />
            <span>{locale === 'tr' ? 'Paylaş' : 'Share'}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}