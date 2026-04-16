import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

const Cart = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="container py-20 text-center">
      <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground/40" />
      <h1 className="text-2xl font-display font-bold mt-4">Your cart is empty</h1>
      <p className="text-muted-foreground mt-2">Start exploring unique handcrafted art!</p>
      <Link to="/browse">
        <Button className="mt-6">Browse Products</Button>
      </Link>
    </div>
  </div>
);

export default Cart;
