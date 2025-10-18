import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import { AuthPage } from "./pages/AuthPage";
import { Dashboard } from "./pages/Dashboard";
import { SitterDashboard } from "./pages/SitterDashboard";
import { SearchSitters } from "./pages/SearchSitters";
import { SitterProfile } from "./pages/SitterProfile";
import { BecomeASitter } from "./pages/BecomeASitter";
import { BecomeASitterPublic } from "./pages/BecomeASitterPublic";
import { BookNow } from "./pages/BookNow";
import { BookingCheckout } from "./pages/BookingCheckout";
import { BookingSuccess } from "./pages/BookingSuccess";
import { AdminDashboard } from "./pages/AdminDashboard";
import { LocationPage } from "./pages/LocationPage";
import NotFound from "./pages/NotFound";
import { AdminPayments } from "./pages/AdminPayments";
import { OwnerInvoices } from "./pages/OwnerInvoices";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sitter-dashboard" element={<SitterDashboard />} />
            <Route path="/search" element={<SearchSitters />} />
            <Route path="/book-now" element={<BookNow />} />
            <Route path="/sitter/:id" element={<SitterProfile />} />
            <Route path="/become-sitter" element={<BecomeASitterPublic />} />
            <Route path="/become-sitter-auth" element={<BecomeASitter />} />
            <Route path="/booking/:sitterId" element={<BookingCheckout />} />
            <Route path="/booking-success" element={<BookingSuccess />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin-payments" element={<AdminPayments />} />
            <Route path="/my-invoices" element={<OwnerInvoices />} />
            <Route path="/location/:location" element={<LocationPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
