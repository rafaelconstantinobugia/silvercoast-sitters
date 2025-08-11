import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/Header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, MapPin, Plus, Star, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Booking {
  id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  payment_status: string;
  notes?: string;
  services?: {
    name: string;
    service_type: string;
  };
  sitters?: {
    name: string;
    average_rating: number;
    photo_url?: string;
    location?: string;
  } | null;
}

export const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Categorize bookings by status
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const upcomingBookings = bookings.filter(b => 
    (b.status === 'confirmed' || b.status === 'accepted') && 
    new Date(b.start_date) > new Date()
  );
  const pastBookings = bookings.filter(b => 
    b.status === 'completed' || 
    (b.status === 'confirmed' && new Date(b.end_date) < new Date())
  );

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    
    if (user) {
      fetchBookings();
    }
  }, [user, authLoading, navigate]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services (name, service_type),
          sitters (
            name,
            average_rating,
            photo_url,
            location
          )
        `)
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched bookings:', data);
      setBookings((data || []) as Booking[]);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="badge-pending">Pending Confirmation</Badge>;
      case 'confirmed':
        return <Badge variant="default" className="badge-verified">Confirmed</Badge>;
      case 'accepted':
        return <Badge variant="default" className="badge-verified">Accepted</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="badge-completed">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;
      
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.user_metadata?.name || user?.email?.split('@')[0]}!
            </h1>
            <p className="text-muted-foreground">
              Manage your bookings and find trusted sitters
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link to="/search">
                <MapPin className="w-4 h-4 mr-2" />
                Browse Sitters
              </Link>
            </Button>
            <Button asChild className="bg-ocean-gradient text-white hover:opacity-90">
              <Link to="/book-now">
                <Plus className="w-4 h-4 mr-2" />
                Request New Sitting
              </Link>
            </Button>
          </div>
        </div>

        {/* Dashboard Summary */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingBookings.length}</p>
                  <p className="text-sm text-muted-foreground">Pending Confirmation</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{upcomingBookings.length}</p>
                  <p className="text-sm text-muted-foreground">Upcoming Bookings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pastBookings.length}</p>
                  <p className="text-sm text-muted-foreground">Completed Bookings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings Sections */}
        <div className="space-y-8">
          {bookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start by finding a trusted sitter in your area
                </p>
                <Button asChild className="bg-ocean-gradient text-white hover:opacity-90">
                  <Link to="/book-now">
                    <Plus className="w-4 h-4 mr-2" />
                    Book a Sitter
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Pending Bookings */}
              {pendingBookings.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <h2 className="text-xl font-semibold">Pending Confirmation</h2>
                    <Badge variant="secondary">{pendingBookings.length}</Badge>
                  </div>
                  <div className="grid gap-4">
                    {pendingBookings.map((booking) => (
                      <BookingCard 
                        key={booking.id} 
                        booking={booking} 
                        onCancel={handleCancelBooking}
                        getStatusBadge={getStatusBadge}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Bookings */}
              {upcomingBookings.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-xl font-semibold">Upcoming Bookings</h2>
                    <Badge variant="secondary">{upcomingBookings.length}</Badge>
                  </div>
                  <div className="grid gap-4">
                    {upcomingBookings.map((booking) => (
                      <BookingCard 
                        key={booking.id} 
                        booking={booking} 
                        onCancel={handleCancelBooking}
                        getStatusBadge={getStatusBadge}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Past Bookings */}
              {pastBookings.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h2 className="text-xl font-semibold">Past Bookings</h2>
                    <Badge variant="secondary">{pastBookings.length}</Badge>
                  </div>
                  <div className="grid gap-4">
                    {pastBookings.map((booking) => (
                      <BookingCard 
                        key={booking.id} 
                        booking={booking} 
                        onCancel={handleCancelBooking}
                        getStatusBadge={getStatusBadge}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Extracted BookingCard component for reusability
const BookingCard = ({ 
  booking, 
  onCancel, 
  getStatusBadge, 
  formatDate 
}: {
  booking: Booking;
  onCancel: (id: string) => void;
  getStatusBadge: (status: string) => JSX.Element;
  formatDate: (date: string) => string;
}) => (
  <Card className="card-hover">
    <CardHeader className="pb-3">
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-lg">
            {booking.services?.name || 'Pet/House Sitting'}
          </CardTitle>
          <p className="text-muted-foreground">
            {booking.sitters ? `with ${booking.sitters.name}` : 'Waiting for sitter assignment'}
          </p>
        </div>
        {getStatusBadge(booking.status)}
      </div>
    </CardHeader>
    
    <CardContent className="space-y-4">
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>
            {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
          </span>
        </div>
        
        {booking.sitters && (
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>{booking.sitters.average_rating.toFixed(1)} rating</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <span className="text-xl font-semibold">
          €{booking.total_price}
        </span>
        
        <div className="flex gap-2">
          {booking.status === 'pending' && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => onCancel(booking.id)}
            >
              Cancel Booking
            </Button>
          )}
          {booking.status === 'completed' && (
            <Button variant="outline" size="sm">
              Leave Review
            </Button>
          )}
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </div>
      </div>

      {booking.notes && (
        <div className="pt-2 border-t border-border">
          <p className="text-sm text-muted-foreground">
            <strong>Notes:</strong> {booking.notes}
          </p>
        </div>
      )}
    </CardContent>
  </Card>
);