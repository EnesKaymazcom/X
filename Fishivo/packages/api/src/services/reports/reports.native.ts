import { getNativeSupabaseClient } from '@fishivo/api/client/supabase.native';
import { ReportReason, CreateReportData } from '@fishivo/types';

const nativeSupabase = getNativeSupabaseClient();

export class ReportsService {
  async reportComment(
    reporterId: string,
    commentId: number,
    reason: ReportReason,
    description?: string
  ): Promise<boolean> {
    try {
      const { data: comment, error: commentError } = await nativeSupabase
        .from('comments')
        .select('user_id')
        .eq('id', commentId)
        .single();

      if (commentError || !comment) {
        console.error('Comment not found:', commentError);
        return false;
      }

      const reportData: CreateReportData = {
        reporter_id: reporterId,
        reported_user_id: comment.user_id,
        target_type: 'comment',
        target_id: commentId,
        reason,
        description,
        status: 'pending',
        priority: this.getPriorityFromReason(reason),
      };

      const { error } = await nativeSupabase
        .from('reports')
        .insert(reportData);

      if (error) {
        console.error('Error creating report:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error reporting comment:', error);
      return false;
    }
  }

  async reportPost(
    reporterId: string,
    postId: number,
    reason: ReportReason,
    description?: string
  ): Promise<boolean> {
    try {
      const { data: post, error: postError } = await nativeSupabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single();

      if (postError || !post) {
        console.error('Post not found:', postError);
        return false;
      }

      const reportData: CreateReportData = {
        reporter_id: reporterId,
        reported_user_id: post.user_id,
        target_type: 'post',
        target_id: postId,
        reason,
        description,
        status: 'pending',
        priority: this.getPriorityFromReason(reason),
      };

      const { error } = await nativeSupabase
        .from('reports')
        .insert(reportData);

      if (error) {
        console.error('Error creating report:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error reporting post:', error);
      return false;
    }
  }

  async reportUser(
    reporterId: string,
    reportedUserId: string,
    reason: ReportReason,
    description?: string
  ): Promise<boolean> {
    try {
      const reportData: CreateReportData = {
        reporter_id: reporterId,
        reported_user_id: reportedUserId,
        target_type: 'user',
        target_id: 0, // User reports don't have numeric target_id
        reason,
        description,
        status: 'pending',
        priority: this.getPriorityFromReason(reason),
      };

      const { error } = await nativeSupabase
        .from('reports')
        .insert(reportData);

      if (error) {
        console.error('Error creating report:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error reporting user:', error);
      return false;
    }
  }

  async reportReview(
    reporterId: string,
    reviewId: string,
    reason: ReportReason,
    description?: string
  ): Promise<boolean> {
    try {
      // First get the review to find the user who wrote it
      const { data: review, error: reviewError } = await nativeSupabase
        .from('species_reviews')
        .select('user_id')
        .eq('id', reviewId)
        .single();

      if (reviewError || !review) {
        console.error('Review not found:', reviewError);
        return false;
      }

      const reportData: CreateReportData = {
        reporter_id: reporterId,
        reported_user_id: review.user_id,
        target_type: 'review',
        target_id: reviewId, // UUID as string for reviews
        reason,
        description,
        status: 'pending',
        priority: this.getPriorityFromReason(reason),
      };

      const { error } = await nativeSupabase
        .from('reports')
        .insert(reportData);

      if (error) {
        console.error('Error creating review report:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error reporting review:', error);
      return false;
    }
  }

  async getUserReports(userId: string): Promise<any[]> {
    try {
      const { data, error } = await nativeSupabase
        .from('reports')
        .select('*')
        .eq('reporter_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user reports:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user reports:', error);
      return [];
    }
  }

  private getPriorityFromReason(reason: ReportReason): string {
    switch (reason) {
      case ReportReason.VIOLENCE_THREAT:
        return 'high';
      case ReportReason.HARASSMENT:
      case ReportReason.INAPPROPRIATE_CONTENT:
        return 'medium';
      case ReportReason.SPAM:
        return 'low';
      default:
        return 'medium';
    }
  }
}

export const reportsService = new ReportsService();