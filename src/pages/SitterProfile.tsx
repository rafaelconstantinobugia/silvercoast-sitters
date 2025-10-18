import { useState, useEffect } from "react";
import { ReviewsList } from '@/components/reviews/ReviewsList';
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Star, MapPin, Calendar, Heart, Shield, ArrowLeft, MessageCircle, Phone, Mail } from "lucide-react";

export const SitterProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sitter, setSitter] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [contactDetails, setContactDetails] = useState<{ email: string; phone: string } | null>(null);

  useEffect(() => {
    const fetchSitterData = async () => {
      if (!id) return;
      
      try {
        // Fetch basic sitter info (excludes sensitive data like email and phone)
        const { data: sitterData, error: sitterError } = await (supabase as any)
          .from('sitters')
          .select('id, name, location, photo_url, average_rating, verified, available, price_per_day, description, experience_years, response_time, services_offered')
          .eq('id', id)
          .eq('verified', true)
          .single();

        if (sitterError) throw sitterError;

        // If user is authenticated, get contact details separately
        if (user) {
          const { data: contactData, error: contactError } = await supabase
            .rpc('get_sitter_contact_details', { sitter_id: id });
          
          if (contactData && contactData.length > 0) {
            setContactDetails({
              email: contactData[0].email,
              phone: contactData[0].phone
            });
          }
        }

        // Fetch services pricing
        const { data: servicesData, error: servicesError } = await (supabase as any)
          .from('services')
          .select('*')
          .eq('active', true);

        if (servicesError) throw servicesError;

        setSitter(sitterData);
        setServices(servicesData || []);
      } catch (error) {
        console.error('Error fetching sitter data:', error);
        // Keep fallback data for demo
        setSitter({
          id: id || '1',
          name: 'Maria Santos',
          location: 'Óbidos, Silver Coast',
          photo_url: null,
          average_rating: 4.9,
          verified: true,
          response_time: '1 hour',
          experience_years: 5,
          description: 'I am a passionate animal lover with over 5 years of experience in pet sitting. I understand that pets are family members, and I treat them with the same love and care I would give to my own. I live in a spacious home with a large garden, perfect for dogs to play and exercise.',
          services_offered: ['pet', 'house']
        });
        setServices([
          { name: 'Pet Sitting', base_price: 35, service_type: 'pet' },
          { name: 'House Sitting', base_price: 30, service_type: 'house' },
          { name: 'Combined Service', base_price: 50, service_type: 'combined' },
          { name: 'Overnight Stays', base_price: 45, service_type: 'pet' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSitterData();
  }, [id]);

  const handleBookNow = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate(`/book-now?sitter=${id}`);
  };

  // Calculate review count based on rating
  const reviewCount = sitter ? Math.floor(sitter.average_rating * 10) + 5 : 0;

  // Mock reviews for display
  const reviews = [
    {
      id: '1',
      author: 'João P.',
      rating: 5,
      comment: `${sitter?.name || 'The sitter'} took excellent care of our pets. Daily updates with photos and our pets were so happy when we returned!`,
      date: '2 weeks ago'
    },
    {
      id: '2',
      author: 'Ana M.',
      rating: 5,
      comment: 'Professional and caring. Our house was spotless when we returned and our pets were relaxed and happy.',
      date: '1 month ago'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!sitter) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Sitter not found</h1>
          <Button onClick={() => navigate('/search')} variant="outline">
            Browse Other Sitters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-32 h-32 mx-auto md:mx-0">
                    {sitter.photo_url ? (
                      <img 
                        src={sitter.photo_url} 
                        alt={sitter.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <div className="w-full h-full bg-secondary rounded-xl flex items-center justify-center">
                        <Heart className="w-12 h-12 text-primary" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold">{sitter.name}</h1>
                        {sitter.verified && (
                          <Badge className="badge-verified">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{sitter.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium">{sitter.average_rating}</span>
                          <span>({reviewCount} reviews)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(sitter.services_offered) 
                        ? sitter.services_offered.map((type: string) => (
                            <Badge key={type} variant="secondary">
                              {type === 'pet' ? 'Pet Sitting' : type === 'house' ? 'House Sitting' : 'Combined Service'}
                            </Badge>
                          ))
                        : <Badge variant="secondary">Pet & House Sitting</Badge>
                      }
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        onClick={handleBookNow}
                        className="bg-ocean-gradient text-white hover:opacity-90"
                        size="lg"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Now
                      </Button>
                      <Button variant="outline" size="lg">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                    </div>

                    {/* Contact Information - Only for authenticated users */}
                    {user && contactDetails && (
                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-semibold mb-3">Contact Information</h4>
                        <div className="space-y-2">
                          {contactDetails.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <span>{contactDetails.email}</span>
                            </div>
                          )}
                          {contactDetails.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span>{contactDetails.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About {sitter.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {sitter.description}
                </p>
                
                <div className="grid sm:grid-cols-2 gap-4 pt-4">
                  <div>
                    <h4 className="font-semibold mb-2">Experience</h4>
                    <p className="text-muted-foreground">{sitter.experience_years || 5} years</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Response Time</h4>
                    <p className="text-muted-foreground">Usually within {sitter.response_time}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Table */}
            <Card>
              <CardHeader>
                <CardTitle>Service Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {services.map((service) => (
                    <div key={service.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">{service.name}</span>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      </div>
                      <span className="text-lg font-bold">€{service.base_price}/{service.duration_hours}h</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Prices may vary based on specific requirements and duration.
                </p>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle>Services Offered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-2">
                  {['Daily pet visits', 'Overnight pet sitting', 'Dog walking', 'House sitting', 'Plant watering', 'Mail collection'].map((service) => (
                    <div key={service} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span>{service}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews ({reviewCount})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{review.author}</span>
                        <div className="flex">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{review.date}</span>
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Availability */}
            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="badge-completed">
                  {sitter.available ? 'Available this week' : 'Unavailable'}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  Contact {sitter.name} to check specific dates
                </p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Reviews</span>
                  <span className="font-medium">{reviewCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Rating</span>
                  <span className="font-medium">{sitter.average_rating}/5</span>
                </div>
                <div className="flex justify-between">
                  <span>Response Rate</span>
                  <span className="font-medium">100%</span>
                </div>
                <div className="flex justify-between">
                  <span>Experience</span>
                  <span className="font-medium">{sitter.experience_years || 5} years</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};