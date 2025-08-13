import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Heart, Shield } from "lucide-react";
import { Link } from "react-router-dom";

interface SitterCardProps {
  id: string;
  name: string;
  location: string;
  photoUrl?: string;
  rating: number;
  reviewCount: number;
  serviceTypes: string[];
  verified: boolean;
  responseTime: string;
  description: string;
  isFavorited?: boolean;
  onFavoriteToggle?: () => void;
}

export const SitterCard = ({
  id,
  name,
  location,
  photoUrl,
  rating,
  reviewCount,
  serviceTypes,
  verified,
  responseTime,
  description,
  isFavorited = false,
  onFavoriteToggle
}: SitterCardProps) => {
  const getServiceTypeBadge = (type: string) => {
    switch (type) {
      case 'pet_sitting':
        return 'Pet Sitting';
      case 'house_sitting':
        return 'House Sitting';
      case 'both':
        return 'Pet & House';
      default:
        return type;
    }
  };

  return (
    <Card className="card-hover border-0 shadow-soft overflow-hidden">
      <div className="aspect-square relative overflow-hidden">
        {photoUrl ? (
          <img 
            src={photoUrl} 
            alt={`${name}'s profile`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-primary" />
            </div>
          </div>
        )}
        
        {/* Favorite Button */}
        {onFavoriteToggle && (
          <button 
            onClick={onFavoriteToggle}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-soft transition-colors ${
              isFavorited 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-white/90 hover:bg-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : 'text-muted-foreground hover:text-red-500'}`} />
          </button>
        )}

        {/* Verified Badge */}
        {verified && (
          <div className="absolute top-3 left-3">
            <Badge className="badge-verified">
              <Shield className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg leading-tight">{name}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{location}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="font-medium">{rating.toFixed(1)}</span>
            </div>
            <span className="text-xs text-muted-foreground">({reviewCount} reviews)</span>
          </div>
        </div>

        {/* Services */}
        <div className="flex flex-wrap gap-1">
          {serviceTypes.map((type) => (
            <Badge key={type} variant="secondary" className="text-xs">
              {getServiceTypeBadge(type)}
            </Badge>
          ))}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>

        {/* Response Time */}
        <p className="text-xs text-muted-foreground">
          Responds in {responseTime}
        </p>

        {/* CTA */}
        <div className="flex justify-end pt-2">
          <Button asChild size="sm" variant="outline">
            <Link to={`/sitter/${id}`}>
              View Profile
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};