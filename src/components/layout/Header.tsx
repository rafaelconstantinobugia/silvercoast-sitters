import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Heart, Menu, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export const Header = () => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-ocean-gradient rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gradient">SilverCoastSitters</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/search" className="text-foreground hover:text-primary transition-colors">
            {t('header.knowOurSitters')}
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">
                {t('header.dashboard')}
              </Link>
              <Link to="/book-now" className="text-foreground hover:text-primary transition-colors">
                {t('header.bookNow')}
              </Link>
              {user.email === 'r3al4f@gmail.com' && (
                <Link to="/admin" className="text-foreground hover:text-primary transition-colors">
                  {t('header.admin')}
                </Link>
              )}
              <LanguageSwitcher />
              <div className="relative">
                <Button variant="ghost" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                  <User className="w-4 h-4 mr-2" />
                  {t('header.profile')}
                </Button>
                {isMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                    <div className="py-2">
                  <Link 
                    to="/dashboard" 
                    className="block px-4 py-2 text-sm hover:bg-secondary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('header.myBookings')}
                  </Link>
                  <Link 
                    to="/sitter-dashboard" 
                    className="block px-4 py-2 text-sm hover:bg-secondary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('header.sitterDashboard')}
                  </Link>
                  <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors"
                      >
                        {t('header.signOut')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <LanguageSwitcher />
              <Button asChild variant="outline">
                <Link to="/auth">{t('header.enterRegister')}</Link>
              </Button>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-card border-b border-border md:hidden">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Link 
                to="/search" 
                className="text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('header.knowOurSitters')}
              </Link>
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('header.dashboard')}
                  </Link>
                  <Link 
                    to="/book-now" 
                    className="text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('header.bookNow')}
                  </Link>
                  {user.email === 'r3al4f@gmail.com' && (
                    <Link 
                      to="/admin" 
                      className="text-foreground hover:text-primary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('header.admin')}
                    </Link>
                  )}
                  <div className="pt-2">
                    <LanguageSwitcher />
                  </div>
                  <Button variant="outline" onClick={handleSignOut}>
                    {t('header.signOut')}
                  </Button>
                </>
              ) : (
                <>
                  <div className="pt-2">
                    <LanguageSwitcher />
                  </div>
                  <Button asChild variant="outline">
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      {t('header.enterRegister')}
                    </Link>
                  </Button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};