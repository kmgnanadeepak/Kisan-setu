import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Sprout, 
  Cloud, 
  Droplets, 
  ThermometerSun, 
  Wind, 
  Scan, 
  ShoppingCart, 
  ClipboardList, 
  User, 
  LogOut, 
  Store,
  Loader2,
  CalendarDays,
  MapPin,
  Users
} from "lucide-react";
import { toast } from "sonner";
import { useWeather } from "@/hooks/useWeather";
import { NotificationBell } from "@/components/NotificationBell";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useTheme } from "@/hooks/useTheme";

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ full_name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const { weather, loading: weatherLoading } = useWeather();
  const theme = useTheme();

  useEffect(() => {
    const checkAuthAndFetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/"); return; }
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", session.user.id)
        .maybeSingle();
      setProfile(profileData);
      setLoading(false);
    };
    checkAuthAndFetchProfile();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) navigate("/");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const quickActions = [
    { icon: Scan, label: "Disease Detection", desc: "Analyze crop diseases using image or symptoms", path: "/farmer/disease-detection" },
    { icon: ShoppingCart, label: "Shop Products", desc: "Browse agricultural products from merchants", path: "/farmer/shop" },
    { icon: ClipboardList, label: "My Orders", desc: "Track your order status and history", path: "/farmer/orders" },
    { icon: Store, label: "Marketplace", desc: "Sell your produce directly to buyers", path: "/farmer/marketplace" },
    { icon: CalendarDays, label: "Farming Calendar", desc: "Plan crops, reminders & weather suggestions", path: "/farmer/calendar" },
    { icon: Users, label: "Customer Orders", desc: "Manage orders from customers", path: "/farmer/customer-orders" },
    { icon: MapPin, label: "Nearby Shops", desc: "Find agricultural shops near you", path: "/farmer/nearby-shops" },
  ];

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 glass-subtle border-b border-border/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Weather Widget */}
          <div className="flex items-center gap-3 glass-subtle rounded-2xl px-4 py-2 border border-border/30">
            {weatherLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ThermometerSun className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-foreground">{weather?.temperature || 28}°C</span>
                    <span className="text-xs text-muted-foreground">{weather?.condition || "..."}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Droplets className="w-3 h-3" /> {weather?.humidity || 0}%</span>
                    <span className="flex items-center gap-1"><Wind className="w-3 h-3" /> {weather?.windSpeed || 0} km/h</span>
                    <span className="flex items-center gap-1"><Cloud className="w-3 h-3" /> {weather?.rainChance || 0}%</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-glow">
              <Sprout className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold hidden sm:block text-gradient">KisanSetu</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <ThemeSwitcher mode={theme.mode} onModeChange={theme.setMode} />
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full glass-subtle border border-border/30">
                  <Avatar className="h-10 w-10 border-2 border-primary/30">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {profile?.full_name ? getInitials(profile.full_name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 glass-card border-border/30" align="end">
                <DropdownMenuLabel>
                  <p className="text-sm font-medium">{profile?.full_name || "Farmer"}</p>
                  <p className="text-xs text-muted-foreground">Farmer Account</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/farmer/profile")} className="gap-2">
                  <User className="mr-2 h-4 w-4" /> Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/farmer/orders")} className="gap-2">
                  <ClipboardList className="mr-2 h-4 w-4" /> My Orders
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive gap-2">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold">
            Hello, {profile?.full_name?.split(" ")[0] || "Farmer"}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">What would you like to do today?</p>
        </div>

        <div className="gradient-divider mb-8" />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {quickActions.map((action) => (
            <Card
              key={action.label}
              className="group cursor-pointer btn-ripple glass-card transition-all duration-300"
              onClick={() => navigate(action.path)}
            >
              <CardHeader>
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-primary/20 group-hover:shadow-glow group-hover:scale-105">
                  <action.icon className="w-8 h-8 text-primary transition-colors duration-300 group-hover:text-primary-foreground" />
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">{action.label}</CardTitle>
                <CardDescription className="text-muted-foreground">{action.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary group-hover:shadow-glow">
                  Open
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="gradient-divider my-8" />

        {/* Tip */}
        <Card className="border-primary/20 glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sprout className="w-4 h-4 text-primary" />
              </div>
              Farming Tip of the Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Based on current weather conditions, consider watering your crops early in the morning 
              to minimize evaporation and maximize water absorption.
            </p>
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default FarmerDashboard;
