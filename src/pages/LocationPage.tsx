import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Clock, Phone, ExternalLink, ArrowLeft } from "lucide-react";

interface PetFriendlyPlace {
  id: string;
  name: string;
  type: 'restaurant' | 'hotel' | 'park' | 'beach' | 'cafe' | 'shop';
  address: string;
  description: string;
  rating: number;
  reviewCount: number;
  phoneNumber?: string;
  website?: string;
  openHours?: string;
  petServices: string[];
}

const mockPlaces: Record<string, PetFriendlyPlace[]> = {
  obidos: [
    {
      id: '1',
      name: 'Óbidos Castle Park',
      type: 'park',
      address: 'Rua Direita, Óbidos',
      description: 'Historic park surrounding the medieval castle with open spaces for dogs to explore.',
      rating: 4.8,
      reviewCount: 156,
      openHours: '9:00 - 18:00',
      petServices: ['Dog-friendly paths', 'Water fountains', 'Waste disposal']
    },
    {
      id: '2',
      name: 'Café Central Óbidos',
      type: 'cafe',
      address: 'Largo de São Pedro, Óbidos',
      description: 'Charming local café with outdoor seating that welcomes well-behaved pets.',
      rating: 4.5,
      reviewCount: 89,
      phoneNumber: '+351 262 959 924',
      openHours: '8:00 - 20:00',
      petServices: ['Outdoor seating', 'Water bowls', 'Pet treats available']
    }
  ],
  caldas: [
    {
      id: '3',
      name: 'Parque D. Carlos I',
      type: 'park',
      address: 'Caldas da Rainha',
      description: 'Beautiful thermal park with lakes and walking paths perfect for pets.',
      rating: 4.7,
      reviewCount: 234,
      openHours: '6:00 - 22:00',
      petServices: ['Walking trails', 'Lake access', 'Pet waste stations']
    },
    {
      id: '4',
      name: 'Hotel Real das Caldas',
      type: 'hotel',
      address: 'Rua Dr. Afonso Zuquete, Caldas da Rainha',
      description: 'Pet-friendly hotel offering accommodations for you and your furry friends.',
      rating: 4.4,
      reviewCount: 67,
      phoneNumber: '+351 262 840 040',
      website: 'www.hotelrealcaldas.com',
      petServices: ['Pet rooms', 'Walking areas', 'Pet sitting services']
    }
  ],
  bombarral: [
    {
      id: '5',
      name: 'Bombarral Municipal Park',
      type: 'park',
      address: 'Bombarral',
      description: 'Spacious municipal park with dedicated areas for pets to play and exercise.',
      rating: 4.6,
      reviewCount: 78,
      openHours: '7:00 - 21:00',
      petServices: ['Off-leash areas', 'Agility equipment', 'Shaded rest areas']
    }
  ],
  peniche: [
    {
      id: '6',
      name: 'Consolação Beach',
      type: 'beach',
      address: 'Praia da Consolação, Peniche',
      description: 'Dog-friendly beach with clear waters and beautiful coastal views.',
      rating: 4.9,
      reviewCount: 312,
      openHours: '24 hours',
      petServices: ['Dog beach area', 'Fresh water showers', 'Waste disposal']
    },
    {
      id: '7',
      name: 'Marisqueira Ribamar',
      type: 'restaurant',
      address: 'Rua Alexandre Herculano 42, Peniche',
      description: 'Traditional seafood restaurant with pet-friendly terrace overlooking the ocean.',
      rating: 4.3,
      reviewCount: 189,
      phoneNumber: '+351 262 787 442',
      openHours: '12:00 - 22:00',
      petServices: ['Outdoor terrace', 'Water bowls', 'Pet menu available']
    }
  ]
};

const locationNames: Record<string, string> = {
  obidos: 'Óbidos',
  caldas: 'Caldas da Rainha',
  bombarral: 'Bombarral',
  peniche: 'Peniche'
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'restaurant': return '🍽️';
    case 'hotel': return '🏨';
    case 'park': return '🌳';
    case 'beach': return '🏖️';
    case 'cafe': return '☕';
    case 'shop': return '🛍️';
    default: return '📍';
  }
};

const getTypeBadgeVariant = (type: string) => {
  switch (type) {
    case 'restaurant': return 'default';
    case 'hotel': return 'secondary';
    case 'park': return 'default';
    case 'beach': return 'default';
    case 'cafe': return 'secondary';
    case 'shop': return 'outline';
    default: return 'outline';
  }
};

export const LocationPage = () => {
  const { location } = useParams<{ location: string }>();
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  
  const places = location ? mockPlaces[location] || [] : [];
  const locationName = location ? locationNames[location] || location : '';
  const otherLocations = Object.keys(locationNames).filter(loc => loc !== location);

  if (!location || !locationNames[location]) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Location not found</h1>
          <Button asChild variant="outline">
            <Link to="/">Return Home</Link>
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
          asChild
          className="mb-6"
        >
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Pet Friendly Places in {locationName}
          </h1>
          <p className="text-xl text-muted-foreground">
            Discover the best pet-friendly locations in {locationName} that welcome you and your furry companions.
          </p>
        </div>

        {/* Interactive Map Placeholder */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="w-full h-64 bg-secondary/30 rounded-lg flex items-center justify-center border-2 border-dashed border-border">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Interactive Map Coming Soon</p>
                <p className="text-sm text-muted-foreground">
                  View all {places.length} pet-friendly places in {locationName}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Places List */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-semibold mb-4">
              {places.length} Pet-Friendly Places
            </h2>
            
            {places.map((place) => (
              <Card 
                key={place.id} 
                className={`card-hover cursor-pointer transition-all ${
                  selectedPlace === place.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedPlace(selectedPlace === place.id ? null : place.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getTypeIcon(place.type)}</span>
                        <CardTitle className="text-xl">{place.name}</CardTitle>
                        <Badge variant={getTypeBadgeVariant(place.type)}>
                          {place.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{place.address}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{place.rating}</span>
                          <span>({place.reviewCount} reviews)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{place.description}</p>
                  
                  {/* Pet Services */}
                  <div>
                    <h4 className="font-semibold mb-2">Pet Services:</h4>
                    <div className="flex flex-wrap gap-1">
                      {place.petServices.map((service) => (
                        <Badge key={service} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Additional Info */}
                  {selectedPlace === place.id && (
                    <div className="space-y-3 pt-4 border-t">
                      {place.openHours && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{place.openHours}</span>
                        </div>
                      )}
                      
                      {place.phoneNumber && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{place.phoneNumber}</span>
                        </div>
                      )}
                      
                      {place.website && (
                        <div className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          <a 
                            href={`https://${place.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            {place.website}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Other Locations */}
            <Card>
              <CardHeader>
                <CardTitle>Explore Other Locations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {otherLocations.map((loc) => (
                  <Button 
                    key={loc}
                    variant="outline" 
                    asChild 
                    className="w-full justify-start"
                  >
                    <Link to={`/location/${loc}`}>
                      <MapPin className="w-4 h-4 mr-2" />
                      {locationNames[loc]}
                    </Link>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Places</span>
                  <span className="font-medium">{places.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Rating</span>
                  <span className="font-medium">
                    {places.length > 0 
                      ? (places.reduce((acc, place) => acc + place.rating, 0) / places.length).toFixed(1)
                      : 'N/A'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Most Common Type</span>
                  <span className="font-medium capitalize">
                    {places.length > 0 
                      ? (() => {
                          const typeCount = places.reduce((acc, place) => {
                            acc[place.type] = (acc[place.type] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>);
                          return Object.entries(typeCount).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
                        })()
                      : 'N/A'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
