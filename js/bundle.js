// Malabar Table - Master Centralized JavaScript Bundle (Offline & HTTP Client Demo)

// ================= 1. INITIAL DATA =================
const INITIAL_TABLES = Array.from({ length: 12 }, (_, i) => {
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

const CATEGORIES = [
  { id: 'all', name: 'All Items', icon: 'utensils' },
  { id: 'starters', name: 'Starters', icon: 'flame' },
  { id: 'mains', name: 'Main Course', icon: 'soup' },
  { id: 'biryani', name: 'Biryani Specials', icon: 'drumstick' },
  { id: 'breads', name: 'Malabar Breads', icon: 'disc' },
  { id: 'beverages', name: 'Beverages', icon: 'coffee' },
  { id: 'desserts', name: 'Desserts', icon: 'ice-cream' }
];

const MENU_ITEMS = [
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
    name: 'Kerala Wheat Parotta (2 Pcs)',
    category: 'breads',
    price: 60,
    portions: [
      { size: 'Full', price: 60 }
    ],
    isVeg: true,
    spiceLevel: 0,
    description: 'Whole wheat flaky layered flatbread prepared on hot griddle.',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=80',
    popular: true,
    prepTime: '5 mins'
  },
  {
    id: 'm8',
    name: 'Tender Coconut Payasam',
    category: 'desserts',
    price: 160,
    portions: [
      { size: 'Full', price: 160 },
      { size: 'Half', price: 90 }
    ],
    isVeg: true,
    spiceLevel: 0,
    description: 'Refreshing dessert made with tender coconut pulp, milk and cardamom.',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=80',
    popular: true,
    prepTime: '5 mins'
  },
  {
    id: 'm9',
    name: 'Kulukki Sarbath',
    category: 'beverages',
    price: 70,
    portions: [
      { size: 'Full', price: 70 }
    ],
    isVeg: true,
    spiceLevel: 1,
    description: 'Shaken Kerala lemonade with basil seeds, green chilli and ginger twist.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80',
    popular: true,
    prepTime: '3 mins'
  }
];

const INITIAL_ORDERS = [
  {
    id: 'ORD-1001',
    orderNumber: 1001,
    tableId: 5,
    tableNumber: 'T-05',
    source: 'staff-mobile',
    status: 'preparing',
    paymentStatus: 'unpaid',
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    items: [
      { itemId: 'm1_Full', name: 'Malabar Mutton Biryani (Full)', price: 380, quantity: 2, notes: '' },
      { itemId: 'm9_Full', name: 'Kulukki Sarbath (Full)', price: 70, quantity: 2, notes: '' }
    ],
    subtotal: 900,
    tax: 45,
    discount: 0,
    total: 945,
    paymentMethod: null
  },
  {
    id: 'ORD-1002',
    orderNumber: 1002,
    tableId: 3,
    tableNumber: 'T-03',
    source: 'qr-customer',
    status: 'placed',
    paymentStatus: 'unpaid',
    createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
    items: [
      { itemId: 'm2_Full', name: 'Kerala Parotta & Beef Roast (Full)', price: 290, quantity: 1, notes: 'Extra spicy' },
      { itemId: 'm5_Half', name: 'Kozhi Porichathu (Half)', price: 140, quantity: 1, notes: '' }
    ],
    subtotal: 430,
    tax: 21.5,
    discount: 0,
    total: 451.5,
    paymentMethod: null
  },
  {
    id: 'ORD-1003',
    orderNumber: 1003,
    tableId: 99,
    tableNumber: 'Swiggy #784',
    source: 'swiggy',
    status: 'preparing',
    paymentStatus: 'paid-online',
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    items: [
      { itemId: 'm3_Full', name: 'Karimeen Pollichathu (Full)', price: 450, quantity: 1, notes: '' },
      { itemId: 'm7_Full', name: 'Kerala Wheat Parotta (Full)', price: 60, quantity: 2, notes: '' }
    ],
    subtotal: 570,
    tax: 28.5,
    discount: 0,
    total: 598.5,
    paymentMethod: 'Swiggy Pay'
  }
];

// ================= 2. AUDIO SYNTHESIZER =================
class AudioService {
  constructor() {
    this.audioCtx = null;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playNewOrderChime() {
    try {
      this.init();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      
      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      
      osc1.start(now);
      osc1.stop(now + 0.3);

      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.15);
      gain2.gain.setValueAtTime(0.3, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      
      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      
      osc2.start(now + 0.15);
      osc2.stop(now + 0.5);

    } catch (e) {
      console.warn('Audio chime playback omitted:', e);
    }
  }

  playSuccessChime() {
    try {
      this.init();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const startTime = now + idx * 0.08;
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + 0.25);
      });
    } catch (e) {
      console.warn('Success chime playback omitted:', e);
    }
  }
}

const soundEffects = new AudioService();

