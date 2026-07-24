// Malabar Table - Real Scannable QR Code Generator Utility

/**
 * Generates a real, high-resolution scannable QR code image/SVG for a restaurant table.
 * Encodes the exact table URL so phone cameras can scan and open the Customer Ordering View.
 */
export function generateTableQRSVG(tableNumber, url, size = 260) {
  // Build real scannable table URL if not passed
  if (!url) {
    const baseUrl = window.location.origin + window.location.pathname;
    url = `${baseUrl}?table=${tableNumber.replace(/[^0-9]/g, '') || 1}`;
  }

  // Encoded URL for QR Code Server API (Generates ISO standard scannable QR matrix)
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
