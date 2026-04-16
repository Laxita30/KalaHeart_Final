import productVase from "@/assets/product-vase.jpg";
import productPainting from "@/assets/product-painting.jpg";
import productJewelry from "@/assets/product-jewelry.jpg";
import productWoodcraft from "@/assets/product-woodcraft.jpg";
import productTextile from "@/assets/product-textile.jpg";
import productLeather from "@/assets/product-leather.jpg";
import productBowl from "@/assets/product-bowl.jpg";

export interface Product {
  id: string;
  title: string;
  price: number;
  currency: string;
  image: string;
  rating: number;
  reviewCount: number;
  artist: string;
  artistId: string;
  category: string;
  description: string;
}

export interface Artist {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  avatar: string;
}

export const products: Product[] = [
  {
    id: "1",
    title: "Earthen Harmony Vase",
    price: 75,
    currency: "$",
    image: productVase,
    rating: 4.8,
    reviewCount: 34,
    artist: "Maya Artistry",
    artistId: "a1",
    category: "Pottery",
    description: "A breathtaking ceramic vase, meticulously hand-painted with intricate patterns inspired by desert flora.",
  },
  {
    id: "2",
    title: "Abstract Canvas Flow",
    price: 120,
    currency: "$",
    image: productPainting,
    rating: 4.5,
    reviewCount: 21,
    artist: "Arjun Creatives",
    artistId: "a2",
    category: "Paintings",
    description: "A vibrant abstract painting combining traditional Indian techniques with modern expression.",
  },
  {
    id: "3",
    title: "Silver Dewdrop Pendant",
    price: 90,
    currency: "$",
    image: productJewelry,
    rating: 4.9,
    reviewCount: 47,
    artist: "Priya Jewels",
    artistId: "a3",
    category: "Jewelry",
    description: "Handcrafted silver pendant with intricate Indian motifs and a timeless design.",
  },
  {
    id: "4",
    title: "Divine Wood Carving",
    price: 150,
    currency: "$",
    image: productWoodcraft,
    rating: 4.7,
    reviewCount: 18,
    artist: "Ravi Sculptures",
    artistId: "a4",
    category: "Sculptures",
    description: "A hand-carved wooden elephant reflecting traditional Indian woodcarving mastery.",
  },
  {
    id: "5",
    title: "Blossom Silk Scarf Set",
    price: 85,
    currency: "$",
    image: productTextile,
    rating: 4.6,
    reviewCount: 29,
    artist: "Shanti Textiles",
    artistId: "a5",
    category: "Textile Art",
    description: "Hand-painted silk scarf featuring vibrant block print patterns from Rajasthan.",
  },
  {
    id: "6",
    title: "Embossed Leather Journal",
    price: 55,
    currency: "$",
    image: productLeather,
    rating: 4.8,
    reviewCount: 52,
    artist: "Leather Lore",
    artistId: "a6",
    category: "Leather",
    description: "A beautifully embossed leather journal with traditional binding techniques.",
  },
  {
    id: "7",
    title: "Geometric Pottery Bowl",
    price: 60,
    currency: "$",
    image: productBowl,
    rating: 4.4,
    reviewCount: 15,
    artist: "Ceramic Wonders",
    artistId: "a7",
    category: "Pottery",
    description: "Modern geometric terracotta bowl with bold tribal-inspired patterns.",
  },
  {
    id: "8",
    title: "Serene Mosaic Landscape",
    price: 180,
    currency: "$",
    image: productPainting,
    rating: 4.7,
    reviewCount: 23,
    artist: "Mosaic Dreams",
    artistId: "a8",
    category: "Paintings",
    description: "A stunning landscape painting with rich warm tones and expressive brushwork.",
  },
];

export const artists: Artist[] = [
  { id: "a1", name: "Maya Devi", specialty: "Specializing in traditional Indian pottery with a modern twist.", rating: 4.8, avatar: "" },
  { id: "a2", name: "Arjun Singh", specialty: "Abstract expressionist known for vibrant colors and dynamic compositions.", rating: 4.5, avatar: "" },
  { id: "a3", name: "Priya Sharma", specialty: "A jewelry designer crafting intricate pieces inspired by nature and Indian motifs.", rating: 4.9, avatar: "" },
  { id: "a4", name: "Ravi Kumar", specialty: "Master woodcarver with decades of experience in mythological figures.", rating: 4.7, avatar: "" },
  { id: "a5", name: "Shanti Rao", specialty: "Textile artist creating hand-painted silk scarves and fabrics.", rating: 4.6, avatar: "" },
  { id: "a6", name: "Divya Patel", specialty: "Potter and ceramicist known for minimalist designs and unique glazes.", rating: 4.4, avatar: "" },
];

export const categories = ["Paintings", "Sculptures", "Textile Art", "Pottery", "Jewelry", "Digital Art", "Leather"];
