import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Search,
  MapPin,
  Heart,
  ShoppingCart,
  Loader2,
  Filter,
  Leaf,
} from "lucide-react";
import { toast } from "sonner";
import { NotificationBell } from "@/components/NotificationBell";

interface Listing {
  id: string;
  farmer_id: string;
  title: string;
  description: string | null;
  category: string;
  price: number;
  quantity: number;
  unit: string;
  image_url: string | null;
  location: string | null;
  variety: string | null;
  farming_method: string | null;
  harvest_date: string | null;
  status: string;
}

const categories = ["All", "Vegetables", "Fruits", "Grains", "Pulses", "Spices", "Dairy", "Other"];

const CustomerMarketplace = () => {
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
        return;
      }
      setCurrentUserId(session.user.id);
      await Promise.all([fetchListings(), fetchWishlist(session.user.id)]);
      setLoading(false);
    };
    init();
  }, [navigate]);

  useEffect(() => {
    filterAndSortListings();
  }, [listings, searchTerm, selectedCategory, sortBy]);

  const fetchListings = async () => {
    const { data, error } = await supabase
      .from("marketplace_listings")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching listings:", error);
      return;
    }
    setListings((data || []) as unknown as Listing[]);
  };

  const fetchWishlist = async (userId: string) => {
    const { data } = await supabase
      .from("customer_wishlist")
      .select("listing_id")
      .eq("customer_id", userId);

    if (data) {
      setWishlist(new Set(data.map(w => w.listing_id).filter(Boolean) as string[]));
    }
  };

  const filterAndSortListings = () => {
    let filtered = [...listings];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(l =>
        l.title.toLowerCase().includes(term) ||
        l.description?.toLowerCase().includes(term) ||
        l.category.toLowerCase().includes(term) ||
        l.location?.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter(l => l.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "newest":
      default:
        // Already sorted by created_at
        break;
    }

    setFilteredListings(filtered);
  };

  const toggleWishlist = async (listingId: string) => {
    if (!currentUserId) return;

    const isInWishlist = wishlist.has(listingId);

    if (isInWishlist) {
      const { error } = await supabase
        .from("customer_wishlist")
        .delete()
        .eq("customer_id", currentUserId)
        .eq("listing_id", listingId);

      if (!error) {
        setWishlist(prev => {
          const next = new Set(prev);
          next.delete(listingId);
          return next;
        });
        toast.success("Removed from wishlist");
      }
    } else {
      const { error } = await supabase
        .from("customer_wishlist")
        .insert({ customer_id: currentUserId, listing_id: listingId });

      if (!error) {
        setWishlist(prev => new Set([...prev, listingId]));
        toast.success("Added to wishlist");
      }
    }
  };

  const addToCart = async (listing: Listing) => {
    if (!currentUserId) return;

    // Check if already in cart
    const { data: existing } = await supabase
      .from("customer_cart")
      .select("id, quantity")
      .eq("customer_id", currentUserId)
      .eq("listing_id", listing.id)
      .single();

    if (existing) {
      // Update quantity
      const { error } = await supabase
        .from("customer_cart")
        .update({ quantity: existing.quantity + 1 })
        .eq("id", existing.id);

      if (!error) {
        toast.success("Updated cart quantity");
      }
    } else {
      // Add new
      const { error } = await supabase
        .from("customer_cart")
        .insert({
          customer_id: currentUserId,
          listing_id: listing.id,
          quantity: 1,
        });

      if (!error) {
        toast.success("Added to cart");
      }
    }
  };

  const getFarmingMethodBadge = (method: string | null) => {
    if (!method) return null;
    const variants: Record<string, string> = {
      organic: "bg-success text-success-foreground",
      conventional: "bg-muted",
      hydroponic: "bg-accent text-accent-foreground",
    };
    return (
      <Badge className={variants[method] || "bg-muted"}>
        {method === "organic" && <Leaf className="w-3 h-3 mr-1" />}
        {method.charAt(0).toUpperCase() + method.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/customer")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Marketplace</h1>
              <p className="text-sm text-muted-foreground">{filteredListings.length} products available</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/customer/cart")}>
              <ShoppingCart className="w-5 h-5" />
            </Button>
            <NotificationBell />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search produce..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[140px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low-High</SelectItem>
                <SelectItem value="price-high">Price: High-Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredListings.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No products found</p>
            </div>
          ) : (
            filteredListings.map((listing) => (
              <Card key={listing.id} className="hover:border-primary/50 transition-colors overflow-hidden">
                {listing.image_url && (
                  <div className="h-48 bg-muted overflow-hidden">
                    <img 
                      src={listing.image_url} 
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{listing.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{listing.category}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleWishlist(listing.id)}
                      className={wishlist.has(listing.id) ? "text-destructive" : "text-muted-foreground"}
                    >
                      <Heart className={`w-5 h-5 ${wishlist.has(listing.id) ? "fill-current" : ""}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-primary text-primary-foreground">
                      ₹{listing.price}/{listing.unit}
                    </Badge>
                    {getFarmingMethodBadge(listing.farming_method)}
                  </div>

                  {listing.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
                  )}

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Available: {listing.quantity} {listing.unit}</span>
                    {listing.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {listing.location}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate(`/customer/listing/${listing.id}`)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="farmer"
                      className="flex-1"
                      onClick={() => addToCart(listing)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default CustomerMarketplace;
