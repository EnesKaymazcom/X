'use client'

import React, { useEffect, useState } from 'react'
import { getProxiedImageUrl } from '@/lib/r2-image-helper'
import { cn } from '@/lib/utils'

interface ProtectedImageProps {
  src: string
  alt: string
  className?: string
  onError?: () => void
  style?: React.CSSProperties
  enableBase64?: boolean
}

export function ProtectedImage({
  src,
  alt,
  className,
  onError,
  style,
  enableBase64 = false,
  ...props
}: ProtectedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(getProxiedImageUrl(src))
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (enableBase64 && src) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0)
          const dataUrl = canvas.toDataURL('image/webp', 0.9)
          setImageSrc(dataUrl)
          setIsLoaded(true)
        }
      }
      img.onerror = () => {
        setImageSrc(getProxiedImageUrl(src))
        setIsLoaded(true)
      }
      img.src = getProxiedImageUrl(src)
    } else {
      setImageSrc(getProxiedImageUrl(src))
      setIsLoaded(true)
    }
  }, [src, enableBase64])

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    return false
  }

  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    return false
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2) {
      e.preventDefault()
      e.stopPropagation()
      return false
    }
  }


  return (
    <div 
      className={cn("relative inline-block protected-image-container", className)}
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
      onMouseDown={handleMouseDown}
      style={{
        ...style,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
    >
      <img
        src={imageSrc}
        alt={alt}
        className="w-full h-full object-cover"
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          WebkitUserDrag: 'none',
          KhtmlUserDrag: 'none',
          MozUserDrag: 'none',
          OUserDrag: 'none',
          userDrag: 'none'
        }}
        draggable={false}
        onError={onError}
        onDragStart={handleDragStart}
        onContextMenu={handleContextMenu}
        onMouseDown={handleMouseDown}
        {...props}
      />
      <div 
        className="absolute inset-0 z-10"
        style={{ 
          backgroundColor: 'transparent',
          backgroundImage: 'url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)'
        }}
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
        onMouseDown={handleMouseDown}
        aria-hidden="true"
      />
    </div>
  )
}