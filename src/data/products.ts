import { Product } from '../types';

export const products: Product[] = [
  // Spring/Summer 2024 Collection
  {
    id: 'ss24-001',
    name: 'Cardigan',
    brand: 'KLEN_HUB',
    price: 1890.00,
    category: 'spring-summer',
    subCategory: 'outerwear',
    images: [
      '/cardigan.jpg',
      '/cardiganBack.jpg'
    ],
    description: 'From our Spring/Summer 2024 collection. Crafted from premium Italian cotton with a relaxed silhouette. Features notched lapels and horn buttons.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    featured: true
  },
  {
    id: 'ss24-002',
    name: 'Represent Tee',
    brand: 'KLEN_HUB',
    price: 890.00,
    category: 'spring-summer',
    subCategory: 'outwear',
    images: [
      '/respresentFront.jpg',
      '/representBack.jpg'
    ],
    description: 'High-waisted trousers with deep pleats and a flowing silhouette. Made from lightweight wool blend.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    featured: true
  },
  // New Arrivals
  {
    id: 'na-001',
    name: 'Drift Tee',
    brand: 'KLEN_HUB',
    price: 2290.00,
    category: 'new-arrivals',
    subCategory: 'outwear',
    images: [
      '/driftfront.jpg',
      '/driftback.jpg'
    ],
    description: 'Architectural shoulder bag crafted from smooth calfskin leather. Features magnetic closure and adjustable strap.',
    sizes: ['ONE SIZE'],
    featured: true
  },
  {
    id: 'na-002',
    name: 'Bhude Vest',
    brand: 'KLEN_HUB',
    price: 2790.00,
    salePrice: 2290.00,
    category: 'new-arrivals',
    subCategory: 'outerwear',
    images: [
      '/bhude1.jpg',
      '/bhude2.jpg',
      '/bhude3.jpg',
      '/bhude4.jpg'
    ],
    description: 'Cropped motorcycle jacket in butter-soft lambskin leather. Silver-tone hardware and quilted panels.',
    sizes: ['XS', 'S', 'M', 'L'],
    onSale: true
  },
  // Collections
  {
    id: 'col-001',
    name: 'Gallery Dept Striped Tee',
    brand: 'KLEN_HUB',
    price: 990.00,
    category: 'collections',
    subCategory: 'outwear',
    images: [
      '/gallerytee.jpg'
    ],
    description: 'Ultra-soft cashmere turtleneck in a relaxed fit. Perfect for layering.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    featured: true
  },
  {
    id: 'col-002',
    name: 'Represent Tee',
    brand: 'KLEN_HUB',
    price: 1690.00,
    category: 'collections',
    subCategory: 'outwear',
    images: [
      '/representbel.jpg'
    ],
    description: 'Floor-length dress in flowing silk with draped details and side slit.',
    sizes: ['XS', 'S', 'M', 'L'],
    featured: true
  },
  // Editorial
  {
    id: 'ed-001',
    name: 'Represrnt Tee BelStaff',
    brand: 'KLEN_HUB',
    price: 900.00,
    category: 'editorial',
    subCategory: 'outwear',
    images: [
      '/representbelBlack.jpg',
      '/representBelBack.jpg'
    ],
    description: 'Exclusive piece from our Editorial collection. Double-breasted coat in Italian wool with oversized proportions.',
    sizes: ['XS', 'S', 'M', 'L'],
    featured: true
  },
  {
    id: 'ed-002',
    name: 'LV Trainer',
    brand: 'KLEN_HUB',
    price: 4290.00,
    category: 'editorial',
    subCategory: 'shoes',
    images: [
      '/lv1.jpg',
      '/lv2.jpg',
      '/lv3.jpg'
    ],
    description: 'Statement boots with architectural heel in polished leather. Made in Italy.',
    sizes: ['36', '37', '38', '39', '40', '41'],
    featured: true
  },
  // More items from each category...
];