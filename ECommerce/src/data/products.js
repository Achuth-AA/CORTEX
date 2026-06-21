// Dummy product catalog — 24 products across 4 categories.
//
// Product photos come from `productImages` (curated, relevance-ranked, and
// verified real images served from a hotlink-friendly CDN). The inline
// img() keyword URLs below act only as a fallback if a product is missing
// from that map. The override loop at the bottom of this file swaps the
// real photos in.

import { productImages } from './productImages.js'

const img = (keyword, count, seed) =>
  Array.from(
    { length: count },
    (_, i) => `https://loremflickr.com/600/600/${keyword}?lock=${seed + i}`
  )

export const categories = ['Electronics', 'Fashion', 'Home Decor', 'Fitness']

export const products = [
  // ---------------- Electronics ----------------
  {
    id: 1,
    name: 'Aurora Wireless Headphones',
    category: 'Electronics',
    price: 199,
    originalPrice: 259,
    rating: 4.8,
    reviewCount: 1284,
    images: img('headphones', 4, 11),
    sizes: ['One Size'],
    colors: ['#1a1a2e', '#6366f1', '#e5e7eb'],
    description:
      'Studio-grade active noise cancellation with 40-hour battery life and plush memory-foam earcups. Spatial audio that wraps around you.',
    badge: 'Hot',
  },
  {
    id: 2,
    name: 'Nimbus Smartwatch Pro',
    category: 'Electronics',
    price: 329,
    originalPrice: 399,
    rating: 4.7,
    reviewCount: 932,
    images: img('smartwatch', 4, 22),
    sizes: ['40mm', '44mm'],
    colors: ['#0f0f0f', '#8b5cf6', '#f59e0b'],
    description:
      'A featherweight titanium smartwatch with always-on AMOLED, ECG, and a sapphire crystal face built to survive the everyday.',
    badge: 'New',
  },
  {
    id: 3,
    name: 'Pulse Mechanical Keyboard',
    category: 'Electronics',
    price: 149,
    originalPrice: 149,
    rating: 4.9,
    reviewCount: 2105,
    images: img('keyboard', 3, 33),
    sizes: ['65%', '75%', 'Full'],
    colors: ['#1a1a2e', '#6366f1'],
    description:
      'Hot-swappable switches, gasket-mounted plate, and per-key RGB. Type on a cloud, sound like a dream.',
    badge: null,
  },
  {
    id: 4,
    name: 'Lumen 4K Action Camera',
    category: 'Electronics',
    price: 279,
    originalPrice: 349,
    rating: 4.6,
    reviewCount: 671,
    images: img('camera', 3, 44),
    sizes: ['One Size'],
    colors: ['#0f0f0f', '#ef4444'],
    description:
      'Cinematic 4K120 stabilization in a pocket-sized, waterproof body. Capture the moment, however fast it moves.',
    badge: 'Sale',
  },
  {
    id: 5,
    name: 'Echo Smart Speaker',
    category: 'Electronics',
    price: 99,
    originalPrice: 129,
    rating: 4.5,
    reviewCount: 1543,
    images: img('speaker', 3, 55),
    sizes: ['One Size'],
    colors: ['#1a1a2e', '#a3a3a3', '#8b5cf6'],
    description:
      'Room-filling 360° sound with an assistant that actually listens. Compact enough for any shelf.',
    badge: null,
  },
  {
    id: 6,
    name: 'Volt Power Bank 20K',
    category: 'Electronics',
    price: 59,
    originalPrice: 79,
    rating: 4.4,
    reviewCount: 388,
    images: img('powerbank', 3, 66),
    sizes: ['One Size'],
    colors: ['#0f0f0f', '#6366f1'],
    description:
      '20,000mAh of fast-charging confidence with dual USB-C PD. Three full phone charges in your pocket.',
    badge: 'Sale',
  },

  // ---------------- Fashion ----------------
  {
    id: 7,
    name: 'Eclipse Bomber Jacket',
    category: 'Fashion',
    price: 189,
    originalPrice: 240,
    rating: 4.7,
    reviewCount: 542,
    images: img('jacket', 4, 77),
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['#1a1a2e', '#3f3f46', '#8b5cf6'],
    description:
      'A water-repellent technical bomber with a matte finish and ribbed cuffs. Streetwear that means business.',
    badge: 'Hot',
  },
  {
    id: 8,
    name: 'Meridian Leather Tote',
    category: 'Fashion',
    price: 159,
    originalPrice: 199,
    rating: 4.8,
    reviewCount: 311,
    images: img('handbag', 3, 88),
    sizes: ['One Size'],
    colors: ['#3f2d23', '#0f0f0f', '#a16207'],
    description:
      'Full-grain vegetable-tanned leather that ages beautifully. Roomy enough for a laptop, refined enough for dinner.',
    badge: 'New',
  },
  {
    id: 9,
    name: 'Strato Knit Sneakers',
    category: 'Fashion',
    price: 129,
    originalPrice: 129,
    rating: 4.6,
    reviewCount: 889,
    images: img('sneakers', 4, 99),
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: ['#e5e7eb', '#1a1a2e', '#6366f1'],
    description:
      'A seamless knit upper on a responsive foam sole. Feels like socks, performs like running shoes.',
    badge: null,
  },
  {
    id: 10,
    name: 'Onyx Aviator Sunglasses',
    category: 'Fashion',
    price: 89,
    originalPrice: 119,
    rating: 4.5,
    reviewCount: 460,
    images: img('sunglasses', 3, 110),
    sizes: ['One Size'],
    colors: ['#0f0f0f', '#a16207'],
    description:
      'Polarized lenses in a lightweight titanium frame with UV400 protection. Timeless silhouette, modern build.',
    badge: 'Sale',
  },
  {
    id: 11,
    name: 'Cashmere Lounge Scarf',
    category: 'Fashion',
    price: 79,
    originalPrice: 99,
    rating: 4.9,
    reviewCount: 207,
    images: img('scarf', 3, 121),
    sizes: ['One Size'],
    colors: ['#9ca3af', '#8b5cf6', '#1a1a2e'],
    description:
      'Pure Mongolian cashmere, impossibly soft and warm. The kind of luxury you reach for every day.',
    badge: null,
  },
  {
    id: 12,
    name: 'Vertex Chronograph Watch',
    category: 'Fashion',
    price: 249,
    originalPrice: 320,
    rating: 4.7,
    reviewCount: 398,
    images: img('watch', 4, 132),
    sizes: ['One Size'],
    colors: ['#1a1a2e', '#a16207', '#e5e7eb'],
    description:
      'A sapphire-crystal automatic chronograph with an exhibition caseback. Mechanical artistry on your wrist.',
    badge: 'Hot',
  },

  // ---------------- Home Decor ----------------
  {
    id: 13,
    name: 'Halo Ceramic Vase',
    category: 'Home Decor',
    price: 69,
    originalPrice: 89,
    rating: 4.6,
    reviewCount: 178,
    images: img('vase', 3, 143),
    sizes: ['Small', 'Medium', 'Large'],
    colors: ['#e5e7eb', '#8b5cf6', '#1a1a2e'],
    description:
      'Hand-thrown matte ceramic with a sculptural silhouette. A centerpiece, with or without flowers.',
    badge: 'New',
  },
  {
    id: 14,
    name: 'Nova Table Lamp',
    category: 'Home Decor',
    price: 119,
    originalPrice: 149,
    rating: 4.8,
    reviewCount: 256,
    images: img('lamp', 3, 154),
    sizes: ['One Size'],
    colors: ['#1a1a2e', '#a16207', '#e5e7eb'],
    description:
      'Dimmable warm-glow LED in a brushed-brass frame with a frosted orb. Ambient light, sculptural form.',
    badge: 'Hot',
  },
  {
    id: 15,
    name: 'Drift Wool Throw Blanket',
    category: 'Home Decor',
    price: 89,
    originalPrice: 119,
    rating: 4.7,
    reviewCount: 332,
    images: img('blanket', 3, 165),
    sizes: ['One Size'],
    colors: ['#9ca3af', '#6366f1', '#3f3f46'],
    description:
      'Chunky merino-wool weave that adds instant warmth and texture to any sofa or bed.',
    badge: null,
  },
  {
    id: 16,
    name: 'Orbit Wall Clock',
    category: 'Home Decor',
    price: 59,
    originalPrice: 75,
    rating: 4.4,
    reviewCount: 145,
    images: img('clock', 3, 176),
    sizes: ['One Size'],
    colors: ['#0f0f0f', '#e5e7eb', '#8b5cf6'],
    description:
      'A silent-sweep minimalist clock with a floating-numeral face. Quiet design, quiet ticking.',
    badge: 'Sale',
  },
  {
    id: 17,
    name: 'Bloom Scented Candle Set',
    category: 'Home Decor',
    price: 49,
    originalPrice: 65,
    rating: 4.9,
    reviewCount: 421,
    images: img('candle', 3, 187),
    sizes: ['Set of 3'],
    colors: ['#e5e7eb', '#a16207', '#8b5cf6'],
    description:
      'Soy-wax candles in amber, fig, and cedar. 50 hours of warm glow and calming fragrance each.',
    badge: null,
  },
  {
    id: 18,
    name: 'Terra Planter Trio',
    category: 'Home Decor',
    price: 45,
    originalPrice: 59,
    rating: 4.5,
    reviewCount: 198,
    images: img('planter', 3, 198),
    sizes: ['Small', 'Medium'],
    colors: ['#9ca3af', '#3f2d23', '#e5e7eb'],
    description:
      'A trio of stoneware planters with bamboo drainage trays. Bring the garden indoors, beautifully.',
    badge: 'New',
  },

  // ---------------- Fitness ----------------
  {
    id: 19,
    name: 'Forge Adjustable Dumbbell',
    category: 'Fitness',
    price: 299,
    originalPrice: 379,
    rating: 4.8,
    reviewCount: 612,
    images: img('dumbbell', 4, 209),
    sizes: ['Single', 'Pair'],
    colors: ['#0f0f0f', '#6366f1'],
    description:
      'Dial from 5 to 52.5 lbs in seconds. A whole rack of dumbbells in one compact, knurled handle.',
    badge: 'Hot',
  },
  {
    id: 20,
    name: 'Flow Yoga Mat Pro',
    category: 'Fitness',
    price: 69,
    originalPrice: 89,
    rating: 4.7,
    reviewCount: 743,
    images: img('yoga', 3, 220),
    sizes: ['4mm', '6mm'],
    colors: ['#8b5cf6', '#1a1a2e', '#10b981'],
    description:
      'A grippy, cushioned natural-rubber mat with alignment lines. Stays put through every flow and hold.',
    badge: null,
  },
  {
    id: 21,
    name: 'Kinetic Resistance Bands',
    category: 'Fitness',
    price: 39,
    originalPrice: 55,
    rating: 4.6,
    reviewCount: 521,
    images: img('fitness', 3, 231),
    sizes: ['Set of 5'],
    colors: ['#6366f1', '#f59e0b', '#ef4444'],
    description:
      'Five tiered latex bands with comfort handles and door anchor. A full gym that fits in a drawer.',
    badge: 'Sale',
  },
  {
    id: 22,
    name: 'Apex Foam Roller',
    category: 'Fitness',
    price: 35,
    originalPrice: 45,
    rating: 4.5,
    reviewCount: 289,
    images: img('foam', 3, 242),
    sizes: ['One Size'],
    colors: ['#1a1a2e', '#8b5cf6'],
    description:
      'High-density textured EVA roller for deep-tissue recovery. Roll out the tension after every session.',
    badge: null,
  },
  {
    id: 23,
    name: 'Hydra Insulated Bottle',
    category: 'Fitness',
    price: 29,
    originalPrice: 39,
    rating: 4.9,
    reviewCount: 1102,
    images: img('bottle', 3, 253),
    sizes: ['500ml', '750ml', '1L'],
    colors: ['#1a1a2e', '#6366f1', '#10b981'],
    description:
      'Double-wall vacuum steel that keeps cold 24h and hot 12h. Leak-proof, sweat-proof, gym-proof.',
    badge: 'Hot',
  },
  {
    id: 24,
    name: 'Tempo Jump Rope',
    category: 'Fitness',
    price: 25,
    originalPrice: 32,
    rating: 4.4,
    reviewCount: 367,
    images: img('rope', 3, 264),
    sizes: ['One Size'],
    colors: ['#0f0f0f', '#8b5cf6'],
    description:
      'A weighted speed rope with ball-bearing handles for friction-free spins. Cardio that keeps up with you.',
    badge: null,
  },
]

// Swap in the curated, verified product photos.
for (const p of products) {
  const imgs = productImages[p.id]
  if (imgs && imgs.length) p.images = imgs
}

export const getProductById = (id) => products.find((p) => p.id === Number(id))

export const getRelated = (product, count = 6) =>
  products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, count)
