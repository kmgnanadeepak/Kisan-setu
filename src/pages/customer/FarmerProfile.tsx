import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Star,
  MapPin,
  ShoppingBag,
  Leaf,
  Heart,
  Loader2,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { NotificationBell } from "@/components/NotificationBell";

interface FarmerProfile {
  farmer_id: string;
  full_name: string;
  city: string | null;
  state: string | null;
  total_sales: number;
  avg_rating: number;
  total_reviews: number;
  crops_grown: string[] | null;
}

interface Listing {
  id: string;
  title: string;
  category: string;
  price: number;
  unit: string;
  quantity: number;
  image_url: string | null;
  farming_method: string | null;
}

interface Review {
  id: string;
  rating: number;
  review: string | null;
  created_at: string;
  customer_name?: string;
}

const FarmerPublicProfile = () => {
  const navigate = useNavigate();
  const { farmerId } = useParams<{ farmerId: string }>();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
        return;
      }
      setCurrentUserId(session.user.id);
      
      if (farmerId) {
        await Promise.all([
          fetchFarmerProfile(farmerId),
          fetchFarmerListings(farmerId),
          fetchFarmerReviews(farmerId),
          checkIsFavorite(session.user.id, farmerId),
        ]);
      }
      setLoading(false);
    };
    init();
  }, [navigate, farmerId]);

  const fetchFarmerProfile = async (id: string) => {
    // Use RPC or direct query since view might have access issues
    const { data: profileData } = await supabase
      .from("profiles")
      .select("user_id, full_name, city, state")
      .eq("user_id", id)
      .single();

    if (!profileData) return;

    // Fetch stats separately
    const { count: salesCount } = await supabase
      .from("customer_orders")
      .select("*", { count: "exact", head: true })
      .eq("farmer_id", id)
      .eq("status", "delivered");

    const { data: ratings } = await supabase
      .from("farmer_ratings")
      .select("rating")
      .eq("farmer_id", id);

    const avgRating = ratings?.length 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
      : 0;

    const { data: cropsData } = await supabase
      .from("marketplace_listings")
      .select("category")
      .eq("farmer_id", id)
      .eq("status", "active");

    const uniqueCrops = [...new Set(cropsData?.map(c => c.category) || [])];

    setProfile({
      farmer_id: profileData.user_id,
      full_name: profileData.full_name,
      city: profileData.city,
      state: profileData.state,
      total_sales: salesCount || 0,
      avg_rating: Math.round(avgRating * 10) / 10,
      total_reviews: ratings?.length || 0,
      crops_grown: uniqueCrops,
    });
  };

  const fetchFarmerListings = async (id: string) => {
    const { data } = await supabase
      .from("marketplace_listings")
      .select("id, title, category, price, unit, quantity, image_url, farming_method")
      .eq("farmer_id", id)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    setListings((data || []) as Listing[]);
  };

  const fetchFarmerReviews = async (id: string) => {
    const { data } = await supabase
      .from("farmer_ratings")
      .select("id, rating, review, created_at")
      .eq("farmer_id", id)
      .order("created_at", { ascending: false })
      .limit(10);

    setReviews((data || []) as Review[]);
  };

  const checkIsFavorite = async (userId: string, farmerId: string) => {
    const { data } = await supabase
      .from("customer_wishlist")
      .select("id")
      .eq("customer_id", userId)
      .eq("farmer_id", farmerId)
      .maybeSingle();

    setIsFavorite(!!data);
  };

  const toggleFavorite = async () => {
    if (!currentUserId || !farmerId) return;

    if (isFavorite) {
      await supabase
        .from("customer_wishlist")
        .delete()
        .eq("customer_id", currentUserId)
        .eq("farmer_id", farmerId);
      setIsFavorite(false);
      toast.success("Removed from favorites");
    } else {
      await supabase
        .from("customer_wishlist")
        .insert({ customer_id: currentUserId, farmer_id: farmerId });
      setIsFavorite(true);
      toast.success("Added to favorites");
    }
  };

  const addToCart = async (listing: Listing) => {
    if (!currentUserId) return;

    const { data: existing } = await supabase
      .from("customer_cart")
      .select("id, quantity")
      .eq("customer_id", currentUserId)
      .eq("listing_id", listing.id)
      .single();

    if (existing) {
      await supabase
        .from("customer_cart")
        .update({ quantity: existing.quantity + 1 })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("customer_cart")
        .insert({ customer_id: currentUserId, listing_id: listing.id, quantity: 1 });
    }
    toast.success("Added to cart");
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.round(rating) ? "text-warning fill-warning" : "text-muted"}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Farmer not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">Farmer Profile</h1>
          </div>
          <NotificationBell />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Avatar className="w-20 h-20 border-2 border-primary">
                <AvatarFallback className="text-2xl bg-primary-lighter text-primary">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{profile.full_name}</h2>
                    {(profile.city || profile.state) && (
                      <p className="text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-4 h-4" />
                        {[profile.city, profile.state].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                  <Button
                    variant={isFavorite ? "default" : "outline"}
                    size="icon"
                    onClick={toggleFavorite}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
                  </Button>
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1">
                    {renderStars(profile.avg_rating)}
                    <span className="ml-1 font-semibold">{profile.avg_rating}</span>
                    <span className="text-muted-foreground">({profile.total_reviews})</span>
                  </div>
                </div>

                <div className="flex gap-6 mt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{profile.total_sales}</p>
                    <p className="text-sm text-muted-foreground">Sales</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{listings.length}</p>
                    <p className="text-sm text-muted-foreground">Products</p>
                  </div>
                </div>
              </div>
            </div>

            {profile.crops_grown && profile.crops_grown.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Commonly Grown</p>
                <div className="flex flex-wrap gap-2">
                  {profile.crops_grown.map((crop) => (
                    <Badge key={crop} variant="secondary">{crop}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Products */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Available Products</h3>
          {listings.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                No products available right now
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((listing) => (
                <Card key={listing.id} className="hover:border-primary/50 transition-colors">
                  {listing.image_url && (
                    <div className="h-32 bg-muted overflow-hidden">
                      <img src={listing.image_url} alt={listing.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{listing.title}</h4>
                        <p className="text-sm text-muted-foreground">{listing.category}</p>
                      </div>
                      <Badge className="bg-primary">₹{listing.price}/{listing.unit}</Badge>
                    </div>
                    {listing.farming_method === "organic" && (
                      <Badge className="bg-success text-success-foreground">
                        <Leaf className="w-3 h-3 mr-1" />
                        Organic
                      </Badge>
                    )}
                    <Button variant="farmer" className="w-full" onClick={() => addToCart(listing)}>
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {review.review && <p className="text-muted-foreground">{review.review}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FarmerPublicProfile;
