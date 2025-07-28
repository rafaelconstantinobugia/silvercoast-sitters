import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

interface EditSitterDialogProps {
  sitter: Sitter;
  onUpdate: () => void;
}

export const EditSitterDialog = ({ sitter, onUpdate }: EditSitterDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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
    services_offered: sitter.services_offered || []
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services_offered: prev.services_offered.includes(service)
        ? prev.services_offered.filter(s => s !== service)
        : [...prev.services_offered, service]
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
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
          services_offered: formData.services_offered as ('pet' | 'house' | 'combined')[]
        })
        .eq('id', sitter.id);

      if (error) throw error;

      toast.success('Sitter updated successfully!');
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
          <div className="space-y-2">
            <Label>Services Offered</Label>
            <div className="grid grid-cols-2 gap-3">
              {['pet', 'house', 'combined'].map((service) => (
                <div key={service} className="flex items-center space-x-2">
                  <Checkbox
                    id={service}
                    checked={formData.services_offered.includes(service)}
                    onCheckedChange={() => handleServiceToggle(service)}
                  />
                  <Label htmlFor={service} className="capitalize">
                    {service === 'combined' ? 'Pet & House' : `${service} sitting`}
                  </Label>
                </div>
              ))}
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