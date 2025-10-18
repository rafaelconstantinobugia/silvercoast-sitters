import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock, Shield, Zap, Star, MapPin, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Service {
  id: string;
  name: string;
  service_type: string;
  base_price: number;
  duration_hours: number;
  description: string;
}

interface Sitter {
  id: string;
  name: string;
  location: string;
  photo_url?: string;
  average_rating: number;
  verified: boolean;
  available: boolean;
}

export const BookNow = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const preSelectedSitterId = searchParams.get('sitter');
  
  const [isLoading, setIsLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [sitters, setSitters] = useState<Sitter[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedSitter, setSelectedSitter] = useState<Sitter | null>(null);
  
  const [formData, setFormData] = useState({
    serviceId: "",
    sitterId: preSelectedSitterId || "",
    startDate: "",
    endDate: "",
    location: "",
    pets: [{ name: "", breed: "", age: "", specialNeeds: "" }],
    houseDetails: "",
    specialInstructions: "",
    contactPhone: "",
    preferredTime: ""
  });

  useEffect(() => {
    fetchServices();
    fetchSitters();
  }, []);

  useEffect(() => {
    if (preSelectedSitterId && sitters.length > 0) {
      const sitter = sitters.find(s => s.id === preSelectedSitterId);
      if (sitter) {
        setSelectedSitter(sitter);
        setFormData(prev => ({ ...prev, sitterId: preSelectedSitterId }));
      }
    }
  }, [preSelectedSitterId, sitters]);

  const fetchServices = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('services')
        .select('*')
        .eq('active', true)
        .order('service_type', { ascending: true })
        .order('duration_hours', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error(t('bookNow.failedToLoadServices'));
    }
  };

  const fetchSitters = async (serviceId?: string) => {
    try {
      let query;
      
      if (serviceId) {
        // Use the function to get sitters filtered by service
        const { data, error } = await supabase.rpc('get_sitters_by_service', {
          service_id_param: serviceId
        });
        
        if (error) throw error;
        setSitters(data || []);
      } else {
        // Fetch all verified sitters if no service is selected
        const { data, error } = await supabase
          .from('sitter_public')
          .select('sitter_id, name, city, avatar_url')
          .eq('is_verified', true)
          .eq('is_listed', true);

        if (error) throw error;
        // @ts-ignore - Schema mismatch
        setSitters(data || []);
      }
    } catch (error) {
      console.error('Error fetching sitters:', error);
      toast.error(t('bookNow.failedToLoadSitters'));
    }
  };

  const calculateTotalPrice = () => {
    if (!selectedService || !formData.startDate || !formData.endDate) return 0;
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffInHours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    
    if (selectedService.duration_hours === 24) {
      // Daily service (24h services)
      const days = Math.ceil(diffInHours / 24);
      return selectedService.base_price * days;
    } else {
      // Hourly service
      const serviceBlocks = Math.ceil(diffInHours / selectedService.duration_hours);
      return selectedService.base_price * serviceBlocks;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'serviceId') {
      const service = services.find(s => s.id === value);
      setSelectedService(service || null);
      
      // Fetch sitters filtered by the selected service
      if (value) {
        fetchSitters(value);
      } else {
        fetchSitters(); // Fetch all sitters if no service selected
      }
    }
    
    if (field === 'sitterId') {
      if (value === 'auto') {
        setSelectedSitter(null);
      } else {
        const sitter = sitters.find(s => s.id === value);
        setSelectedSitter(sitter || null);
      }
    }
  };

  const handlePetChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      pets: prev.pets.map((pet, i) => 
        i === index ? { ...pet, [field]: value } : pet
      )
    }));
  };

  const addPet = () => {
    setFormData(prev => ({
      ...prev,
      pets: [...prev.pets, { name: "", breed: "", age: "", specialNeeds: "" }]
    }));
  };

  const removePet = (index: number) => {
    if (formData.pets.length > 1) {
      setFormData(prev => ({
        ...prev,
        pets: prev.pets.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmitBooking = async () => {
    if (!user) {
      toast.error(t('bookNow.signInToBook'));
      navigate("/auth");
      return;
    }

    if (!formData.serviceId || !formData.startDate || !formData.endDate || !formData.location) {
      toast.error(t('bookNow.fillRequiredFields'));
      return;
    }

    setIsLoading(true);

    try {
      const totalPrice = calculateTotalPrice();
      
      console.log("Submitting booking with data:", {
        owner_id: user.id,
        service_id: formData.serviceId,
        sitter_id: formData.sitterId === 'auto' ? null : formData.sitterId || null,
        start_date: formData.startDate,
        end_date: formData.endDate,
        total_price: totalPrice,
        status: "pending"
      });
      
      // Create booking - will be pending admin confirmation
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          customer_id: user.id,
          service_id: formData.serviceId,
          sitter_id: formData.sitterId === 'auto' ? null : formData.sitterId || null, // Optional sitter selection
          start_time: formData.startDate,
          end_time: formData.endDate,
          pet_details: selectedService?.service_type === "pet" || selectedService?.service_type === "combined" 
            ? { pets: formData.pets } : null,
          house_details: selectedService?.service_type === "house" || selectedService?.service_type === "combined" 
            ? { details: formData.houseDetails } : null,
          notes: `Location: ${formData.location}\nPhone: ${formData.contactPhone}\nPreferred Time: ${formData.preferredTime}\nSpecial Instructions: ${formData.specialInstructions}`,
          total_price: totalPrice,
          status: "pending" // All bookings start as pending for admin confirmation
        })
        .select()
        .maybeSingle();

      console.log("Booking result:", { booking, bookingError });

      if (bookingError) {
        console.error("Booking error details:", bookingError);
        throw bookingError;
      }

      toast.success(t('bookNow.requestSubmitted'));
      navigate("/dashboard");
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(`${t('bookNow.failedToSubmit')}: ${error.message || t('common.error')}`);
    } finally {
      setIsLoading(false);
    }
  };

  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.service_type]) {
      acc[service.service_type] = [];
    }
    acc[service.service_type].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  const getServiceTypeLabel = (type: string) => {
    switch (type) {
      case 'pet': return t('bookNow.petServices');
      case 'house': return t('bookNow.houseServices');
      case 'combined': return t('bookNow.combinedServices');
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t('bookNow.title')}
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            {t('bookNow.subtitle')}
          </p>
          
          {/* Trust Indicators */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Zap className="h-5 w-5 text-primary" />
              <span>{t('bookNow.fastBooking')}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-5 w-5 text-primary" />
              <span>{t('bookNow.verifiedSitters')}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-5 w-5 text-primary" />
              <span>{t('bookNow.support247')}</span>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <Card className="mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t('bookNow.serviceDetails')}
            </CardTitle>
            <CardDescription>
              {t('bookNow.selectServiceDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Service Selection */}
            <div className="space-y-2">
              <Label htmlFor="serviceId">{t('bookNow.selectService')} *</Label>
              <Select onValueChange={(value) => handleInputChange("serviceId", value)} value={formData.serviceId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('bookNow.chooseService')} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(groupedServices).map(([type, typeServices]) => (
                    <div key={type}>
                      <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                        {getServiceTypeLabel(type)}
                      </div>
                      {typeServices.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{service.name}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              €{service.base_price}/{service.duration_hours === 24 ? 'day' : service.duration_hours + 'h'}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
              {selectedService && (
                <div className="text-sm text-muted-foreground">
                  {selectedService.description}
                </div>
              )}
            </div>

            {/* Sitter Selection */}
            <div className="space-y-2">
              <Label htmlFor="sitterId">{t('bookNow.preferredSitter')}</Label>
              <Select onValueChange={(value) => handleInputChange("sitterId", value)} value={formData.sitterId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('bookNow.chooseSitter')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">{t('bookNow.letUsAssign')}</SelectItem>
                  {sitters.map((sitter) => (
                    <SelectItem key={sitter.id} value={sitter.id}>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={sitter.photo_url || ""} />
                          <AvatarFallback><User className="h-3 w-3" /></AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-2">
                          <span>{sitter.name}</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs">{sitter.average_rating}</span>
                          </div>
                          {sitter.verified && (
                            <Badge variant="secondary" className="text-xs">{t('bookNow.verified')}</Badge>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedSitter && (
                <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedSitter.photo_url || ""} />
                    <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{selectedSitter.name}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{selectedSitter.location}</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span>{selectedSitter.average_rating} {t('bookNow.rating')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">{t('bookNow.startDate')} *</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">{t('bookNow.endDate')} *</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                />
              </div>
            </div>

            {/* Price Estimation */}
            {selectedService && formData.startDate && formData.endDate && (
              <div className="p-4 bg-ocean-gradient/10 rounded-lg border border-ocean-gradient/20">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{t('bookNow.estimatedTotal')}</span>
                  <span className="text-2xl font-bold bg-ocean-gradient bg-clip-text text-transparent">€{calculateTotalPrice()}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {t('bookNow.finalPriceConfirmed')}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">{t('bookNow.location')} *</Label>
              <Input
                id="location"
                placeholder={t('bookNow.enterLocation')}
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
              />
            </div>

            {/* Contact Phone */}
            <div className="space-y-2">
              <Label htmlFor="contactPhone">{t('bookNow.contactPhone')}</Label>
              <Input
                id="contactPhone"
                placeholder={t('bookNow.yourPhone')}
                value={formData.contactPhone}
                onChange={(e) => handleInputChange("contactPhone", e.target.value)}
              />
            </div>

            {/* Preferred Time */}
            <div className="space-y-2">
              <Label htmlFor="preferredTime">{t('bookNow.preferredContactTime')}</Label>
              <Select onValueChange={(value) => handleInputChange("preferredTime", value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('bookNow.whenContact')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">{t('bookNow.morning')}</SelectItem>
                  <SelectItem value="afternoon">{t('bookNow.afternoon')}</SelectItem>
                  <SelectItem value="evening">{t('bookNow.evening')}</SelectItem>
                  <SelectItem value="anytime">{t('bookNow.anytime')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pet Details */}
            {selectedService?.service_type === "pet" || selectedService?.service_type === "combined" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>{t('bookNow.petDetails')}</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addPet}>
                    {t('bookNow.addAnotherPet')}
                  </Button>
                </div>
                {formData.pets.map((pet, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Pet {index + 1}</h4>
                      {formData.pets.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removePet(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          {t('bookNow.removePet')}
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor={`petName-${index}`}>{t('bookNow.petName')}</Label>
                        <Input
                          id={`petName-${index}`}
                          placeholder={t('bookNow.petName')}
                          value={pet.name}
                          onChange={(e) => handlePetChange(index, "name", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`petBreed-${index}`}>{t('bookNow.breed')}</Label>
                        <Input
                          id={`petBreed-${index}`}
                          placeholder={t('bookNow.breed')}
                          value={pet.breed}
                          onChange={(e) => handlePetChange(index, "breed", e.target.value)}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : null}

            {/* House Details */}
            {selectedService?.service_type === "house" || selectedService?.service_type === "combined" ? (
              <div className="space-y-2">
                <Label htmlFor="houseDetails">{t('bookNow.houseDetails')}</Label>
                <Textarea
                  id="houseDetails"
                  placeholder={t('bookNow.houseDetailsPlaceholder')}
                  value={formData.houseDetails}
                  onChange={(e) => handleInputChange("houseDetails", e.target.value)}
                />
              </div>
            ) : null}

            {/* Special Instructions */}
            <div className="space-y-2">
              <Label htmlFor="specialInstructions">{t('bookNow.specialInstructions')}</Label>
              <Textarea
                id="specialInstructions"
                placeholder={t('bookNow.additionalInfo')}
                value={formData.specialInstructions}
                onChange={(e) => handleInputChange("specialInstructions", e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <div className="flex flex-col gap-4 pt-4">
              <Button 
                onClick={handleSubmitBooking} 
                disabled={isLoading}
                size="lg"
                className="w-full"
              >
                {isLoading ? t('becomeSitter.submitting') : t('bookNow.requestBooking')}
              </Button>
              
              <p className="text-sm text-muted-foreground text-center">
                {t('bookNow.finalPriceConfirmed')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};