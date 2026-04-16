import { Link, useLocation } from "react-router-dom";
import { Heart, ShoppingCart, User } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="KalaHeart" className="h-8 w-8" />
          <span className="text-xl font-bold font-display text-primary">KalaHeart</span>
        </Link>

        {isLanding ? (
          <>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium">
              <a href="#mission" className="text-foreground/70 hover:text-foreground transition-colors">Our Mission</a>
              <a href="#products" className="text-foreground/70 hover:text-foreground transition-colors">Products</a>
              <a href="#artisans" className="text-foreground/70 hover:text-foreground transition-colors">Artists</a>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button>Login</Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/favorites" className="text-foreground/60 hover:text-foreground transition-colors">
              <Heart className="h-5 w-5" />
            </Link>
            <Link to="/cart" className="text-foreground/60 hover:text-foreground transition-colors">
              <ShoppingCart className="h-5 w-5" />
            </Link>
            <Link to="/login" className="text-foreground/60 hover:text-foreground transition-colors">
              <User className="h-5 w-5" />
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
