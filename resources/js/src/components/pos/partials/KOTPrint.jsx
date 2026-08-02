import React, { useRef } from 'react';
import { usePermission } from '../../../context/PermissionContext';
import { toAbsUrl, writeAndPrint } from '../../../utils/printUtil';

function buildKotHtml(sale, restaurant) {
  const date = sale.created_at ? new Date(sale.created_at).toLocaleString() : '-';
  const logo = restaurant?.logo;
  const logoHtml = logo
    ? `<img src="${toAbsUrl(logo)}" alt="${(restaurant?.name || 'Logo').replace(/"/g, '')}" style="width:56px;max-height:56px;object-fit:contain;display:block;margin:0 auto 4px;" />`
    : '';
  const items = (sale.items || [])
    .map(
      (item, idx) => `
      <tr>
        <td style="padding:6px 8px;border-bottom:1px dashed #ccc;font-size:13px;color:#888;">${idx + 1}</td>
        <td style="padding:6px 8px;border-bottom:1px dashed #ccc;font-size:13px;">
          <strong>${item.item_name}</strong>
          ${item.modifiers && item.modifiers.length > 0 ? `<br/><span style="font-size:11px;color:#999;">[${item.modifiers.map((m) => m.name).join(', ')}]</span>` : ''}
          ${item.notes ? `<br/><span style="font-size:11px;color:#e67e22;">Note: ${item.notes}</span>` : ''}
        </td>
        <td style="padding:6px 8px;border-bottom:1px dashed #ccc;font-size:15px;font-weight:700;text-align:center;">${item.quantity}</td>
      </tr>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<title>KOT ${sale.invoice_number || sale.id}</title>
<style>
  @page { size: 80mm auto; margin: 0; }
  @media print {
    html, body { height: auto; overflow: visible; }
    body { margin: 0; }
    tr { page-break-inside: avoid; }
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Courier New', monospace; color: #000; background: #fff; padding: 8px; width: 72mm; min-width: 72mm; max-width: 72mm; font-size: 12px; line-height: 1.4; word-wrap: break-word; }
  .center { text-align: center; }
  .bold { font-weight: 700; }
  .divider { border-top: 2px solid #000; margin: 6px 0; }
  .thin-divider { border-top: 1px dashed #ccc; margin: 4px 0; }
  img { max-width: 56px; }
</style></head><body>
  <div class="center bold" style="font-size:16px;margin-bottom:2px;">KITCHEN ORDER TICKET</div>
  ${logoHtml}
  <div class="center bold" style="font-size:13px;">${restaurant?.name || 'Restaurant'}</div>
  <div class="divider"></div>
  <div style="display:flex;justify-content:space-between;font-size:12px;">
    <span><strong>${sale.invoice_number || '-'}</strong></span>
    <span>${date}</span>
  </div>
  ${sale.table ? `<div style="font-size:13px;margin-top:2px;"><strong>Table: ${sale.table.name}</strong></div>` : ''}
  <div style="font-size:12px;margin-top:2px;">Type: ${(sale.order_type || '-').replace('_', ' ')}</div>
  ${sale.customer ? `<div style="font-size:12px;margin-top:2px;">Customer: ${sale.customer.name}</div>` : ''}
  ${sale.kitchen_notes ? `<div style="font-size:12px;margin-top:4px;padding:4px;background:#fff3cd;border:1px solid #ffc107;border-radius:3px;"><strong>Kitchen Notes:</strong> ${sale.kitchen_notes}</div>` : ''}
  <div class="divider"></div>
  <table style="width:100%;border-collapse:collapse;">
    <thead>
      <tr>
        <th style="padding:4px 8px;font-size:10px;text-transform:uppercase;text-align:left;border-bottom:2px solid #000;">#</th>
        <th style="padding:4px 8px;font-size:10px;text-transform:uppercase;text-align:left;border-bottom:2px solid #000;">Item</th>
        <th style="padding:4px 8px;font-size:10px;text-transform:uppercase;text-align:center;border-bottom:2px solid #000;">Qty</th>
      </tr>
    </thead>
    <tbody>${items}</tbody>
  </table>
  <div class="divider"></div>
  <div class="center" style="font-size:11px;color:#888;margin-top:4px;">Printed: ${new Date().toLocaleString()}</div>
</body></html>`;
}

export default function KOTPrint({ sale, triggerRef, children }) {
  const { restaurant } = usePermission();
  const iframeRef = useRef(null);

  const handlePrint = () => {
    if (!sale) return;
    const html = buildKotHtml(sale, restaurant);

    const iframe = iframeRef.current;
    if (!iframe) return;
    writeAndPrint(iframe, html);
  };

  if (triggerRef) {
    triggerRef.current = handlePrint;
  }

  return (
    <>
      <iframe
        ref={iframeRef}
        style={{ position: 'fixed', top: 0, left: '-2000px', width: '80mm', height: '1200mm', border: 0 }}
        title="kot-frame"
      />
      {children ? (
        <span onClick={handlePrint} style={{ cursor: 'pointer' }}>{children}</span>
      ) : null}
    </>
  );
}
