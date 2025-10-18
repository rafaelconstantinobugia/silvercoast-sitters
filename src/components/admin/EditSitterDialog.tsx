import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ui/image-upload";
import { supabase } from "@/integrations/supabase/client";
import { Edit } from "lucide-react";
import { toast } from "sonner";

interface Sitter {
  id: string;
  name: string;
  location: string;
  phone: string;
  email: string;
  description: string;
  services_offered: string[];
  average_rating: number;
  verified: boolean;
  available: boolean;
  experience_years: number;
  price_per_day: number;
  photo_url?: string;
  response_time: string;
}

interface Service {
  id: string;
  name: string;
  service_type: string;
  base_price: number;
  description: string;
}

interface SitterService {
  service_id: string;
  custom_price: number;
  available: boolean;
}

interface EditSitterDialogProps {
  sitter: Sitter;
  onUpdate: () => void;
}

export const EditSitterDialog = ({ sitter, onUpdate }: EditSitterDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [sitterServices, setSitterServices] = useState<SitterService[]>([]);
  const [formData, setFormData] = useState({
    name: sitter.name,
    location: sitter.location,
    phone: sitter.phone,
    email: sitter.email,
    description: sitter.description,
    price_per_day: sitter.price_per_day.toString(),
    experience_years: sitter.experience_years.toString(),
    response_time: sitter.response_time,
    verified: sitter.verified,
    available: sitter.available,
    services_offered: sitter.services_offered || [],
    photo_url: sitter.photo_url || null
  });

  useEffect(() => {
    if (open) {
      fetchServicesAndPricing();
    }
  }, [open]);

  const fetchServicesAndPricing = async () => {
    try {
      // Fetch all available services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('active', true)
        .order('name');

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Fetch sitter's current service pricing
      const { data: sitterServicesData, error: sitterServicesError } = await supabase
        .from('sitter_services')
        .select('service_id, custom_price')
        .eq('sitter_id', sitter.id);

      if (sitterServicesError) throw sitterServicesError;
      // @ts-ignore - Schema mismatch
      setSitterServices(sitterServicesData || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services data');
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceToggle = (serviceId: string, isEnabled: boolean) => {
    if (isEnabled) {
      const service = services.find(s => s.id === serviceId);
      if (service) {
        setSitterServices(prev => [
          ...prev.filter(ss => ss.service_id !== serviceId),
          { service_id: serviceId, custom_price: service.base_price, available: true }
        ]);
      }
    } else {
      setSitterServices(prev => prev.filter(ss => ss.service_id !== serviceId));
    }
  };

  const handleServicePriceChange = (serviceId: string, price: number) => {
    setSitterServices(prev => 
      prev.map(ss => 
        ss.service_id === serviceId 
          ? { ...ss, custom_price: price }
          : ss
      )
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Update sitter basic info
      const { error: sitterError } = await supabase
        .from('sitters')
        .update({
          name: formData.name,
          location: formData.location,
          phone: formData.phone,
          email: formData.email,
          description: formData.description,
          price_per_day: parseFloat(formData.price_per_day),
          experience_years: parseInt(formData.experience_years),
          response_time: formData.response_time,
          verified: formData.verified,
          available: formData.available,
          photo_url: formData.photo_url,
          services_offered: sitterServices.map(ss => {
            const service = services.find(s => s.id === ss.service_id);
            return service?.service_type || '';
          }).filter(Boolean) as ('pet' | 'house' | 'combined')[]
        })
        .eq('id', sitter.id);

      if (sitterError) throw sitterError;

      // Delete existing sitter services
      const { error: deleteError } = await supabase
        .from('sitter_services')
        .delete()
        .eq('sitter_id', sitter.id);

      if (deleteError) throw deleteError;

      // Insert new sitter services
      if (sitterServices.length > 0) {
        const { error: insertError } = await supabase
          .from('sitter_services')
          .insert(
            sitterServices.map(ss => ({
              sitter_id: sitter.id,
              service_id: ss.service_id,
              custom_price: ss.custom_price,
              available: ss.available
            }))
          );

        if (insertError) throw insertError;
      }

      toast.success('Sitter updated successfully!');
      console.log('Calling onUpdate to refresh sitters list...');
      setOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating sitter:', error);
      toast.error('Failed to update sitter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Sitter: {sitter.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Profile Photo</Label>
            <ImageUpload
              value={formData.photo_url}
              onChange={(url) => handleInputChange('photo_url', url || '')}
              bucket="sitter-photos"
              path={sitter.id}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* Pricing and Experience */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price per Day (€)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price_per_day}
                onChange={(e) => handleInputChange('price_per_day', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Experience (years)</Label>
              <Input
                id="experience"
                type="number"
                value={formData.experience_years}
                onChange={(e) => handleInputChange('experience_years', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="response">Response Time</Label>
              <Select value={formData.response_time} onValueChange={(value) => handleInputChange('response_time', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30 minutes">30 minutes</SelectItem>
                  <SelectItem value="1 hour">1 hour</SelectItem>
                  <SelectItem value="2 hours">2 hours</SelectItem>
                  <SelectItem value="3 hours">3 hours</SelectItem>
                  <SelectItem value="1 day">1 day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Services & Pricing</Label>
            <div className="space-y-3">
              {services.map((service) => {
                const sitterService = sitterServices.find(ss => ss.service_id === service.id);
                const isSelected = !!sitterService;
                
                return (
                  <div key={service.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={service.id}
                          checked={isSelected}
                          onCheckedChange={(checked) => handleServiceToggle(service.id, checked as boolean)}
                        />
                        <div>
                          <Label htmlFor={service.id} className="font-medium">
                            {service.name}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {service.description}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        Base: €{service.base_price}
                      </Badge>
                    </div>
                    
                    {isSelected && (
                      <div className="flex items-center gap-2 pl-6">
                        <Label htmlFor={`price-${service.id}`} className="text-sm">
                          Your Price:
                        </Label>
                        <Input
                          id={`price-${service.id}`}
                          type="number"
                          step="0.01"
                          min="0"
                          value={sitterService?.custom_price || service.base_price}
                          onChange={(e) => handleServicePriceChange(service.id, parseFloat(e.target.value) || 0)}
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">€</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={formData.verified}
                onCheckedChange={(checked) => handleInputChange('verified', checked as boolean)}
              />
              <Label htmlFor="verified">Verified Sitter</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="available"
                checked={formData.available}
                onCheckedChange={(checked) => handleInputChange('available', checked as boolean)}
              />
              <Label htmlFor="available">Available for Bookings</Label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={loading}
              className="bg-ocean-gradient text-white hover:opacity-90"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};