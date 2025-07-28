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
  users: {
    name: string;
    location?: string;
    photo_url?: string;
  };
  description?: string;
  services_offered: string[];
  average_rating: number;
  verified: boolean;
  available: boolean;
  experience_years?: number;
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
        .select(`
          *,
          users (name, location, photo_url)
        `)
        .eq('verified', true)
        .eq('available', true);

      if (error) throw error;
      setSitters(data || []);
    } catch (error) {
      console.error('Error fetching sitters:', error);
      toast.error('Failed to load sitters');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // TODO: Implement filtering logic
    toast.info('Filtering functionality coming soon!');
  };

  // Mock data for now since we need sample sitters
  const mockSitters = [
    {
      id: '1',
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
      id: '2',
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
      id: '3',
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
      id: '4',
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Find Your Perfect Sitter</h1>
            <p className="text-muted-foreground">
              Browse verified pet and house sitters in Portugal's Silver Coast
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
                {mockSitters.length} sitters available
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {mockSitters.map((sitter) => (
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

            {mockSitters.length === 0 && (
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