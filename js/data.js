// Malabar Table - Master Menu & Initial State Data

export const INITIAL_TABLES = Array.from({ length: 12 }, (_, i) => {
  const id = i + 1;
  return {
    id,
    number: `T-${id.toString().padStart(2, '0')}`,
    seats: id % 3 === 0 ? 6 : id % 2 === 0 ? 4 : 2,
    status: id === 3 || id === 7 ? 'occupied' : id === 5 ? 'bill-requested' : 'available',
    currentOrderId: id === 3 ? 'ORD-1002' : id === 7 ? 'ORD-1004' : id === 5 ? 'ORD-1001' : null,
    qrUrl: `${window.location.origin}${window.location.pathname}?table=${id}`
  };
});

export const CATEGORIES = [
  { id: 'all', name: 'All Items', icon: 'utensils' },
  { id: 'starters', name: 'Starters', icon: 'flame' },
  { id: 'mains', name: 'Main Course', icon: 'soup' },
  { id: 'biryani', name: 'Biryani Specials', icon: 'drumstick' },
  { id: 'breads', name: 'Malabar Breads', icon: 'disc' },
  { id: 'beverages', name: 'Beverages', icon: 'coffee' },
  { id: 'desserts', name: 'Desserts', icon: 'ice-cream' }
];

export const MENU_ITEMS = [
  {
    id: 'm1',
    name: 'Malabar Mutton Biryani',
    category: 'biryani',
    price: 380,
    portions: [
      { size: 'Full', price: 380 },
      { size: 'Half', price: 220 },
      { size: 'Quarter', price: 130 }
    ],
    isVeg: false,
    spiceLevel: 2,
    description: 'Authentic Thalassery style dum biryani cooked with Kaima rice, tender mutton and aromatic spices.',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
    popular: true,
    prepTime: '15 mins'
  },
  {
    id: 'm2',
    name: 'Kerala Parotta & Beef Roast',
    category: 'mains',
    price: 290,
    portions: [
      { size: 'Full', price: 290 },
      { size: 'Half', price: 170 },
      { size: 'Quarter', price: 100 }
    ],
    isVeg: false,
    spiceLevel: 3,
    description: 'Flaky layered Kerala parottas served with slow-cooked spicy Malabar beef roast.',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=80',
    popular: true,
    prepTime: '12 mins'
  },
  {
    id: 'm3',
    name: 'Karimeen Pollichathu',
    category: 'mains',
    price: 450,
    portions: [
      { size: 'Full', price: 450 },
      { size: 'Half', price: 260 }
    ],
    isVeg: false,
    spiceLevel: 2,
    description: 'Pearl spot fish marinated in shallot-chilli paste, wrapped in banana leaf and pan grilled.',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=80',
    popular: true,
    prepTime: '20 mins'
  },
  {
    id: 'm4',
    name: 'Appam with Chicken Stew',
    category: 'mains',
    price: 260,
    portions: [
      { size: 'Full', price: 260 },
      { size: 'Half', price: 150 }
    ],
    isVeg: false,
    spiceLevel: 1,
    description: 'Soft laced coconut milk hoppers served with rich creamy potato chicken stew.',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80',
    popular: false,
    prepTime: '10 mins'
  },
  {
    id: 'm5',
    name: 'Kozhi Porichathu (Malabar Fried Chicken)',
    category: 'starters',
    price: 240,
    portions: [
      { size: 'Full', price: 240 },
      { size: 'Half', price: 140 },
      { size: 'Quarter', price: 80 }
    ],
    isVeg: false,
    spiceLevel: 3,
    description: 'Deep fried crispy chicken marinated in Kerala spice mix, curry leaves and coconut oil.',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80',
    popular: true,
    prepTime: '15 mins'
  },
  {
    id: 'm6',
    name: 'Paneer Butter Masala',
    category: 'mains',
    price: 240,
    portions: [
      { size: 'Full', price: 240 },
      { size: 'Half', price: 140 }
    ],
    isVeg: true,
    spiceLevel: 1,
    description: 'Cottage cheese cubes simmered in rich cashew tomato butter gravy.',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80',
    popular: false,
    prepTime: '12 mins'
  },
  {
    id: 'm7',
    name: 'Malabar Chicken Biryani',
    category: 'biryani',
    price: 280,
    portions: [
      { size: 'Full', price: 280 },
      { size: 'Half', price: 160 },
      { size: 'Quarter', price: 100 }
    ],
    isVeg: false,
    spiceLevel: 2,
    description: 'Signature Malabar chicken biryani served with date pickle, coconut chammanthi and raita.',
    image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&auto=format&fit=crop&q=80',
    popular: true,
    prepTime: '15 mins'
  },
  {
    id: 'm8',
    name: 'Malabar Flaky Parotta (2 Pcs)',
    category: 'breads',
    price: 60,
    isVeg: true,
    spiceLevel: 0,
    description: 'Hand-rolled golden flaky flatbread baked on iron griddle.',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=80',
    popular: true,
    prepTime: '5 mins'
  },
  {
    id: 'm9',
    name: 'Malabar Special Sulaimani Tea',
    category: 'beverages',
    price: 40,
    isVeg: true,
    spiceLevel: 0,
    description: 'Aromatic spiced black tea steeped with cardamom, mint leaves and lemon juice.',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80',
    popular: true,
    prepTime: '3 mins'
  },
  {
    id: 'm10',
    name: 'Elaneer Payasam (Tender Coconut Dessert)',
    category: 'desserts',
    price: 150,
    isVeg: true,
    spiceLevel: 0,
    description: 'Chilled signature pudding made with tender coconut pulp, condensed milk and cardamom.',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=80',
    popular: true,
    prepTime: '2 mins'
  },
  {
    id: 'm11',
    name: 'Fresh Mint Lime Cooler',
    category: 'beverages',
    price: 70,
    isVeg: true,
    spiceLevel: 0,
    description: 'Refreshing crushed mint leaves, fresh lime and sparkling soda.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',
    popular: false,
    prepTime: '3 mins'
  },
  {
    id: 'm12',
    name: 'Kerala Fish Molee',
    category: 'mains',
    price: 390,
    portions: [
      { size: 'Full', price: 390 },
      { size: 'Half', price: 230 }
    ],
    isVeg: false,
    spiceLevel: 1,
    description: 'Seer fish cooked in mild coconut milk curry infused with green chillies and turmeric.',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&auto=format&fit=crop&q=80',
    popular: true,
    prepTime: '18 mins'
  }
];

