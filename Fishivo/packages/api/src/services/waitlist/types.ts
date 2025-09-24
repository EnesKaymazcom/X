export interface WaitlistEntry {
  id?: string
  email: string
  referrer?: string
  referral_code?: string
  user_agent?: string
  ip_address?: string
  created_at?: string
  updated_at?: string
}

export interface WaitlistSignupRequest {
  email: string
  referrer?: string
  referral_code?: string
}

export interface WaitlistSignupResponse {
  success: boolean
  message: string
  data?: {
    id: string
    email: string
    created_at: string
  }
  error?: string
}