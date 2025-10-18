import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { format } from 'date-fns';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface ReviewsListProps {
  sitterId: string;
}

export function ReviewsList({ sitterId }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [sitterId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);

      const { data: reviewsData, error } = await (supabase as any)
        .from('reviews_new')
        .select(`
          id,
          rating,
          comment,
          created_at,
          reviewer_id
        `)
        .eq('reviewee_id', sitterId)
        .order('created_at', { ascending: false});

      if (error) throw error;

      // Fetch reviewer profiles separately
      const reviewerIds = [...new Set((reviewsData || []).map((r: any) => r.reviewer_id))];
      const { data: profilesData } = await (supabase as any)
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', reviewerIds);

      const profilesMap = new Map((profilesData || []).map((p: any) => [p.id, p]));

      const formattedReviews = (reviewsData || []).map((review: any) => {
        const profile = profilesMap.get(review.reviewer_id) as any;
        return {
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          created_at: review.created_at,
          reviewer: {
            full_name: profile?.full_name || 'Usuário',
            avatar_url: profile?.avatar_url || null
          }
        };
      });

      setReviews(formattedReviews);

      // Calculate average
      if (formattedReviews.length > 0) {
        const avg = formattedReviews.reduce((acc: number, r: Review) => acc + r.rating, 0) / formattedReviews.length;
        setAverageRating(Math.round(avg * 10) / 10);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando avaliações...</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Ainda não há avaliações
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Average Rating */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold">{averageRating}</div>
            <div>
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Avatar>
                  <AvatarImage src={review.reviewer.avatar_url || undefined} />
                  <AvatarFallback>
                    {review.reviewer.full_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{review.reviewer.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(review.created_at), 'dd/MM/yyyy')}
                      </p>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