export const INITIAL_ORDERS = [
  {
    id: 'ORD-1001',
    orderNumber: 1001,
    tableId: 5,
    tableNumber: 'T-05',
    source: 'dine-in', // 'dine-in', 'staff-mobile', 'swiggy', 'zomato', 'qr-customer'
    orderedBy: 'Customer QR Scan',
    items: [
      { itemId: 'm1', name: 'Malabar Mutton Biryani', quantity: 2, price: 380, notes: 'Medium spice' },
      { itemId: 'm9', name: 'Malabar Special Sulaimani Tea', quantity: 2, price: 40, notes: '' }
    ],
    subtotal: 840,
    tax: 42,
    total: 882,
    status: 'ready', // 'placed', 'preparing', 'ready', 'served', 'paid'
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    elapsedMins: 25,
    paymentStatus: 'unpaid'
  },
  {
    id: 'ORD-1002',
    orderNumber: 1002,
    tableId: 3,
    tableNumber: 'T-03',
    source: 'staff-mobile',
    orderedBy: 'Staff (Rahul V.)',
    items: [
      { itemId: 'm2', name: 'Kerala Parotta & Beef Roast', quantity: 2, price: 290, notes: 'Extra crispy parotta' },
      { itemId: 'm8', name: 'Malabar Flaky Parotta (2 Pcs)', quantity: 2, price: 60, notes: '' },
      { itemId: 'm11', name: 'Fresh Mint Lime Cooler', quantity: 2, price: 70, notes: 'Less sugar' }
    ],
    subtotal: 840,
    tax: 42,
    total: 882,
    status: 'preparing',
    timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
    elapsedMins: 12,
    paymentStatus: 'unpaid'
  },
  {
    id: 'ORD-1003',
    orderNumber: 1003,
    tableId: null,
    tableNumber: 'ONLINE-SWIGGY',
    source: 'swiggy',
    customerName: 'Ananya Sharma (Swiggy #8921)',
    items: [
      { itemId: 'm7', name: 'Malabar Chicken Biryani', quantity: 1, price: 280, notes: '' },
      { itemId: 'm5', name: 'Kozhi Porichathu (Malabar Fried Chicken)', quantity: 1, price: 240, notes: 'Extra onions' },
      { itemId: 'm10', name: 'Elaneer Payasam', quantity: 1, price: 150, notes: '' }
    ],
    subtotal: 670,
    tax: 33.5,
    total: 703.5,
    status: 'preparing',
    timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
    elapsedMins: 8,
    paymentStatus: 'paid-online'
  },
  {
    id: 'ORD-1004',
    orderNumber: 1004,
    tableId: 7,
    tableNumber: 'T-07',
    source: 'qr-customer',
    orderedBy: 'Customer QR Scan',
    items: [
      { itemId: 'm3', name: 'Karimeen Pollichathu', quantity: 1, price: 450, notes: 'Well cooked' },
      { itemId: 'm4', name: 'Appam with Chicken Stew', quantity: 2, price: 260, notes: '' }
    ],
    subtotal: 970,
    tax: 48.5,
    total: 1018.5,
    status: 'placed',
    timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
    elapsedMins: 3,
    paymentStatus: 'unpaid'
  },
  {
    id: 'ORD-1005',
    orderNumber: 1005,
    tableId: null,
    tableNumber: 'ONLINE-ZOMATO',
    source: 'zomato',
    customerName: 'Firoz Khan (Zomato #4410)',
    items: [
      { itemId: 'm1', name: 'Malabar Mutton Biryani', quantity: 1, price: 380, notes: '' },
      { itemId: 'm9', name: 'Malabar Special Sulaimani Tea', quantity: 1, price: 40, notes: 'Hot' }
    ],
    subtotal: 420,
    tax: 21,
    total: 441,
    status: 'placed',
    timestamp: new Date(Date.now() - 1 * 60000).toISOString(),
    elapsedMins: 1,
    paymentStatus: 'paid-online'
  }
];
