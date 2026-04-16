import logo from "@/assets/logo.png";

const Footer = () => (
  <footer className="border-t bg-card mt-20">
    <div className="container py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img src={logo} alt="KalaHeart" className="h-7 w-7" />
            <span className="text-lg font-bold font-display text-primary">KalaHeart</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            Discover authentic local art, powered by AI. Empowering artisans, enriching lives.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Quick Links</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Connect With Us</h4>
          <div className="flex gap-4 text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
            <a href="#" className="hover:text-foreground transition-colors">Instagram</a>
            <a href="#" className="hover:text-foreground transition-colors">Facebook</a>
          </div>
        </div>
      </div>
      <div className="border-t mt-8 pt-6 text-center text-xs text-muted-foreground">
        © 2026 KalaHeart. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
