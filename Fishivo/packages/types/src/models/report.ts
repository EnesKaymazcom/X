export enum ReportReason {
  HARASSMENT = 'harassment',
  HATE_SPEECH = 'hate_speech',
  SPAM = 'spam',
  VIOLENCE_THREAT = 'violence_threat',
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  ADVERTISING = 'advertising',
}

export interface CreateReportData {
  reporter_id: string;
  reported_user_id: string;
  target_type: 'comment' | 'post' | 'user' | 'review';
  target_id: number | string; // number for comment/post, string (uuid) for review
  reason: ReportReason;
  description?: string;
  status?: string;
  priority?: string;
}

export interface Report extends CreateReportData {
  id: number;
  evidence_urls?: any;
  assigned_to?: string;
  resolved_by?: string;
  resolved_at?: string;
  resolution_action?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}