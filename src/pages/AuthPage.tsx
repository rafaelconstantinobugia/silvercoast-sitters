import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Heart } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error(t('auth.enterEmailError'));
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success(t('auth.resetEmailSent'));
        setIsForgotPassword(false);
      }
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isForgotPassword) {
        await handleForgotPassword(e);
        return;
      }

      if (isSignUp) {
        if (!name.trim()) {
          toast.error(t('auth.enterNameError'));
          return;
        }
        const { error } = await signUp(email, password, name);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error(t('auth.emailAlreadyRegistered'));
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success(t('auth.accountCreated'));
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login")) {
            toast.error(t('auth.invalidCredentials'));
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success(t('auth.welcomeBack'));
          navigate('/dashboard');
        }
      }
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-ocean-gradient rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">SilverCoastSitters</span>
          </Link>
        </div>

        <Card className="shadow-large border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isForgotPassword ? t('auth.resetPassword') : 
               isSignUp ? t('auth.createAccount') : t('auth.welcomeBack')}
            </CardTitle>
            <CardDescription>
              {isForgotPassword ? t('auth.enterEmailReset') :
               isSignUp ? t('auth.joinCommunity') : t('auth.signInToAccount')}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && !isForgotPassword && (
                <div className="space-y-2">
                  <Label htmlFor="name">{t('auth.fullName')}</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Silva"
                    required={isSignUp}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                />
              </div>
              
              {!isForgotPassword && (
                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isSignUp ? t('auth.createStrongPassword') : t('auth.enterPassword')}
                    required
                    minLength={6}
                  />
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-ocean-gradient text-white hover:opacity-90"
                disabled={loading}
              >
                {loading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : null}
                {isForgotPassword ? t('auth.sendResetEmail') :
                 isSignUp ? t('auth.createAccount') : t('auth.signIn')}
              </Button>
            </form>
            
            {!isForgotPassword && (
              <>
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-primary hover:underline text-sm"
                  >
                    {isSignUp ? t('auth.alreadyHaveAccount') : t('auth.dontHaveAccount')}
                  </button>
                </div>
                
                {!isSignUp && (
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-primary hover:underline text-sm"
                    >
                      {t('auth.forgotPassword')}
                    </button>
                  </div>
                )}
              </>
            )}
            
            {isForgotPassword && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="text-primary hover:underline text-sm"
                >
                  {t('auth.backToSignIn')}
                </button>
              </div>
            )}
            
            <div className="mt-4 text-center">
              <Link to="/" className="text-muted-foreground hover:text-primary text-sm">
                {t('auth.backToHome')}
              </Link>
            </div>
          </CardContent>
        </Card>

        {isSignUp && !isForgotPassword && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {t('auth.termsAgreement')}
          </div>
        )}
      </div>
    </div>
  );
};