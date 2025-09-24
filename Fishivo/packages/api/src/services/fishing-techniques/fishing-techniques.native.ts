import { getNativeSupabaseClient } from '@fishivo/api/client/supabase.native';
import type { FishingTechnique } from '@fishivo/types';

export interface TechniqueStatistics {
  totalFollowers: number;
  totalCatches: number;
  avgRating: number;
  totalReviews: number;
}

export interface TechniqueReview {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user: {
    username: string;
    avatar_url: string;
  };
}

export interface ReviewData {
  rating: number;
  comment?: string;
  review_text?: string;
  is_beginner_friendly?: boolean;
  is_weather_sensitive?: boolean;
  is_suitable_for_night?: boolean;
}

export interface CommunityStats {
  is_beginner_friendly: { yes: number; no: number; percentage: number | null };
  is_weather_sensitive: { yes: number; no: number; percentage: number | null };
  is_suitable_for_night: { yes: number; no: number; percentage: number | null };
  total_responses: number;
}

export interface FishingTechniquesService {
  getAllFishingTechniques(): Promise<FishingTechnique[]>;
  getFishingTechniqueById(id: number): Promise<FishingTechnique | null>;
  followTechnique(userId: string, techniqueId: number): Promise<boolean>;
  unfollowTechnique(userId: string, techniqueId: number): Promise<boolean>;
  isFollowingTechnique(userId: string, techniqueId: number): Promise<boolean>;
  getTechniqueStatistics(techniqueId: number): Promise<TechniqueStatistics>;
  getTechniqueReviews(techniqueId: number): Promise<TechniqueReview[]>;
  getUserReviewForTechnique(techniqueId: number, userId: string): Promise<TechniqueReview | null>;
  createReview(techniqueId: number, reviewData: ReviewData): Promise<TechniqueReview>;
  updateReview(reviewId: string, reviewData: ReviewData): Promise<TechniqueReview>;
  deleteReview(reviewId: string): Promise<boolean>;
  getCommunityStats(techniqueId: number): Promise<CommunityStats | null>;
  voteReviewHelpful(reviewId: string, isHelpful: boolean): Promise<void>;
  getUserReviewVotes(reviewIds: string[]): Promise<{ [reviewId: string]: boolean }>;
  getReviewVoteCounts(reviewId: string): Promise<{ helpful: number; unhelpful: number }>;
}

