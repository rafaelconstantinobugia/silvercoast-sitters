import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, Shield, Clock, Star, ArrowRight, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

export const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFindSitter = () => {
    if (user) {
      navigate('/search');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Your trusted sitter in{" "}
                  <span className="text-gradient">3 minutes</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Connect with verified pet and house sitters in Portugal's Silver Coast. 
                  Safe, transparent, and reliable care for your beloved pets and home.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-ocean-gradient text-white hover:opacity-90 text-lg px-8 py-4"
                  onClick={handleFindSitter}
                >
                  Find a Sitter
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                {!user && (
                  <Button variant="outline" size="lg" asChild className="text-lg px-8 py-4">
                    <Link to="/auth?mode=signup">Become a Sitter</Link>
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Verified sitters</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Secure payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>24/7 support</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Happy pet with sitter on Portugal's Silver Coast" 
                className="w-full h-auto rounded-2xl shadow-large hero-float"
              />
              <div className="absolute -bottom-6 -left-6 bg-card rounded-xl p-4 shadow-medium border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">4.9/5 Rating</p>
                    <p className="text-sm text-muted-foreground">From 500+ families</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 lg:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">How it works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Book trusted pet and house sitters in just a few simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center card-hover">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">1. Find a Sitter</h3>
                <p className="text-muted-foreground">
                  Browse verified sitters in your area. View profiles, reviews, and availability.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center card-hover">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">2. Book</h3>
                <p className="text-muted-foreground">
                  Send a booking request with your dates and requirements. Pay securely online.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center card-hover">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">3. Relax</h3>
                <p className="text-muted-foreground">
                  Your pets and home are in safe hands. Get updates and enjoy your time away.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="bg-sand-gradient rounded-2xl p-8 lg:p-12 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to find your perfect sitter?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join hundreds of pet owners in the Silver Coast who trust us with their beloved companions.
            </p>
            <Button 
              size="lg" 
              className="bg-ocean-gradient text-white hover:opacity-90 text-lg px-8 py-4"
              onClick={handleFindSitter}
            >
              Get Started Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">SilverCoastSitters</span>
              </div>
              <p className="text-primary-foreground/80">
                Trusted pet and house sitting services in Portugal's Silver Coast region.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>Pet Sitting</li>
                <li>House Sitting</li>
                <li>Dog Walking</li>
                <li>Emergency Care</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Locations</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>Óbidos</li>
                <li>Caldas da Rainha</li>
                <li>Bombarral</li>
                <li>Peniche</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Safety</li>
                <li>Terms & Conditions</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-primary-foreground/80">
            <p>&copy; 2024 SilverCoastSitters. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};