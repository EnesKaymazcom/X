import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@fishivo/api/client/supabase.server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Check user role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!userData || (userData.role !== 'admin' && userData.role !== 'super_admin')) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    // Get all waitlist entries
    const { data: entries, error: entriesError } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (entriesError) {
      throw entriesError
    }
    
    // Calculate stats
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const thisWeek = entries.filter(entry => 
      new Date(entry.created_at) > oneWeekAgo
    ).length
    
    const thisMonth = entries.filter(entry => 
      new Date(entry.created_at) > oneMonthAgo
    ).length
    
    const stats = {
      total: entries.length,
      thisWeek,
      thisMonth,
      bySource: {
        website: entries.length, // All entries are from website for now
        mobile: 0,
        other: 0
      }
    }
    
    return NextResponse.json({
      entries,
      stats
    })
    
  } catch (error) {
    console.error('Waitlist admin API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}