// ================= 3. QR GENERATOR =================
function generateTableQRSVG(tableNumber, url, size = 260) {
  if (!url) {
    const baseUrl = window.location.origin + window.location.pathname;
    url = `${baseUrl}?table=${tableNumber.replace(/[^0-9]/g, '') || 1}`;
  }

  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&color=0F172A&bgcolor=FFFFFF&margin=10`;

  return `
    <div class="real-qr-card" style="display:inline-block; background:#FFFFFF; padding:16px; border-radius:16px; border:2px solid var(--surface-border); box-shadow:var(--shadow-md); text-align:center;">
      <div style="font-weight:800; font-size:16px; color:#0F172A; margin-bottom:8px;">MALABAR TABLE</div>
      <div style="position:relative; display:inline-block;">
        <img src="${qrApiUrl}" width="${size}" height="${size}" style="display:block; border-radius:8px;" alt="QR Code for Table ${tableNumber}" />
      </div>
      <div style="background:var(--primary); color:#FFFFFF; font-weight:800; font-size:14px; padding:6px 14px; border-radius:20px; margin-top:10px; display:inline-block;">
        SCAN TABLE ${tableNumber}
      </div>
      <div style="font-size:10px; color:#64748B; margin-top:6px; font-weight:600;">Scan with Phone Camera to Order</div>
    </div>
  `;
}

// ================= 4. STORE =================
class RestaurantStore {
  constructor() {
    this.listeners = new Set();
    try {
      this.channel = new BroadcastChannel('malabar_table_channel');
    } catch (e) {
      this.channel = { postMessage: () => {} };
    }
    
    this.theme = localStorage.getItem('malabar_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', this.theme);

    this.currentUser = this.load('malabar_user', {
      name: 'Restaurant Owner',
      role: 'owner',
      isLoggedIn: false
    });

    this.tables = this.load('malabar_tables', INITIAL_TABLES);
    this.orders = this.load('malabar_orders', INITIAL_ORDERS);
    this.menu = this.load('malabar_menu', MENU_ITEMS);

    this.receiptSettings = this.load('malabar_receipt_settings', {
      restaurantName: 'MALABAR TABLE',
      tagline: 'Fine Dining Restaurant',
      address: 'Beach Road, Calicut, Kerala - 673001',
      phone: '+91 98765 43210',
      gstin: '32ABCDE1234F1Z5',
      fssai: '11223344556677',
      footerNote: 'Thank you for dining with us! Please visit again.',
      logoUrl: ''
    });

    this.searchQuery = '';
    this.selectedCategory = 'all';
    this.activeView = this.currentUser.isLoggedIn ? (this.currentUser.role === 'owner' ? 'owner' : 'staff-ops') : 'login';
    this.customerTableId = 4;
    this.toasts = [];

    this.nextOrderNumber = this.orders.reduce((max, o) => Math.max(max, o.orderNumber || 1000), 1000) + 1;

    if (this.channel.onmessage !== undefined) {
      this.channel.onmessage = (event) => {
        if (event.data && event.data.type) {
          this.handleRemoteAction(event.data);
        }
      };
    }

    window.addEventListener('storage', (e) => {
      if (e.key === 'malabar_orders' || e.key === 'malabar_tables' || e.key === 'malabar_menu') {
        this.tables = this.load('malabar_tables', this.tables);
        this.orders = this.load('malabar_orders', this.orders);
        this.menu = this.load('malabar_menu', this.menu);
        this.listeners.forEach((listener) => listener(this));
      }
    });
  }

  load(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  save() {
    try {
      localStorage.setItem('malabar_tables', JSON.stringify(this.tables));
      localStorage.setItem('malabar_orders', JSON.stringify(this.orders));
      localStorage.setItem('malabar_menu', JSON.stringify(this.menu));
      localStorage.setItem('malabar_user', JSON.stringify(this.currentUser));
      localStorage.setItem('malabar_receipt_settings', JSON.stringify(this.receiptSettings));
      localStorage.setItem('malabar_theme', this.theme);
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(actionType = 'STATE_CHANGED', payload = null) {
    this.save();
    this.listeners.forEach((listener) => listener(this));
    if (this.channel && this.channel.postMessage) {
      try {
        this.channel.postMessage({ type: actionType, payload, timestamp: Date.now() });
      } catch (e) {}
    }
  }

  updateReceiptSettings(newSettings) {
    this.receiptSettings = { ...this.receiptSettings, ...newSettings };
    this.showToast('Billing receipt customization saved!');
    this.notify('RECEIPT_SETTINGS_UPDATED', this.receiptSettings);
  }

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', this.theme);
    this.notify('THEME_CHANGED', this.theme);
  }

  showToast(message, icon = '') {
    const toast = { id: Date.now(), message, icon };
    this.toasts.push(toast);
    this.notify('TOAST_ADDED', toast);

    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== toast.id);
      this.notify('TOAST_REMOVED');
    }, 3500);
  }

  handleRemoteAction(data) {
    this.tables = this.load('malabar_tables', this.tables);
    this.orders = this.load('malabar_orders', this.orders);
    this.menu = this.load('malabar_menu', this.menu);
    this.receiptSettings = this.load('malabar_receipt_settings', this.receiptSettings);

    if (data.type === 'NEW_ORDER') {
      soundEffects.playNewOrderChime();
      this.showToast(`New Order #${data.payload.orderNumber} (${data.payload.tableNumber}) received!`);
    } else if (data.type === 'ORDER_STATUS_UPDATED') {
      soundEffects.playSuccessChime();
      this.showToast(`Order status updated to ${data.payload.newStatus.toUpperCase()}`);
    } else if (data.type === 'PAYMENT_COMPLETE') {
      soundEffects.playSuccessChime();
      this.showToast(`Bill settled for Order #${data.payload.orderId}`);
    } else if (data.type === 'MENU_UPDATED') {
      this.showToast(`Menu catalog updated`);
    }
    
    this.listeners.forEach((listener) => listener(this));
  }

  login(role = 'admin', name = 'Restaurant Owner (Admin)') {
    this.currentUser = {
      name,
      role,
      isLoggedIn: true
    };

    if (role === 'admin' || role === 'owner') {
      this.activeView = 'admin';
    } else if (role === 'kitchen') {
      this.activeView = 'kitchen';
    } else if (role === 'customer') {
      this.activeView = 'customer';
    } else {
      this.activeView = 'staff';
    }

    this.showToast(`Welcome back, ${name}. Active Role: ${role.toUpperCase()}`);
    this.notify('AUTH_LOGIN', this.currentUser);
  }

  logout() {
    this.currentUser = {
      name: '',
      role: '',
      isLoggedIn: false
    };
    this.activeView = 'login';
    this.showToast('Logged out successfully.');
    this.notify('AUTH_LOGOUT');
  }

  setView(viewName, params = {}) {
    this.activeView = viewName;
    if (params.tableId) {
      this.customerTableId = params.tableId;
    }
    if (viewName === 'customer' && (!this.currentUser || !this.currentUser.isLoggedIn)) {
      this.currentUser = {
        name: `Customer (Table ${this.customerTableId})`,
        role: 'customer',
        isLoggedIn: true
      };
    }
    this.notify('VIEW_CHANGED', { viewName, params });
  }

  setSearchQuery(query) {
    this.searchQuery = query;
    this.notify('SEARCH_CHANGED', query);
  }

  setSelectedCategory(cat) {
    this.selectedCategory = cat;
    this.notify('CATEGORY_CHANGED', cat);
  }

  createOrder({ tableId, source, orderedBy, customerName, items, notes }) {
    const table = tableId ? this.tables.find(t => t.id === Number(tableId)) : null;
    const tableNumber = table ? table.number : (source === 'swiggy' ? 'ONLINE-SWIGGY' : 'ONLINE-ZOMATO');

    let existingOrder = table ? this.orders.find(o => o.tableId === table.id && o.paymentStatus === 'unpaid' && o.status !== 'completed') : null;

    if (existingOrder) {
      items.forEach(newItem => {
        const match = existingOrder.items.find(i => i.itemId === newItem.itemId || i.name === newItem.name);
        if (match) {
          match.quantity += newItem.quantity;
        } else {
          existingOrder.items.push({ ...newItem });
        }
      });

      existingOrder.subtotal = existingOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      existingOrder.tax = Math.round(existingOrder.subtotal * 0.05 * 100) / 100;
      existingOrder.total = existingOrder.subtotal + existingOrder.tax;
      existingOrder.status = 'placed'; // Reset status to 'placed' so KDS immediately displays ticket to Kitchen!
      existingOrder.hasNewItems = true;
      existingOrder.updatedAt = new Date().toISOString();

      if (table) {
        table.status = 'occupied';
        table.currentOrderId = existingOrder.id;
      }

      soundEffects.playNewOrderChime();
      this.showToast(`Order #${existingOrder.orderNumber} (Table ${tableNumber}) updated & dispatched to Kitchen!`, '🚀');
      this.notify('NEW_ORDER', existingOrder);
      return existingOrder;
    }

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    const total = subtotal + tax;

    const newOrder = {
      id: `ORD-${this.nextOrderNumber}`,
      orderNumber: this.nextOrderNumber,
      tableId: table ? table.id : null,
      tableNumber,
      source: source || 'dine-in',
      orderedBy: orderedBy || (source === 'qr-customer' ? 'Customer QR Scan' : 'Staff POS'),
      customerName: customerName || null,
      items: [...items],
      subtotal,
      tax,
      total,
      status: 'placed',
      hasNewItems: false,
      timestamp: new Date().toISOString(),
      elapsedMins: 0,
      paymentStatus: (source === 'swiggy' || source === 'zomato') ? 'paid-online' : 'unpaid',
      notes: notes || ''
    };

    this.nextOrderNumber++;
    this.orders.unshift(newOrder);

    if (table) {
      table.status = 'occupied';
      table.currentOrderId = newOrder.id;
    }

    soundEffects.playNewOrderChime();
    this.showToast(`Order #${newOrder.orderNumber} dispatched to Kitchen & Billing!`, '🚀');
    this.notify('NEW_ORDER', newOrder);
    return newOrder;
  }

  updateOrderItems(orderId, updatedItems) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;

    if (!updatedItems || updatedItems.length === 0) {
      if (order.tableId) {
        const table = this.tables.find(t => t.id === order.tableId);
        if (table) {
          table.status = 'available';
          table.currentOrderId = null;
        }
      }
      this.orders = this.orders.filter(o => o.id !== orderId);
      this.showToast(`Order #${order.orderNumber} cleared.`, '🗑️');
      this.notify('ORDER_DELETED', orderId);
      return;
    }

    order.items = [...updatedItems];
    order.subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    order.tax = Math.round(order.subtotal * 0.05 * 100) / 100;
    order.total = order.subtotal + order.tax;
    order.status = 'placed'; // Reset status to placed for kitchen to cook updated items
    order.hasNewItems = true;
    order.updatedAt = new Date().toISOString();

    if (order.tableId) {
      const table = this.tables.find(t => t.id === order.tableId);
      if (table) {
        table.status = 'occupied';
      }
    }

    soundEffects.playNewOrderChime();
    this.showToast(`Order #${order.orderNumber} updated and dispatched to Kitchen!`, '✏️');
    this.notify('ORDER_UPDATED', order);
  }

  updateOrderStatus(orderId, newStatus) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;

    if (newStatus === 'served') {
      if (order.source === 'swiggy' || order.source === 'zomato' || !order.tableId) {
        order.status = 'completed';
      } else {
        order.status = 'served';
      }
    } else {
      order.status = newStatus;
    }

    if (newStatus === 'ready' && order.tableId) {
      const table = this.tables.find(t => t.id === order.tableId);
      if (table && table.status === 'occupied') {
        table.status = 'bill-requested';
      }
    }

    this.showToast(`Order #${order.orderNumber} ${order.status === 'completed' ? 'Cleared & Completed' : 'Status: ' + order.status.toUpperCase()}`, '👨‍🍳');
    this.notify('ORDER_STATUS_UPDATED', { orderId, newStatus: order.status });
  }

  settleBill(orderId, paymentMethod = 'UPI') {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;

    order.status = 'paid';
    order.paymentStatus = 'paid';
    order.paymentMethod = paymentMethod;

    if (order.tableId) {
      const table = this.tables.find(t => t.id === order.tableId);
      if (table) {
        table.status = 'available';
        table.currentOrderId = null;
      }
    }

    soundEffects.playSuccessChime();
    this.showToast(`Table ${order.tableNumber} bill cleared via ${paymentMethod}!`, '💵');
    this.notify('PAYMENT_COMPLETE', { orderId, paymentMethod });
  }

  addMenuItem(itemData) {
    let category = itemData.category || 'mains';
    if (itemData.newCategory) {
      const catId = itemData.newCategory.toLowerCase().replace(/\s+/g, '-');
      if (!CATEGORIES.find(c => c.id === catId)) {
        CATEGORIES.push({ id: catId, name: itemData.newCategory, icon: 'utensils' });
      }
      category = catId;
    }

    const portions = [
      { size: 'Full', price: Number(itemData.priceFull) || 200 }
    ];
    if (itemData.priceHalf) portions.push({ size: 'Half', price: Number(itemData.priceHalf) });
    if (itemData.priceQuarter) portions.push({ size: 'Quarter', price: Number(itemData.priceQuarter) });

    const newItem = {
      id: `m_${Date.now()}`,
      name: itemData.name,
      category: category,
      price: Number(itemData.priceFull) || 200,
      portions: portions,
      isVeg: Boolean(itemData.isVeg),
      spiceLevel: Number(itemData.spiceLevel) || 1,
      description: itemData.description || 'Authentic Malabar specialty dish.',
      image: itemData.image || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
      popular: true,
      prepTime: '15 mins'
    };

    this.menu.unshift(newItem);
    soundEffects.playSuccessChime();
    this.showToast(`Added '${newItem.name}' to Menu Catalog!`, '🍲');
    this.notify('MENU_UPDATED', newItem);
    return newItem;
  }

  toggleMenuItemAvailability(itemId) {
    const item = this.menu.find(m => m.id === itemId);
    if (!item) return;
    item.available = item.available === false ? true : false;
    soundEffects.playSuccessChime();
    this.showToast(`Dish '${item.name}' marked ${item.available ? 'AVAILABLE 🟢' : 'OUT OF STOCK 🔴'}`, item.available ? '🟢' : '🔴');
    this.notify('MENU_UPDATED', item);
  }

  addTable(tableData) {
    const tableNumber = Number(tableData.number) || (this.tables.length + 1);
    const tableNumStr = tableNumber < 10 ? `T-0${tableNumber}` : `T-${tableNumber}`;

    const baseUrl = window.location.origin + window.location.pathname;
    const qrUrl = `${baseUrl}?table=${tableNumber}`;

    const newTable = {
      id: tableNumber,
      number: tableNumStr,
      seats: Number(tableData.seats) || 4,
      section: tableData.section || 'Main Dining',
      status: 'available',
      qrUrl: qrUrl,
      currentOrderId: null
    };

    this.tables.push(newTable);
    soundEffects.playSuccessChime();
    this.showToast(`Added Table ${newTable.number} with real QR Code!`, '📍');
    this.notify('TABLES_UPDATED', newTable);
    return newTable;
  }

  simulateOnlineOrder(aggregator = 'swiggy') {
    const isSwiggy = aggregator === 'swiggy';
    const sampleCustomers = [
      'Rahul Nair (Bungalow Rd)',
      'Priyanaka Menon (Marine Drive)',
      'Arun Kumar (Kakkanad)',
      'Siddharth V. (Edappally)',
      'Deepa Chandran (Vyttila)'
    ];
    const customer = sampleCustomers[Math.floor(Math.random() * sampleCustomers.length)];
    const randomItems = [
      { itemId: 'm1', name: 'Malabar Mutton Biryani', quantity: 1, price: 380, notes: 'Less spicy' },
      { itemId: 'm8', name: 'Malabar Flaky Parotta (2 Pcs)', quantity: 2, price: 60, notes: '' },
      { itemId: 'm9', name: 'Malabar Special Sulaimani Tea', quantity: 2, price: 40, notes: '' }
    ];

    return this.createOrder({
      tableId: null,
      source: isSwiggy ? 'swiggy' : 'zomato',
      customerName: `${customer} (${isSwiggy ? 'Swiggy' : 'Zomato'})`,
      items: randomItems
    });
  }

  resetDemoData() {
    this.tables = INITIAL_TABLES;
    this.orders = INITIAL_ORDERS;
    this.menu = MENU_ITEMS;
    this.save();
    this.showToast('Demo data reset to initial state.', '🔄');
    this.notify('RESET');
  }
}

const store = new RestaurantStore();
window.store = store;

// ================= 5. APP CONTROLLER =================
class App {
  constructor() {
    this.container = document.getElementById('app-root');
    this.sidebar = document.getElementById('app-sidebar');
    this.topHeader = document.getElementById('top-header');
    
    this.selectedLoginRole = 'admin';
    this.staffCart = [];
    this.staffSelectedTable = 1;
    this.billingSelectedOrder = null;
    this.selectedPaymentMethod = 'UPI';
    this.uploadedImageDataUrl = null;
    this.selectedImagePreset = 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80';
    this.uploadedReceiptLogoUrl = null;
    this.staffSubTab = 'pos';
    this.isMobileSidebarOpen = false;
    this.customerCart = [];
    this.selectedPortions = {};
    
    store.subscribe(() => this.render());

    const urlParams = new URLSearchParams(window.location.search);
    const tableParam = urlParams.get('table');
    if (tableParam) {
      const tId = Number(tableParam);
      store.login('customer', `Customer (Table ${tId})`);
      store.setView('customer', { tableId: tId });
    }

    setInterval(() => {
      const freshOrders = store.load('malabar_orders', null);
      if (freshOrders && JSON.stringify(freshOrders) !== JSON.stringify(store.orders)) {
        store.orders = freshOrders;
        store.tables = store.load('malabar_tables', store.tables);
        this.render();
      }
    }, 1500);

    this.render();
  }

  refreshLiveStatus() {
    store.orders = store.load('malabar_orders', store.orders);
    store.tables = store.load('malabar_tables', store.tables);
    store.showToast('Synced latest KDS status!', '🔄');
    this.render();
  }

  setPortion(itemId, portionSize) {
    this.selectedPortions[itemId] = portionSize;
    this.render();
  }

  toggleMobileSidebar() {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
    this.updateMobileSidebarDOM();
  }

  closeMobileSidebar() {
    this.isMobileSidebarOpen = false;
    this.updateMobileSidebarDOM();
  }

  updateMobileSidebarDOM() {
    let overlay = document.getElementById('sidebar-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'sidebar-overlay';
      overlay.className = 'sidebar-overlay';
      overlay.onclick = () => this.closeMobileSidebar();
      document.body.appendChild(overlay);
    }

    if (this.isMobileSidebarOpen) {
      this.sidebar.classList.add('mobile-open');
      overlay.classList.add('active');
    } else {
      this.sidebar.classList.remove('mobile-open');
      overlay.classList.remove('active');
    }
  }

  render() {
    const mainContent = document.querySelector('.app-main-content');
    if (store.activeView === 'customer') {
      this.sidebar.style.display = 'none';
      this.topHeader.style.display = 'flex';
      if (mainContent) {
        mainContent.style.marginLeft = '0';
        mainContent.style.width = '100%';
      }
      this.closeMobileSidebar();
      this.renderTopHeader();
      this.renderToasts();
      this.renderCustomerWebPortal();
    } else if (store.activeView === 'login' || !store.currentUser || !store.currentUser.isLoggedIn) {
      this.sidebar.style.display = 'none';
      this.topHeader.style.display = 'none';
      if (mainContent) {
        mainContent.style.marginLeft = '0';
        mainContent.style.width = '100%';
      }
      this.closeMobileSidebar();
      this.renderLoginScreen();
    } else {
      this.sidebar.style.display = 'flex';
      this.topHeader.style.display = 'flex';
      if (mainContent) {
        mainContent.style.marginLeft = '';
        mainContent.style.width = '';
      }
      
      this.renderSidebar();
      this.renderTopHeader();
      this.renderToasts();
      this.renderActiveView();
      this.updateMobileSidebarDOM();
    }
  }

