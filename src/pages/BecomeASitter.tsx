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
import { useLanguage } from "@/contexts/LanguageContext";
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
  const { t } = useLanguage();
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
      toast.error(t('becomeSitter.failedLoadServices'));
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

      toast.success(t('becomeSitter.applicationSubmitted'), {
        description: t('becomeSitter.reviewDescription')
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(t('becomeSitter.failedSubmit'));
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle>{t('becomeSitter.personalInfo')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">{t('becomeSitter.firstName')}</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="Maria"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">{t('becomeSitter.lastName')}</Label>
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
          <Label htmlFor="phone">{t('becomeSitter.phoneNumber')}</Label>
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
          <Label htmlFor="location">{t('becomeSitter.location')}</Label>
          <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
            <SelectTrigger>
              <SelectValue placeholder={t('becomeSitter.selectLocation')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="obidos">Óbidos</SelectItem>
              <SelectItem value="caldas">Caldas da Rainha</SelectItem>
              <SelectItem value="bombarral">Bombarral</SelectItem>
              <SelectItem value="peniche">Peniche</SelectItem>
              <SelectItem value="other">{t('becomeSitter.otherSilverCoast')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience">{t('becomeSitter.yearsExperience')}</Label>
          <Select value={formData.experience} onValueChange={(value) => handleInputChange('experience', value)}>
            <SelectTrigger>
              <SelectValue placeholder={t('becomeSitter.selectExperience')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-1">{t('becomeSitter.lessThan1Year')}</SelectItem>
              <SelectItem value="1-3">1-3 anos</SelectItem>
              <SelectItem value="3-5">3-5 anos</SelectItem>
              <SelectItem value="5+">5+ anos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle>{t('becomeSitter.servicesPricing')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>{t('becomeSitter.servicesYouOffer')}</Label>
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
          <Label htmlFor="pricePerDay">{t('becomeSitter.pricePerDay')}</Label>
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
            {t('becomeSitter.recommendedRange')}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">{t('becomeSitter.aboutYou')}</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder={t('becomeSitter.aboutYouPlaceholder')}
            rows={4}
          />
          <div className="text-sm text-muted-foreground">
            {t('becomeSitter.aboutYouDescription')}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle>{t('becomeSitter.finalDetails')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="emergencyContact">{t('becomeSitter.emergencyContact')}</Label>
          <Input
            id="emergencyContact"
            value={formData.emergencyContact}
            onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
            placeholder={t('becomeSitter.emergencyContactPlaceholder')}
          />
        </div>

        <div className="space-y-4">
          <Label>{t('becomeSitter.profilePhoto')}</Label>
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
            <Label htmlFor="insurance">{t('becomeSitter.hasInsurance')}</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={formData.agreedToTerms}
              onCheckedChange={(checked) => handleInputChange('agreedToTerms', checked as boolean)}
            />
            <Label htmlFor="terms" className="text-sm">
              {t('becomeSitter.agreeTerms')}
            </Label>
          </div>
        </div>

        <div className="bg-secondary/50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">{t('becomeSitter.whatHappensNext')}</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• {t('becomeSitter.reviewWithin24h')}</li>
            <li>• {t('becomeSitter.backgroundCheck')}</li>
            <li>• {t('becomeSitter.videoInterview')}</li>
            <li>• {t('becomeSitter.profileApproval')}</li>
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
            {t('becomeSitter.back')}
          </Button>
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">{t('becomeSitter.title')}</h1>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">{t('becomeSitter.stepOf').replace('{step}', String(step)).replace('{total}', '3')}</span>
            <span className="text-sm text-muted-foreground">{t('becomeSitter.complete').replace('{percent}', String(Math.round((step / 3) * 100)))}</span>
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
            {step === 1 ? t('becomeSitter.cancel') : t('becomeSitter.previous')}
          </Button>
          <Button 
            onClick={handleNext}
            className="bg-ocean-gradient text-white hover:opacity-90"
            disabled={loading || (step === 3 && !formData.agreedToTerms)}
          >
            {loading ? t('becomeSitter.submitting') : step === 3 ? t('becomeSitter.submitApplication') : t('becomeSitter.next')}
          </Button>
        </div>
      </div>
    </div>
  );
};