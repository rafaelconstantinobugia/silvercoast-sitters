import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Calendar, CreditCard, Shield, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export const BookingCheckout = () => {
  const { sitterId } = useParams<{ sitterId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Booking Details, 2: Payment, 3: Confirmation

  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    serviceType: '',
    petDetails: {
      petName: '',
      petType: '',
      petAge: '',
      specialNeeds: ''
    },
    houseDetails: {
      houseType: '',
      address: '',
      keyLocation: '',
      specialInstructions: ''
    },
    emergencyContact: '',
    notes: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Mock sitter data
  const mockSitter = {
    id: sitterId || '1',
    name: 'Maria Santos',
    location: 'Óbidos',
    pricePerDay: 35,
    rating: 4.9,
    photo: undefined
  };

  const calculateTotalPrice = () => {
    if (!bookingData.startDate || !bookingData.endDate) return 0;
    
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    return days * mockSitter.pricePerDay;
  };

  const handleInputChange = (field: string, value: string) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const handlePetDetailsChange = (field: string, value: string) => {
    setBookingData(prev => ({
      ...prev,
      petDetails: { ...prev.petDetails, [field]: value }
    }));
  };

  const handleHouseDetailsChange = (field: string, value: string) => {
    setBookingData(prev => ({
      ...prev,
      houseDetails: { ...prev.houseDetails, [field]: value }
    }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!bookingData.startDate || !bookingData.endDate || !bookingData.serviceType) {
        toast.error('Please fill in all required fields');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      handlePayment();
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      // TODO: Implement Stripe integration
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate payment
      setStep(3);
      toast.success('Booking request sent successfully!');
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderBookingDetails = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={bookingData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={bookingData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Service Type</Label>
            <Select value={bookingData.serviceType} onValueChange={(value) => handleInputChange('serviceType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pet_sitting">Pet Sitting Only</SelectItem>
                <SelectItem value="house_sitting">House Sitting Only</SelectItem>
                <SelectItem value="both">Pet & House Sitting</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {(bookingData.serviceType === 'pet_sitting' || bookingData.serviceType === 'both') && (
        <Card>
          <CardHeader>
            <CardTitle>Pet Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="petName">Pet Name</Label>
                <Input
                  id="petName"
                  value={bookingData.petDetails.petName}
                  onChange={(e) => handlePetDetailsChange('petName', e.target.value)}
                  placeholder="Luna"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="petType">Pet Type</Label>
                <Select value={bookingData.petDetails.petType} onValueChange={(value) => handlePetDetailsChange('petType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pet type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dog">Dog</SelectItem>
                    <SelectItem value="cat">Cat</SelectItem>
                    <SelectItem value="bird">Bird</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="petAge">Pet Age</Label>
              <Input
                id="petAge"
                value={bookingData.petDetails.petAge}
                onChange={(e) => handlePetDetailsChange('petAge', e.target.value)}
                placeholder="3 years old"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialNeeds">Special Needs/Instructions</Label>
              <Textarea
                id="specialNeeds"
                value={bookingData.petDetails.specialNeeds}
                onChange={(e) => handlePetDetailsChange('specialNeeds', e.target.value)}
                placeholder="Any special care instructions, medical needs, feeding schedule..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {(bookingData.serviceType === 'house_sitting' || bookingData.serviceType === 'both') && (
        <Card>
          <CardHeader>
            <CardTitle>House Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={bookingData.houseDetails.address}
                onChange={(e) => handleHouseDetailsChange('address', e.target.value)}
                placeholder="Street address, Óbidos"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keyLocation">Key Location</Label>
              <Input
                id="keyLocation"
                value={bookingData.houseDetails.keyLocation}
                onChange={(e) => handleHouseDetailsChange('keyLocation', e.target.value)}
                placeholder="Where to find keys, lockbox code, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialInstructions">House Instructions</Label>
              <Textarea
                id="specialInstructions"
                value={bookingData.houseDetails.specialInstructions}
                onChange={(e) => handleHouseDetailsChange('specialInstructions', e.target.value)}
                placeholder="Plant watering, mail collection, security systems..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emergencyContact">Emergency Contact</Label>
            <Input
              id="emergencyContact"
              value={bookingData.emergencyContact}
              onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
              placeholder="Name and phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={bookingData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Anything else the sitter should know..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPayment = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span>Sitter:</span>
            <span className="font-medium">{mockSitter.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Dates:</span>
            <span className="font-medium">
              {new Date(bookingData.startDate).toLocaleDateString()} - {new Date(bookingData.endDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Service:</span>
            <span className="font-medium">{bookingData.serviceType?.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold border-t pt-4">
            <span>Total:</span>
            <span>€{calculateTotalPrice()}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-secondary/50 p-4 rounded-lg text-center">
            <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="font-medium mb-2">Secure Payment via Stripe</p>
            <p className="text-sm text-muted-foreground">
              Your payment is secured and protected. You'll be redirected to Stripe to complete the payment.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderConfirmation = () => (
    <Card>
      <CardContent className="p-8 text-center">
        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Booking Request Sent!</h2>
        <p className="text-muted-foreground mb-6">
          Your booking request has been sent to {mockSitter.name}. 
          You'll receive a notification when they accept or decline your request.
        </p>
        <div className="space-y-3">
          <Button 
            onClick={() => navigate('/dashboard')}
            className="bg-ocean-gradient text-white hover:opacity-90"
          >
            View My Bookings
          </Button>
          <Button variant="outline" onClick={() => navigate('/search')}>
            Find More Sitters
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (!user) {
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
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">
            {step === 1 ? 'Booking Details' : step === 2 ? 'Payment' : 'Confirmation'}
          </h1>
        </div>

        {/* Progress */}
        {step < 3 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Step {step} of 2</span>
              <span className="text-sm text-muted-foreground">{Math.round((step / 2) * 100)}% complete</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-ocean-gradient h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 2) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        {step === 1 && renderBookingDetails()}
        {step === 2 && renderPayment()}
        {step === 3 && renderConfirmation()}

        {/* Navigation */}
        {step < 3 && (
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button 
              onClick={handleNext}
              className="bg-ocean-gradient text-white hover:opacity-90"
              disabled={loading}
            >
              {loading ? 'Processing...' : step === 1 ? 'Continue to Payment' : 'Pay Now'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};