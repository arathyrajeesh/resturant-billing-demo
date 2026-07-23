// Malabar Table - Master Controller with Customer Portal Accessible for Admin, Staff & Kitchen

import { store } from './store.js';
import { generateTableQRSVG } from './qrGenerator.js';
import { CATEGORIES } from './data.js';

window.store = store;

class App {
  constructor() {
    this.container = document.getElementById('app-root');
    this.sidebar = document.getElementById('app-sidebar');
    this.topHeader = document.getElementById('top-header');
    
    // Local states
    this.selectedLoginRole = 'admin'; // 'admin', 'staff', 'kitchen'
    this.staffCart = [];
    this.staffSelectedTable = 1;
    this.billingSelectedOrder = null;
    this.selectedPaymentMethod = 'UPI';
    this.uploadedImageDataUrl = null;
    this.selectedImagePreset = 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80';
    this.staffSubTab = 'pos'; // 'floor', 'pos', 'billing'
    this.isMobileSidebarOpen = false;
    this.customerCart = [];
    
    store.subscribe(() => this.render());

    // Check URL query for direct QR table scanning (?table=4)
    const urlParams = new URLSearchParams(window.location.search);
    const tableParam = urlParams.get('table');
    if (tableParam) {
      const tId = Number(tableParam);
      store.login('customer', `Customer (Table ${tId})`);
      store.setView('customer', { tableId: tId });
    }

    // Auto-poll localStorage every 1.5 seconds for instant multi-window/device state sync
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

  // ================= LOGIN SCREEN =================
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

  // ================= SIDEBAR NAVIGATION =================
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

  // ================= TOP HEADER =================
  renderTopHeader() {
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

        <button class="btn-enterprise" style="color:var(--swiggy-orange);" onclick="window.store.simulateOnlineOrder('swiggy')">
          <span class="btn-text">+ Swiggy</span>
        </button>
        <button class="btn-enterprise" style="color:var(--zomato-red);" onclick="window.store.simulateOnlineOrder('zomato')">
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

  // ================= ADMIN DASHBOARD =================
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
          <div style="display:flex; gap:10px;">
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
            <div class="panel-card">
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

            <!-- Receipt & Billing Customization Panel -->
            <div class="panel-card" style="margin-top:20px;">
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
                  <label>Logo Image URL (Optional)</label>
                  <input type="url" id="rc-logo-url" value="${store.receiptSettings.logoUrl || ''}" placeholder="https://example.com/logo.png" />
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
          </div>
        </div>
      </div>
    `;
  }

  handleReceiptSettingsSubmit(e) {
    e.preventDefault();
    const restaurantName = document.getElementById('rc-restaurant-name').value;
    const tagline = document.getElementById('rc-tagline').value;
    const address = document.getElementById('rc-address').value;
    const phone = document.getElementById('rc-phone').value;
    const gstin = document.getElementById('rc-gstin').value;
    const logoUrl = document.getElementById('rc-logo-url').value;
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

  // ================= ➕ ADD TABLE MODAL =================
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

  // ================= 📋 2. STAFF POS & BILLING DASHBOARD =================
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
                  const cartEntry = this.staffCart.find(c => c.itemId === item.id);
                  const qty = cartEntry ? cartEntry.quantity : 0;

                  return `
                    <div class="web-menu-card">
                      <div>
                        <img src="${item.image}" class="web-menu-img" alt="${item.name}" />
                        <div class="web-menu-info">
                          <h5>${item.name}</h5>
                          <p>${item.description}</p>
                        </div>
                      </div>

                      <div class="web-menu-footer">
                        <div>
                          <div class="menu-price">₹${item.price}</div>
                        </div>

                        ${qty > 0 ? `
                          <div class="counter-stepper">
                            <button class="counter-btn-std" onclick="window.app.updateStaffCartQty('${item.id}', -1)">-</button>
                            <span style="font-weight:800; padding:0 8px;">${qty}</span>
                            <button class="counter-btn-std" onclick="window.app.updateStaffCartQty('${item.id}', 1)">+</button>
                          </div>
                        ` : `
                          <button class="add-cart-btn" onclick="window.app.updateStaffCartQty('${item.id}', 1)">+ Add</button>
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
                  <select id="staff-table-select" style="background:var(--primary); color:#fff; border:none; padding:7px 12px; border-radius:8px; font-weight:800;" onchange="window.app.staffSelectedTable = Number(this.value)">
                    ${store.tables.map(t => `<option value="${t.id}" ${t.id === this.staffSelectedTable ? 'selected' : ''}>Table ${t.number}</option>`).join('')}
                  </select>
                </div>

                <div class="orders-list" style="max-height:300px; overflow-y:auto;">
                  ${this.staffCart.length === 0 ? '<p style="color:var(--text-muted); font-size:13px; text-align:center; padding:40px 0;">Cart is empty.</p>' : ''}
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
                  Dispatch Order to Kitchen
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
              ${store.tables.map(t => `
                <div class="table-card-std ${t.status}">
                  <div class="table-title">${t.number}</div>
                  <div style="font-size:12px; color:var(--text-muted); font-weight:600;">${t.seats} Seats</div>
                  <span class="status-tag ${t.status === 'available' ? 'tag-available' : t.status === 'occupied' ? 'tag-occupied' : 'tag-bill'}">
                    ${t.status.toUpperCase()}
                  </span>
                  <button class="table-qr-btn" onclick="window.app.openStaffOrderForTable(${t.id})">Take Order</button>
                </div>
              `).join('')}
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
                    <div>
                      <div style="display:flex; align-items:center; gap:6px; margin-bottom:2px;">
                        <h4 style="font-size:14px;">Table ${o.tableNumber}</h4>
                        <span class="source-tag ${o.source === 'qr-customer' ? 'tag-qr-customer' : o.source === 'swiggy' ? 'tag-swiggy' : o.source === 'zomato' ? 'tag-zomato' : 'tag-dinein'}">
                          ${o.source === 'qr-customer' ? 'QR Self-Order' : o.source === 'swiggy' ? 'Swiggy' : o.source === 'zomato' ? 'Zomato' : 'Staff POS'}
                        </span>
                      </div>
                      <p style="font-size:11px; color:var(--text-muted);">${o.items.length} items • #${o.orderNumber}</p>
                    </div>
                    <div style="text-align:right;">
                      <div style="font-weight:800; font-size:15px; color:var(--primary);">₹${o.total}</div>
                      <span class="status-tag tag-bill">${o.status}</span>
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
                    <h3 style="font-size:15px; margin-bottom:14px;">Settle Payment</h3>
                    
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

  updateStaffCartQty(itemId, delta) {
    const item = store.menu.find(m => m.id === itemId);
    if (!item) return;

    let existing = this.staffCart.find(c => c.itemId === itemId);
    if (existing) {
      existing.quantity += delta;
      if (existing.quantity <= 0) {
        this.staffCart = this.staffCart.filter(c => c.itemId !== itemId);
      }
    } else if (delta > 0) {
      this.staffCart.push({ itemId: item.id, name: item.name, price: item.price, quantity: 1, notes: '' });
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

  // ================= KITCHEN DISPLAY DASHBOARD =================
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
                    Order Served (Clear)
                  </button>
                `}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ================= CUSTOMER WEB PORTAL =================
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
        <!-- Header Banner -->
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

        <!-- Live Order Status Tracker (If table has an active order) -->
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

            <!-- 4-Step Visual Tracker -->
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

            <!-- Active Order Items Summary -->
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

        <!-- Main Order Interface Grid -->
        <div class="web-pos-grid">
          <!-- Menu Catalog Panel -->
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
                const cartEntry = (this.customerCart || []).find(c => c.itemId === item.id);
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
                      </div>
                    </div>

                    <div class="web-menu-footer">
                      <div class="menu-price">₹${item.price}</div>

                      ${item.available === false ? `
                        <button class="add-cart-btn" disabled style="opacity:0.6; cursor:not-allowed; background:var(--surface-border); color:var(--danger); border-color:var(--surface-border);">Out of Stock</button>
                      ` : qty > 0 ? `
                        <div class="counter-stepper">
                          <button class="counter-btn-std" onclick="window.app.updateCustomerCartQty('${item.id}', -1)">-</button>
                          <span style="font-weight:800; padding:0 8px;">${qty}</span>
                          <button class="counter-btn-std" onclick="window.app.updateCustomerCartQty('${item.id}', 1)">+</button>
                        </div>
                      ` : `
                        <button class="add-cart-btn" onclick="window.app.updateCustomerCartQty('${item.id}', 1)">+ Add</button>
                      `}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Customer Cart Summary & Submit Order Drawer -->
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

  updateCustomerCartQty(itemId, delta) {
    const item = store.menu.find(m => m.id === itemId);
    if (!item) return;

    if (!this.customerCart) this.customerCart = [];

    let existing = this.customerCart.find(c => c.itemId === itemId);
    if (existing) {
      existing.quantity += delta;
      if (existing.quantity <= 0) {
        this.customerCart = this.customerCart.filter(c => c.itemId !== itemId);
      }
    } else if (delta > 0) {
      this.customerCart.push({ itemId: item.id, name: item.name, price: item.price, quantity: 1 });
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

  // ================= MODALS =================
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

// Instantiate App
window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
