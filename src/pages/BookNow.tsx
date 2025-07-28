import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Shield, Zap } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const BookNow = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    serviceType: "",
    startDate: "",
    endDate: "",
    location: "",
    petDetails: "",
    houseDetails: "",
    specialInstructions: "",
    contactPhone: "",
    preferredTime: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleQuickBook = async () => {
    if (!user) {
      toast.error("Please sign in to book a service");
      navigate("/auth");
      return;
    }

    if (!formData.serviceType || !formData.startDate || !formData.endDate || !formData.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      // Get the appropriate service
      const { data: services, error: serviceError } = await supabase
        .from("services")
        .select("*")
        .eq("service_type", formData.serviceType as "pet" | "house" | "combined")
        .eq("active", true)
        .limit(1);

      if (serviceError || !services || services.length === 0) {
        throw new Error("Service not available");
      }

      const service = services[0];

      // Create booking without sitter_id (will be assigned by admin later)
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          owner_id: user.id,
          service_id: service.id,
          sitter_id: "00000000-0000-0000-0000-000000000000", // Placeholder UUID, will be updated by admin
          start_date: formData.startDate,
          end_date: formData.endDate,
          pet_details: formData.serviceType === "pet" || formData.serviceType === "combined" ? { details: formData.petDetails } : null,
          house_details: formData.serviceType === "house" || formData.serviceType === "combined" ? { details: formData.houseDetails } : null,
          notes: `Location: ${formData.location}\nPhone: ${formData.contactPhone}\nPreferred Time: ${formData.preferredTime}\nSpecial Instructions: ${formData.specialInstructions}`,
          total_price: service.base_price,
          status: "pending"
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      toast.success("Booking request submitted! We'll assign a sitter and contact you soon.");
      navigate("/dashboard");
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to submit booking request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Book Your Service Now
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Quick, secure, and reliable pet & house sitting services
          </p>
          
          {/* Trust Indicators */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Zap className="h-5 w-5 text-primary" />
              <span>Fast Booking</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-5 w-5 text-primary" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-5 w-5 text-primary" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <Card className="mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Service Details
            </CardTitle>
            <CardDescription>
              Tell us what you need and we'll match you with the perfect sitter
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Service Type */}
            <div className="space-y-2">
              <Label htmlFor="serviceType">Service Type *</Label>
              <Select onValueChange={(value) => handleInputChange("serviceType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pet">Pet Sitting</SelectItem>
                  <SelectItem value="house">House Sitting</SelectItem>
                  <SelectItem value="combined">Pet & House Sitting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="Enter your location (city, neighborhood)"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
              />
            </div>

            {/* Contact Phone */}
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                placeholder="Your phone number"
                value={formData.contactPhone}
                onChange={(e) => handleInputChange("contactPhone", e.target.value)}
              />
            </div>

            {/* Preferred Time */}
            <div className="space-y-2">
              <Label htmlFor="preferredTime">Preferred Contact Time</Label>
              <Select onValueChange={(value) => handleInputChange("preferredTime", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="When can we contact you?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (9AM - 12PM)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                  <SelectItem value="evening">Evening (5PM - 8PM)</SelectItem>
                  <SelectItem value="anytime">Anytime</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pet Details */}
            {formData.serviceType === "pet" || formData.serviceType === "combined" ? (
              <div className="space-y-2">
                <Label htmlFor="petDetails">Pet Details</Label>
                <Textarea
                  id="petDetails"
                  placeholder="Tell us about your pets (breed, age, special needs, etc.)"
                  value={formData.petDetails}
                  onChange={(e) => handleInputChange("petDetails", e.target.value)}
                />
              </div>
            ) : null}

            {/* House Details */}
            {formData.serviceType === "house" || formData.serviceType === "combined" ? (
              <div className="space-y-2">
                <Label htmlFor="houseDetails">House Details</Label>
                <Textarea
                  id="houseDetails"
                  placeholder="Tell us about your home (size, security, plants, etc.)"
                  value={formData.houseDetails}
                  onChange={(e) => handleInputChange("houseDetails", e.target.value)}
                />
              </div>
            ) : null}

            {/* Special Instructions */}
            <div className="space-y-2">
              <Label htmlFor="specialInstructions">Special Instructions</Label>
              <Textarea
                id="specialInstructions"
                placeholder="Any specific requirements or instructions for the sitter"
                value={formData.specialInstructions}
                onChange={(e) => handleInputChange("specialInstructions", e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <div className="flex flex-col gap-4 pt-4">
              <Button 
                onClick={handleQuickBook} 
                disabled={isLoading}
                size="lg"
                className="w-full"
              >
                {isLoading ? "Submitting..." : "Submit Booking Request"}
              </Button>
              
              <p className="text-sm text-muted-foreground text-center">
                We'll review your request and assign a verified sitter within 24 hours.
                Payment is only charged after you approve the assigned sitter.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};