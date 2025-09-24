import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@fishivo/api/client/supabase.server'
import { ReactNode } from 'react'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { Navbar } from '@/components/ui/navbar'

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = await createSupabaseServerClient()
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    redirect('/login')
  }

  // Check user role
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (!userData || (userData.role !== 'admin' && userData.role !== 'super_admin')) {
    redirect('/404')
  }

  return (
    <>
      <Navbar />
      <AdminSidebar>
        {children}
      </AdminSidebar>
    </>
  )
}