import { useState, useCallback, useEffect } from 'react'
import { contactUtils, type Contact } from '@/utils/contacts'
import { useSupabaseUser } from '@/hooks/useSupabaseUser'
import { useTranslation } from '@/contexts/LanguageContext'

// Modal callback types
interface ModalCallbacks {
  onShowSuccess?: (message: string) => void
  onShowError?: (message: string) => void
}

interface UseContactsReturn {
  contacts: Contact[]
  isLoading: boolean
  error: string | null
  isPermissionGranted: boolean
  
  // Actions
  requestPermission: () => Promise<boolean>
  syncContacts: (callbacks?: ModalCallbacks) => Promise<void>
  clearContacts: (callbacks?: ModalCallbacks) => Promise<void>
  
  // Helper methods
  getContactCount: () => number
  hasContacts: () => boolean
}

export const useContacts = (): UseContactsReturn => {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPermissionGranted, setIsPermissionGranted] = useState(false)
  
  const { user } = useSupabaseUser()
  const { t } = useTranslation()

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const hasPermission = await contactUtils.checkPermission()
        setIsPermissionGranted(hasPermission)
      } catch (error) {
        setIsPermissionGranted(false)
      }
    }
    
    checkPermission()
  }, [])

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setError(null)
      const granted = await contactUtils.requestContactsPermission()
      setIsPermissionGranted(granted)
      
      
      return granted
    } catch (error) {
      setError(t('profile.findFriends.permission.error'))
      return false
    }
  }, [t])

  const syncContacts = useCallback(async (callbacks?: ModalCallbacks): Promise<void> => {
    if (!user?.id) {
      setError(t('auth.loginRequired'))
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      if (!isPermissionGranted) {
        const granted = await requestPermission()
        if (!granted) {
          return
        }
      }

      const deviceContacts = await contactUtils.getContacts()
      setContacts(deviceContacts)

    } catch (error) {
      setError(t('profile.findFriends.syncError'))
      callbacks?.onShowError?.(t('profile.findFriends.syncError'))
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, isPermissionGranted, requestPermission, t])

  const clearContacts = useCallback(async (callbacks?: ModalCallbacks): Promise<void> => {
    if (!user?.id) {
      setError(t('auth.loginRequired'))
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      setContacts([])

      callbacks?.onShowSuccess?.(t('profile.findFriends.clearSuccess'))
    } catch (error) {
      setError(t('profile.findFriends.clearError'))
      
      callbacks?.onShowError?.(t('profile.findFriends.clearError'))
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, t])

  const getContactCount = useCallback((): number => {
    return contacts.length
  }, [contacts])

  const hasContacts = useCallback((): boolean => {
    return contacts.length > 0
  }, [contacts])

  return {
    contacts,
    isLoading,
    error,
    isPermissionGranted,
    requestPermission,
    syncContacts,
    clearContacts,
    getContactCount,
    hasContacts
  }
}

export default useContacts