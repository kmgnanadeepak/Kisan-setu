import { useState, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SplashScreen } from "@/components/SplashScreen";
import { Layout } from "@/components/Layout";
import { useTheme } from "@/hooks/useTheme";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import DiseaseDetection from "./pages/farmer/DiseaseDetection";
import DiseaseResult from "./pages/farmer/DiseaseResult";
import Shop from "./pages/farmer/Shop";
import FarmerOrders from "./pages/farmer/FarmerOrders";
import FarmerProfile from "./pages/farmer/FarmerProfile";
import Marketplace from "./pages/farmer/Marketplace";
import NearbyShops from "./pages/farmer/NearbyShops";
import FarmerCalendar from "./pages/farmer/FarmerCalendar";
import FarmerCustomerOrders from "./pages/farmer/FarmerCustomerOrders";
import MerchantDashboard from "./pages/merchant/MerchantDashboard";
import MerchantStock from "./pages/merchant/MerchantStock";
import MerchantOrders from "./pages/merchant/MerchantOrders";
import MerchantProfile from "./pages/merchant/MerchantProfile";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CustomerMarketplace from "./pages/customer/CustomerMarketplace";
import CustomerCart from "./pages/customer/CustomerCart";
import CustomerCheckout from "./pages/customer/CustomerCheckout";
import CustomerOrders from "./pages/customer/CustomerOrders";
import CustomerWishlist from "./pages/customer/CustomerWishlist";
import CustomerProfile from "./pages/customer/CustomerProfile";
import FarmerProfileView from "./pages/customer/FarmerProfile";
import PriceComparison from "./pages/customer/PriceComparison";
import NotFound from "./pages/NotFound";

export const ThemeContext = {
  mode: "auto" as any,
  setMode: (() => {}) as any,
  resolvedTheme: "light" as any,
};

const queryClient = new QueryClient();

const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  const theme = useTheme();

  // Make theme accessible to child components via window
  (window as any).__theme = theme;

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Farmer Routes */}
          <Route path="/farmer" element={<Layout><FarmerDashboard /></Layout>} />
          <Route path="/farmer/disease-detection" element={<Layout><DiseaseDetection /></Layout>} />
          <Route path="/farmer/disease-result" element={<Layout><DiseaseResult /></Layout>} />
          <Route path="/farmer/shop" element={<Layout><Shop /></Layout>} />
          <Route path="/farmer/orders" element={<Layout><FarmerOrders /></Layout>} />
          <Route path="/farmer/profile" element={<Layout><FarmerProfile /></Layout>} />
          <Route path="/farmer/marketplace" element={<Layout><Marketplace /></Layout>} />
          <Route path="/farmer/nearby-shops" element={<Layout><NearbyShops /></Layout>} />
          <Route path="/farmer/calendar" element={<Layout><FarmerCalendar /></Layout>} />
          <Route path="/farmer/customer-orders" element={<Layout><FarmerCustomerOrders /></Layout>} />
          
          {/* Merchant Routes */}
          <Route path="/merchant" element={<Layout><MerchantDashboard /></Layout>} />
          <Route path="/merchant/stock" element={<Layout><MerchantStock /></Layout>} />
          <Route path="/merchant/orders" element={<Layout><MerchantOrders /></Layout>} />
          <Route path="/merchant/profile" element={<Layout><MerchantProfile /></Layout>} />
          
          {/* Customer Routes */}
          <Route path="/customer" element={<Layout><CustomerDashboard /></Layout>} />
          <Route path="/customer/marketplace" element={<Layout><CustomerMarketplace /></Layout>} />
          <Route path="/customer/cart" element={<Layout><CustomerCart /></Layout>} />
          <Route path="/customer/checkout" element={<Layout><CustomerCheckout /></Layout>} />
          <Route path="/customer/orders" element={<Layout><CustomerOrders /></Layout>} />
          <Route path="/customer/wishlist" element={<Layout><CustomerWishlist /></Layout>} />
          <Route path="/customer/profile" element={<Layout><CustomerProfile /></Layout>} />
          <Route path="/customer/farmer/:farmerId" element={<Layout><FarmerProfileView /></Layout>} />
          <Route path="/customer/compare" element={<Layout><PriceComparison /></Layout>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
