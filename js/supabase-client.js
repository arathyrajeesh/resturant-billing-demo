// ================= SUPABASE REAL-TIME CLIENT =================
// T Clock Restaurant POS - Cross-device sync via Supabase

const SUPABASE_URL = 'https://yrupquvpukpgbsgzxtgg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_3PqfR5jDeAB3Bs7ZGF-A6A_8gEUhMuJ';

let supabaseDb = null;

function initSupabase() {
  try {
    if (typeof supabase !== 'undefined' && supabase.createClient) {
      supabaseDb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      console.log('[Supabase] Connected to', SUPABASE_URL);
    } else {
      console.warn('[Supabase] SDK not loaded, running in localStorage-only mode');
    }
  } catch (e) {
    console.warn('[Supabase] Init failed, using localStorage only:', e);
  }
  return supabaseDb;
}

function orderToRow(order) {
  return {
    id: order.id,
    order_number: order.orderNumber,
    table_id: order.tableId || null,
    table_number: order.tableNumber || '',
    source: order.source || 'dine-in',
    ordered_by: order.orderedBy || '',
    customer_name: order.customerName || null,
    items: order.items || [],
    subtotal: order.subtotal || 0,
    tax: order.tax || 0,
    total: order.total || 0,
    status: order.status || 'placed',
    payment_status: order.paymentStatus || 'unpaid',
    has_new_items: order.hasNewItems || false,
    notes: order.notes || '',
    elapsed_mins: order.elapsedMins || 0,
    timestamp: order.timestamp || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

function rowToOrder(row) {
  return {
    id: row.id,
    orderNumber: row.order_number,
    tableId: row.table_id,
    tableNumber: row.table_number,
    source: row.source,
    orderedBy: row.ordered_by,
    customerName: row.customer_name,
    items: row.items || [],
    subtotal: row.subtotal,
    tax: row.tax,
    total: row.total,
    status: row.status,
    paymentStatus: row.payment_status,
    hasNewItems: row.has_new_items,
    notes: row.notes,
    elapsedMins: row.elapsed_mins,
    timestamp: row.timestamp,
    updatedAt: row.updated_at
  };
}

async function syncOrderToSupabase(order) {
  if (!supabaseDb) return;
  try {
    const { error } = await supabaseDb.from('orders').upsert(orderToRow(order), { onConflict: 'id' });
    if (error) console.warn('[Supabase] Upsert failed:', error.message);
  } catch (e) {
    console.warn('[Supabase] syncOrder error:', e);
  }
}

async function deleteOrderFromSupabase(orderId) {
  if (!supabaseDb) return;
  try {
    const { error } = await supabaseDb.from('orders').delete().eq('id', orderId);
    if (error) console.warn('[Supabase] Delete failed:', error.message);
  } catch (e) {
    console.warn('[Supabase] deleteOrder error:', e);
  }
}

async function fetchOrdersFromSupabase() {
  if (!supabaseDb) return null;
  try {
    const { data, error } = await supabaseDb
      .from('orders')
      .select('*')
      .order('order_number', { ascending: false })
      .limit(200);
    if (error) { console.warn('[Supabase] Fetch failed:', error.message); return null; }
    return (data || []).map(rowToOrder);
  } catch (e) {
    console.warn('[Supabase] fetchOrders error:', e);
    return null;
  }
}

function subscribeToSupabaseOrders(onInsert, onUpdate, onDelete) {
  if (!supabaseDb) return;
  supabaseDb
    .channel('orders-realtime-channel')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
      onInsert(rowToOrder(payload.new));
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
      onUpdate(rowToOrder(payload.new));
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'orders' }, (payload) => {
      onDelete(payload.old.id);
    })
    .subscribe((status) => {
      console.log('[Supabase Orders] Realtime:', status);
    });
}

// --- SUPABASE MENU SYNC ---
async function syncMenuToSupabase(menuArray) {
  if (!supabaseDb) return;
  try {
    const rows = (menuArray || []).map(item => ({
      id: item.id,
      name: item.name,
      category: item.category || 'mains',
      price: item.price || 0,
      portions: item.portions || [],
      is_veg: item.isVeg || false,
      spice_level: item.spiceLevel || 1,
      description: item.description || '',
      image: item.image || '',
      popular: item.popular || false,
      available: item.available !== false,
      updated_at: new Date().toISOString()
    }));
    const { error } = await supabaseDb.from('menu').upsert(rows, { onConflict: 'id' });
    if (error) console.warn('[Supabase Menu] Upsert warning:', error.message);
  } catch (e) {
    console.warn('[Supabase Menu] syncMenu error:', e);
  }
}

async function fetchMenuFromSupabase() {
  if (!supabaseDb) return null;
  try {
    const { data, error } = await supabaseDb
      .from('menu')
      .select('*');
    if (error || !data || data.length === 0) return null;
    return data.map(row => ({
      id: row.id,
      name: row.name,
      category: row.category,
      price: row.price,
      portions: row.portions,
      isVeg: row.is_veg,
      spiceLevel: row.spice_level,
      description: row.description,
      image: row.image,
      popular: row.popular,
      available: row.available
    }));
  } catch (e) {
    console.warn('[Supabase Menu] fetchMenu error:', e);
    return null;
  }
}

function subscribeToSupabaseMenu(onMenuChange) {
  if (!supabaseDb) return;
  supabaseDb
    .channel('menu-realtime-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'menu' }, (payload) => {
      if (onMenuChange) onMenuChange(payload);
    })
    .subscribe((status) => {
      console.log('[Supabase Menu] Realtime:', status);
    });
}
