const img = (id, w = 1200) =>
  `https://images.unsplash.com/${id}?q=80&w=${w}&auto=format&fit=crop`

export const HERO_IMAGE = img('photo-1490481651871-ab68de25d43d', 2000)

export const COLLECTIONS = [
  {
    title: 'The Dress Edit',
    tag: 'Spring / Summer',
    image: img('photo-1515372039744-b8f02a3ae446'),
  },
  {
    title: 'Outerwear',
    tag: 'Tailored Layers',
    image: img('photo-1539109136881-3be0616acf4b'),
  },
  {
    title: 'Accessories',
    tag: 'Finishing Touches',
    image: img('photo-1492707892479-7bc8d5a4ee93'),
  },
  {
    title: 'Essentials',
    tag: 'Everyday Icons',
    image: img('photo-1485968579580-b6d095142e6e'),
  },
]

export const STORY_IMAGE = img('photo-1441986300917-64674bd600d8', 1400)

export const PRODUCTS = [
  {
    name: 'Silk Wrap Midi Dress',
    price: '$248',
    label: 'New Arrival',
    image: img('photo-1509631179647-0177331693ae'),
  },
  {
    name: 'Wide-Brim Straw Hat',
    price: '$96',
    label: 'Bestseller',
    image: img('photo-1496747611176-843222e1e57c'),
  },
  {
    name: 'Rose Organza Gown',
    price: '$385',
    label: 'Limited',
    image: img('photo-1487222477894-8943e31ef7b2'),
  },
  {
    name: 'Cat-Eye Sunglasses',
    price: '$120',
    label: 'Back in Stock',
    image: img('photo-1469334031218-e382a71b716b'),
  },
]

export const NEWSLETTER_IMAGE = img('photo-1445205170230-053b83016050', 2000)

export const TESTIMONIALS = [
  {
    quote:
      'Every piece I own from Maison Élan feels like it was made for me. The quality is unmatched, and the styling advice turned my wardrobe into something I actually love.',
    name: 'Amelia Hart',
    role: 'Stylist, New York',
  },
  {
    quote:
      'A boutique that understands restraint. Nothing here is trend-chasing — it is quiet, confident luxury that lasts season after season.',
    name: 'Priya Raman',
    role: 'Creative Director',
  },
  {
    quote:
      'From the packaging to the hand-written note, shopping here feels personal. It is the only place I buy gifts anymore.',
    name: 'Sofia Marchetti',
    role: 'Loyal Client since 2021',
  },
]

export const MARQUEE_ITEMS = [
  'New Season Arrivals',
  'Handcrafted in Small Batches',
  'Complimentary Styling',
  'Worldwide Shipping',
  'Sustainable Fabrics',
]
