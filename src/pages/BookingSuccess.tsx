import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CheckCircle, Calendar, MapPin, User } from "lucide-react";
import { toast } from "sonner";

export const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      // In a real app, you'd verify the payment with Stripe and update booking status
      // For now, we'll simulate success
      setTimeout(() => {
        setBookingDetails({
          sitterName: 'Maria Santos',
          location: 'Óbidos',
          serviceType: 'Pet & House Sitting',
          dates: 'Dec 15-20, 2024',
          totalPrice: 175
        });
        setLoading(false);
        toast.success('Payment successful! Your booking is confirmed.');
      }, 2000);
    } else {
      navigate('/search');
    }
  }, [sessionId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground">Confirming your payment...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-0 shadow-soft">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
            
            <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Your booking has been confirmed and payment processed securely.
            </p>

            {bookingDetails && (
              <div className="bg-secondary/30 rounded-lg p-6 mb-8 space-y-4">
                <h3 className="font-semibold text-lg mb-4">Booking Details</h3>
                
                <div className="flex items-center gap-3 text-left">
                  <User className="w-5 h-5 text-primary" />
                  <div>
                    <span className="text-sm text-muted-foreground">Sitter</span>
                    <p className="font-medium">{bookingDetails.sitterName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-left">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <span className="text-sm text-muted-foreground">Location</span>
                    <p className="font-medium">{bookingDetails.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-left">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <span className="text-sm text-muted-foreground">Service Period</span>
                    <p className="font-medium">{bookingDetails.dates}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Paid</span>
                    <span className="text-xl font-bold text-primary">€{bookingDetails.totalPrice}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>What's next?</strong> You'll receive email confirmation shortly. 
                  Your sitter will contact you within 24 hours to arrange meet-up details.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-ocean-gradient text-white hover:opacity-90 flex-1"
                >
                  View My Bookings
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/search')}
                  className="flex-1"
                >
                  Find More Sitters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};