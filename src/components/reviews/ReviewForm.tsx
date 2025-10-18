import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Star } from 'lucide-react';

interface ReviewFormProps {
  bookingId: string;
  revieweeId: string;
  revieweeName: string;
  onSuccess?: () => void;
}

export function ReviewForm({ bookingId, revieweeId, revieweeName, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Por favor selecione uma classificação');
      return;
    }

    try {
      setSubmitting(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('reviews_new')
        .insert({
          booking_id: bookingId,
          reviewer_id: user.id,
          reviewee_id: revieweeId,
          rating,
          comment: comment.trim() || null
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('Você já deixou uma avaliação para esta reserva');
          return;
        }
        throw error;
      }

      // Log analytics
      await (supabase as any).from('analytics_events').insert({
        event_type: 'review_submitted',
        event_data: {
          booking_id: bookingId,
          rating,
          has_comment: !!comment.trim()
        }
      });

      toast.success('Avaliação enviada com sucesso!');
      setRating(0);
      setComment('');
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Erro ao enviar avaliação');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avaliar {revieweeName}</CardTitle>
        <CardDescription>
          Como foi sua experiência? Sua avaliação ajuda outros usuários.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Classificação</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Comentário (opcional)
          </label>
          <Textarea
            placeholder="Compartilhe sua experiência..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {comment.length}/500 caracteres
          </p>
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={submitting || rating === 0}
          className="w-full"
        >
          {submitting ? 'Enviando...' : 'Enviar Avaliação'}
        </Button>
      </CardContent>
    </Card>
  );
}
