import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'pt' | 'es' | 'de' | 'zh' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Auto-detect language from browser
const detectLanguage = (): Language => {
  // First try localStorage
  const stored = localStorage.getItem('lang') as Language;
  if (stored && ['en', 'pt', 'es', 'de', 'zh', 'fr'].includes(stored)) {
    return stored;
  }
  
  // Then browser language
  const browserLang = (navigator.language || 'pt').slice(0, 2) as Language;
  if (['en', 'pt', 'es', 'de', 'zh', 'fr'].includes(browserLang)) {
    return browserLang;
  }
  
  return 'pt'; // Default to Portuguese
};

const translations = {
  en: {
    header: {
      dashboard: 'Dashboard',
      myBookings: 'My Bookings',
      sitterDashboard: 'Sitter Dashboard',
      knowOurSitters: 'Know Our Sitters',
      bookNow: 'Book Now',
      admin: 'Admin',
      signOut: 'Sign Out',
      login: 'Login',
      signUpAsSitter: 'Sign Up as Sitter',
      enterRegister: 'Enter/Register',
      profile: 'Profile',
      findSitters: 'Find Sitters',
      becomeASitter: 'Become a Sitter',
      signIn: 'Sign In',
      signUp: 'Sign Up',
    },
    
    // Search
    'search.findPerfectSitter': 'Find Your Perfect Pet Sitter',
    'search.browseFavoritesFirst': 'Browse verified pet and house sitters. Your favorites appear first!',
    'search.browseSignInToSave': 'Browse verified pet and house sitters. Sign in to save favorites!',
    'search.signInToFavorite': 'Please sign in to favorite sitters',
    'search.removedFromFavorites': 'Removed from favorites',
    'search.addedToFavorites': 'Added to favorites',
    'search.failedToUpdateFavorites': 'Failed to update favorites',
    'search.filteringComingSoon': 'Filtering functionality coming soon!',
    'search.filters': 'Filters',
    'search.advancedFilteringComingSoon': 'Advanced filtering coming soon! Currently showing all verified sitters.',
    'search.verifiedSittersFound': 'verified sitters found',
    'search.noSittersFound': 'No sitters found',
    'search.tryAdjustingFilters': 'Try adjusting your filters or check back later for more sitters.',
    'search.refreshResults': 'Refresh Results',
    
    // Landing
    'landing.trustedSitterIn': 'Your trusted sitter in',
    'landing.threeMinutes': '3 minutes',
    'landing.connectWithVerified': 'Connect with verified pet and house sitters in Portugal\'s Silver Coast. Safe, transparent, and reliable care for your beloved pets and home.',
    'landing.bookNow': 'Book Now',
    'landing.knowOurSitters': 'Know Our Sitters',
    'landing.becomeASitter': 'Become a Sitter',
    'landing.verifiedSitters': 'Verified sitters',
    'landing.securePayments': 'Secure payments',
    'landing.support247': '24/7 support',
    
    // Auth Page
    'auth.createAccount': 'Create Account',
    'auth.welcomeBack': 'Welcome Back',
    'auth.joinCommunity': 'Join our community of trusted sitters',
    'auth.signInToAccount': 'Sign in to your account',
    'auth.fullName': 'Full Name',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.createStrongPassword': 'Create a strong password',
    'auth.enterPassword': 'Enter your password',
    'auth.signIn': 'Sign In',
    'auth.alreadyHaveAccount': 'Already have an account? Sign in',
    'auth.dontHaveAccount': "Don't have an account? Sign up",
    'auth.forgotPassword': 'Forgot your password?',
    'auth.backToHome': '← Back to home',
    'auth.termsAgreement': 'By creating an account, you agree to our Terms of Service and Privacy Policy.',
    
    // Admin Dashboard
    'admin.dashboard': 'Admin Dashboard',
    'admin.manageSittersAndApplications': 'Manage sitters and applications',
    'admin.pendingApplications': 'Pending Applications',
    'admin.activeSitters': 'Active Sitters',
    'admin.totalApplications': 'Total Applications',
    'admin.allSitters': 'All Sitters',
    'admin.applications': 'Applications',
    'admin.manageSitters': 'Manage Sitters',
    'admin.manageBookings': 'Manage Bookings',
    'admin.sitterApplications': 'Sitter Applications',
    'admin.noApplicationsYet': 'No applications yet',
    'admin.approve': 'Approve',
    'admin.reject': 'Reject',
    'admin.addSitter': 'Add Sitter',
    'admin.noSittersRegistered': 'No sitters registered yet',
    'admin.verified': 'Verified',
    'admin.unverified': 'Unverified',
    'admin.active': 'Active',
    'admin.inactive': 'Inactive',
    'admin.activate': 'Activate',
    'admin.deactivate': 'Deactivate',
    'admin.edit': 'Edit',
    'admin.delete': 'Delete',
    'admin.deleteConfirmation': 'Are you sure you want to delete sitter "{name}"? This action cannot be undone.',
    'admin.deleteSuccess': 'Sitter "{name}" deleted successfully',
    'admin.deleteError': 'Error deleting sitter',
    
    // Common
    'common.price': 'Price',
    'common.phone': 'Phone',
    'common.emergency': 'Emergency',
    'common.insurance': 'Insurance',
    'common.applied': 'Applied',
    'common.experience': 'experience',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.day': 'day',
    'common.hour': 'hour',
    'common.pending': 'pending',
    'common.approved': 'approved',
    'common.rejected': 'rejected',
    'common.error': 'An error occurred',
    'common.locale': 'en-US',
    
    // Sitter Dashboard
    'sitter.dashboard': 'Sitter Dashboard',
    'sitter.manageBookings': 'Manage your bookings',
    'sitter.newRequests': 'New Requests',
    'sitter.upcoming': 'Upcoming',
    'sitter.completed': 'Completed',
    'sitter.pastBookings': 'Past Bookings',
    'sitter.noBookings': 'No bookings yet',
    'sitter.waitingForRequests': 'Waiting for booking requests',
    'sitter.editProfile': 'Edit Profile',
    'sitter.bookingAccepted': 'Booking accepted successfully',
    'sitter.bookingDeclined': 'Booking declined',
    'sitter.errorAcceptingBooking': 'Error accepting booking',
    'sitter.errorDecliningBooking': 'Error declining booking',
    'sitter.errorFetchingBookings': 'Error loading bookings',
    'sitter.notRegistered': 'You are not registered as a sitter',
  },
  pt: {
    // Header
    'header.dashboard': 'Painel',
    'header.knowOurSitters': 'Conhece os Nossos Sitters',
    'header.bookNow': 'Reservar Agora',
    'header.admin': 'Admin',
    'header.signOut': 'Sair',
    'header.login': 'Entrar',
    'header.signUpAsSitter': 'Registar como Sitter',
    'header.enterRegister': 'Entrar/Registar',
    'header.profile': 'Perfil',
    'header.myBookings': 'As Minhas Reservas',
    
    // Search
    'search.findPerfectSitter': 'Encontre o Seu Pet Sitter Perfeito',
    'search.browseFavoritesFirst': 'Explore sitters verificados de animais e casa. Os seus favoritos aparecem primeiro!',
    'search.browseSignInToSave': 'Explore sitters verificados de animais e casa. Entre para guardar favoritos!',
    'search.signInToFavorite': 'Por favor entre para favoritar sitters',
    'search.removedFromFavorites': 'Removido dos favoritos',
    'search.addedToFavorites': 'Adicionado aos favoritos',
    'search.failedToUpdateFavorites': 'Falha ao atualizar favoritos',
    'search.filteringComingSoon': 'Funcionalidade de filtros em breve!',
    'search.filters': 'Filtros',
    'search.advancedFilteringComingSoon': 'Filtros avançados em breve! Atualmente mostrando todos os sitters verificados.',
    'search.verifiedSittersFound': 'sitters verificados encontrados',
    'search.noSittersFound': 'Nenhum sitter encontrado',
    'search.tryAdjustingFilters': 'Tente ajustar os seus filtros ou volte mais tarde para mais sitters.',
    'search.refreshResults': 'Atualizar Resultados',
    
    // Landing
    'landing.trustedSitterIn': 'O seu sitter de confiança em',
    'landing.threeMinutes': '3 minutos',
    'landing.connectWithVerified': 'Conecte-se com sitters verificados de animais e casa na Costa de Prata de Portugal. Cuidado seguro, transparente e confiável para os seus animais e casa queridos.',
    'landing.bookNow': 'Reservar Agora',
    'landing.knowOurSitters': 'Conheça os Nossos Sitters',
    'landing.becomeASitter': 'Tornar-me Sitter',
    'landing.verifiedSitters': 'Sitters verificados',
    'landing.securePayments': 'Pagamentos seguros',
    'landing.support247': 'Suporte 24/7',
    
    // Auth Page  
    'auth.createAccount': 'Criar Conta',
    'auth.welcomeBack': 'Bem-vindo de Volta',
    'auth.joinCommunity': 'Junte-se à nossa comunidade de sitters de confiança',
    'auth.signInToAccount': 'Entre na sua conta',
    'auth.fullName': 'Nome Completo',
    'auth.email': 'Email',
    'auth.password': 'Palavra-passe',
    'auth.createStrongPassword': 'Crie uma palavra-passe forte',
    'auth.enterPassword': 'Digite a sua palavra-passe',
    'auth.signIn': 'Entrar',
    'auth.alreadyHaveAccount': 'Já tem conta? Entre',
    'auth.dontHaveAccount': 'Não tem conta? Registe-se',
    'auth.forgotPassword': 'Esqueceu-se da palavra-passe?',
    'auth.backToHome': '← Voltar ao início',
    'auth.termsAgreement': 'Ao criar uma conta, concorda com os nossos Termos de Serviço e Política de Privacidade.',
    
    // Admin Dashboard
    'admin.dashboard': 'Painel de Administração',
    'admin.manageSittersAndApplications': 'Gerir sitters e candidaturas',
    'admin.pendingApplications': 'Candidaturas Pendentes',
    'admin.activeSitters': 'Sitters Ativos',
    'admin.totalApplications': 'Total de Candidaturas',
    'admin.allSitters': 'Todos os Sitters',
    'admin.applications': 'Candidaturas',
    'admin.manageSitters': 'Gerir Sitters',
    'admin.manageBookings': 'Gerir Reservas',
    'admin.sitterApplications': 'Candidaturas de Sitter',
    'admin.noApplicationsYet': 'Ainda não há candidaturas',
    'admin.approve': 'Aprovar',
    'admin.reject': 'Rejeitar',
    'admin.addSitter': 'Adicionar Sitter',
    'admin.noSittersRegistered': 'Ainda não há sitters registados',
    'admin.verified': 'Verificado',
    'admin.unverified': 'Não Verificado',
    'admin.active': 'Ativo',
    'admin.inactive': 'Inativo',
    'admin.activate': 'Ativar',
    'admin.deactivate': 'Desativar',
    'admin.edit': 'Editar',
    'admin.delete': 'Apagar',
    'admin.deleteConfirmation': 'Tem a certeza que quer apagar o sitter "{name}"? Esta ação não pode ser desfeita.',
    'admin.deleteSuccess': 'Sitter "{name}" apagado com sucesso',
    'admin.deleteError': 'Erro ao apagar sitter',
    
    // Common
    'common.price': 'Preço',
    'common.phone': 'Telefone',
    'common.emergency': 'Emergência',
    'common.insurance': 'Seguro',
    'common.applied': 'Candidatou-se',
    'common.experience': 'experiência',
    'common.yes': 'Sim',
    'common.no': 'Não',
    'common.day': 'dia',
    'common.hour': 'hora',
    'common.pending': 'pendente',
    'common.approved': 'aprovado',
    'common.rejected': 'rejeitado',
    'common.error': 'Ocorreu um erro',
    'common.locale': 'pt-PT',
    
    // Sitter Dashboard
    'sitter.dashboard': 'Painel do Sitter',
    'sitter.manageBookings': 'Gerir as suas reservas',
    'sitter.newRequests': 'Novos Pedidos',
    'sitter.upcoming': 'Próximas',
    'sitter.completed': 'Concluídas',
    'sitter.pastBookings': 'Reservas Anteriores',
    'sitter.noBookings': 'Sem reservas',
    'sitter.waitingForRequests': 'À espera de pedidos',
    'sitter.editProfile': 'Editar Perfil',
    'sitter.bookingAccepted': 'Reserva aceite com sucesso',
    'sitter.bookingDeclined': 'Reserva recusada',
    'sitter.errorAcceptingBooking': 'Erro ao aceitar reserva',
    'sitter.errorDecliningBooking': 'Erro ao recusar reserva',
    'sitter.errorFetchingBookings': 'Erro ao carregar reservas',
    'sitter.notRegistered': 'Não está registado como sitter',
  },
  es: {
    // Header
    'header.dashboard': 'Panel',
    'header.knowOurSitters': 'Conoce Nuestros Cuidadores',
    'header.bookNow': 'Reservar Ahora',
    'header.admin': 'Admin',
    'header.signOut': 'Cerrar Sesión',
    'header.login': 'Iniciar Sesión',
    'header.signUpAsSitter': 'Registrarse como Cuidador',
    
    // Auth Page
    'auth.createAccount': 'Crear Cuenta',
    'auth.welcomeBack': 'Bienvenido de Vuelta',
    'auth.joinCommunity': 'Únete a nuestra comunidad de cuidadores de confianza',
    'auth.signInToAccount': 'Inicia sesión en tu cuenta',
    'auth.fullName': 'Nombre Completo',
    'auth.email': 'Email',
    'auth.password': 'Contraseña',
    'auth.createStrongPassword': 'Crea una contraseña fuerte',
    'auth.enterPassword': 'Ingresa tu contraseña',
    'auth.signIn': 'Iniciar Sesión',
    'auth.alreadyHaveAccount': '¿Ya tienes cuenta? Inicia sesión',
    'auth.dontHaveAccount': '¿No tienes cuenta? Regístrate',
    'auth.forgotPassword': '¿Olvidaste tu contraseña?',
    'auth.backToHome': '← Volver al inicio',
    'auth.termsAgreement': 'Al crear una cuenta, aceptas nuestros Términos de Servicio y Política de Privacidad.',
    
    // Other translations would continue here...
    'admin.dashboard': 'Panel de Administración',
    'admin.manageSittersAndApplications': 'Gestionar cuidadores y solicitudes',
    // ... (other Spanish translations)
  },
  de: {
    // German translations
    'header.dashboard': 'Dashboard',
    'header.knowOurSitters': 'Unsere Betreuer Kennenlernen',
    'header.bookNow': 'Jetzt Buchen',
    'auth.createAccount': 'Konto Erstellen',
    'auth.welcomeBack': 'Willkommen Zurück',
    // ... (other German translations)
  },
  zh: {
    // Chinese translations
    'header.dashboard': '仪表板',
    'header.knowOurSitters': '了解我们的看护员',
    'header.bookNow': '立即预订',
    'auth.createAccount': '创建账户',
    'auth.welcomeBack': '欢迎回来',
    // ... (other Chinese translations)
  },
  fr: {
    // French translations
    'header.dashboard': 'Tableau de Bord',
    'header.knowOurSitters': 'Connaître Nos Gardiens',
    'header.bookNow': 'Réserver Maintenant',
    'auth.createAccount': 'Créer un Compte',
    'auth.welcomeBack': 'Bon Retour',
    // ... (other French translations)
  },
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => detectLanguage());

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem('lang', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
