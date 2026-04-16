import { Star, User } from "lucide-react";
import type { Artist } from "@/lib/data";

const ArtistCard = ({ artist }: { artist: Artist }) => (
  <div className="rounded-lg border bg-card p-6 text-center hover:shadow-md transition-shadow">
    <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-accent flex items-center justify-center">
      <User className="h-8 w-8 text-primary" />
    </div>
    <h3 className="font-display font-semibold">{artist.name}</h3>
    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{artist.specialty}</p>
    <div className="flex items-center justify-center gap-1 mt-2">
      <Star className="h-3.5 w-3.5 fill-current text-star" />
      <span className="text-xs text-muted-foreground">{artist.rating}</span>
    </div>
  </div>
);

export default ArtistCard;
