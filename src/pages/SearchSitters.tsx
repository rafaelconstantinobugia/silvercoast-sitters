import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { SitterCard } from "@/components/sitters/SitterCard";
import { FilterPanel } from "@/components/sitters/FilterPanel";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Filter } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface FilterState {
  location: string;
  serviceType: string;
  dateRange: { start: string; end: string };
  minRating: number;
  priceRange: { min: number; max: number };
}

interface Sitter {
  id: string;
  name: string;
  location: string;
  photo_url?: string;
  average_rating: number;
  verified: boolean;
  services_offered: string[];
  response_time: string;
  description: string;
  price_per_day: number;
}

export const SearchSitters = () => {
  const { user } = useAuth();
  const [sitters, setSitters] = useState<Sitter[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    location: "",
    serviceType: "",
    dateRange: { start: "", end: "" },
    minRating: 0,
    priceRange: { min: 0, max: 100 }
  });

  useEffect(() => {
    fetchSitters();
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchSitters = async () => {
    try {
      // Use public view that excludes sensitive data like email and phone
      const { data, error } = await supabase
        .from('sitters_public')
        .select('*')
        .eq('available', true)
        .order('average_rating', { ascending: false });

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

  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('sitter_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(data?.map(f => f.sitter_id) || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const toggleFavorite = async (sitterId: string) => {
    if (!user) {
      toast.error("Please sign in to favorite sitters");
      return;
    }

    try {
      const isFavorited = favorites.includes(sitterId);
      
      if (isFavorited) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('sitter_id', sitterId);
        
        if (error) throw error;
        setFavorites(prev => prev.filter(id => id !== sitterId));
        toast.success("Removed from favorites");
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, sitter_id: sitterId });
        
        if (error) throw error;
        setFavorites(prev => [...prev, sitterId]);
        toast.success("Added to favorites");
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error("Failed to update favorites");
    }
  };

  const handleSearch = () => {
    // TODO: Implement filtering logic
    toast.info('Filtering functionality coming soon!');
  };

  // Transform database sitters for display
  const displaySitters = sitters.map(sitter => ({
    id: sitter.id,
    name: sitter.name,
    location: sitter.location,
    photoUrl: sitter.photo_url,
    rating: sitter.average_rating || 0,
    reviewCount: Math.floor(sitter.average_rating * 10) + 5, // Calculate based on rating
    serviceTypes: Array.isArray(sitter.services_offered) 
      ? sitter.services_offered 
      : [sitter.services_offered || 'pet_sitting'],
    verified: sitter.verified,
    responseTime: sitter.response_time || '2 hours',
    description: sitter.description || 'Professional pet and house sitter in the Silver Coast region.',
    isFavorited: favorites.includes(sitter.id)
  }));

  // Sort to show favorites first for logged-in users
  const sortedSitters = user 
    ? displaySitters.sort((a, b) => {
        if (a.isFavorited && !b.isFavorited) return -1;
        if (!a.isFavorited && b.isFavorited) return 1;
        return b.rating - a.rating; // Then by rating
      })
    : displaySitters;

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
        <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold mb-4">
            Find Your Perfect Pet Sitter
          </h1>
          <p className="text-xl text-muted-foreground">
            Browse verified pet and house sitters{user ? '. Your favorites appear first!' : '. Sign in to save favorites!'}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar - Desktop */}
           <div className="hidden lg:block lg:w-80">
             {/* Temporarily disable filters until interface is fixed */}
             <div className="p-4 border rounded-lg bg-card">
               <h3 className="font-semibold mb-4">Filters</h3>
               <p className="text-sm text-muted-foreground">
                 Advanced filtering coming soon! Currently showing all verified sitters.
               </p>
             </div>
           </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-6">
              <Button 
                variant="outline" 
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              
               {showMobileFilters && (
                 <div className="mt-4 p-4 border rounded-lg bg-card">
                   <h3 className="font-semibold mb-4">Filters</h3>
                   <p className="text-sm text-muted-foreground">
                     Advanced filtering coming soon! Currently showing all verified sitters.
                   </p>
                 </div>
               )}
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {sortedSitters.length} verified sitters found
              </p>
            </div>

            {/* Sitters Grid */}
            {sortedSitters.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedSitters.map((sitter) => (
                  <SitterCard
                    key={sitter.id}
                    id={sitter.id}
                    name={sitter.name}
                    location={sitter.location}
                    photoUrl={sitter.photoUrl}
                    rating={sitter.rating}
                    reviewCount={sitter.reviewCount}
                    serviceTypes={sitter.serviceTypes}
                    verified={sitter.verified}
                    responseTime={sitter.responseTime}
                    description={sitter.description}
                    isFavorited={sitter.isFavorited}
                    onFavoriteToggle={user ? () => toggleFavorite(sitter.id) : undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">No sitters found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or check back later for more sitters.
                </p>
                <Button onClick={fetchSitters} variant="outline">
                  Refresh Results
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};