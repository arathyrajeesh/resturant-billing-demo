// Malabar Table - Enhanced Central State Management with Authentication & Owner Menu Controls

import { INITIAL_TABLES, MENU_ITEMS, INITIAL_ORDERS } from './data.js';
import { soundEffects } from './audio.js';

class RestaurantStore {
  constructor() {
    this.listeners = new Set();
    this.channel = new BroadcastChannel('malabar_table_channel');
    
    // Theme & preferences
    this.theme = localStorage.getItem('malabar_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', this.theme);

    // Auth State
    this.currentUser = this.load('malabar_user', {
      name: 'Restaurant Owner',
      role: 'owner', // 'owner', 'staff', 'kitchen', 'billing', 'customer'
      isLoggedIn: false
    });

    // Load initial or persisted state
    this.tables = this.load('malabar_tables', INITIAL_TABLES);
    this.orders = this.load('malabar_orders', INITIAL_ORDERS);
    this.menu = this.load('malabar_menu', MENU_ITEMS);

    this.receiptSettings = this.load('malabar_receipt_settings', {
      restaurantName: 'T CLOCK RESTO CAFE',
      tagline: 'Time for Tea, Time for Taste',
      address: 'Main Road, Calicut, Kerala',
      phone: '+91 98765 43210',
      gstin: '32ABCDE1234F1Z5',
      fssai: '11223344556677',
      footerNote: 'Thank you for visiting T Clock Resto Cafe!',
      logoUrl: 'assets/tclock-logo.jpg'
    });

    this.searchQuery = '';
    this.selectedCategory = 'all';
    this.activeView = this.currentUser.isLoggedIn ? (this.currentUser.role === 'owner' ? 'owner' : 'staff-ops') : 'login';
    this.customerTableId = 4;
    this.toasts = [];

    this.nextOrderNumber = this.orders.reduce((max, o) => Math.max(max, o.orderNumber || 1000), 1000) + 1;

    // Listen to cross-tab broadcasts & browser storage updates
    this.channel.onmessage = (event) => {
      if (event.data && event.data.type) {
        this.handleRemoteAction(event.data);
      }
    };

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
      if (!data) return fallback;
      const parsed = JSON.parse(data);
      if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
      if (typeof fallback === 'object' && fallback !== null && (typeof parsed !== 'object' || parsed === null)) return fallback;
      return parsed;
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
    this.channel.postMessage({ type: actionType, payload, timestamp: Date.now() });
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

  // --- AUTH ACTIONS ---

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

  // --- OWNER MENU MANAGEMENT ---

  addMenuItem(itemData) {
    const newItem = {
      id: `m_${Date.now()}`,
      name: itemData.name,
      category: itemData.category || 'mains',
      price: Number(itemData.price) || 200,
      isVeg: Boolean(itemData.isVeg),
      spiceLevel: Number(itemData.spiceLevel) || 1,
      description: itemData.description || 'Authentic Malabar special dish.',
      image: itemData.image || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
      popular: true,
      prepTime: '15 mins'
    };

    this.menu.unshift(newItem);
    soundEffects.playSuccessChime();
    this.showToast(`Added '${newItem.name}' (₹${newItem.price}) to Menu!`, '🍲');
    this.notify('MENU_UPDATED', newItem);
    if (typeof syncMenuToSupabase !== 'undefined') syncMenuToSupabase(this.menu);
    return newItem;
  }

  deleteTable(tableId) {
    const tableIndex = this.tables.findIndex(t => t.id === Number(tableId));
    if (tableIndex === -1) return;
    const table = this.tables[tableIndex];
    this.tables.splice(tableIndex, 1);
    this.save();
    soundEffects.playSuccessChime();
    this.showToast(`Table '${table.number}' deleted!`, '🗑️');
    this.notify('TABLES_UPDATED', { tableId });
  }

  // --- CORE ACTIONS ---

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

    // Check if active unpaid order exists for this table
    let existingOrder = table ? this.orders.find(o => o.tableId === table.id && o.paymentStatus === 'unpaid' && o.status !== 'completed') : null;

    if (existingOrder) {
      items.forEach(newItem => {
        const match = existingOrder.items.find(i => i.itemId === newItem.itemId || i.name === newItem.name);
        if (match) {
          match.quantity += newItem.quantity;
          if (newItem.notes) {
            match.notes = match.notes ? (match.notes.includes(newItem.notes) ? match.notes : `${match.notes}; ${newItem.notes}`) : newItem.notes;
          }
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

  login(role = 'admin', name = 'Restaurant Owner (Admin)', passcode = '') {
    if (role === 'admin') {
      const validPasscodes = ['owner123', 'admin', '1234', '123456', 'admin123', 'owner'];
      if (passcode && !validPasscodes.includes(passcode.toLowerCase()) && passcode !== 'owner123') {
        this.showToast('Invalid Admin Passcode! Passcode is: owner123', '🔒');
        alert('Invalid Admin Passcode! Correct passcode is: owner123');
        return false;
      }
    }

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

    this.save();
    this.showToast(`Welcome back, ${name}. Active Role: ${role.toUpperCase()}`);
    this.notify('AUTH_LOGIN', this.currentUser);
    return true;
  }

  logout() {
    this.currentUser = {
      name: '',
      role: '',
      isLoggedIn: false
    };
    this.activeView = 'login';
    this.save();
    this.showToast('Logged out successfully.');
    this.notify('AUTH_LOGOUT');
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

export const store = new RestaurantStore();
