import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "@/components/ui/image-upload";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Heart, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Service {
  id: string;
  name: string;
  service_type: string;
}

export const BecomeASitter = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
    experience: '',
    description: '',
    services: [] as string[],
    pricePerDay: '',
    emergencyContact: '',
    hasInsurance: false,
    agreedToTerms: false,
    photoUrl: null as string | null
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('services')
        .select('id, name, service_type')
        .eq('active', true)
        .order('service_type', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/');
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('applicants').insert({
        user_id: user.id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: user.email, // Use logged-in user's email
        phone: formData.phone,
        location: formData.location,
        experience_years: formData.experience,
        description: formData.description,
        services_offered: formData.services,
        price_per_day: parseFloat(formData.pricePerDay) || 0,
        emergency_contact: formData.emergencyContact,
        has_insurance: formData.hasInsurance,
        status: 'pending'
      });

      if (error) throw error;

      toast.success('Application submitted successfully!', {
        description: 'We\'ll review your profile and get back to you within 24 hours.'
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="Maria"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Santos"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+351 123 456 789"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="obidos">Óbidos</SelectItem>
              <SelectItem value="caldas">Caldas da Rainha</SelectItem>
              <SelectItem value="bombarral">Bombarral</SelectItem>
              <SelectItem value="peniche">Peniche</SelectItem>
              <SelectItem value="other">Other (Silver Coast)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience">Years of Experience</Label>
          <Select value={formData.experience} onValueChange={(value) => handleInputChange('experience', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select experience level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-1">Less than 1 year</SelectItem>
              <SelectItem value="1-3">1-3 years</SelectItem>
              <SelectItem value="3-5">3-5 years</SelectItem>
              <SelectItem value="5+">5+ years</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Services & Pricing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>Services You Offer</Label>
          <div className="grid sm:grid-cols-2 gap-3">
            {services.map((service) => (
              <div key={service.id} className="flex items-center space-x-2">
                <Checkbox
                  id={service.id}
                  checked={formData.services.includes(service.id)}
                  onCheckedChange={() => handleServiceToggle(service.id)}
                />
                <Label htmlFor={service.id} className="text-sm">
                  {service.name}
                  <span className="text-xs text-muted-foreground ml-1">
                    ({service.service_type})
                  </span>
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pricePerDay">Price Per Day (€)</Label>
          <Input
            id="pricePerDay"
            type="number"
            value={formData.pricePerDay}
            onChange={(e) => handleInputChange('pricePerDay', e.target.value)}
            placeholder="35"
            min="15"
            max="100"
          />
          <p className="text-sm text-muted-foreground">
            Recommended range: €25-€50 per day
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">About You</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Tell potential clients about your experience, what makes you special, and why they should trust you with their pets..."
            rows={4}
          />
          <div className="text-sm text-muted-foreground">
            Describe your experience, personality, and what makes you the perfect pet sitter.
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Final Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="emergencyContact">Emergency Contact</Label>
          <Input
            id="emergencyContact"
            value={formData.emergencyContact}
            onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
            placeholder="Name and phone number"
          />
        </div>

        <div className="space-y-4">
          <Label>Profile Photo</Label>
          <ImageUpload
            value={formData.photoUrl}
            onChange={(url) => handleInputChange('photoUrl', url)}
            bucket="sitter-photos"
            path="applicants"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="insurance"
              checked={formData.hasInsurance}
              onCheckedChange={(checked) => handleInputChange('hasInsurance', checked as boolean)}
            />
            <Label htmlFor="insurance">I have liability insurance</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={formData.agreedToTerms}
              onCheckedChange={(checked) => handleInputChange('agreedToTerms', checked as boolean)}
            />
            <Label htmlFor="terms" className="text-sm">
              I agree to the Terms of Service and Privacy Policy
            </Label>
          </div>
        </div>

        <div className="bg-secondary/50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">What happens next?</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• We'll review your application within 24 hours</li>
            <li>• Background check and reference verification</li>
            <li>• Video interview with our team</li>
            <li>• Profile approval and activation</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Become a Sitter</h1>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Step {step} of 3</span>
            <span className="text-sm text-muted-foreground">{Math.round((step / 3) * 100)}% complete</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-ocean-gradient h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Steps */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={handleBack}>
            {step === 1 ? 'Cancel' : 'Previous'}
          </Button>
          <Button 
            onClick={handleNext}
            className="bg-ocean-gradient text-white hover:opacity-90"
            disabled={loading || (step === 3 && !formData.agreedToTerms)}
          >
            {loading ? 'Submitting...' : step === 3 ? 'Submit Application' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
};