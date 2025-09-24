import { Suspense } from 'react'
import { AuthStatus } from './auth-status'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

function AuthStatusFallback() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-8 w-16" />
    </div>
  )
}

export function AuthStatusWrapper() {
  return (
    <Suspense fallback={<AuthStatusFallback />}>
      <AuthStatus />
    </Suspense>
  )
}