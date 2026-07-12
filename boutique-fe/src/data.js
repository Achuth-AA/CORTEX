const img = (id, w = 1200) =>
  `https://images.unsplash.com/${id}?q=80&w=${w}&auto=format&fit=crop`

export const HERO_IMAGE = img('photo-1490481651871-ab68de25d43d', 2000)

export const NAV_LINKS = [
  { label: 'Home', id: 'home' },
  { label: 'Clients', id: 'clients' },
  { label: 'Measurements', id: 'measurements' },
  { label: 'Transactions', id: 'transactions' },
  { label: 'Dashboards', id: 'dashboards' },
]

export const MARQUEE_ITEMS = [
  'Spring / Summer 2026',
  'Handcrafted in Small Batches',
  'Complimentary Worldwide Shipping',
  'Timeless by Design',
]

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

export const PRODUCTS = [
  {
    name: 'Silk Wrap Midi Dress',
    price: '$248',
    label: 'New Arrival',
    image: img('photo-1539008835657-9e8e9680c956'),
  },
  {
    name: 'Wide-Brim Straw Hat',
    price: '$96',
    label: 'Bestseller',
    image: img('photo-1572307480813-ceb0e59d8325'),
  },
  {
    name: 'Rose Organza Gown',
    price: '$385',
    label: 'Limited',
    image: img('photo-1595777457583-95e059d581b8'),
  },
  {
    name: 'Cat-Eye Sunglasses',
    price: '$120',
    label: 'Back in Stock',
    image: img('photo-1508296695146-257a814070b4'),
  },
]

export const STORY_IMAGE = img('photo-1441986300917-64674bd600d8', 1400)

export const STORY_STATS = [
  { value: '2012', label: 'Established' },
  { value: '48', label: 'Ateliers Worldwide' },
  { value: '100%', label: 'Natural Fibres' },
]

export const TESTIMONIALS = [
  {
    quote:
      'Every piece I own from Boutique feels like it was made for me. The quality is unmatched, and the styling advice turned my wardrobe into something I actually love.',
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

export const NEWSLETTER_IMAGE = img('photo-1445205170230-053b83016050', 2000)

export const GARMENT_TYPES = [
  {
    id: 'blouse',
    label: 'Blouse',
    fields: [
      'Blouse Length',
      'Chest',
      'Waist',
      'Shoulder',
      'Sleeve Length',
      'Sleeve Round',
      'Armhole',
      'Front Neck Depth',
      'Back Neck Depth',
    ],
  },
  {
    id: 'kurti',
    label: 'Kurti / Kameez',
    fields: [
      'Kurti Length',
      'Chest',
      'Waist',
      'Hip',
      'Shoulder',
      'Sleeve Length',
      'Sleeve Round',
      'Armhole',
      'Front Neck Depth',
      'Back Neck Depth',
      'Slit Length',
    ],
  },
  {
    id: 'salwar',
    label: 'Salwar / Churidar',
    fields: ['Pant Length', 'Waist', 'Hip', 'Thigh Round', 'Knee Round', 'Mohri (Ankle)'],
  },
  {
    id: 'lehenga',
    label: 'Lehenga',
    fields: ['Lehenga Length', 'Waist', 'Hip', 'Flare'],
  },
  {
    id: 'anarkali',
    label: 'Anarkali / Gown',
    fields: [
      'Full Length',
      'Chest',
      'Waist',
      'Hip',
      'Shoulder',
      'Sleeve Length',
      'Armhole',
      'Front Neck Depth',
      'Back Neck Depth',
      'Flare',
    ],
  },
  {
    id: 'frock',
    label: 'Frock (Kids)',
    fields: ['Frock Length', 'Chest', 'Waist', 'Shoulder', 'Sleeve Length'],
  },
  {
    id: 'petticoat',
    label: 'Saree Petticoat',
    fields: ['Petticoat Length', 'Waist', 'Hip'],
  },
]

export const FOOTER_COLUMNS = [
  {
    title: 'Shop',
    links: ['New Arrivals', 'Dresses', 'Outerwear', 'Accessories', 'Gift Cards'],
  },
  {
    title: 'About',
    links: ['Our Story', 'Ateliers', 'Sustainability', 'Journal', 'Careers'],
  },
  {
    title: 'Care',
    links: ['Shipping & Returns', 'Size Guide', 'Garment Care', 'FAQ', 'Contact Us'],
  },
]
