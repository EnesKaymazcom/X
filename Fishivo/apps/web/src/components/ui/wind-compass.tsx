"use client"

import { TypographyLarge, TypographySmall } from '@/lib/typography'

// Simple placeholder functions
const formatWindSpeed = (speed: number) => `${Math.round(speed * 3.6)} km/h`

const getWindDirection = (degree: number) => {
  const directions = ['K', 'KKD', 'KD', 'DKD', 'D', 'DGD', 'GD', 'GGD', 'G', 'GGB', 'GB', 'BGB', 'B', 'BKB', 'KB', 'KKB']
  const index = Math.round(degree / 22.5) % 16
  return directions[index]
}

interface WindCompassProps {
  speed: number
  direction: number
  className?: string
}

export default function WindCompass({ speed, direction, className = "" }: WindCompassProps) {
  return (
    <div className={`relative flex h-32 w-32 items-center justify-center ${className}`}>
      {/* Wind speed display in center */}
      <div className="absolute text-center z-10">
        <TypographyLarge>{formatWindSpeed(speed)}</TypographyLarge>
        <TypographySmall className="text-muted-foreground">{getWindDirection(direction)}</TypographySmall>
      </div>
      
      {/* Compass background */}
      <div className="absolute inset-0 rounded-full border-2 border-muted">
        {/* Cardinal directions */}
        <TypographySmall className="absolute top-1 left-1/2 transform -translate-x-1/2 font-semibold">K</TypographySmall>
        <TypographySmall className="absolute right-1 top-1/2 transform -translate-y-1/2 font-semibold">D</TypographySmall>
        <TypographySmall className="absolute bottom-1 left-1/2 transform -translate-x-1/2 font-semibold">G</TypographySmall>
        <TypographySmall className="absolute left-1 top-1/2 transform -translate-y-1/2 font-semibold">B</TypographySmall>
        
        {/* Compass marks */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
          <div
            key={angle}
            className="absolute w-0.5 h-3 bg-muted-foreground transform origin-bottom"
            style={{
              top: '50%',
              left: '50%',
              transformOrigin: '0 0',
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-60px)`,
            }}
          />
        ))}
      </div>
      
      {/* Wind direction arrow */}
      <div 
        className="absolute w-1 h-12 bg-blue-500 transform origin-bottom transition-transform ease-in-out duration-500"
        style={{
          top: '50%',
          left: '50%',
          transformOrigin: '50% 100%',
          transform: `translate(-50%, -50%) rotate(${direction}deg)`,
        }}
      >
        {/* Arrow head */}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-4 border-l-transparent border-r-transparent border-b-blue-500" />
      </div>
    </div>
  )
}