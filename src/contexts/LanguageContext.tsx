import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'pt' | 'es' | 'de' | 'zh' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Header
    'header.dashboard': 'Dashboard',
    'header.knowOurSitters': 'Know Our Sitters',
    'header.bookNow': 'Book Now',
    'header.admin': 'Admin',
    'header.signOut': 'Sign Out',
    'header.login': 'Login',
    'header.signUpAsSitter': 'Sign Up as Sitter',
    
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
  const [language, setLanguage] = useState<Language>('en');

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
