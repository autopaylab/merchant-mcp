import type { Product } from "../../types/merchant";

export const MERCHANT_ID = "demoshop";

export const catalog: ReadonlyArray<Product> = [
  {
    id: "prod_001",
    sku: "ELC-001",
    name: "Wireless Noise-Cancelling Headphones",
    description:
      "Over-ear Bluetooth 5.3 headphones with 30-hour battery and hybrid active noise cancellation.",
    price: 299.99,
    currency: "PLN",
    availability: true,
    category: "electronics",
    image_url: "https://placehold.co/400x400?text=Headphones",
  },
  {
    id: "prod_002",
    sku: "ELC-002",
    name: "Portable Bluetooth Speaker",
    description:
      "Waterproof IPX7 speaker with 360° sound, 20-hour playback, and USB-C charging.",
    price: 149.99,
    currency: "PLN",
    availability: true,
    category: "electronics",
    image_url: "https://placehold.co/400x400?text=Speaker",
  },
  {
    id: "prod_003",
    sku: "ELC-003",
    name: "USB-C Hub 7-in-1",
    description:
      "Expands your laptop with 4K HDMI, 3× USB-A 3.0, SD/microSD slots, and 100W Power Delivery.",
    price: 89.99,
    currency: "PLN",
    availability: true,
    category: "electronics",
  },
  {
    id: "prod_004",
    sku: "ACC-001",
    name: 'Leather Laptop Sleeve 15"',
    description:
      "Full-grain leather sleeve with velvet lining and magnetic closure, fits laptops up to 15 inches.",
    price: 119.0,
    currency: "PLN",
    availability: true,
    category: "accessories",
    image_url: "https://placehold.co/400x400?text=Sleeve",
  },
  {
    id: "prod_005",
    sku: "ACC-002",
    name: "Ergonomic Mouse Pad XL",
    description:
      "Extended 90×45 cm desk mat with micro-texture surface, non-slip base, and stitched edges.",
    price: 49.99,
    currency: "PLN",
    availability: true,
    category: "accessories",
  },
  {
    id: "prod_006",
    sku: "ACC-003",
    name: "Mechanical Keyboard Wrist Rest",
    description:
      "Memory-foam wrist rest with non-slip PU base, fits standard TKL keyboards. Currently out of stock.",
    price: 39.99,
    currency: "PLN",
    availability: false,
    category: "accessories",
  },
  {
    id: "prod_007",
    sku: "HOM-001",
    name: "Smart LED Desk Lamp",
    description:
      "Touch-controlled lamp with 5 colour temperatures, stepless dimming, USB-A charging port, and 10W output.",
    price: 79.99,
    currency: "PLN",
    availability: true,
    category: "home",
    image_url: "https://placehold.co/400x400?text=Lamp",
  },
  {
    id: "prod_008",
    sku: "HOM-002",
    name: "Bamboo Desk Organiser",
    description:
      "Six-compartment caddy crafted from sustainable bamboo. Holds pens, cables, business cards, and small devices.",
    price: 34.99,
    currency: "PLN",
    availability: true,
    category: "home",
  },
];