export const createNativeFishingTechniquesService = (): FishingTechniquesService => {
  const supabase = getNativeSupabaseClient();

  return {
    async getAllFishingTechniques(): Promise<FishingTechnique[]> {
      try {
        const { data, error } = await supabase
          .from('fishing_techniques')
          .select('*')
          .order('name');

        if (error) {
          throw error;
        }

        return data || [];
      } catch (err) {
        throw err;
      }
    },

    async getFishingTechniqueById(id: number): Promise<FishingTechnique | null> {
      const { data, error } = await supabase
        .from('fishing_techniques')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return null;
      }

      return data;
    },

    async followTechnique(userId: string, techniqueId: number): Promise<boolean> {
      try {
        const { error } = await supabase
          .from('user_fishing_technique_follows')
          .insert({
            user_id: userId,
            fishing_technique_id: techniqueId
          });

        return !error;
      } catch (err) {
        return false;
      }
    },

    async unfollowTechnique(userId: string, techniqueId: number): Promise<boolean> {
      try {
        const { error } = await supabase
          .from('user_fishing_technique_follows')
          .delete()
          .eq('user_id', userId)
          .eq('fishing_technique_id', techniqueId);

        return !error;
      } catch (err) {
        return false;
      }
    },

    async isFollowingTechnique(userId: string, techniqueId: number): Promise<boolean> {
      try {
        const { data, error } = await supabase
          .from('user_fishing_technique_follows')
          .select('*')
          .eq('user_id', userId)
          .eq('fishing_technique_id', techniqueId)
          .single();

        return !!data && !error;
      } catch (err) {
        return false;
      }
    },

    async getTechniqueStatistics(techniqueId: number): Promise<TechniqueStatistics> {
      try {
        // Get followers count
        const { count: followersCount } = await supabase
          .from('user_fishing_technique_follows')
          .select('*', { count: 'exact', head: true })
          .eq('fishing_technique_id', techniqueId);

        // Get reviews stats
        const { data: reviewsData, count: reviewsCount } = await supabase
          .from('fishing_technique_reviews')
          .select('rating', { count: 'exact' })
          .eq('fishing_technique_id', techniqueId);

        // Calculate average rating
        let avgRating = 0;
        if (reviewsData && reviewsData.length > 0) {
          const totalRating = reviewsData.reduce((sum, review) => sum + (review.rating || 0), 0);
          avgRating = totalRating / reviewsData.length;
        }

        // Get catches count (posts that used this technique)
        // Önce tekniğin adını bul
        const { data: techniqueData } = await supabase
          .from('fishing_techniques')
          .select('name, name_en')
          .eq('id', techniqueId)
          .single();

        let catchesCount = 0;
        if (techniqueData) {
          // Teknik adıyla posts'larda ara
          const { count } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .or(`catch_details->technique.ilike.%${techniqueData.name}%,catch_details->technique.ilike.%${techniqueData.name_en}%`);
          
          catchesCount = count || 0;
        }

        return {
          totalFollowers: followersCount || 0,
          totalCatches: catchesCount || 0,
          avgRating: avgRating || 0,
          totalReviews: reviewsCount || 0,
        };
      } catch (err) {
        return {
          totalFollowers: 0,
          totalCatches: 0,
          avgRating: 0,
          totalReviews: 0,
        };
      }
    },

    async getTechniqueReviews(techniqueId: number): Promise<TechniqueReview[]> {
      try {
        const { data, error } = await supabase
          .from('fishing_technique_reviews')
          .select(`
            id,
            user_id,
            rating,
            comment,
            created_at,
            user:users(
              username,
              avatar_url
            )
          `)
          .eq('fishing_technique_id', techniqueId)
          .order('created_at', { ascending: false });

        if (error) {
          return [];
        }

        return (data || []).map((review: any) => ({
          id: review.id,
          user_id: review.user_id,
          rating: review.rating,
          comment: review.comment,
          created_at: review.created_at,
          user: {
            username: review.user?.username || '',
            avatar_url: review.user?.avatar_url || ''
          }
        }));
      } catch (err) {
        return [];
      }
    },

    async getUserReviewForTechnique(techniqueId: number, userId: string): Promise<TechniqueReview | null> {
      try {
        const { data, error } = await supabase
          .from('fishing_technique_reviews')
          .select('*')
          .eq('fishing_technique_id', techniqueId)
          .eq('user_id', userId)
          .single();

        if (error) {
          return null;
        }

        return data;
      } catch (err) {
        return null;
      }
    },

    async createReview(techniqueId: number, reviewData: ReviewData): Promise<TechniqueReview> {
      try {
        // Kullanıcı zaten giriş yapmış, RLS auth.uid() ile handle edecek
        const { data, error } = await supabase
          .from('fishing_technique_reviews')
          .insert({
            fishing_technique_id: techniqueId,
            // user_id RLS tarafından otomatik set edilecek (auth.uid())
            rating: reviewData.rating,
            review_text: reviewData.review_text || reviewData.comment,
            is_beginner_friendly: reviewData.is_beginner_friendly,
            is_weather_sensitive: reviewData.is_weather_sensitive,
            is_suitable_for_night: reviewData.is_suitable_for_night
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        return data;
      } catch (err) {
        throw err;
      }
    },

    async updateReview(reviewId: string, reviewData: ReviewData): Promise<TechniqueReview> {
      try {
        const { data, error } = await supabase
          .from('fishing_technique_reviews')
          .update({
            rating: reviewData.rating,
            review_text: reviewData.review_text || reviewData.comment,
            is_beginner_friendly: reviewData.is_beginner_friendly,
            is_weather_sensitive: reviewData.is_weather_sensitive,
            is_suitable_for_night: reviewData.is_suitable_for_night,
            updated_at: new Date().toISOString(),
          })
          .eq('id', reviewId)
          .select()
          .single();

        if (error) {
          throw error;
        }

        return data;
      } catch (err) {
        throw err;
      }
    },

    async deleteReview(reviewId: string): Promise<boolean> {
      try {
        const { error } = await supabase
          .from('fishing_technique_reviews')
          .delete()
          .eq('id', reviewId);

        if (error) {
          throw error;
        }

        return true;
      } catch (err) {
        throw err;
      }
    },

    async getCommunityStats(techniqueId: number): Promise<CommunityStats | null> {
      try {
        const { data: reviews, error } = await supabase
          .from('fishing_technique_reviews')
          .select('is_beginner_friendly, is_weather_sensitive, is_suitable_for_night')
          .eq('fishing_technique_id', techniqueId);

        if (error) throw error;
        
        if (!reviews || reviews.length === 0) {
          return null;
        }

        const stats: CommunityStats = {
          is_beginner_friendly: { yes: 0, no: 0, percentage: null },
          is_weather_sensitive: { yes: 0, no: 0, percentage: null },
          is_suitable_for_night: { yes: 0, no: 0, percentage: null },
          total_responses: 0
        };

        reviews.forEach(review => {
          // Count beginner friendly
          if (review.is_beginner_friendly !== null) {
            if (review.is_beginner_friendly) {
              stats.is_beginner_friendly.yes++;
            } else {
              stats.is_beginner_friendly.no++;
            }
          }

          // Count weather sensitive
          if (review.is_weather_sensitive !== null) {
            if (review.is_weather_sensitive) {
              stats.is_weather_sensitive.yes++;
            } else {
              stats.is_weather_sensitive.no++;
            }
          }

          // Count suitable for night
          if (review.is_suitable_for_night !== null) {
            if (review.is_suitable_for_night) {
              stats.is_suitable_for_night.yes++;
            } else {
              stats.is_suitable_for_night.no++;
            }
          }
        });

        // Calculate percentages
        const beginnerTotal = stats.is_beginner_friendly.yes + stats.is_beginner_friendly.no;
        if (beginnerTotal > 0) {
          stats.is_beginner_friendly.percentage = Math.round((stats.is_beginner_friendly.yes / beginnerTotal) * 100);
        }

        const weatherTotal = stats.is_weather_sensitive.yes + stats.is_weather_sensitive.no;
        if (weatherTotal > 0) {
          stats.is_weather_sensitive.percentage = Math.round((stats.is_weather_sensitive.yes / weatherTotal) * 100);
        }

        const nightTotal = stats.is_suitable_for_night.yes + stats.is_suitable_for_night.no;
        if (nightTotal > 0) {
          stats.is_suitable_for_night.percentage = Math.round((stats.is_suitable_for_night.yes / nightTotal) * 100);
        }

        stats.total_responses = reviews.length;

        return stats;
      } catch (err) {
        return null;
      }
    },

    async voteReviewHelpful(reviewId: string, isHelpful: boolean): Promise<void> {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        // Check if vote exists
        const { data: existingVote } = await supabase
          .from('fishing_technique_review_votes')
          .select('id')
          .eq('review_id', reviewId)
          .eq('user_id', session.user.id)
          .single();

        if (existingVote) {
          // Update existing vote
          await supabase
            .from('fishing_technique_review_votes')
            .update({ is_helpful: isHelpful })
            .eq('review_id', reviewId)
            .eq('user_id', session.user.id);
        } else {
          // Insert new vote
          await supabase
            .from('fishing_technique_review_votes')
            .insert({
              review_id: reviewId,
              user_id: session.user.id,
              is_helpful: isHelpful
            });
        }
      } catch (err) {
        throw err;
      }
    },

    async getUserReviewVotes(reviewIds: string[]): Promise<{ [reviewId: string]: boolean }> {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return {};

        const { data, error } = await supabase
          .from('fishing_technique_review_votes')
          .select('review_id, is_helpful')
          .eq('user_id', session.user.id)
          .in('review_id', reviewIds);

        if (error) throw error;

        const votes: { [reviewId: string]: boolean } = {};
        data?.forEach(vote => {
          votes[vote.review_id] = vote.is_helpful;
        });

        return votes;
      } catch (err) {
        return {};
      }
    },

    async getReviewVoteCounts(reviewId: string): Promise<{ helpful: number; unhelpful: number }> {
      try {
        const { data, error } = await supabase
          .from('fishing_technique_review_votes')
          .select('is_helpful')
          .eq('review_id', reviewId);

        if (error) throw error;

        let helpful = 0;
        let unhelpful = 0;

        data?.forEach(vote => {
          if (vote.is_helpful) {
            helpful++;
          } else {
            unhelpful++;
          }
        });

        return { helpful, unhelpful };
      } catch (err) {
        return { helpful: 0, unhelpful: 0 };
      }
    }
  };
};