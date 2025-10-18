import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/Header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, MapPin, CheckCircle, XCircle, Clock, AlertCircle, Euro } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Booking {
  id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  notes?: string;
  house_details?: any;
  owner_id: string;
}

export const SitterDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [sitterId, setSitterId] = useState<string | null>(null);

  // Categorize bookings
  const pendingRequests = bookings.filter(b => b.status === 'pending');
  const upcomingBookings = bookings.filter(b => 
    b.status === 'confirmed' && new Date(b.start_date) > new Date()
  );
  const pastBookings = bookings.filter(b => 
    b.status === 'completed' || new Date(b.end_date) < new Date()
  );

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    
    if (user) {
      checkSitterStatusAndFetchBookings();
    }
  }, [user, authLoading, navigate]);

  const checkSitterStatusAndFetchBookings = async () => {
    try {
      // Just set the sitter ID to user ID and fetch bookings
      if (!user?.id) return;
      
      setSitterId(user.id);
      await fetchBookings(user.id);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error(t('common.error'));
    }
  };

  const fetchBookings = async (sitterId: string) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('sitter_id', sitterId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings((data || []) as any);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error(t('sitter.errorFetchingBookings'));
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'confirmed',
          accepted_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .eq('sitter_id', sitterId);

      if (error) throw error;
      
      toast.success(t('sitter.bookingAccepted'));
      if (sitterId) fetchBookings(sitterId);
    } catch (error) {
      console.error('Error accepting booking:', error);
      toast.error(t('sitter.errorAcceptingBooking'));
    }
  };

  const handleDeclineBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'cancelled',
          cancelled_reason: 'Declined by sitter'
        })
        .eq('id', bookingId)
        .eq('sitter_id', sitterId);

      if (error) throw error;
      
      toast.success(t('sitter.bookingDeclined'));
      if (sitterId) fetchBookings(sitterId);
    } catch (error) {
      console.error('Error declining booking:', error);
      toast.error(t('sitter.errorDecliningBooking'));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">{t('sitter.newRequests')}</Badge>;
      case 'confirmed':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">{t('common.approved')}</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">{t('sitter.completed')}</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">{t('common.rejected')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(t('common.locale'), {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
              {t('sitter.dashboard')}
            </h1>
            <p className="text-muted-foreground">
              {t('sitter.manageBookings')}
            </p>
          </div>
          
          <Button asChild variant="outline">
            <a href="/become-sitter-auth">
              {t('sitter.editProfile')}
            </a>
          </Button>
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
                  <p className="text-2xl font-bold">{pendingRequests.length}</p>
                  <p className="text-sm text-muted-foreground">{t('sitter.newRequests')}</p>
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
                  <p className="text-sm text-muted-foreground">{t('sitter.upcoming')}</p>
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
                  <p className="text-sm text-muted-foreground">{t('sitter.completed')}</p>
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
                <h3 className="text-xl font-semibold mb-2">{t('sitter.noBookings')}</h3>
                <p className="text-muted-foreground">
                  {t('sitter.waitingForRequests')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* New Requests */}
              {pendingRequests.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <h2 className="text-xl font-semibold">{t('sitter.newRequests')}</h2>
                    <Badge variant="secondary">{pendingRequests.length}</Badge>
                  </div>
                  <div className="grid gap-4">
                     {pendingRequests.map((booking) => (
                      <BookingRequestCard 
                        key={booking.id} 
                        booking={booking} 
                        onAccept={handleAcceptBooking}
                        onDecline={handleDeclineBooking}
                        getStatusBadge={getStatusBadge}
                        formatDate={formatDate}
                        t={t}
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
                    <h2 className="text-xl font-semibold">{t('sitter.upcoming')}</h2>
                    <Badge variant="secondary">{upcomingBookings.length}</Badge>
                  </div>
                  <div className="grid gap-4">
                     {upcomingBookings.map((booking) => (
                      <BookingCard 
                        key={booking.id} 
                        booking={booking} 
                        getStatusBadge={getStatusBadge}
                        formatDate={formatDate}
                        t={t}
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
                    <h2 className="text-xl font-semibold">{t('sitter.pastBookings')}</h2>
                    <Badge variant="secondary">{pastBookings.length}</Badge>
                  </div>
                  <div className="grid gap-4">
                     {pastBookings.map((booking) => (
                      <BookingCard 
                        key={booking.id} 
                        booking={booking} 
                        getStatusBadge={getStatusBadge}
                        formatDate={formatDate}
                        t={t}
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

// Booking Request Card with Accept/Decline buttons
const BookingRequestCard = ({ 
  booking, 
  onAccept,
  onDecline,
  getStatusBadge, 
  formatDate,
  t
}: {
  booking: Booking;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  getStatusBadge: (status: string) => JSX.Element;
  formatDate: (date: string) => string;
  t: (key: string) => string;
}) => (
  <Card className="card-hover border-l-4 border-l-yellow-500">
    <CardHeader className="pb-3">
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-lg">
            {t('sitter.petSittingRequest')}
          </CardTitle>
          <p className="text-muted-foreground">
            {t('sitter.petOwner')}
          </p>
        </div>
        {getStatusBadge(booking.status)}
      </div>
    </CardHeader>
    
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>
            {formatDate(booking.start_date)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>
            {formatDate(booking.end_date)}
          </span>
        </div>
        {booking.house_details && (
          <div className="flex items-center gap-2 col-span-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span>{typeof booking.house_details === 'string' ? booking.house_details : 'Address provided'}</span>
          </div>
        )}
      </div>

      {booking.notes && (
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm">
            <strong>Notes:</strong> {booking.notes}
          </p>
        </div>
      )}

      <div className="flex justify-between items-center pt-2 border-t">
        <div className="flex items-center gap-2">
          <Euro className="w-5 h-5" />
          <span className="text-xl font-semibold">
            €{booking.total_price.toFixed(2)}
          </span>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => onDecline(booking.id)}
          >
            <XCircle className="w-4 h-4 mr-2" />
            {t('sitter.decline')}
          </Button>
          <Button 
            className="bg-ocean-gradient text-white hover:opacity-90"
            size="sm"
            onClick={() => onAccept(booking.id)}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {t('sitter.accept')}
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Regular Booking Card (for accepted/completed bookings)
const BookingCard = ({ 
  booking, 
  getStatusBadge, 
  formatDate,
  t
}: {
  booking: Booking;
  getStatusBadge: (status: string) => JSX.Element;
  formatDate: (date: string) => string;
  t: (key: string) => string;
}) => (
  <Card className="card-hover">
    <CardHeader className="pb-3">
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-lg">
            {t('sitter.petSitting')}
          </CardTitle>
          <p className="text-muted-foreground">
            {t('sitter.petOwner')}
          </p>
        </div>
        {getStatusBadge(booking.status)}
      </div>
    </CardHeader>
    
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>{formatDate(booking.start_date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>{formatDate(booking.end_date)}</span>
        </div>
        {booking.house_details && (
          <div className="flex items-center gap-2 col-span-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span>{typeof booking.house_details === 'string' ? booking.house_details : 'Address provided'}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-2 border-t">
        <div className="flex items-center gap-2">
          <Euro className="w-5 h-5" />
          <span className="text-xl font-semibold">
            €{booking.total_price.toFixed(2)}
          </span>
        </div>
        
        <Button variant="outline" size="sm">
          {t('sitter.contactClient')}
        </Button>
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
