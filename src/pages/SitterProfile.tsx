import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/contexts/AuthContext";
import { Star, MapPin, Calendar, Heart, Shield, ArrowLeft, MessageCircle } from "lucide-react";

export const SitterProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Mock sitter data for now
  const mockSitter = {
    id: id || '1',
    name: 'Maria Santos',
    location: 'Óbidos, Silver Coast',
    photoUrl: undefined,
    rating: 4.9,
    reviewCount: 47,
    pricePerDay: 35,
    serviceTypes: ['Pet Sitting', 'House Sitting'],
    verified: true,
    responseTime: '1 hour',
    experienceYears: 5,
    description: 'I am a passionate animal lover with over 5 years of experience in pet sitting. I understand that pets are family members, and I treat them with the same love and care I would give to my own. I live in a spacious home with a large garden, perfect for dogs to play and exercise.',
    services: [
      'Daily pet visits',
      'Overnight pet sitting',
      'Dog walking',
      'House sitting',
      'Plant watering',
      'Mail collection'
    ],
    availability: 'Available this week',
    reviews: [
      {
        id: '1',
        author: 'João P.',
        rating: 5,
        comment: 'Maria took excellent care of our dog Luna. She sent daily updates with photos and Luna was so happy when we returned!',
        date: '2 weeks ago'
      },
      {
        id: '2',
        author: 'Ana M.',
        rating: 5,
        comment: 'Professional and caring. Our house was spotless when we returned and our cats were relaxed and happy.',
        date: '1 month ago'
      }
    ]
  };

  const handleBookNow = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate(`/booking/${id}`);
  };

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
                    {mockSitter.photoUrl ? (
                      <img 
                        src={mockSitter.photoUrl} 
                        alt={mockSitter.name}
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
                        <h1 className="text-3xl font-bold">{mockSitter.name}</h1>
                        {mockSitter.verified && (
                          <Badge className="badge-verified">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{mockSitter.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium">{mockSitter.rating}</span>
                          <span>({mockSitter.reviewCount} reviews)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {mockSitter.serviceTypes.map((type) => (
                        <Badge key={type} variant="secondary">{type}</Badge>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        onClick={handleBookNow}
                        className="bg-ocean-gradient text-white hover:opacity-90"
                        size="lg"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Now - €{mockSitter.pricePerDay}/day
                      </Button>
                      <Button variant="outline" size="lg">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About {mockSitter.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {mockSitter.description}
                </p>
                
                <div className="grid sm:grid-cols-2 gap-4 pt-4">
                  <div>
                    <h4 className="font-semibold mb-2">Experience</h4>
                    <p className="text-muted-foreground">{mockSitter.experienceYears} years</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Response Time</h4>
                    <p className="text-muted-foreground">Usually within {mockSitter.responseTime}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle>Services Offered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-2">
                  {mockSitter.services.map((service) => (
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
                <CardTitle>Reviews ({mockSitter.reviewCount})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockSitter.reviews.map((review) => (
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
                <Badge className="badge-completed">{mockSitter.availability}</Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  Contact {mockSitter.name} to check specific dates
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
                  <span className="font-medium">{mockSitter.reviewCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Rating</span>
                  <span className="font-medium">{mockSitter.rating}/5</span>
                </div>
                <div className="flex justify-between">
                  <span>Response Rate</span>
                  <span className="font-medium">100%</span>
                </div>
                <div className="flex justify-between">
                  <span>Experience</span>
                  <span className="font-medium">{mockSitter.experienceYears} years</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};