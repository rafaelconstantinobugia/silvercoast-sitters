import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Search, Filter, Star, Heart, Shield } from "lucide-react";

interface FilterState {
  location: string;
  serviceType: string;
  dateRange: string;
  minRating: string;
  priceRange: string;
}

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onSearch: () => void;
}

export const FilterPanel = ({ filters, onFiltersChange, onSearch }: FilterPanelProps) => {
  const updateFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card className="border-0 shadow-medium">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                placeholder="Óbidos, Caldas da Rainha, Peniche..."
                value={filters.location}
                onChange={(e) => updateFilter('location', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Service Type */}
          <div className="space-y-2">
            <Label>Service Type</Label>
            <Select value={filters.serviceType} onValueChange={(value) => updateFilter('serviceType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All services" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="pet_sitting">Pet Sitting</SelectItem>
                <SelectItem value="house_sitting">House Sitting</SelectItem>
                <SelectItem value="both">Pet & House Sitting</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label htmlFor="dates">Dates Needed</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="dates"
                placeholder="Select dates"
                value={filters.dateRange}
                onChange={(e) => updateFilter('dateRange', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Rating Filter */}
          <div className="space-y-2">
            <Label>Minimum Rating</Label>
            <Select value={filters.minRating} onValueChange={(value) => updateFilter('minRating', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Any rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Rating</SelectItem>
                <SelectItem value="4">4+ Stars</SelectItem>
                <SelectItem value="4.5">4.5+ Stars</SelectItem>
                <SelectItem value="4.8">4.8+ Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <Label>Price Range</Label>
            <Select value={filters.priceRange} onValueChange={(value) => updateFilter('priceRange', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Any price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Price</SelectItem>
                <SelectItem value="0-30">€0 - €30/day</SelectItem>
                <SelectItem value="30-50">€30 - €50/day</SelectItem>
                <SelectItem value="50-75">€50 - €75/day</SelectItem>
                <SelectItem value="75+">€75+/day</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <Button 
            onClick={onSearch}
            className="w-full bg-ocean-gradient text-white hover:opacity-90"
            size="lg"
          >
            <Search className="w-4 h-4 mr-2" />
            Search Sitters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};