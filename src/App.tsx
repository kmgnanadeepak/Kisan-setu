import { useState, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SplashScreen } from "@/components/SplashScreen";
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
          <Route path="/farmer" element={<FarmerDashboard />} />
          <Route path="/farmer/disease-detection" element={<DiseaseDetection />} />
          <Route path="/farmer/disease-result" element={<DiseaseResult />} />
          <Route path="/farmer/shop" element={<Shop />} />
          <Route path="/farmer/orders" element={<FarmerOrders />} />
          <Route path="/farmer/profile" element={<FarmerProfile />} />
          <Route path="/farmer/marketplace" element={<Marketplace />} />
          <Route path="/farmer/nearby-shops" element={<NearbyShops />} />
          <Route path="/farmer/calendar" element={<FarmerCalendar />} />
          <Route path="/farmer/customer-orders" element={<FarmerCustomerOrders />} />
          
          {/* Merchant Routes */}
          <Route path="/merchant" element={<MerchantDashboard />} />
          <Route path="/merchant/stock" element={<MerchantStock />} />
          <Route path="/merchant/orders" element={<MerchantOrders />} />
          <Route path="/merchant/profile" element={<MerchantProfile />} />
          
          {/* Customer Routes */}
          <Route path="/customer" element={<CustomerDashboard />} />
          <Route path="/customer/marketplace" element={<CustomerMarketplace />} />
          <Route path="/customer/cart" element={<CustomerCart />} />
          <Route path="/customer/checkout" element={<CustomerCheckout />} />
          <Route path="/customer/orders" element={<CustomerOrders />} />
          <Route path="/customer/wishlist" element={<CustomerWishlist />} />
          <Route path="/customer/profile" element={<CustomerProfile />} />
          <Route path="/customer/farmer/:farmerId" element={<FarmerProfileView />} />
          <Route path="/customer/compare" element={<PriceComparison />} />
          
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
