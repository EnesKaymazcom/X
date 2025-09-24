export interface ReferralStats {
  total_referrals: number
  total_rewards: number
  referral_code: string
  premium_until: string | null
  is_premium: boolean
  milestones: {
    next_milestone: number | null
    progress_to_next: number
    completed_milestones: number[]
  }
  recent_referrals: ReferralUser[]
}

export interface ReferralUser {
  username: string
  avatar_url: string | null
  created_at: string
  status: 'pending' | 'completed' | 'rewarded'
}

export interface ClaimReferralRequest {
  referral_code: string
  ip_address?: string
  user_agent?: string
}

export interface ClaimReferralResponse {
  success: boolean
  error?: string
  referral_id?: string
  referrer_id?: string
  new_count?: number
}

export interface ReferralMilestone {
  level: number
  required_referrals: number
  reward_type: 'badge' | 'premium_month' | 'premium_year'
  reward_value: number
  title_en: string
  title_tr: string
  description_en: string
  description_tr: string
  badge_icon: string
}

export const REFERRAL_MILESTONES: ReferralMilestone[] = [
  {
    level: 1,
    required_referrals: 5,
    reward_type: 'badge',
    reward_value: 1,
    title_en: 'First Fisherman',
    title_tr: 'İlk Balıkçı',
    description_en: 'Invited 5 friends to Fishivo',
    description_tr: '5 arkadaşını Fishivo\'ya davet etti',
    badge_icon: '🎣'
  },
  {
    level: 2,
    required_referrals: 10,
    reward_type: 'badge',
    reward_value: 1,
    title_en: 'Crew Leader',
    title_tr: 'Ekip Lideri',
    description_en: 'Built a crew of 10 fishermen',
    description_tr: '10 balıkçıdan oluşan bir ekip kurdu',
    badge_icon: '👥'
  },
  {
    level: 3,
    required_referrals: 20,
    reward_type: 'premium_month',
    reward_value: 1,
    title_en: 'Community Builder',
    title_tr: 'Topluluk Kurucusu',
    description_en: 'Brought 20 friends - earned 1 month premium!',
    description_tr: '20 arkadaş getirdi - 1 ay premium kazandı!',
    badge_icon: '🏆'
  },
  {
    level: 4,
    required_referrals: 50,
    reward_type: 'premium_month',
    reward_value: 3,
    title_en: 'Fishing Ambassador',
    title_tr: 'Balıkçılık Elçisi',
    description_en: 'Invited 50 fishermen - earned 3 months premium!',
    description_tr: '50 balıkçı davet etti - 3 ay premium kazandı!',
    badge_icon: '🎖️'
  },
  {
    level: 5,
    required_referrals: 100,
    reward_type: 'premium_year',
    reward_value: 12,
    title_en: 'Legend of the Seas',
    title_tr: 'Denizlerin Efsanesi',
    description_en: 'Built a fleet of 100 fishermen - earned 1 year premium!',
    description_tr: '100 balıkçıdan oluşan bir filo kurdu - 1 yıl premium kazandı!',
    badge_icon: '👑'
  }
]