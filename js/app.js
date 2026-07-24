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
    this.staffSubTab = 'floor'; // 'floor', 'pos', 'billing'
    this.isMobileSidebarOpen = false;
    this.customerCart = [];
    this.selectedPortions = {}; // { [itemId]: 'Full' | 'Half' | 'Quarter' }
    this.showAllAdminTables = false;
    this.showAllStaffTables = false;
    
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

  setPortion(itemId, portionSize) {
    this.selectedPortions[itemId] = portionSize;
    this.render();
  }

  // Swiggy / Zomato style Item Customization Modal methods
  openItemCustomizationModal(itemId) {
    const item = store.menu.find(m => m.id === itemId);
    if (!item) return;

    const activePortion = this.selectedPortions[item.id] || (item.portions && item.portions.length > 0 ? item.portions[0].size : null);
    
    this.modalState = {
      itemId: item.id,
      selectedPortion: activePortion,
      qty: 1,
      notes: ''
    };

    this.renderCustomizationModal();
  }

  closeItemCustomizationModal() {
    this.modalState = null;
    const modal = document.getElementById('item-customization-modal');
    if (modal) modal.remove();
  }

  updateModalPortion(itemId, portionSize) {
    if (!this.modalState) return;
    this.modalState.selectedPortion = portionSize;
    this.selectedPortions[itemId] = portionSize;
    this.updateModalDOM();
  }

  changeModalQty(delta) {
    if (!this.modalState) return;
    const newQty = this.modalState.qty + delta;
    if (newQty >= 1) {
      this.modalState.qty = newQty;
      this.updateModalDOM();
    }
  }

  updateModalNotes(text) {
    if (!this.modalState) return;
    this.modalState.notes = text;
    const countEl = document.getElementById('modal-char-count');
    if (countEl) countEl.innerText = `${text.length}/100`;
  }

  appendQuickNote(chipText) {
    if (!this.modalState) return;
    let current = this.modalState.notes || '';
    if (current.includes(chipText)) {
      current = current.replace(chipText, '').replace(/,\s*,/g, ',').replace(/^,\s*/, '').replace(/,\s*$/, '').trim();
    } else {
      current = current ? `${current}, ${chipText}` : chipText;
    }
    if (current.length > 100) current = current.substring(0, 100);
    this.modalState.notes = current;
    
    const textarea = document.getElementById('modal-cooking-notes');
    if (textarea) textarea.value = current;
    const countEl = document.getElementById('modal-char-count');
    if (countEl) countEl.innerText = `${current.length}/100`;
  }

  confirmAddItemFromModal(itemId) {
    if (!this.modalState) return;
    const item = store.menu.find(m => m.id === itemId);
    if (!item) return;

    const portion = this.modalState.selectedPortion;
    const qty = this.modalState.qty;
    const notes = this.modalState.notes;

    let price = item.price;
    let name = item.name;

    if (item.portions && portion) {
      const pObj = item.portions.find(p => p.size === portion) || item.portions[0];
      price = pObj.price;
      name = `${item.name} (${pObj.size})`;
    }

    const cartItemId = item.portions ? `${item.id}_${portion}` : item.id;

    if (!this.customerCart) this.customerCart = [];
    let existing = this.customerCart.find(c => c.itemId === cartItemId);
    if (existing) {
      existing.quantity += qty;
      if (notes) existing.notes = existing.notes ? `${existing.notes}; ${notes}` : notes;
    } else {
      this.customerCart.push({
        itemId: cartItemId,
        name: name,
        price: price,
        quantity: qty,
        notes: notes || ''
      });
    }

    store.showToast(`Added ${qty}x ${name} to your cart!`, '😋');
    this.closeItemCustomizationModal();
    this.render();
  }

  updateModalDOM() {
    if (!this.modalState) return;
    const item = store.menu.find(m => m.id === this.modalState.itemId);
    if (!item) return;

    let price = item.price;
    if (item.portions && this.modalState.selectedPortion) {
      const pObj = item.portions.find(p => p.size === this.modalState.selectedPortion) || item.portions[0];
      price = pObj.price;
    }

    const totalPrice = price * this.modalState.qty;

    const qtyVal = document.getElementById('modal-qty-val');
    if (qtyVal) qtyVal.innerText = this.modalState.qty;

    const addBtn = document.getElementById('modal-add-btn');
    if (addBtn) addBtn.innerText = `Add item ₹${totalPrice}`;

    const radioRows = document.querySelectorAll('.portion-radio-row');
    radioRows.forEach(row => {
      const radio = row.querySelector('input[type="radio"]');
      if (radio && radio.value === this.modalState.selectedPortion) {
        row.classList.add('active');
        radio.checked = true;
      } else {
        row.classList.remove('active');
      }
    });
  }

  renderCustomizationModal() {
    const existing = document.getElementById('item-customization-modal');
    if (existing) existing.remove();

    if (!this.modalState) return;
    const item = store.menu.find(m => m.id === this.modalState.itemId);
    if (!item) return;

    const activePortion = this.modalState.selectedPortion;
    let price = item.price;
    if (item.portions && activePortion) {
      const pObj = item.portions.find(p => p.size === activePortion) || item.portions[0];
      price = pObj.price;
    }
    const totalPrice = price * this.modalState.qty;

    const modalHtml = `
      <div class="item-custom-overlay" id="item-customization-modal" onclick="if(event.target === this) window.app.closeItemCustomizationModal()">
        <div class="item-custom-sheet">
          <button class="item-modal-close" onclick="window.app.closeItemCustomizationModal()" title="Close">✕</button>

          <div class="item-modal-header">
            <img src="${item.image}" class="item-modal-thumb" alt="${item.name}" />
            <div class="item-modal-title-box">
              <div style="display:flex; align-items:center; gap:6px;">
                <div class="item-veg-tag ${item.isVeg ? 'veg' : ''}">
                  <span class="dot"></span>
                </div>
                <span style="font-size:11px; font-weight:700; color:${item.isVeg ? 'var(--success)' : 'var(--danger)'};">${item.isVeg ? 'Veg' : 'Non-Veg'}</span>
              </div>
              <h4>${item.name}</h4>
            </div>
          </div>

          <div class="item-modal-body">
            ${item.portions && item.portions.length > 0 ? `
              <div class="custom-section">
                <div class="custom-section-header">
                  <span class="custom-title">Size</span>
                  <span class="custom-subtitle">Required • Select any 1 option</span>
                </div>
                <div class="portion-radio-group">
                  ${item.portions.map(p => `
                    <label class="portion-radio-row ${activePortion === p.size ? 'active' : ''}" onclick="window.app.updateModalPortion('${item.id}', '${p.size}')">
                      <span class="portion-name">${item.name} (${p.size})</span>
                      <div class="portion-right">
                        <span class="portion-price">₹${p.price}</span>
                        <input type="radio" name="modal-portion" value="${p.size}" ${activePortion === p.size ? 'checked' : ''} />
                        <span class="custom-radio-mark"></span>
                      </div>
                    </label>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <div class="custom-section">
              <div class="custom-section-header">
                <span class="custom-title">Add a cooking request (optional)</span>
                <p class="custom-disclaimer">The restaurant will try its best to fulfil your requests. However, refunds or cancellations related to such requests won't be possible.</p>
              </div>

              <div class="cooking-notes-box">
                <textarea id="modal-cooking-notes" maxlength="100" placeholder="e.g. Don't make it too spicy" oninput="window.app.updateModalNotes(this.value)">${this.modalState.notes || ''}</textarea>
                <span class="char-count" id="modal-char-count">${(this.modalState.notes || '').length}/100</span>
              </div>

              <div class="quick-notes-chips">
                <button type="button" class="note-chip" onclick="window.app.appendQuickNote('Without onion and garlic')">Without onion and garlic</button>
                <button type="button" class="note-chip" onclick="window.app.appendQuickNote('Less Spicy')">Less Spicy</button>
                <button type="button" class="note-chip" onclick="window.app.appendQuickNote('Non spicy')">Non spicy</button>
                <button type="button" class="note-chip" onclick="window.app.appendQuickNote('Mild')">Mild</button>
                <button type="button" class="note-chip" onclick="window.app.appendQuickNote('Extra Gravy')">Extra Gravy</button>
              </div>
            </div>
          </div>

          <div class="item-modal-footer">
            <div class="counter-stepper-lg">
              <button type="button" class="counter-btn-lg" onclick="window.app.changeModalQty(-1)">-</button>
              <span class="counter-val-lg" id="modal-qty-val">${this.modalState.qty}</span>
              <button type="button" class="counter-btn-lg" onclick="window.app.changeModalQty(1)">+</button>
            </div>

            <button type="button" class="btn-add-item-primary" id="modal-add-btn" onclick="window.app.confirmAddItemFromModal('${item.id}')">
              Add item ₹${totalPrice}
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
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
                    <strong style="font-size:14px; display:block;">2. Staff Ordering & Billing Counter</strong>
                    <p style="font-size:11px; color:var(--text-muted);">Dining Tables, Take Order & Billing Section</p>
                  </div>
                </div>

                <div class="role-choice-card ${this.selectedLoginRole === 'kitchen' ? 'selected' : ''}" style="display:flex; align-items:center; gap:12px; text-align:left; padding:14px;" onclick="window.app.selectLoginRole('kitchen')">
                  <div>
                    <strong style="font-size:14px; display:block;">3. Kitchen Order Screen</strong>
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
    if (e) e.preventDefault();
    const usernameInput = document.getElementById('login-username');
    const username = usernameInput && usernameInput.value ? usernameInput.value.trim() : 'Restaurant Owner (Admin)';
    const role = this.selectedLoginRole || window._selectedRole || 'admin';
    store.login(role, username);
  }

  // ================= SIDEBAR NAVIGATION =================
  renderSidebar() {
    const role = store.currentUser.role;

    const allNavItems = [
      { id: 'admin', label: 'Admin Dashboard', roles: ['admin'] },
      { id: 'staff', label: 'Staff Ordering & Billing', roles: ['admin', 'staff'] },
      { id: 'kitchen', label: 'Kitchen Order Screen', roles: ['admin', 'staff', 'kitchen'] },
      { id: 'customer', label: 'Customer Portal', roles: ['admin', 'staff', 'kitchen', 'customer'] },
      { id: 'settings', label: 'Settings', roles: ['admin'] }
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
      case 'settings':
        this.renderSettingsView();
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
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
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
                ${(this.showAllAdminTables ? store.tables : store.tables.slice(0, 6)).map(t => `
                  <div class="table-card-std ${t.status}">
                    <div class="table-title">${t.number}</div>
                    <div style="font-size:11px; color:var(--text-muted); font-weight:600;">${t.seats} Seats • ${t.section || 'Main'}</div>
                    <button class="table-qr-btn" onclick="window.app.openQRModal(${t.id})">Real QR Sticker</button>
                  </div>
                `).join('')}
              </div>
              ${store.tables.length > 6 ? `
                <div style="text-align:center; margin-top:14px;">
                  <button class="btn-enterprise" style="padding:8px 18px; font-weight:700; color:var(--primary); border-color:var(--primary);" onclick="window.app.toggleAdminTablesExpand()">
                    ${this.showAllAdminTables ? '▲ Show Fewer Tables (Collapse to 6)' : `▼ Show More Tables (${store.tables.length - 6} More)`}
                  </button>
                </div>
              ` : ''}
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
                        <div style="display:flex; gap:6px; align-items:center;">
                          <button class="btn-enterprise" style="padding:4px 10px; font-size:11px; font-weight:800; color:${m.available === false ? 'var(--danger)' : 'var(--success)'}; border-color:${m.available === false ? 'var(--danger)' : 'var(--success)'};" onclick="window.store.toggleMenuItemAvailability('${m.id}')">
                            ${m.available === false ? 'Out of Stock' : 'In Stock'}
                          </button>
                          <button class="btn-enterprise" style="padding:4px 8px; font-size:11px; font-weight:700; color:var(--primary); border-color:var(--primary);" onclick="window.app.openEditDishImageModal('${m.id}')">
                            📷 Upload Photo
                          </button>
                        </div>
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

  scrollToReceiptSettings() {
    this.switchView('settings');
  }

  renderSettingsView() {
    this.container.innerHTML = `
      <div class="view-container">
        <div class="section-header" style="margin-bottom:20px;">
          <div>
            <h2>⚙️ Settings & Billing Customization</h2>
            <p style="color:var(--text-muted); font-size:13px;">Manage Restaurant Info, Thermal Receipt Branding & Business Details</p>
          </div>
        </div>

        <div style="max-width:720px;">
          <div class="panel-card" id="billing-settings-panel" style="border: 2px solid var(--primary);">
            <div class="section-header" style="margin-bottom:14px;">
              <div class="panel-title">Billing & Receipt Customization</div>
              <span class="status-tag tag-available" style="font-size:11px;">Live Thermal Receipt Branding</span>
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

              <button type="submit" class="btn-primary" style="width:100%; justify-content:center; padding:11px; margin-top:8px; background:#059669;">
                <span>💾</span> Save Settings & Receipt Branding
              </button>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  scrollToReceiptSettings() {
    const el = document.getElementById('billing-settings-panel');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      el.style.boxShadow = '0 0 0 4px var(--primary)';
      setTimeout(() => el.style.boxShadow = '', 2500);
    }
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
          <button class="btn-enterprise ${this.staffSubTab === 'floor' ? 'btn-primary' : ''}" onclick="window.app.setStaffSubTab('floor')">
            📍 Dining Tables (${activeTablesCount}/${store.tables.length})
          </button>
          <button class="btn-enterprise ${this.staffSubTab === 'pos' ? 'btn-primary' : ''}" onclick="window.app.setStaffSubTab('pos')">
            📝 Take Order
          </button>
          <button class="btn-enterprise ${this.staffSubTab === 'billing' ? 'btn-primary' : ''}" onclick="window.app.setStaffSubTab('billing')">
            💳 Billing Section (${unpaidOrders.length} Unpaid)
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
              <div class="panel-title">Restaurant Dining Tables (${store.tables.length} Tables)</div>
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
                      <div style="display:flex; gap:4px; width:100%;">
                        <button class="table-qr-btn" style="flex:1; padding:6px 4px; font-size:11px;" onclick="window.app.openStaffOrderForTable(${t.id})">➕ ${tableOrder ? 'Add Items' : 'Take Order'}</button>
                        <button class="table-qr-btn" style="background:#0284C7; color:#FFF; padding:6px 6px; font-size:11px; white-space:nowrap;" onclick="window.app.openQRModal(${t.id})" title="Show QR Code for ${t.number}">📱 QR Code</button>
                      </div>
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

  // ================= KITCHEN DISPLAY DASHBOARD =================
  renderKitchenDashboard() {
    const activeOrders = store.orders.filter(o => o.status !== 'paid' && o.status !== 'served' && o.status !== 'completed');

    this.container.innerHTML = `
      <div class="view-container">
        <div class="section-header" style="margin-bottom:20px;">
          <div>
            <h2>Kitchen Order Screen</h2>
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
            <div class="panel-card" style="text-align:center; padding:60px 20px; grid-column:1/-1;">
              <div style="font-size:48px; margin-bottom:16px;">👨‍🍳</div>
              <p style="color:var(--text-muted); font-size:16px; font-weight:600;">Kitchen Queue is Empty</p>
              <p style="color:var(--text-muted); font-size:13px; margin-top:6px;">Waiting for new orders from Customer Portal or Staff POS...</p>
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
                    <div class="kds-item-row" style="flex-direction:column; align-items:flex-start; margin-bottom:8px; padding-bottom:6px; border-bottom:1px dashed var(--surface-border);">
                      <div style="display:flex; align-items:center; width:100%; gap:8px;">
                        <span class="kds-item-qty">${item.quantity}</span>
                        <span style="font-weight:700; font-size:14px; color:var(--text-dark);">${item.name}</span>
                      </div>
                      ${item.notes ? `
                        <div style="margin-left:32px; margin-top:4px; font-size:12px; font-weight:800; color:#C2410C; background:#FFF7ED; padding:4px 10px; border-radius:8px; border:1.5px solid #FDBA74; display:inline-flex; align-items:center; gap:4px;">
                          <span>⚠️ Special Request:</span>
                          <span>"${item.notes}"</span>
                        </div>
                      ` : ''}
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
        ` : ''}

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

            <div class="swiggy-menu-list">
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
                const masterItem = MENU_ITEMS.find(m => m.id === item.id);
                const cat = item.category || (masterItem ? masterItem.category : 'mains');
                let catEmoji = '🍛', c1 = '%23F97316', c2 = '%23EA580C';
                if (cat === 'biryani') { catEmoji = '🍛'; c1 = '%23F97316'; c2 = '%23DC2626'; }
                else if (cat === 'mains') { catEmoji = '🍲'; c1 = '%2310B981'; c2 = '%23047857'; }
                else if (cat === 'starters') { catEmoji = '🍗'; c1 = '%23D97706'; c2 = '%23B45309'; }
                else if (cat === 'breads') { catEmoji = '🫓'; c1 = '%23EAB308'; c2 = '%23CA8A04'; }
                else if (cat === 'beverages') { catEmoji = '🍹'; c1 = '%2306B6D4'; c2 = '%230E7490'; }
                else if (cat === 'desserts') { catEmoji = '🍧'; c1 = '%23EC4899'; c2 = '%23BE185D'; }

                const svgFallback = `data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%2290%22%20viewBox%3D%220%200%20100%2090%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22${c1}%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22${c2}%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%22%20height%3D%2290%22%20rx%3D%2214%22%20fill%3D%22url(%23g)%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2242%22%20r%3D%2226%22%20fill%3D%22rgba(255%2C255%2C255%2C0.2)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22central%22%20text-anchor%3D%22middle%22%20font-size%3D%2230%22%3E${encodeURIComponent(catEmoji)}%3C%2Ftext%3E%3C%2Fsvg%3E`;
                const itemImg = (item.image && item.image.length > 10 ? item.image : '') || (masterItem && masterItem.image ? masterItem.image : '') || svgFallback;

                return `
                  <div class="swiggy-item-card" style="display:flex !important; flex-direction:row !important; justify-content:space-between !important; align-items:flex-start !important; width:100% !important; box-sizing:border-box !important; gap:8px !important;">
                    <div class="swiggy-item-left" style="flex:1 1 auto !important; width:calc(100% - 100px) !important; max-width:calc(100% - 100px) !important; min-width:0 !important; overflow:hidden !important; word-break:break-word !important;">
                      <div class="swiggy-badge-row">
                        <div class="item-veg-tag ${item.isVeg ? 'veg' : ''}">
                          <span class="dot"></span>
                        </div>
                        ${item.popular ? `<span class="reordered-badge">🔥 Highly reordered</span>` : ''}
                      </div>

                      <h4 class="swiggy-item-name" onclick="window.app.openItemCustomizationModal('${item.id}')" style="cursor:pointer;">${item.name}</h4>
                      <div class="swiggy-item-price">₹${price}</div>
                      <p class="swiggy-item-desc">${item.description}</p>

                      <div class="swiggy-action-icons" style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-top:10px;">
                        <button class="btn-primary" style="padding:6px 14px; font-size:12px; font-weight:800; border-radius:8px;" onclick="window.app.openItemCustomizationModal('${item.id}')">+ Add to Order</button>
                      </div>
                    </div>

                    <div class="swiggy-item-right" style="width:92px !important; min-width:92px !important; max-width:92px !important; flex:0 0 92px !important; display:flex !important; flex-direction:column !important; align-items:center !important; position:relative !important;">
                      <img src="${itemImg}" class="swiggy-item-img" alt="${item.name}" referrerpolicy="no-referrer" onclick="window.app.openItemCustomizationModal('${item.id}')" style="width:86px !important; height:80px !important; border-radius:12px !important; object-fit:cover !important; display:block !important; cursor:pointer !important;" onerror="this.onerror=null; this.src='${svgFallback}';" />
                      <div class="swiggy-add-btn-box" style="margin-top:-16px !important; position:relative !important; z-index:10 !important; text-align:center !important;">
                        ${item.available === false ? `
                          <button class="swiggy-add-btn" disabled style="opacity:0.6; cursor:not-allowed; color:var(--danger); border-color:var(--surface-border);">Out of Stock</button>
                        ` : qty > 0 ? `
                          <div class="counter-stepper-lg" style="width:84px !important;">
                            <button type="button" class="counter-btn-lg" onclick="window.app.updateCustomerCartQty('${cartItemId}', -1)">-</button>
                            <span class="counter-val-lg">${qty}</span>
                            <button type="button" class="counter-btn-lg" onclick="window.app.updateCustomerCartQty('${cartItemId}', 1)">+</button>
                          </div>
                        ` : `
                          <button type="button" class="swiggy-add-btn" onclick="window.app.openItemCustomizationModal('${item.id}')">ADD +</button>
                          ${item.portions ? `<span class="customisable-text">customisable</span>` : ''}
                        `}
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Customer Cart Summary & Submit Order Drawer -->
          <div class="web-pos-cart-panel" id="customer-cart-panel">
            <div>
              <div style="padding-bottom:14px; border-bottom:1px solid var(--surface-border); margin-bottom:14px; display:flex; align-items:center; justify-content:space-between;">
                <h3>Your Order</h3>
                <span class="status-tag tag-available">Table ${table.number}</span>
              </div>

              <div class="orders-list" style="max-height:280px; overflow-y:auto;">
                ${(!this.customerCart || this.customerCart.length === 0) ? `
                  <div style="text-align:center; padding:40px 10px; color:var(--text-muted);">
                    <p style="font-size:13px; font-weight:600;">Your Cart is Empty</p>
                    <p style="font-size:11px; margin-top:4px;">Tap 'ADD +' on dishes to start your order</p>
                  </div>
                ` : ''}

                ${(this.customerCart || []).map(item => `
                  <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px dashed var(--surface-border);">
                    <div>
                      <strong style="font-size:13px;">${item.name}</strong>
                      ${item.notes ? `<p style="font-size:10px; color:#E11D48; font-weight:700; margin-top:2px;">Note: "${item.notes}"</p>` : ''}
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

              <button class="btn-primary desktop-only-submit-btn" style="width:100%; justify-content:center; padding:12px; font-size:14px; font-weight:800;" ${(!this.customerCart || this.customerCart.length === 0) ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''} onclick="window.app.submitCustomerOrder()">
                Submit Order to Kitchen
              </button>
            </div>
          </div>
        </div>

        ${(this.customerCart && this.customerCart.length > 0) ? `
          <div class="swiggy-sticky-bottom-bar" onclick="window.app.submitCustomerOrder()">
            <div style="display:flex; align-items:center; gap:10px;">
              <div style="width:32px; height:32px; background:rgba(255,255,255,0.2); border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:16px;">🛍️</div>
              <div>
                <strong style="font-size:14px; color:#FFF;">${this.customerCart.reduce((sum, i) => sum + i.quantity, 0)} ${this.customerCart.reduce((sum, i) => sum + i.quantity, 0) === 1 ? 'item' : 'items'} added</strong>
                <p style="font-size:11px; opacity:0.9;">Total ₹${grandTotal}</p>
              </div>
            </div>
            <div style="font-weight:800; font-size:14px; display:flex; align-items:center; gap:4px;">
              Continue & Checkout ➔
            </div>
          </div>
        ` : ''}
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  toggleAdminTablesExpand() {
    this.showAllAdminTables = !this.showAllAdminTables;
    this.render();
  }

  toggleStaffTablesExpand() {
    this.showAllStaffTables = !this.showAllStaffTables;
    this.render();
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

  openEditDishImageModal(itemId) {
    const item = store.menu.find(m => m.id === itemId);
    if (!item) return;

    this.editingDishId = itemId;
    this.uploadedImageDataUrl = null;

    const modalHtml = `
      <div class="modal-overlay" id="edit-dish-image-modal">
        <div class="modal-card" style="max-width:460px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
            <h3 style="font-size:16px;">📁 Upload Photo for ${item.name}</h3>
            <button class="modal-close" onclick="document.getElementById('edit-dish-image-modal').remove()">✕</button>
          </div>

          <form onsubmit="window.app.handleEditDishImageSubmit(event)">
            <div class="form-group-std">
              <label>Select Image File (Upload from Computer / Folder)</label>
              
              <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                <input type="file" id="edit-dish-file-input" accept="image/*" style="display:none;" onchange="window.app.handleDishFileUpload(event)" />
                <button type="button" class="btn-enterprise" style="flex:1; justify-content:center; padding:12px; font-weight:700; background:var(--bg-main);" onclick="document.getElementById('edit-dish-file-input').click()">
                  📂 Browse Computer & Select Dish Image...
                </button>
              </div>

              <div id="image-upload-preview" style="margin-bottom:12px; text-align:center;">
                <img id="preview-img-tag" src="${item.image || ''}" style="max-height:140px; border-radius:12px; border:2px solid var(--primary); object-fit:cover;" alt="${item.name}" />
                <p style="font-size:11px; color:var(--text-muted); font-weight:700; margin-top:4px;">Live Image Preview</p>
              </div>

              <input type="url" id="edit-dish-img-url" placeholder="Or paste image URL" value="${item.image || ''}" />
            </div>

            <button type="submit" class="btn-primary" style="width:100%; justify-content:center; padding:11px; background:#059669; margin-top:10px;">
              <span>💾</span> Save Dish Photo to Menu
            </button>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

  handleEditDishImageSubmit(e) {
    e.preventDefault();
    const itemId = this.editingDishId;
    const item = store.menu.find(m => m.id === itemId);
    if (!item) return;

    const newUrl = this.uploadedImageDataUrl || document.getElementById('edit-dish-img-url').value;
    if (newUrl) {
      item.image = newUrl;
      localStorage.setItem('malabar_menu', JSON.stringify(store.menu));
      store.showToast(`Updated photo for ${item.name}!`, '🖼️');
      store.notifyListeners();
    }

    const modal = document.getElementById('edit-dish-image-modal');
    if (modal) modal.remove();
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
