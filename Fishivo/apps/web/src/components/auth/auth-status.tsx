'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@fishivo/api/client/supabase.web'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LocalizedLink } from '@/components/ui/localized-link'
import { LogOut, Settings, User, LogIn, Shield, Edit } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/lib/i18n'

export function AuthStatus() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseBrowserClient()
  const router = useRouter()
  const { locale } = useLocale()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        
        if (user) {
          // Get user profile data
          const { data: profile } = await supabase
            .from('users')
            .select('username, full_name, avatar_url, role')
            .eq('id', user.id)
            .single()
          setProfile(profile)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null)
        if (!session?.user) {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      // Her zaman anasayfaya yönlendir
      router.push(`/${locale}`)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-16 animate-pulse bg-muted rounded" />
        <div className="h-8 w-16 animate-pulse bg-muted rounded" />
      </div>
    )
  }

  if (!user) {
    return (
      <LocalizedLink href="/login">
        <Button variant="outline" size="sm" className="h-9 px-3">
          <LogIn className="h-4 w-4 mr-2" />
          Giriş Yap
        </Button>
      </LocalizedLink>
    )
  }

  const displayName = profile?.full_name || profile?.username || user.email?.split('@')[0]
  const userInitials = displayName ? displayName.substring(0, 2).toUpperCase() : 'U'

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 px-2 sm:px-3">
          <Avatar className="h-5 w-5 sm:mr-[2px]">
            <AvatarImage src={profile?.avatar_url} alt={displayName || 'User'} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline truncate max-w-24">
            {displayName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {profile?.username && (
          <DropdownMenuItem asChild>
            <LocalizedLink href={`/${profile.username}`} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profilim</span>
            </LocalizedLink>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <LocalizedLink href="/profile/edit" className="cursor-pointer">
            <Edit className="mr-2 h-4 w-4" />
            <span>Profili Düzenle</span>
          </LocalizedLink>
        </DropdownMenuItem>
        {(profile?.role === 'admin' || profile?.role === 'super_admin') && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <LocalizedLink href="/admin" className="cursor-pointer">
                <Shield className="mr-2 h-4 w-4" />
                <span>Admin Paneli</span>
              </LocalizedLink>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Çıkış Yap</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}