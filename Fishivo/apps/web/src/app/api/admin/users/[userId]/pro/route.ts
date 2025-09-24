import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@fishivo/api/client/supabase.server'
import { userServiceWeb } from '@fishivo/api/services/user/user.web'

// Helper function to check admin permissions
async function checkAdminPermissions() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { authorized: false, status: 401, error: 'Unauthorized' }
  }
  
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (!userData || (userData.role !== 'admin' && userData.role !== 'super_admin')) {
    return { authorized: false, status: 403, error: 'Forbidden' }
  }
  
  return { authorized: true, user }
}

// POST /api/admin/users/[userId]/pro - Grant Pro status
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const authCheck = await checkAdminPermissions()
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }
    
    const { userId } = await params
    const body = await request.json()
    const { duration } = body
    
    if (!duration || duration <= 0) {
      return NextResponse.json({ error: 'Valid duration is required' }, { status: 400 })
    }
    
    await userServiceWeb.grantProStatus(userId, duration)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error granting pro status:', error)
    return NextResponse.json(
      { error: 'Failed to grant pro status' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[userId]/pro - Revoke Pro status
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const authCheck = await checkAdminPermissions()
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }
    
    const { userId } = await params
    await userServiceWeb.revokeProStatus(userId)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error revoking pro status:', error)
    return NextResponse.json(
      { error: 'Failed to revoke pro status' },
      { status: 500 }
    )
  }
}