  renderToasts() {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }

    toastContainer.innerHTML = store.toasts.map(t => `
      <div class="toast">
        <span>${t.icon}</span>
        <span>${t.message}</span>
      </div>
    `).join('');
  }

  renderLoginScreen() {
    this.container.innerHTML = `
      <div class="login-wrapper">
        <div class="login-card-std" style="max-width:440px;">
          <div style="text-align:center; margin-bottom:24px;">
            <div style="width:48px; height:48px; background:var(--primary); color:#fff; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; margin:0 auto 12px auto; font-weight:800;">MT</div>
            <h2 style="font-size:22px; font-weight:800;">Malabar Table POS</h2>
            <p style="color:var(--text-muted); font-size:13px; margin-top:4px;">Select Dashboard Workspace to Continue</p>
          </div>

          <form onsubmit="window.app.handleLoginSubmit(event)">
            <div style="margin-bottom:20px;">
              <label style="font-size:12px; font-weight:700; color:var(--text-dark); display:block; margin-bottom:10px;">Select Dashboard Role:</label>
              <div style="display:flex; flex-direction:column; gap:10px;">
                
                <div class="role-choice-card ${this.selectedLoginRole === 'admin' ? 'selected' : ''}" style="display:flex; align-items:center; gap:12px; text-align:left; padding:14px;" onclick="window.app.selectLoginRole('admin')">
                  <div>
                    <strong style="font-size:14px; display:block;">1. Admin Dashboard</strong>
                    <p style="font-size:11px; color:var(--text-muted);">Analytics, Menu Catalog, Add Tables & QR Stickers</p>
                  </div>
                </div>

                <div class="role-choice-card ${this.selectedLoginRole === 'staff' ? 'selected' : ''}" style="display:flex; align-items:center; gap:12px; text-align:left; padding:14px;" onclick="window.app.selectLoginRole('staff')">
                  <div>
                    <strong style="font-size:14px; display:block;">2. Staff POS & Billing Counter</strong>
                    <p style="font-size:11px; color:var(--text-muted);">Floor Map, Web POS Terminal & Cashier Billing</p>
                  </div>
                </div>

                <div class="role-choice-card ${this.selectedLoginRole === 'kitchen' ? 'selected' : ''}" style="display:flex; align-items:center; gap:12px; text-align:left; padding:14px;" onclick="window.app.selectLoginRole('kitchen')">
                  <div>
                    <strong style="font-size:14px; display:block;">3. Kitchen KDS Display</strong>
                    <p style="font-size:11px; color:var(--text-muted);">Live Order Cooking Cards & Kitchen Queue</p>
                  </div>
                </div>

              </div>
            </div>

            <div class="form-group-std">
              <label>User Name</label>
              <input type="text" id="login-username" value="${this.selectedLoginRole === 'admin' ? 'Restaurant Owner (Admin)' : this.selectedLoginRole === 'staff' ? 'Rahul V. (Staff & Cashier)' : 'Chef Master (Kitchen Cook)'}" required />
            </div>

            ${this.selectedLoginRole === 'admin' ? `
              <div class="form-group-std">
                <label>Admin Passcode</label>
                <input type="password" id="login-password" value="owner123" required />
                <span style="font-size:11px; color:var(--primary); font-weight:600;">(Passcode: owner123)</span>
              </div>
            ` : ''}

            <button type="submit" class="btn-primary" style="width:100%; justify-content:center; padding:12px; margin-top:8px;">
              Open ${this.selectedLoginRole.toUpperCase()} Dashboard
            </button>
          </form>

          <div style="margin-top:20px; border-top:1px solid var(--surface-border); padding-top:16px; text-align:center;">
            <p style="font-size:12px; color:var(--text-muted); margin-bottom:8px;">Customer QR Self-Order View</p>
            <button class="btn-enterprise" style="width:100%; justify-content:center;" onclick="window.store.login('customer', 'Customer QR User')">
              View Customer Ordering Portal
            </button>
          </div>
        </div>
      </div>
    `;
  }

  selectLoginRole(role) {
    this.selectedLoginRole = role;
    this.render();
  }

  handleLoginSubmit(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value || 'User';
    store.login(this.selectedLoginRole, username);
  }

  renderSidebar() {
    const role = store.currentUser.role;

    const allNavItems = [
      { id: 'admin', label: 'Admin Dashboard', roles: ['admin'] },
      { id: 'staff', label: 'Staff POS & Billing', roles: ['admin', 'staff'] },
      { id: 'kitchen', label: 'Kitchen KDS Screen', roles: ['admin', 'staff', 'kitchen'] },
      { id: 'customer', label: 'Customer Portal', roles: ['admin', 'staff', 'kitchen', 'customer'] }
    ];

    const visibleItems = allNavItems.filter(item => item.roles.includes(role));

    this.sidebar.innerHTML = `
      <div>
        <a href="#" class="sidebar-brand" onclick="return false;">
          <div class="sidebar-brand-logo">MT</div>
          <div class="sidebar-brand-info">
            <h1>Malabar Table</h1>
            <p style="font-size:10px; color:var(--primary); font-weight:700;">${role.toUpperCase()} DASHBOARD</p>
          </div>
        </a>

        <div class="sidebar-nav-group">
          <div class="sidebar-label">Workspaces</div>
          ${visibleItems.map(item => `
            <button class="nav-link ${store.activeView === item.id ? 'active' : ''}" onclick="window.app.switchView('${item.id}')">
              <span>${item.label}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <div>
        <div class="sidebar-user-box" style="margin-bottom:10px;">
          <div>
            <div style="font-size:12px; font-weight:800;">${store.currentUser.name}</div>
            <div style="font-size:10px; color:var(--primary); font-weight:700;">${role.toUpperCase()} USER</div>
          </div>
        </div>

        <button class="btn-enterprise" style="width:100%; justify-content:center; color:var(--danger); border-color:var(--danger); font-weight:700;" onclick="window.store.logout()">
          Logout
        </button>
      </div>
    `;
  }

  renderTopHeader() {
    if (store.activeView === 'customer') {
      const table = store.tables.find(t => t.id === store.customerTableId) || store.tables[3];
      this.topHeader.innerHTML = `
        <div class="header-left" style="display:flex; align-items:center; gap:12px;">
          <div style="width:36px; height:36px; background:var(--primary); color:#FFF; border-radius:10px; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:14px;">MT</div>
          <div>
            <h3 style="font-size:15px; font-weight:800; margin:0; line-height:1.2;">Malabar Table</h3>
            <span style="font-size:11px; color:var(--primary); font-weight:700;">Customer Self-Order • Table ${table.number}</span>
          </div>
        </div>

        <div class="header-right-actions">
          ${store.currentUser && store.currentUser.isLoggedIn && store.currentUser.role !== 'customer' ? `
            <button class="btn-enterprise" style="color:var(--primary); border-color:var(--primary); font-weight:700;" onclick="window.app.switchView('${store.currentUser.role === 'admin' ? 'admin' : 'staff'}')">
              ← Back to ${store.currentUser.role === 'admin' ? 'Admin' : 'Staff'} Dashboard
            </button>
          ` : ''}
          
          <button class="btn-enterprise" title="Toggle Theme" onclick="window.store.toggleTheme()">
            ${store.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      `;
      return;
    }

    this.topHeader.innerHTML = `
      <div class="header-left">
        <button class="mobile-menu-btn" onclick="window.app.toggleMobileSidebar()" aria-label="Toggle Navigation Menu">
          ☰
        </button>
        <div class="header-search">
          <input type="text" placeholder="Search orders, dishes, table numbers..." value="${store.searchQuery}" oninput="window.store.setSearchQuery(this.value)" />
        </div>
      </div>

      <div class="header-right-actions">
        <button class="btn-enterprise" style="color:var(--primary); border-color:var(--primary);" onclick="window.app.switchView('customer')">
          <span class="btn-text">Customer Portal</span>
        </button>

        <button class="btn-enterprise" style="color:var(--swiggy-orange);" onclick="window.app.openOnlineOrderModal('swiggy')">
          <span class="btn-text">+ Swiggy</span>
        </button>
        <button class="btn-enterprise" style="color:var(--zomato-red);" onclick="window.app.openOnlineOrderModal('zomato')">
          <span class="btn-text">+ Zomato</span>
        </button>

        <button class="btn-enterprise" title="Toggle Theme" onclick="window.store.toggleTheme()">
          ${store.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>

        <button class="btn-enterprise" style="color:var(--danger); border-color:var(--danger); font-weight:700;" onclick="window.store.logout()">
          🔒
        </button>
      </div>
    `;
  }

  switchView(viewId) {
    this.closeMobileSidebar();
    store.setView(viewId);
  }

  renderActiveView() {
    switch (store.activeView) {
      case 'admin':
      case 'owner':
        this.renderAdminDashboard();
        break;
      case 'staff':
      case 'staff-ops':
        this.renderStaffDashboard();
        break;
      case 'kitchen':
        this.renderKitchenDashboard();
        break;
      case 'customer':
        this.renderCustomerWebPortal();
        break;
      default:
        this.renderAdminDashboard();
    }
  }

  renderAdminDashboard() {
    const totalSales = store.orders.filter(o => o.paymentStatus === 'paid' || o.paymentStatus === 'paid-online')
      .reduce((sum, o) => sum + o.total, 0);

    const dineInRevenue = store.orders.filter(o => o.source === 'dine-in' || o.source === 'staff-mobile' || o.source === 'qr-customer')
      .reduce((sum, o) => sum + o.total, 0);
    const swiggyRevenue = store.orders.filter(o => o.source === 'swiggy')
      .reduce((sum, o) => sum + o.total, 0);
    const zomatoRevenue = store.orders.filter(o => o.source === 'zomato')
      .reduce((sum, o) => sum + o.total, 0);

    const estimatedNetProfit = Math.round(totalSales * 0.32);

    this.container.innerHTML = `
      <div class="view-container">
        <div class="owner-banner">
          <div>
            <h2 style="font-size:22px;">Admin Executive Dashboard</h2>
            <p style="color:var(--text-muted); font-size:13px; margin-top:2px;">Business Analytics, Financial Margins, Table Management & QR Codes</p>
          </div>
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <button class="btn-enterprise" style="border-color:var(--primary); color:var(--primary); font-weight:700;" onclick="window.app.scrollToReceiptSettings()">
              Edit Billing Settings
            </button>
            <button class="btn-enterprise" style="border-color:var(--primary); color:var(--primary); font-weight:700;" onclick="window.app.openAddTableModal()">
              Add New Table
            </button>
            <button class="btn-primary" style="background:#D97706;" onclick="window.app.openAddMenuModal()">
              Add New Menu Dish
            </button>
          </div>
        </div>

        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-top">
              <div class="metric-lbl">Total Gross Revenue</div>
            </div>
            <div class="metric-val">₹${totalSales.toLocaleString('en-IN')}</div>
          </div>

          <div class="metric-card">
            <div class="metric-top">
              <div class="metric-lbl">Est. Net Profit (32%)</div>
            </div>
            <div class="metric-val" style="color:var(--success);">₹${estimatedNetProfit.toLocaleString('en-IN')}</div>
          </div>

          <div class="metric-card">
            <div class="metric-top">
              <div class="metric-lbl">Active Tables & QR</div>
            </div>
            <div class="metric-val">${store.tables.length} Tables</div>
          </div>

          <div class="metric-card">
            <div class="metric-top">
              <div class="metric-lbl">Active Menu Catalog</div>
            </div>
            <div class="metric-val">${store.menu.length} Dishes</div>
          </div>
        </div>

        <div class="dashboard-grid-2col">
          <div>
            <div class="panel-card">
              <div class="section-header">
                <div class="panel-title">Table QR Code Generator (${store.tables.length} Tables)</div>
                <button class="btn-enterprise" onclick="window.app.openAddTableModal()">Add New Table</button>
              </div>

              <div class="tables-floor-grid">
                ${store.tables.map(t => `
                  <div class="table-card-std ${t.status}">
                    <div class="table-title">${t.number}</div>
                    <div style="font-size:11px; color:var(--text-muted); font-weight:600;">${t.seats} Seats • ${t.section || 'Main'}</div>
                    <button class="table-qr-btn" onclick="window.app.openQRModal(${t.id})">Real QR Sticker</button>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="panel-card">
              <div class="section-header">
                <div class="panel-title">Admin Menu Management (${store.menu.length} Dishes)</div>
                <button class="btn-enterprise" onclick="window.app.openAddMenuModal()">Add Dish</button>
              </div>

              <table class="data-table">
                <thead>
                  <tr>
                    <th>Dish</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Pricing</th>
                    <th>Live Availability</th>
                  </tr>
                </thead>
                <tbody>
                  ${store.menu.map(m => `
                    <tr>
                      <td style="width:48px;"><img src="${m.image}" style="width:40px; height:40px; border-radius:6px; object-fit:cover;" alt="${m.name}" /></td>
                      <td><strong>${m.name}</strong></td>
                      <td>${m.category.toUpperCase()}</td>
                      <td>
                        ${m.portions ? m.portions.map(p => `<span style="font-size:11px; padding:2px 6px; border-radius:4px; background:var(--bg-main); border:1px solid var(--surface-border); margin-right:4px;">${p.size}: <strong>₹${p.price}</strong></span>`).join('') : `<strong style="color:var(--primary)">₹${m.price}</strong>`}
                      </td>
                      <td>
                        <button class="btn-enterprise" style="padding:4px 10px; font-size:11px; font-weight:800; color:${m.available === false ? 'var(--danger)' : 'var(--success)'}; border-color:${m.available === false ? 'var(--danger)' : 'var(--success)'};" onclick="window.store.toggleMenuItemAvailability('${m.id}')">
                          ${m.available === false ? 'Out of Stock' : 'In Stock'}
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div class="panel-card" id="billing-settings-panel" style="border: 2px solid var(--primary);">
              <div class="section-header" style="margin-bottom:14px;">
                <div class="panel-title">Billing & Receipt Customization</div>
                <span class="status-tag tag-available" style="font-size:11px;">Live Branding</span>
              </div>
              
              <form onsubmit="window.app.handleReceiptSettingsSubmit(event)">
                <div class="form-group-std">
                  <label>Restaurant Name</label>
                  <input type="text" id="rc-restaurant-name" value="${store.receiptSettings.restaurantName || ''}" required placeholder="MALABAR TABLE" />
                </div>

                <div class="form-group-std">
                  <label>Tagline / Subtitle</label>
                  <input type="text" id="rc-tagline" value="${store.receiptSettings.tagline || ''}" placeholder="Fine Dining Restaurant" />
                </div>

                <div class="form-group-std">
                  <label>Address / Location</label>
                  <input type="text" id="rc-address" value="${store.receiptSettings.address || ''}" placeholder="Beach Road, Calicut, Kerala" />
                </div>

                <div class="form-group-std">
                  <label>Contact Phone Number</label>
                  <input type="text" id="rc-phone" value="${store.receiptSettings.phone || ''}" placeholder="+91 98765 43210" />
                </div>

                <div class="form-group-std">
                  <label>GSTIN Number</label>
                  <input type="text" id="rc-gstin" value="${store.receiptSettings.gstin || ''}" placeholder="32ABCDE1234F1Z5" />
                </div>

                <div class="form-group-std">
                  <label>Logo Image (Upload File from System or Paste URL)</label>
                  
                  <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
                    <input type="file" id="rc-logo-file-input" accept="image/*" style="display:none;" onchange="window.app.handleReceiptLogoUpload(event)" />
                    <button type="button" class="btn-enterprise" style="flex:1; justify-content:center;" onclick="document.getElementById('rc-logo-file-input').click()">
                      📁 Browse & Upload Logo File...
                    </button>
                  </div>

                  <div id="rc-logo-upload-preview" style="${store.receiptSettings.logoUrl ? 'display:block;' : 'display:none;'} margin-bottom:8px; text-align:center;">
                    <img id="rc-logo-preview-img" src="${store.receiptSettings.logoUrl || ''}" style="max-height:80px; border-radius:6px; border:2px solid var(--primary); object-fit:contain; background:#fff; padding:4px;" alt="Logo Preview" />
                    <p style="font-size:11px; color:var(--success); font-weight:700; margin-top:2px;">✅ Receipt Logo Active!</p>
                  </div>

                  <input type="url" id="rc-logo-url" value="${store.receiptSettings.logoUrl || ''}" placeholder="Or paste image URL" />
                </div>

                <div class="form-group-std">
                  <label>Thermal Receipt Footer Greeting</label>
                  <textarea id="rc-footer-note" rows="2" style="width:100%; padding:8px; border-radius:8px; border:1px solid var(--surface-border); background:var(--bg-main); color:var(--text-dark); font-family:inherit; font-size:12px;">${store.receiptSettings.footerNote || ''}</textarea>
                </div>

                <button type="submit" class="btn-primary" style="width:100%; justify-content:center; padding:11px; margin-top:8px;">
                  Save Receipt Settings
                </button>
              </form>
            </div>

            <div class="panel-card" style="margin-top:20px;">
              <div class="panel-title">Revenue by Channel</div>
              <div style="display:flex; flex-direction:column; gap:12px;">
                <div class="ranking-item">
                  <span>Dine-in Revenue</span>
                  <strong>₹${dineInRevenue}</strong>
                </div>
                <div class="ranking-item">
                  <span style="color:var(--swiggy-orange)">Swiggy Revenue</span>
                  <strong>₹${swiggyRevenue}</strong>
                </div>
                <div class="ranking-item">
                  <span style="color:var(--zomato-red)">Zomato Revenue</span>
                  <strong>₹${zomatoRevenue}</strong>
                </div>
              </div>
            </div>

            <div class="panel-card">
              <div class="panel-title">Live Orders Task Monitor</div>
              <div class="orders-list">
                ${store.orders.slice(0, 5).map(o => `
                  <div class="order-card ${o.source}" style="padding:12px;">
                    <div>
                      <div style="display:flex; align-items:center; gap:6px; margin-bottom:2px;">
                        <strong style="font-size:13px;">#${o.orderNumber} - ${o.tableNumber}</strong>
                        <span class="source-tag ${o.source === 'qr-customer' ? 'tag-qr-customer' : o.source === 'swiggy' ? 'tag-swiggy' : o.source === 'zomato' ? 'tag-zomato' : 'tag-dinein'}">
                          ${o.source === 'qr-customer' ? 'QR Self-Order' : o.source === 'swiggy' ? 'Swiggy' : o.source === 'zomato' ? 'Zomato' : 'Staff POS'}
                        </span>
                      </div>
                      <p style="font-size:11px; color:var(--text-muted);">${o.items.length} items • ₹${o.total}</p>
                    </div>
                    <span class="status-tag ${o.status === 'ready' ? 'tag-available' : 'tag-occupied'}">${o.status}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  handleReceiptLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.uploadedReceiptLogoUrl = e.target.result;
      const urlInput = document.getElementById('rc-logo-url');
      if (urlInput) urlInput.value = this.uploadedReceiptLogoUrl;

      const previewBox = document.getElementById('rc-logo-upload-preview');
      const previewImgTag = document.getElementById('rc-logo-preview-img');
      if (previewBox && previewImgTag) {
        previewImgTag.src = this.uploadedReceiptLogoUrl;
        previewBox.style.display = 'block';
      }
    };
    reader.readAsDataURL(file);
  }

  handleReceiptSettingsSubmit(e) {
    e.preventDefault();
    const restaurantName = document.getElementById('rc-restaurant-name').value;
    const tagline = document.getElementById('rc-tagline').value;
    const address = document.getElementById('rc-address').value;
    const phone = document.getElementById('rc-phone').value;
    const gstin = document.getElementById('rc-gstin').value;
    const logoUrl = this.uploadedReceiptLogoUrl || document.getElementById('rc-logo-url').value;
    const footerNote = document.getElementById('rc-footer-note').value;

    store.updateReceiptSettings({
      restaurantName,
      tagline,
      address,
      phone,
      gstin,
      logoUrl,
      footerNote
    });
  }

  scrollToReceiptSettings() {
    const el = document.getElementById('billing-settings-panel');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      el.style.boxShadow = '0 0 0 4px var(--primary)';
      setTimeout(() => el.style.boxShadow = '', 2500);
    }
  }

  openAddTableModal() {
    const nextNum = store.tables.length + 1;
    const modalHtml = `
      <div class="modal-overlay" id="add-table-modal">
        <div class="modal-card" style="max-width:400px;">
          <button class="modal-close" onclick="document.getElementById('add-table-modal').remove()">✕</button>
          <h3 style="font-size:20px; margin-bottom:4px;">➕ Add New Restaurant Table</h3>
          <p style="color:var(--text-muted); font-size:13px; margin-bottom:16px;">Generates unique real scannable QR Code</p>

          <form onsubmit="window.app.handleAddTableSubmit(event)">
            <div class="form-group-std">
              <label>Table Number</label>
              <input type="number" id="new-table-num" value="${nextNum}" required />
            </div>

            <div class="form-group-std">
              <label>Seat Capacity</label>
              <select id="new-table-seats">
                <option value="2">👥 2 Seats</option>
                <option value="4" selected>👥 4 Seats</option>
                <option value="6">👥 6 Seats</option>
                <option value="8">👥 8 Family Seats</option>
              </select>
            </div>

            <div class="form-group-std">
              <label>Section / Dining Area</label>
              <select id="new-table-section">
                <option value="Main Hall" selected>Main Hall Dining</option>
                <option value="AC Family Section">AC Family Section</option>
                <option value="Rooftop Garden">Rooftop Garden</option>
                <option value="Outdoor Terrace">Outdoor Terrace</option>
              </select>
            </div>

            <button type="submit" class="btn-primary" style="width:100%; justify-content:center; padding:11px;">
              <span>✅</span> Add Table & Generate Real QR Code
            </button>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

  handleAddTableSubmit(e) {
    e.preventDefault();
    const number = document.getElementById('new-table-num').value;
    const seats = document.getElementById('new-table-seats').value;
    const section = document.getElementById('new-table-section').value;

    store.addTable({ number, seats, section });
    const modal = document.getElementById('add-table-modal');
    if (modal) modal.remove();
  }

  renderStaffDashboard() {
    const activeTablesCount = store.tables.filter(t => t.status === 'occupied' || t.status === 'bill-requested').length;
    const unpaidOrders = store.orders.filter(o => o.paymentStatus === 'unpaid');
    const selectedOrder = this.billingSelectedOrder || unpaidOrders[0];

    const filteredMenu = store.menu.filter(m => {
      if (store.selectedCategory !== 'all' && m.category !== store.selectedCategory) return false;
      if (store.searchQuery) {
        return m.name.toLowerCase().includes(store.searchQuery.toLowerCase());
      }
      return true;
    });

    const cartTotal = this.staffCart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const cartTax = Math.round(cartTotal * 0.05 * 100) / 100;
    const grandTotal = cartTotal + cartTax;

    this.container.innerHTML = `
      <div class="view-container">
        <div style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom:20px;">
          <button class="btn-enterprise ${this.staffSubTab === 'pos' ? 'btn-primary' : ''}" onclick="window.app.setStaffSubTab('pos')">
            💻 Web POS Terminal
          </button>
          <button class="btn-enterprise ${this.staffSubTab === 'floor' ? 'btn-primary' : ''}" onclick="window.app.setStaffSubTab('floor')">
            📍 Floor Map (${activeTablesCount}/${store.tables.length})
          </button>
          <button class="btn-enterprise ${this.staffSubTab === 'billing' ? 'btn-primary' : ''}" onclick="window.app.setStaffSubTab('billing')">
            💳 Cashier Billing (${unpaidOrders.length} Unpaid)
          </button>
        </div>

        ${this.staffSubTab === 'pos' ? `
          <div class="web-pos-grid">
            <div class="panel-card">
              <div class="menu-categories">
                ${CATEGORIES.map(cat => `
                  <button class="cat-chip ${store.selectedCategory === cat.id ? 'active' : ''}" onclick="window.store.setSelectedCategory('${cat.id}')">
                    ${cat.name}
                  </button>
                `).join('')}
              </div>

              <div class="web-menu-grid">
                ${filteredMenu.map(item => {
                  const activePortion = this.selectedPortions[item.id] || (item.portions ? item.portions[0].size : null);
                  let price = item.price;
                  if (item.portions && activePortion) {
                    const pObj = item.portions.find(p => p.size === activePortion) || item.portions[0];
                    price = pObj.price;
                  }

                  const cartItemId = item.portions ? `${item.id}_${activePortion}` : item.id;
                  const cartEntry = this.staffCart.find(c => c.itemId === cartItemId);
                  const qty = cartEntry ? cartEntry.quantity : 0;

                  return `
                    <div class="web-menu-card">
                      <div>
                        <img src="${item.image}" class="web-menu-img" alt="${item.name}" />
                        <div class="web-menu-info">
                          <h5>${item.name}</h5>
                          <p>${item.description}</p>

                          ${item.portions ? `
                            <div style="display:flex; gap:4px; margin-top:8px; flex-wrap:wrap;">
                              ${item.portions.map(p => `
                                <button class="btn-enterprise" style="padding:3px 7px; font-size:10px; font-weight:800; border-radius:12px; ${activePortion === p.size ? 'background:var(--primary); color:#FFF; border-color:var(--primary);' : ''}" onclick="window.app.setPortion('${item.id}', '${p.size}')">
                                  ${p.size} ₹${p.price}
                                </button>
                              `).join('')}
                            </div>
                          ` : ''}
                        </div>
                      </div>

                      <div class="web-menu-footer" style="margin-top:8px;">
                        <div>
                          <div class="menu-price">₹${price}</div>
                        </div>

                        ${qty > 0 ? `
                          <div class="counter-stepper">
                            <button class="counter-btn-std" onclick="window.app.updateStaffCartQty('${item.id}', -1, '${activePortion}')">-</button>
                            <span style="font-weight:800; padding:0 8px;">${qty}</span>
                            <button class="counter-btn-std" onclick="window.app.updateStaffCartQty('${item.id}', 1, '${activePortion}')">+</button>
                          </div>
                        ` : `
                          <button class="add-cart-btn" onclick="window.app.updateStaffCartQty('${item.id}', 1, '${activePortion}')">+ Add ${item.portions ? `(${activePortion})` : ''}</button>
                        `}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <div class="web-pos-cart-panel">
              <div>
                <div style="padding-bottom:14px; border-bottom:1px solid var(--surface-border); margin-bottom:14px; display:flex; align-items:center; justify-content:space-between;">
                  <h3>Current Order</h3>
                  <select id="staff-table-select" style="background:var(--primary); color:#fff; border:none; padding:7px 12px; border-radius:8px; font-weight:800;" onchange="window.app.staffSelectedTable = Number(this.value); window.app.render();">
                    ${store.tables.map(t => `<option value="${t.id}" ${t.id === this.staffSelectedTable ? 'selected' : ''}>Table ${t.number}</option>`).join('')}
                  </select>
                </div>

                ${(() => {
                  const activeTableOrder = store.orders.find(o => o.tableId === this.staffSelectedTable && o.paymentStatus === 'unpaid' && o.status !== 'completed');
                  if (!activeTableOrder) return '';
                  return `
                    <div style="background:var(--primary-light); border:1px solid var(--primary); padding:10px 12px; border-radius:10px; margin-bottom:12px;">
                      <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                          <strong style="font-size:12px; color:var(--primary); display:block;">Active Running Order #${activeTableOrder.orderNumber}</strong>
                          <span style="font-size:11px; color:var(--text-muted);">${activeTableOrder.items.length} items in kitchen • ₹${activeTableOrder.total}</span>
                        </div>
                        <button class="btn-enterprise" style="padding:4px 8px; font-size:11px; font-weight:800; color:var(--primary); border-color:var(--primary);" onclick="window.app.openEditOrderModal('${activeTableOrder.id}')">
                          ✏️ Edit Order
                        </button>
                      </div>
                    </div>
                  `;
                })()}

                <div class="orders-list" style="max-height:300px; overflow-y:auto;">
                  ${this.staffCart.length === 0 ? '<p style="color:var(--text-muted); font-size:13px; text-align:center; padding:30px 0;">Cart is empty.<br/><span style="font-size:11px;">Select dishes from menu to add to table order.</span></p>' : ''}
                  ${this.staffCart.map(item => `
                    <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px dashed var(--surface-border);">
                      <div>
                        <strong style="font-size:13px;">${item.name}</strong>
                        <p style="font-size:11px; color:var(--text-muted);">₹${item.price} each</p>
                      </div>
                      <div style="display:flex; align-items:center; gap:8px;">
                        <div class="counter-stepper">
                          <button class="counter-btn-std" onclick="window.app.updateStaffCartQty('${item.itemId}', -1)">-</button>
                          <span style="font-weight:800; padding:0 6px;">${item.quantity}</span>
                          <button class="counter-btn-std" onclick="window.app.updateStaffCartQty('${item.itemId}', 1)">+</button>
                        </div>
                        <span style="font-weight:800; font-size:14px; min-width:50px; text-align:right;">₹${item.price * item.quantity}</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div style="border-top:1px solid var(--surface-border); padding-top:14px; margin-top:14px;">
                <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:6px; color:var(--text-muted);">
                  <span>Subtotal</span>
                  <span>₹${cartTotal}</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:12px; color:var(--text-muted);">
                  <span>GST (5%)</span>
                  <span>₹${cartTax}</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:18px; font-weight:800; color:var(--primary); margin-bottom:14px;">
                  <span>Total Amount</span>
                  <span>₹${grandTotal}</span>
                </div>

                <button class="btn-primary" style="width:100%; justify-content:center; padding:11px;" onclick="window.app.submitStaffOrder()">
                  🚀 Dispatch Order to Kitchen
                </button>
              </div>
            </div>
          </div>
        ` : this.staffSubTab === 'floor' ? `
          <div class="panel-card">
            <div class="section-header">
              <div class="panel-title">Restaurant Floor Map (${store.tables.length} Tables)</div>
              <div style="display:flex; gap:12px;">
                <span class="status-tag tag-available">Free: ${store.tables.length - activeTablesCount}</span>
                <span class="status-tag tag-occupied">Occupied: ${activeTablesCount}</span>
              </div>
            </div>

            <div class="tables-floor-grid">
              ${store.tables.map(t => {
                const tableOrder = store.orders.find(o => o.tableId === t.id && o.paymentStatus === 'unpaid' && o.status !== 'completed');
                return `
                  <div class="table-card-std ${t.status}">
                    <div class="table-title">${t.number}</div>
                    <div style="font-size:12px; color:var(--text-muted); font-weight:600;">${t.seats} Seats</div>
                    <span class="status-tag ${t.status === 'available' ? 'tag-available' : t.status === 'occupied' ? 'tag-occupied' : 'tag-bill'}">
                      ${t.status.toUpperCase()}
                    </span>
                    <div style="display:flex; flex-direction:column; gap:4px; width:100%; margin-top:8px;">
                      <button class="table-qr-btn" onclick="window.app.openStaffOrderForTable(${t.id})">➕ ${tableOrder ? 'Add Items' : 'Take Order'}</button>
                      ${tableOrder ? `
                        <button class="table-qr-btn" style="background:var(--blue); color:#FFF;" onclick="window.app.openEditOrderModal('${tableOrder.id}')">✏️ Edit Order</button>
                      ` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : `
          <div style="display:grid; grid-template-columns: 340px 1fr; gap:20px;">
            <div class="panel-card">
              <h3 style="font-size:15px; margin-bottom:14px;">Active Unpaid Bills (${unpaidOrders.length})</h3>
              <div class="orders-list">
                ${unpaidOrders.length === 0 ? '<p style="color:var(--text-muted); font-size:13px; text-align:center; padding:40px 0;">No pending bills.</p>' : ''}
                ${unpaidOrders.map(o => `
                  <div class="order-card ${o.source} ${selectedOrder && selectedOrder.id === o.id ? 'dine-in' : ''}" 
                       style="cursor:pointer;"
                       onclick="window.app.selectBillingOrder('${o.id}')">
                    <div style="width:100%;">
                      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:2px;">
                        <div style="display:flex; align-items:center; gap:6px;">
                          <h4 style="font-size:14px;">Table ${o.tableNumber}</h4>
                          <span class="source-tag ${o.source === 'qr-customer' ? 'tag-qr-customer' : o.source === 'swiggy' ? 'tag-swiggy' : o.source === 'zomato' ? 'tag-zomato' : 'tag-dinein'}">
                            ${o.source === 'qr-customer' ? 'QR Self-Order' : o.source === 'swiggy' ? 'Swiggy' : o.source === 'zomato' ? 'Zomato' : 'Staff POS'}
                          </span>
                        </div>
                        <button class="btn-enterprise" style="padding:2px 8px; font-size:11px; color:var(--primary); border-color:var(--primary);" onclick="event.stopPropagation(); window.app.openEditOrderModal('${o.id}')">
                          ✏️ Edit
                        </button>
                      </div>
                      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
                        <p style="font-size:11px; color:var(--text-muted);">${o.items.length} items • #${o.orderNumber}</p>
                        <div style="font-weight:800; font-size:15px; color:var(--primary);">₹${o.total}</div>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div>
              ${!selectedOrder ? `<div class="panel-card" style="text-align:center; padding:60px;"><p style="color:var(--text-muted);">Select an order from the left queue to generate thermal bill.</p></div>` : `
                <div style="display:grid; grid-template-columns: 1fr 340px; gap:20px;">
                  <div class="receipt-paper">
                    <div class="receipt-header">
                      ${store.receiptSettings.logoUrl ? `<img src="${store.receiptSettings.logoUrl}" style="max-height:48px; margin:0 auto 8px auto; display:block; object-fit:contain;" alt="Logo" />` : ''}
                      <h2>${store.receiptSettings.restaurantName || 'MALABAR TABLE'}</h2>
                      <p style="font-size:11px; font-weight:700;">${store.receiptSettings.tagline || 'Fine Dining Restaurant'}</p>
                      ${store.receiptSettings.address ? `<p style="font-size:10px; color:var(--text-muted); margin-top:2px;">${store.receiptSettings.address}</p>` : ''}
                      ${store.receiptSettings.phone ? `<p style="font-size:10px; color:var(--text-muted);">Ph: ${store.receiptSettings.phone}</p>` : ''}
                      ${store.receiptSettings.gstin ? `<p style="font-size:10px; color:var(--text-muted); font-weight:600;">GSTIN: ${store.receiptSettings.gstin}</p>` : ''}
                    </div>

                    <div class="receipt-row">
                      <span>Order #: ${selectedOrder.orderNumber}</span>
                      <span>Table: ${selectedOrder.tableNumber}</span>
                    </div>

                    <div class="receipt-divider"></div>

                    ${selectedOrder.items.map(item => `
                      <div class="receipt-row">
                        <span>${item.quantity}x ${item.name}</span>
                        <span>₹${item.price * item.quantity}</span>
                      </div>
                    `).join('')}

                    <div class="receipt-divider"></div>

                    <div class="receipt-row">
                      <span>Subtotal:</span>
                      <span>₹${selectedOrder.subtotal}</span>
                    </div>
                    <div class="receipt-row">
                      <span>GST (5%):</span>
                      <span>₹${selectedOrder.tax}</span>
                    </div>

                    <div class="receipt-total receipt-row">
                      <span>TOTAL:</span>
                      <span>₹${selectedOrder.total}</span>
                    </div>

                    ${store.receiptSettings.footerNote ? `
                      <div style="text-align:center; font-size:10px; margin-top:12px; border-top:1px dashed var(--surface-border); padding-top:8px; color:var(--text-muted); font-weight:600;">
                        ${store.receiptSettings.footerNote}
                      </div>
                    ` : ''}
                  </div>

                  <div class="panel-card">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                      <h3 style="font-size:15px;">Settle Payment</h3>
                      <button class="btn-enterprise" style="padding:4px 8px; font-size:11px; color:var(--primary); border-color:var(--primary);" onclick="window.app.openEditOrderModal('${selectedOrder.id}')">
                        ✏️ Edit Items
                      </button>
                    </div>
                    
                    <div style="margin-bottom:16px;">
                      <label style="font-size:12px; font-weight:700; color:var(--text-muted); display:block; margin-bottom:6px;">Select Payment Method:</label>
                      <div style="display:flex; flex-direction:column; gap:8px;">
                        <button class="btn-enterprise ${this.selectedPaymentMethod === 'UPI' ? 'btn-primary' : ''}" style="justify-content:center;" onclick="window.app.setPaymentMethod('UPI')">UPI / QR Code</button>
                        <button class="btn-enterprise ${this.selectedPaymentMethod === 'Cash' ? 'btn-primary' : ''}" style="justify-content:center;" onclick="window.app.setPaymentMethod('Cash')">Cash Register</button>
                        <button class="btn-enterprise ${this.selectedPaymentMethod === 'Card' ? 'btn-primary' : ''}" style="justify-content:center;" onclick="window.app.setPaymentMethod('Card')">Credit / Debit Card</button>
                      </div>
                    </div>

                    <button class="btn-primary" style="width:100%; justify-content:center; padding:11px;" onclick="window.app.payOrder('${selectedOrder.id}')">
                      Complete ₹${selectedOrder.total} & Clear Table
                    </button>
                  </div>
                </div>
              `}
            </div>
          </div>
        `}
      </div>
    `;
  }

  setStaffSubTab(tab) {
    this.staffSubTab = tab;
    this.render();
  }

  openStaffOrderForTable(tableId) {
    this.staffSelectedTable = tableId;
    this.staffSubTab = 'pos';
    this.render();
  }

  updateStaffCartQty(itemId, delta, portion = null) {
    const item = store.menu.find(m => m.id === itemId || m.id === itemId.split('_')[0]);
    if (!item) return;

    const selectedPortion = portion || this.selectedPortions[item.id] || (item.portions ? item.portions[0].size : null);
    let price = item.price;
    let name = item.name;

    if (item.portions && selectedPortion) {
      const pObj = item.portions.find(p => p.size === selectedPortion) || item.portions[0];
      price = pObj.price;
      name = `${item.name} (${pObj.size})`;
    }

    const cartItemId = item.portions ? `${item.id}_${selectedPortion}` : item.id;

    let existing = this.staffCart.find(c => c.itemId === cartItemId);
    if (existing) {
      existing.quantity += delta;
      if (existing.quantity <= 0) {
        this.staffCart = this.staffCart.filter(c => c.itemId !== cartItemId);
      }
    } else if (delta > 0) {
      this.staffCart.push({ itemId: cartItemId, name, price, quantity: 1, notes: '' });
    }
    this.render();
  }

  submitStaffOrder() {
    if (this.staffCart.length === 0) {
      alert('Please add items to cart first.');
      return;
    }

    store.createOrder({
      tableId: this.staffSelectedTable,
      source: 'staff-mobile',
      orderedBy: `Staff (${store.currentUser.name})`,
      items: this.staffCart
    });

    this.staffCart = [];
    alert(`Order dispatched to Kitchen & Billing for Table T-0${this.staffSelectedTable}!`);
    this.render();
  }

  setPaymentMethod(method) {
    this.selectedPaymentMethod = method;
    this.render();
  }

  selectBillingOrder(orderId) {
    this.billingSelectedOrder = store.orders.find(o => o.id === orderId);
    this.render();
  }

  payOrder(orderId) {
    store.settleBill(orderId, this.selectedPaymentMethod);
    this.billingSelectedOrder = null;
    this.render();
  }

  renderKitchenDashboard() {
    const activeOrders = store.orders.filter(o => o.status !== 'paid' && o.status !== 'served' && o.status !== 'completed');

    this.container.innerHTML = `
      <div class="view-container">
        <div class="section-header" style="margin-bottom:20px;">
          <div>
            <h2>Kitchen Display System (KDS)</h2>
            <p style="color:var(--text-muted); font-size:13px;">Dedicated cooking queue for kitchen chefs</p>
          </div>
          <div style="display:flex; gap:10px;">
            <span class="status-tag tag-occupied">Placed: ${activeOrders.filter(o => o.status === 'placed').length}</span>
            <span class="status-tag tag-bill">Cooking: ${activeOrders.filter(o => o.status === 'preparing').length}</span>
            <span class="status-tag tag-available">Ready: ${activeOrders.filter(o => o.status === 'ready').length}</span>
          </div>
        </div>

        <div class="kds-grid">
          ${activeOrders.length === 0 ? `
            <div class="panel-card" style="text-align:center; padding:50px 20px; grid-column:1/-1;">
              <p style="color:var(--text-muted); font-size:16px; margin-bottom:14px;">Kitchen Queue Clean. All orders fulfilled.</p>
              <button class="btn-primary" style="margin:0 auto; display:inline-flex;" onclick="window.store.resetDemoData()">Load Sample Live Orders into Kitchen Queue</button>
            </div>
          ` : ''}
          ${activeOrders.map(o => `
            <div class="kds-card ${o.status}">
              <div>
                <div class="kds-header">
                  <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                    <div class="kds-table-badge">
                      ${o.tableNumber}
                    </div>
                    <span class="source-tag ${o.source === 'qr-customer' ? 'tag-qr-customer' : o.source === 'swiggy' ? 'tag-swiggy' : o.source === 'zomato' ? 'tag-zomato' : 'tag-dinein'}">
                      ${o.source === 'qr-customer' ? 'QR Self-Order' : o.source === 'swiggy' ? 'Swiggy' : o.source === 'zomato' ? 'Zomato' : 'Staff POS'}
                    </span>
                    ${o.hasNewItems ? `<span class="status-tag tag-occupied" style="background:#EF4444; color:#FFF; font-weight:800;">🔥 NEW ITEMS ADDED</span>` : ''}
                  </div>
                  <div class="kds-timer">#${o.orderNumber}</div>
                </div>

                <div class="kds-items">
                  ${o.items.map(item => `
                    <div class="kds-item-row">
                      <div>
                        <span class="kds-item-qty">${item.quantity}</span>
                        <span>${item.name}</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <div>
                ${o.status === 'placed' ? `
                  <button class="kds-action-btn btn-prep" onclick="window.store.updateOrderStatus('${o.id}', 'preparing')">
                    Start Cooking
                  </button>
                ` : o.status === 'preparing' ? `
                  <button class="kds-action-btn btn-ready" onclick="window.store.updateOrderStatus('${o.id}', 'ready')">
                    Mark Order Ready
                  </button>
                ` : `
                  <button class="kds-action-btn" style="background:#059669; color:#FFF;" onclick="window.store.updateOrderStatus('${o.id}', 'served')">
                    ✓ Clear Ticket (Order Fulfilled)
                  </button>
                `}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderCustomerWebPortal() {
    const table = store.tables.find(t => t.id === store.customerTableId) || store.tables[3];
    const customerOrder = store.orders.find(o => 
      o.tableId === table.id && 
      o.paymentStatus === 'unpaid' && 
      (o.status === 'placed' || o.status === 'preparing' || o.status === 'ready')
    );

    const filteredMenu = store.menu.filter(m => {
      if (store.selectedCategory !== 'all' && m.category !== store.selectedCategory) return false;
      if (store.searchQuery) {
        return m.name.toLowerCase().includes(store.searchQuery.toLowerCase());
      }
      return true;
    });

    const cartTotal = (this.customerCart || []).reduce((sum, i) => sum + i.price * i.quantity, 0);
    const cartTax = Math.round(cartTotal * 0.05 * 100) / 100;
    const grandTotal = cartTotal + cartTax;

    this.container.innerHTML = `
      <div class="view-container">
        <div style="background:linear-gradient(135deg, var(--primary), var(--primary-hover)); border-radius:var(--radius-lg); padding:20px; color:#FFF; margin-bottom:20px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; box-shadow:var(--shadow-md);">
          <div>
            <h2 style="color:#FFF; font-size:22px;">Malabar Table - Self Ordering</h2>
            <p style="opacity:0.95; font-size:13px; margin-top:2px;">Table ${table.number} (${table.section || 'Main Hall'})</p>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:12px; background:rgba(255,255,255,0.2); padding:6px 12px; border-radius:20px; font-weight:700;">Simulate Table:</span>
            <select style="background:#FFF; color:#0F172A; border:none; padding:6px 10px; border-radius:8px; font-weight:800; cursor:pointer;" onchange="window.store.setView('customer', {tableId: Number(this.value)})">
              ${store.tables.map(t => `<option value="${t.id}" ${t.id === table.id ? 'selected' : ''}>Table ${t.number}</option>`).join('')}
            </select>
          </div>
        </div>

        ${customerOrder ? `
          <div class="panel-card" style="border-left: 5px solid ${customerOrder.status === 'ready' ? 'var(--success)' : customerOrder.status === 'preparing' ? 'var(--primary)' : customerOrder.status === 'served' ? '#8B5CF6' : 'var(--warning)'}; margin-bottom:24px;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
              <div>
                <h3 style="font-size:17px; font-weight:800;">Live Order #${customerOrder.orderNumber} Status</h3>
                <p style="font-size:12px; color:var(--primary); font-weight:700; margin-top:2px;">
                  ${customerOrder.status === 'placed' ? 'Order received. Kitchen chef has received your ticket.' :
                    customerOrder.status === 'preparing' ? 'Chef master is currently cooking your food live in the kitchen.' :
                    customerOrder.status === 'ready' ? 'Hot & Ready. Waiter is serving your dishes to your table.' :
                    'Order Served. Enjoy your meal.'}
                </p>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <button class="btn-enterprise" style="padding:4px 8px; font-size:11px; border-color:var(--surface-border);" onclick="window.app.refreshLiveStatus()" title="Refresh Live Status">
                  Refresh
                </button>
                <span class="status-tag ${customerOrder.status === 'ready' ? 'tag-available' : customerOrder.status === 'preparing' ? 'tag-bill' : 'tag-occupied'}" style="font-size:12px; padding:6px 12px;">
                  ${customerOrder.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div class="status-tracker-container" style="display:flex; justify-content:space-between; margin:16px 0; background:var(--bg-main); padding:14px 10px; border-radius:12px; border:1px solid var(--surface-border); gap:6px;">
              <div class="status-tracker-step" style="flex:1; text-align:center; opacity: ${['placed','preparing','ready','served'].includes(customerOrder.status) ? 1 : 0.35}; font-weight:${customerOrder.status === 'placed' ? '800' : '600'};">
                <div style="font-size:12px; font-weight:800;">1</div>
                <div style="font-size:11px; margin-top:2px;">Order Placed</div>
              </div>
              <div class="status-tracker-step" style="flex:1; text-align:center; opacity: ${['preparing','ready','served'].includes(customerOrder.status) ? 1 : 0.35}; font-weight:${customerOrder.status === 'preparing' ? '800' : '600'}; color:${customerOrder.status === 'preparing' ? 'var(--primary)' : 'inherit'};">
                <div style="font-size:12px; font-weight:800;">2</div>
                <div style="font-size:11px; margin-top:2px;">In Preparation</div>
              </div>
              <div class="status-tracker-step" style="flex:1; text-align:center; opacity: ${['ready','served'].includes(customerOrder.status) ? 1 : 0.35}; font-weight:${customerOrder.status === 'ready' ? '800' : '600'}; color:${customerOrder.status === 'ready' ? 'var(--success)' : 'inherit'};">
                <div style="font-size:12px; font-weight:800;">3</div>
                <div style="font-size:11px; margin-top:2px;">Ready for Pickup</div>
              </div>
              <div class="status-tracker-step" style="flex:1; text-align:center; opacity: ${customerOrder.status === 'served' ? 1 : 0.35}; font-weight:${customerOrder.status === 'served' ? '800' : '600'};">
                <div style="font-size:12px; font-weight:800;">4</div>
                <div style="font-size:11px; margin-top:2px;">Served</div>
              </div>
            </div>

            <div style="background:var(--surface-hover); padding:12px; border-radius:8px; font-size:13px;">
              <strong style="display:block; margin-bottom:6px;">Current Table Items (${customerOrder.items.length}):</strong>
              <div style="display:flex; flex-wrap:wrap; gap:8px;">
                ${customerOrder.items.map(i => `<span style="background:var(--surface-white); border:1px solid var(--surface-border); padding:4px 10px; border-radius:16px; font-size:12px; font-weight:700;">${i.quantity}x ${i.name}</span>`).join('')}
              </div>
              <div style="display:flex; justify-content:space-between; margin-top:10px; font-weight:800; font-size:14px; border-top:1px dashed var(--surface-border); padding-top:8px;">
                <span>Total Live Bill Amount:</span>
                <span style="color:var(--primary);">₹${customerOrder.total}</span>
              </div>
            </div>
            <p style="font-size:11px; color:var(--text-muted); margin-top:10px; text-align:center;">Want to order extra food or drinks? Select items below and tap <strong>'Submit Order'</strong>.</p>
          </div>
        ` : `
          <div class="panel-card" style="background:var(--primary-light); border:1px solid var(--primary); margin-bottom:20px; text-align:center; padding:14px;">
            <p style="font-size:13px; font-weight:700; color:var(--primary);">Ready to order? Select your dishes below & tap <strong>'Submit Order'</strong>.</p>
          </div>
        `}

        <div class="web-pos-grid">
          <div class="panel-card">
            <div style="margin-bottom:14px; display:flex; align-items:center; justify-content:space-between;">
              <h3 style="font-size:16px;">Menu Catalog</h3>
              <span style="font-size:12px; color:var(--text-muted);">${filteredMenu.length} dishes available</span>
            </div>

            <div class="menu-categories">
              ${CATEGORIES.map(cat => `
                <button class="cat-chip ${store.selectedCategory === cat.id ? 'active' : ''}" onclick="window.store.setSelectedCategory('${cat.id}')">
                  ${cat.name}
                </button>
              `).join('')}
            </div>

            <div class="web-menu-grid">
              ${filteredMenu.map(item => {
                const activePortion = this.selectedPortions[item.id] || (item.portions ? item.portions[0].size : null);
                let price = item.price;
                if (item.portions && activePortion) {
                  const pObj = item.portions.find(p => p.size === activePortion) || item.portions[0];
                  price = pObj.price;
                }

                const cartItemId = item.portions ? `${item.id}_${activePortion}` : item.id;
                const cartEntry = (this.customerCart || []).find(c => c.itemId === cartItemId);
                const qty = cartEntry ? cartEntry.quantity : 0;

                return `
                  <div class="web-menu-card">
                    <div>
                      <img src="${item.image}" class="web-menu-img" alt="${item.name}" />
                      <div class="web-menu-info">
                        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:2px;">
                          <h5>${item.name}</h5>
                          <span style="font-size:10px; font-weight:800; color:${item.isVeg ? 'var(--success)' : 'var(--danger)'};">${item.isVeg ? 'Veg' : 'Non-Veg'}</span>
                        </div>
                        <p>${item.description}</p>
                        
                        ${item.portions ? `
                          <div style="display:flex; gap:4px; margin-top:8px; flex-wrap:wrap;">
                            ${item.portions.map(p => `
                              <button class="btn-enterprise" style="padding:3px 7px; font-size:10px; font-weight:800; border-radius:12px; ${activePortion === p.size ? 'background:var(--primary); color:#FFF; border-color:var(--primary);' : ''}" onclick="window.app.setPortion('${item.id}', '${p.size}')">
                                ${p.size} ₹${p.price}
                              </button>
                            `).join('')}
                          </div>
                        ` : ''}
                      </div>
                    </div>

                    <div class="web-menu-footer" style="margin-top:8px;">
                      <div class="menu-price">₹${price}</div>

                      ${item.available === false ? `
                        <button class="add-cart-btn" disabled style="opacity:0.6; cursor:not-allowed; background:var(--surface-border); color:var(--danger); border-color:var(--surface-border);">Out of Stock</button>
                      ` : qty > 0 ? `
                        <div class="counter-stepper">
                          <button class="counter-btn-std" onclick="window.app.updateCustomerCartQty('${item.id}', -1, '${activePortion}')">-</button>
                          <span style="font-weight:800; padding:0 8px;">${qty}</span>
                          <button class="counter-btn-std" onclick="window.app.updateCustomerCartQty('${item.id}', 1, '${activePortion}')">+</button>
                        </div>
                      ` : `
                        <button class="add-cart-btn" onclick="window.app.updateCustomerCartQty('${item.id}', 1, '${activePortion}')">+ Add ${item.portions ? `(${activePortion})` : ''}</button>
                      `}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div class="web-pos-cart-panel">
            <div>
              <div style="padding-bottom:14px; border-bottom:1px solid var(--surface-border); margin-bottom:14px; display:flex; align-items:center; justify-content:space-between;">
                <h3>Your Order</h3>
                <span class="status-tag tag-available">Table ${table.number}</span>
              </div>

              <div class="orders-list" style="max-height:280px; overflow-y:auto;">
                ${(!this.customerCart || this.customerCart.length === 0) ? `
                  <div style="text-align:center; padding:40px 10px; color:var(--text-muted);">
                    <p style="font-size:13px; font-weight:600;">Your Cart is Empty</p>
                    <p style="font-size:11px; margin-top:4px;">Tap '+ Add' on dishes to start your order</p>
                  </div>
                ` : ''}

                ${(this.customerCart || []).map(item => `
                  <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px dashed var(--surface-border);">
                    <div>
                      <strong style="font-size:13px;">${item.name}</strong>
                      <p style="font-size:11px; color:var(--text-muted);">₹${item.price} each</p>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                      <div class="counter-stepper">
                        <button class="counter-btn-std" onclick="window.app.updateCustomerCartQty('${item.itemId}', -1)">-</button>
                        <span style="font-weight:800; padding:0 6px;">${item.quantity}</span>
                        <button class="counter-btn-std" onclick="window.app.updateCustomerCartQty('${item.itemId}', 1)">+</button>
                      </div>
                      <span style="font-weight:800; font-size:14px; min-width:45px; text-align:right;">₹${item.price * item.quantity}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div style="border-top:1px solid var(--surface-border); padding-top:14px; margin-top:14px;">
              <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:6px; color:var(--text-muted);">
                <span>Subtotal</span>
                <span>₹${cartTotal}</span>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:12px; color:var(--text-muted);">
                <span>GST (5%)</span>
                <span>₹${cartTax}</span>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:18px; font-weight:800; color:var(--primary); margin-bottom:14px;">
                <span>Total Payable</span>
                <span>₹${grandTotal}</span>
              </div>

              <button class="btn-primary" style="width:100%; justify-content:center; padding:12px; font-size:14px; font-weight:800;" ${(!this.customerCart || this.customerCart.length === 0) ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''} onclick="window.app.submitCustomerOrder()">
                Submit Order to Kitchen
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  updateCustomerCartQty(itemId, delta, portion = null) {
    const item = store.menu.find(m => m.id === itemId || m.id === itemId.split('_')[0]);
    if (!item) return;

    if (!this.customerCart) this.customerCart = [];

    const selectedPortion = portion || this.selectedPortions[item.id] || (item.portions ? item.portions[0].size : null);
    let price = item.price;
    let name = item.name;

    if (item.portions && selectedPortion) {
      const pObj = item.portions.find(p => p.size === selectedPortion) || item.portions[0];
      price = pObj.price;
      name = `${item.name} (${pObj.size})`;
    }

    const cartItemId = item.portions ? `${item.id}_${selectedPortion}` : item.id;

    let existing = this.customerCart.find(c => c.itemId === cartItemId);
    if (existing) {
      existing.quantity += delta;
      if (existing.quantity <= 0) {
        this.customerCart = this.customerCart.filter(c => c.itemId !== cartItemId);
      }
    } else if (delta > 0) {
      this.customerCart.push({ itemId: cartItemId, name, price, quantity: 1 });
    }
    this.render();
  }

  submitCustomerOrder() {
    if (!this.customerCart || this.customerCart.length === 0) {
      alert('Please add dishes to your cart before submitting.');
      return;
    }

    const table = store.tables.find(t => t.id === store.customerTableId) || store.tables[3];

    store.createOrder({
      tableId: table.id,
      source: 'qr-customer',
      orderedBy: `Customer (Table ${table.number})`,
      items: this.customerCart
    });

    this.customerCart = [];
    this.render();
  }

  openEditOrderModal(orderId) {
    const order = store.orders.find(o => o.id === orderId);
    if (!order) return;

    let tempItems = JSON.parse(JSON.stringify(order.items));
    window.app._currentEditTempItems = tempItems;
    window.app._currentEditOrderId = orderId;

    const modalHtml = `
      <div class="modal-overlay" id="edit-order-modal">
        <div class="modal-card" style="max-width:520px;">
          <button class="modal-close" onclick="document.getElementById('edit-order-modal').remove()">✕</button>
          <h3 style="font-size:20px; margin-bottom:4px;">✏️ Edit Order #${order.orderNumber} (${order.tableNumber})</h3>
          <p style="color:var(--text-muted); font-size:12px; margin-bottom:14px;">Modify quantities, remove items, or add new dishes to this table's order</p>
          <div id="edit-order-modal-content"></div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    this.refreshEditModalDOM();
  }

  adjustEditItemQty(idx, delta) {
    if (!window.app._currentEditTempItems) return;
    const item = window.app._currentEditTempItems[idx];
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
      window.app._currentEditTempItems.splice(idx, 1);
    }
    this.refreshEditModalDOM();
  }

  removeEditItem(idx) {
    if (!window.app._currentEditTempItems) return;
    window.app._currentEditTempItems.splice(idx, 1);
    this.refreshEditModalDOM();
  }

  refreshEditModalDOM() {
    const modalEl = document.getElementById('edit-order-modal-content');
    if (!modalEl) return;
    const tempItems = window.app._currentEditTempItems || [];
    const subtotal = tempItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    const total = subtotal + tax;

    modalEl.innerHTML = `
      <div style="max-height:300px; overflow-y:auto; margin-bottom:14px; border-bottom:1px solid var(--surface-border); padding-bottom:10px;">
        ${tempItems.length === 0 ? '<p style="color:var(--text-muted); text-align:center; padding:20px 0;">No items in order.</p>' : ''}
        ${tempItems.map((item, idx) => `
          <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px dashed var(--surface-border);">
            <div>
              <strong style="font-size:13px; display:block;">${item.name}</strong>
              <span style="font-size:11px; color:var(--text-muted);">₹${item.price} each</span>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
              <div class="counter-stepper">
                <button class="counter-btn-std" onclick="window.app.adjustEditItemQty(${idx}, -1)">-</button>
                <span style="font-weight:800; padding:0 8px;">${item.quantity}</span>
                <button class="counter-btn-std" onclick="window.app.adjustEditItemQty(${idx}, 1)">+</button>
              </div>
              <strong style="font-size:14px; min-width:55px; text-align:right;">₹${item.price * item.quantity}</strong>
              <button class="btn-enterprise" style="padding:2px 6px; color:var(--danger); border-color:var(--danger);" onclick="window.app.removeEditItem(${idx})">🗑️</button>
            </div>
          </div>
        `).join('')}
      </div>

      <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px; color:var(--text-muted);">
        <span>Subtotal</span>
        <span>₹${subtotal}</span>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:10px; color:var(--text-muted);">
        <span>GST (5%)</span>
        <span>₹${tax}</span>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:18px; font-weight:800; color:var(--primary); margin-bottom:16px;">
        <span>Total Amount</span>
        <span>₹${total}</span>
      </div>

      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn-enterprise" style="flex:1; justify-content:center;" onclick="window.app.addMoreFromMenuForOrder('${window.app._currentEditOrderId}')">
          ➕ Add More Dishes from Menu
        </button>
        <button class="btn-primary" style="flex:1; justify-content:center;" onclick="window.app.saveEditOrder('${window.app._currentEditOrderId}')">
          🚀 Save & Dispatch to Kitchen
        </button>
      </div>
    `;
  }

  saveEditOrder(orderId) {
    const tempItems = window.app._currentEditTempItems || [];
    store.updateOrderItems(orderId, tempItems);
    const modal = document.getElementById('edit-order-modal');
    if (modal) modal.remove();
    this.render();
  }

  addMoreFromMenuForOrder(orderId) {
    const order = store.orders.find(o => o.id === orderId);
    const modal = document.getElementById('edit-order-modal');
    if (modal) modal.remove();

    if (order && order.tableId) {
      this.staffSelectedTable = order.tableId;
    }
    this.staffSubTab = 'pos';
    this.render();
  }

  openEditOrderModalForTable(tableId) {
    const order = store.orders.find(o => o.tableId === tableId && o.paymentStatus === 'unpaid' && o.status !== 'completed');
    if (order) {
      this.openEditOrderModal(order.id);
    } else {
      this.openStaffOrderForTable(tableId);
    }
  }

  openOnlineOrderModal(aggregator = 'swiggy') {
    const isSwiggy = aggregator === 'swiggy';
    const brandColor = isSwiggy ? '#FC8019' : '#CB202D';
    const brandName = isSwiggy ? 'Swiggy Delivery' : 'Zomato Delivery';

    const modalHtml = `
      <div class="modal-overlay" id="online-order-modal">
        <div class="modal-card" style="max-width:520px; border-top: 5px solid ${brandColor};">
          <button class="modal-close" onclick="document.getElementById('online-order-modal').remove()">✕</button>
          
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
            <div style="background:${brandColor}; color:#FFF; padding:6px 12px; border-radius:8px; font-weight:800; font-size:14px;">
              ${isSwiggy ? '🛵 SWIGGY' : '🍕 ZOMATO'}
            </div>
            <div>
              <h3 style="font-size:18px; margin:0;">${brandName} Order Relay</h3>
              <p style="font-size:11px; color:var(--text-muted); margin:0;">Live Online Aggregator Order Simulation & API Webhook Integration</p>
            </div>
          </div>

          <form onsubmit="window.app.handleOnlineOrderSubmit(event, '${aggregator}')">
            <div class="form-group-std">
              <label>Customer Name & Delivery Address</label>
              <input type="text" id="online-cust-name" value="${isSwiggy ? 'Rahul Nair (Beach Road, Flat 4B)' : 'Priya Menon (Kadavanthra, Block C)'}" required />
            </div>

            <div class="form-group-std">
              <label>Select Primary Dish</label>
              <select id="online-item-1">
                ${store.menu.map(m => `<option value="${m.id}">${m.name} - ₹${m.price}</option>`).join('')}
              </select>
            </div>

            <div class="form-group-std">
              <label>Select Beverage / Side Dish</label>
              <select id="online-item-2">
                ${store.menu.filter(m => m.category === 'beverages' || m.category === 'desserts' || m.category === 'starters').map(m => `<option value="${m.id}">${m.name} - ₹${m.price}</option>`).join('')}
              </select>
            </div>

            <div style="background:var(--bg-main); border:1px solid var(--surface-border); padding:10px; border-radius:8px; margin-bottom:14px; font-size:12px;">
              <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span>Payment Status:</span>
                <strong style="color:var(--success);">✅ Paid Online (${isSwiggy ? 'Swiggy Pay' : 'Zomato UPI'})</strong>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span>Routing Target:</span>
                <strong style="color:var(--primary);">👨‍🍳 Direct to KDS Cooking Queue</strong>
              </div>
            </div>

            <div style="display:flex; gap:10px;">
              <button type="button" class="btn-enterprise" style="flex:1; justify-content:center;" onclick="window.store.simulateOnlineOrder('${aggregator}'); document.getElementById('online-order-modal').remove();">
                ⚡ Quick Random Order
              </button>
              <button type="submit" class="btn-primary" style="flex:1.2; justify-content:center; background:${brandColor}; color:#FFF;">
                🚀 Dispatch ${isSwiggy ? 'Swiggy' : 'Zomato'} Ticket
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

  handleOnlineOrderSubmit(e, aggregator) {
    e.preventDefault();
    const isSwiggy = aggregator === 'swiggy';
    const custName = document.getElementById('online-cust-name').value;
    const item1Id = document.getElementById('online-item-1').value;
    const item2Id = document.getElementById('online-item-2').value;

    const item1 = store.menu.find(m => m.id === item1Id);
    const item2 = store.menu.find(m => m.id === item2Id);

    const items = [];
    if (item1) items.push({ itemId: item1.id, name: item1.name, price: item1.price, quantity: 1, notes: 'Online Delivery' });
    if (item2) items.push({ itemId: item2.id, name: item2.name, price: item2.price, quantity: 1, notes: '' });

    store.createOrder({
      tableId: null,
      source: isSwiggy ? 'swiggy' : 'zomato',
      customerName: `${custName} (${isSwiggy ? 'Swiggy' : 'Zomato'})`,
      items
    });

    const modal = document.getElementById('online-order-modal');
    if (modal) modal.remove();
  }

  openAddMenuModal() {
    this.uploadedImageDataUrl = null;

    const imagePresets = [
      { name: 'Biryani', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80' },
      { name: 'Mutton Roast', url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=80' },
      { name: 'Karimeen Fish', url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=80' },
      { name: 'Parotta', url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=80' },
      { name: 'Sulaimani Tea', url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80' },
      { name: 'Dessert', url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=80' }
    ];

    const modalHtml = `
      <div class="modal-overlay" id="add-menu-modal">
        <div class="modal-card" style="max-width:540px;">
          <button class="modal-close" onclick="document.getElementById('add-menu-modal').remove()">✕</button>
          <h3 style="font-size:20px; margin-bottom:4px;">➕ Add New Menu Dish</h3>
          <p style="color:var(--text-muted); font-size:13px; margin-bottom:16px;">Set custom category, portion pricing & upload dish photo from computer</p>

          <form onsubmit="window.app.handleAddMenuSubmit(event)">
            <div class="form-group-std">
              <label>Dish Name</label>
              <input type="text" id="new-dish-name" placeholder="e.g. Thalassery Mutton Curry" required />
            </div>

            <div class="form-group-std">
              <label>Category</label>
              <div style="display:flex; gap:8px;">
                <select id="new-dish-category" style="flex:1;" onchange="window.app.toggleCustomCategoryInput(this.value)">
                  ${CATEGORIES.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                  <option value="CUSTOM">+ Add New Custom Category...</option>
                </select>
                <input type="text" id="new-custom-category" placeholder="Type category name" style="display:none; flex:1;" />
              </div>
            </div>

            <div style="background:var(--bg-main); border:1px solid var(--surface-border); padding:12px; border-radius:8px; margin-bottom:14px;">
              <label style="font-size:12px; font-weight:700; color:var(--text-dark); display:block; margin-bottom:8px;">Portion Pricing (₹):</label>
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(110px, 1fr)); gap:10px;">
                <div class="form-group-std" style="margin:0;">
                  <label>Full Portion (₹) *</label>
                  <input type="number" id="price-full" placeholder="380" required />
                </div>
                <div class="form-group-std" style="margin:0;">
                  <label>Half Portion (₹)</label>
                  <input type="number" id="price-half" placeholder="220" />
                </div>
                <div class="form-group-std" style="margin:0;">
                  <label>Quarter (₹)</label>
                  <input type="number" id="price-quarter" placeholder="130" />
                </div>
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div class="form-group-std">
                <label>Diet Type</label>
                <select id="new-dish-veg">
                  <option value="false">🔴 Non-Veg</option>
                  <option value="true">🟢 Pure Veg</option>
                </select>
              </div>

              <div class="form-group-std">
                <label>Spice Level</label>
                <select id="new-dish-spice">
                  <option value="1">Mild</option>
                  <option value="2" selected>Medium</option>
                  <option value="3">Spicy</option>
                </select>
              </div>
            </div>

            <div class="form-group-std">
              <label>Dish Photo (Upload from System / Computer)</label>
              
              <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
                <input type="file" id="dish-file-input" accept="image/*" style="display:none;" onchange="window.app.handleDishFileUpload(event)" />
                <button type="button" class="btn-enterprise" style="flex:1; justify-content:center;" onclick="document.getElementById('dish-file-input').click()">
                  📁 Browse & Upload Image File...
                </button>
              </div>

              <div id="image-upload-preview" style="display:none; margin-bottom:8px; text-align:center;">
                <img id="preview-img-tag" src="" style="max-height:120px; border-radius:8px; border:2px solid var(--primary); object-fit:cover;" alt="Upload Preview" />
                <p style="font-size:11px; color:var(--success); font-weight:700; margin-top:2px;">✅ Image File Loaded!</p>
              </div>

              <input type="url" id="new-dish-img-url" placeholder="Or paste image URL" value="${this.selectedImagePreset}" />
              
              <div style="display:flex; gap:6px; margin-top:8px; overflow-x:auto; padding-bottom:4px;">
                ${imagePresets.map(preset => `
                  <div style="cursor:pointer; border:2px solid ${this.selectedImagePreset === preset.url ? 'var(--primary)' : 'var(--surface-border)'}; border-radius:6px; padding:2px; text-align:center;" onclick="window.app.selectPresetImage('${preset.url}')">
                    <img src="${preset.url}" style="width:40px; height:40px; border-radius:4px; object-fit:cover;" alt="${preset.name}" />
                    <div style="font-size:9px; font-weight:700;">${preset.name}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="form-group-std">
              <label>Description</label>
              <textarea id="new-dish-desc" rows="2" placeholder="Brief description of aromatic ingredients & cooking style..."></textarea>
            </div>

            <button type="submit" class="btn-primary" style="width:100%; justify-content:center; padding:11px; background:#D97706;">
              <span>✅</span> Add Dish to Menu Catalog
            </button>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

  handleDishFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.uploadedImageDataUrl = e.target.result;
      const previewBox = document.getElementById('image-upload-preview');
      const previewImgTag = document.getElementById('preview-img-tag');
      if (previewBox && previewImgTag) {
        previewImgTag.src = this.uploadedImageDataUrl;
        previewBox.style.display = 'block';
      }
    };
    reader.readAsDataURL(file);
  }

  toggleCustomCategoryInput(val) {
    const customInput = document.getElementById('new-custom-category');
    if (val === 'CUSTOM') {
      customInput.style.display = 'block';
      customInput.required = true;
    } else {
      customInput.style.display = 'none';
      customInput.required = false;
    }
  }

  selectPresetImage(url) {
    this.selectedImagePreset = url;
    this.uploadedImageDataUrl = null;
    const input = document.getElementById('new-dish-img-url');
    if (input) input.value = url;
    const previewBox = document.getElementById('image-upload-preview');
    if (previewBox) previewBox.style.display = 'none';
    this.render();
  }

  handleAddMenuSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('new-dish-name').value;
    const categorySelect = document.getElementById('new-dish-category').value;
    const customCategory = document.getElementById('new-custom-category').value;

    const priceFull = document.getElementById('price-full').value;
    const priceHalf = document.getElementById('price-half').value;
    const priceQuarter = document.getElementById('price-quarter').value;

    const isVeg = document.getElementById('new-dish-veg').value === 'true';
    const spiceLevel = document.getElementById('new-dish-spice').value;
    const imageUrl = this.uploadedImageDataUrl || document.getElementById('new-dish-img-url').value || this.selectedImagePreset;
    const description = document.getElementById('new-dish-desc').value;

    store.addMenuItem({
      name,
      category: categorySelect === 'CUSTOM' ? null : categorySelect,
      newCategory: categorySelect === 'CUSTOM' ? customCategory : null,
      priceFull,
      priceHalf,
      priceQuarter,
      isVeg,
      spiceLevel,
      image: imageUrl,
      description
    });

    const modal = document.getElementById('add-menu-modal');
    if (modal) modal.remove();
  }

  openQRModal(tableId) {
    const table = store.tables.find(t => t.id === tableId);
    if (!table) return;

    const qrSvg = generateTableQRSVG(table.number, table.qrUrl, 240);

    const modalHtml = `
      <div class="modal-overlay" id="qr-modal">
        <div class="modal-card" style="text-align:center; max-width:380px;">
          <button class="modal-close" onclick="document.getElementById('qr-modal').remove()">✕</button>
          <h3 style="font-size:18px; margin-bottom:4px;">Table ${table.number} QR Sticker</h3>
          <p style="color:var(--text-muted); font-size:12px; margin-bottom:14px;">Scan with smartphone camera to open self-order portal</p>
          <div style="display:flex; justify-content:center; margin:10px 0;">${qrSvg}</div>
          <button class="btn-primary" style="width:100%; justify-content:center; margin-top:14px;" onclick="window.print()">🖨️ Print QR Sticker</button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }
}

// Auto-initialize when script loads or DOM is ready
function initApp() {
  if (!window.app) {
    window.app = new App();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
