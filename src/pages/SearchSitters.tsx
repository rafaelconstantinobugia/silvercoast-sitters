import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { FilterPanel } from "@/components/sitters/FilterPanel";
import { SitterCard } from "@/components/sitters/SitterCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Filter } from "lucide-react";

interface FilterState {
  location: string;
  serviceType: string;
  dateRange: string;
  minRating: string;
  priceRange: string;
}

interface Sitter {
  id: string;
  name: string;
  location: string;
  phone: string;
  email: string;
  description?: string;
  services_offered: string[];
  average_rating: number;
  verified: boolean;
  available: boolean;
  experience_years?: number;
  price_per_day: number;
  photo_url?: string;
  response_time: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export const SearchSitters = () => {
  const { user } = useAuth();
  const [sitters, setSitters] = useState<Sitter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    location: '',
    serviceType: 'all',
    dateRange: '',
    minRating: 'all',
    priceRange: 'all'
  });

  useEffect(() => {
    fetchSitters();
  }, []);

  const fetchSitters = async () => {
    try {
      const { data, error } = await supabase
        .from('sitters')
        .select('*')
        .eq('verified', true)
        .eq('available', true);

      if (error) {
        console.error('Error fetching sitters:', error);
        setSitters([]);
      } else {
        setSitters(data || []);
      }
    } catch (error) {
      console.error('Error fetching sitters:', error);
      setSitters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // TODO: Implement filtering logic
    toast.info('Filtering functionality coming soon!');
  };

  // Mock data for demonstration - this will be replaced by real database sitters when available
  const mockSitters = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Maria Santos',
      location: 'Óbidos',
      photoUrl: undefined,
      rating: 4.9,
      reviewCount: 47,
      pricePerDay: 35,
      serviceTypes: ['pet_sitting', 'house_sitting'],
      verified: true,
      responseTime: '1 hour',
      description: 'Experienced pet sitter with over 5 years caring for dogs and cats. I love spending time with animals and ensuring they feel safe and loved while their owners are away.'
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'João Silva',
      location: 'Caldas da Rainha',
      photoUrl: undefined,
      rating: 4.8,
      reviewCount: 32,
      pricePerDay: 45,
      serviceTypes: ['pet_sitting'],
      verified: true,
      responseTime: '30 minutes',
      description: 'Professional dog walker and pet sitter. Specializing in large breeds and senior pets. Available for overnight sitting and daily walks.'
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      name: 'Ana Costa',
      location: 'Peniche',
      photoUrl: undefined,
      rating: 4.7,
      reviewCount: 28,
      pricePerDay: 30,
      serviceTypes: ['house_sitting'],
      verified: true,
      responseTime: '2 hours',
      description: 'Reliable house sitter with experience in home maintenance and security. I take care of your home as if it were my own, ensuring everything is safe and secure.'
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      name: 'Pedro Ferreira',
      location: 'Bombarral',
      photoUrl: undefined,
      rating: 4.9,
      reviewCount: 53,
      pricePerDay: 50,
      serviceTypes: ['both'],
      verified: true,
      responseTime: '45 minutes',
      description: 'Complete care package for your pets and home. Former veterinary assistant with extensive experience in pet care and home maintenance.'
    },
    {
      id: '55555555-5555-5555-5555-555555555555',
      name: 'Sofia Oliveira',
      location: 'Óbidos',
      photoUrl: undefined,
      rating: 4.8,
      reviewCount: 39,
      pricePerDay: 40,
      serviceTypes: ['pet_sitting'],
      verified: true,
      responseTime: '1 hour',
      description: 'Loving pet sitter specializing in cats and small animals. I work from home so can provide constant companionship.'
    },
    {
      id: '66666666-6666-6666-6666-666666666666',
      name: 'Ricardo Mendes',
      location: 'Caldas da Rainha',
      photoUrl: undefined,
      rating: 4.6,
      reviewCount: 25,
      pricePerDay: 38,
      serviceTypes: ['both'],
      verified: true,
      responseTime: '3 hours',
      description: 'Trustworthy house and pet sitter offering complete peace of mind. I maintain your home security, care for gardens, and provide daily updates with photos.'
    }
  ];

  // Use database sitters if available, otherwise fall back to mock data for empty state
  const displaySitters = sitters.length > 0 ? 
    sitters.map(sitter => ({
      id: sitter.id,
      name: sitter.name || 'Unknown Sitter',
      location: sitter.location || 'Silver Coast',
      photoUrl: sitter.photo_url,
      rating: sitter.average_rating || 0,
      reviewCount: Math.floor(Math.random() * 50) + 10, // Mock review count for now
      pricePerDay: sitter.price_per_day || 35,
      serviceTypes: sitter.services_offered?.map(service => {
        // Convert enum values to display format
        if (service === 'pet') return 'pet_sitting';
        if (service === 'house') return 'house_sitting';
        if (service === 'combined') return 'both';
        return service;
      }) || [],
      verified: sitter.verified,
      responseTime: sitter.response_time || '2 hours',
      description: sitter.description || 'Professional pet and house sitter.'
    })) : mockSitters;

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
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Know Our Sitters</h1>
            <p className="text-muted-foreground">
              Meet our verified pet and house sitters and see their rates in Portugal's Silver Coast
            </p>
          </div>
          
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <FilterPanel 
              filters={filters}
              onFiltersChange={setFilters}
              onSearch={handleSearch}
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {displaySitters.length} sitters available
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {displaySitters.map((sitter) => (
                <SitterCard
                  key={sitter.id}
                  id={sitter.id}
                  name={sitter.name}
                  location={sitter.location}
                  photoUrl={sitter.photoUrl}
                  rating={sitter.rating}
                  reviewCount={sitter.reviewCount}
                  pricePerDay={sitter.pricePerDay}
                  serviceTypes={sitter.serviceTypes}
                  verified={sitter.verified}
                  responseTime={sitter.responseTime}
                  description={sitter.description}
                />
              ))}
            </div>

            {displaySitters.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No sitters found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};