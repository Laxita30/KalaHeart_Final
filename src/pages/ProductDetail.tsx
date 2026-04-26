import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, ShoppingCart, Star, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RecommendedProducts from "@/components/RecommendedProducts";
import { supabase } from "@/integrations/supabase/client";
import { products, artists } from "@/lib/data";

const ProductDetail = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);

  // Track view (real DB product ids only — uuid format)
  useEffect(() => {
    if (!id) return;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("product_views").insert({ user_id: user.id, product_id: id });
    })();
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-display font-bold">Product not found</h1>
          <Link to="/browse" className="text-primary mt-4 inline-block">← Back to browse</Link>
        </div>
      </div>
    );
  }

  const artist = artists.find((a) => a.id === product.artistId);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <Link to="/browse" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to browse
        </Link>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Image */}
          <div className="rounded-xl overflow-hidden border bg-card">
            <img
              src={product.image}
              alt={product.title}
              className="w-full aspect-square object-cover"
              width={600}
              height={600}
            />
          </div>

          {/* Info */}
          <div>
            <h1 className="text-3xl font-display font-bold">{product.title}</h1>
            <p className="text-muted-foreground mt-3 leading-relaxed">{product.description}</p>

            <p className="text-3xl font-bold text-price mt-6">
              {product.currency}{product.price.toFixed(2)}
            </p>

            <div className="flex items-center gap-2 mt-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-current text-star" : "text-muted"}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
            </div>

            <div className="flex gap-3 mt-8">
              <Button size="lg" className="flex-1 gap-2">
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Artist section */}
        {artist && (
          <div className="mt-12 rounded-xl border bg-card p-8">
            <h2 className="text-xl font-display font-bold mb-4">About the Artist</h2>
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-full bg-accent flex items-center justify-center shrink-0">
                <User className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{artist.name}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-3.5 w-3.5 fill-current text-star" />
                  <span className="text-xs text-muted-foreground">Artist Rating</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{artist.specialty}</p>
                <Button variant="default" size="sm" className="mt-4">Contact Artist</Button>
              </div>
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        <div className="mt-16">
          <RecommendedProducts currentProductId={id} limit={6} title="You might also love" />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;
