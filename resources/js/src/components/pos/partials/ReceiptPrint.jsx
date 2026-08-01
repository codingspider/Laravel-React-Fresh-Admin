import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrencyFormatter } from '../../../useCurrencyFormatter';
import { usePermission } from '../../../context/PermissionContext';

function buildA4Html(sale, restaurant, formatAmount, t) {
  const date = sale.created_at ? new Date(sale.created_at).toLocaleString() : '-';
  const due = Math.max(0, (parseFloat(sale.total) || 0) - (parseFloat(sale.amount_paid) || 0));

  const items = (sale.items || [])
    .map(
      (item, idx) => {
        const modifierPrices = item.modifiers && item.modifiers.length > 0
          ? item.modifiers.reduce((sum, m) => sum + (parseFloat(m.price) || 0), 0)
          : 0;
        const basePrice = parseFloat(item.unit_price) - modifierPrices;
        const modifiers = item.modifiers && item.modifiers.length > 0
          ? item.modifiers.map((m) => `<div class="mod-row"><span>${m.name}</span><span>${m.price ? `+${formatAmount(m.price)}` : ''}</span></div>`).join('')
          : '';
        return `
        <tr>
          <td class="c-num">${idx + 1}</td>
          <td class="c-item">
            <div class="item-name">${item.item_name}</div>
            ${modifiers}
          </td>
          <td class="c-qty">${item.quantity}</td>
          <td class="c-price">${formatAmount(basePrice)}</td>
          <td class="c-total">${formatAmount(item.total)}</td>
        </tr>`;
      }
    )
    .join('');

  const payments = (sale.payments && sale.payments.length > 0) ? `
    <div class="block">
      <div class="block-title">Payment Summary</div>
      <table class="data-table">
        <thead><tr>
          <th>#</th><th>Method</th><th>Reference</th><th class="r">Amount</th><th>Date</th>
        </tr></thead>
        <tbody>${sale.payments.map((p, i) => `
          <tr>
            <td class="c-num">${i + 1}</td>
            <td class="c-item">${(p.payment_method || '').replace('_', ' ')}</td>
            <td class="c-qty">${p.reference_number || '-'}</td>
            <td class="c-total">${formatAmount(p.amount)}</td>
            <td class="c-qty">${p.created_at ? new Date(p.created_at).toLocaleString() : '-'}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>` : '';

  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<title>Invoice ${sale.invoice_number || sale.id}</title>
<style>
  @media print { body { margin: 0; } @page { size: A4; margin: 12mm; } }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', -apple-system, Arial, sans-serif; color: #1e293b; background: #fff; font-size: 13px; }
  .page { padding: 8px; }
  /* ===== Top band ===== */
  .top { background: #0f172a; color: #fff; border-radius: 10px; padding: 22px 26px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
  .top-brand { display: flex; align-items: center; gap: 14px; }
  .top-logo { width: 46px; height: 46px; border-radius: 9px; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800; color: #fff; }
  .top-name { font-size: 20px; font-weight: 800; letter-spacing: -0.01em; }
  .top-sub { font-size: 11.5px; color: #94a3b8; line-height: 1.5; margin-top: 2px; }
  .top-inv { text-align: right; }
  .top-inv .t1 { font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #94a3b8; font-weight: 600; }
  .top-inv .t2 { font-size: 17px; font-weight: 700; font-family: 'Consolas', monospace; color: #fff; margin-top: 3px; }
  .top-inv .t3 { font-size: 11px; color: #94a3b8; margin-top: 3px; }
  /* ===== Info table ===== */
  .info-table { width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 24px; }
  .info-table td { border: 1px solid #e2e8f0; padding: 0; width: 50%; }
  .info-box { padding: 14px 18px; }
  .info-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #94a3b8; font-weight: 700; margin-bottom: 8px; }
  .info-row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 12.5px; }
  .info-row .k { color: #64748b; }
  .info-row .v { color: #1e293b; font-weight: 600; }
  .status { display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; background: ${sale.payment_status === 'paid' ? '#dcfce7' : sale.payment_status === 'partial' ? '#fef9c3' : '#fee2e2'}; color: ${sale.payment_status === 'paid' ? '#15803d' : sale.payment_status === 'partial' ? '#a16207' : '#b91c1c'}; }
  /* ===== Items ===== */
  .block { margin-bottom: 22px; }
  .block-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #64748b; font-weight: 700; margin-bottom: 10px; }
  .data-table { width: 100%; border-collapse: collapse; }
  .data-table thead th { background: #f1f5f9; color: #475569; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; padding: 11px 14px; text-align: left; border: 1px solid #e2e8f0; }
  .data-table thead th.r { text-align: right; }
  .data-table tbody td { padding: 10px 14px; border: 1px solid #e2e8f0; vertical-align: top; font-size: 13px; }
  .data-table tbody tr:nth-child(even) { background: #f8fafc; }
  .c-num { width: 40px; color: #94a3b8; text-align: center; }
  .c-item { color: #1e293b; }
  .item-name { font-weight: 600; color: #0f172a; }
  .mod-row { display: flex; justify-content: space-between; font-size: 12px; color: #64748b; padding-left: 10px; margin-top: 2px; max-width: 300px; }
  .c-qty { text-align: center; color: #475569; }
  .c-price { text-align: right; color: #475569; }
  .c-total { text-align: right; font-weight: 700; color: #0f172a; }
  /* ===== Totals ===== */
  .bottom { display: flex; gap: 24px; margin-bottom: 22px; }
  .notes { flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; }
  .notes .nt { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #94a3b8; font-weight: 700; margin-bottom: 8px; }
  .notes p { font-size: 12.5px; color: #475569; line-height: 1.6; }
  .totals { width: 300px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
  .totals-row { display: flex; justify-content: space-between; padding: 7px 16px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
  .totals-row .label { color: #64748b; }
  .totals-row .value { font-weight: 600; color: #334155; }
  .totals-row.total { background: #0f172a; color: #fff; padding: 12px 16px; font-size: 15px; font-weight: 800; border-bottom: none; }
  .totals-row.total .label, .totals-row.total .value { color: #fff; }
  .totals-row.total .value { font-size: 17px; }
  .paid { color: #15803d !important; font-weight: 700; }
  .due { color: #b91c1c !important; font-weight: 700; }
  /* ===== Footer ===== */
  .footer { text-align: center; padding-top: 18px; border-top: 2px solid #f1f5f9; margin-top: 8px; }
  .footer .thanks { font-size: 15px; color: #1e293b; font-weight: 700; margin-bottom: 3px; }
  .footer .sub { font-size: 12px; color: #94a3b8; }
</style></head><body>
  <div class="page">
    <div class="top">
      <div class="top-brand">
        <div class="top-logo">${(restaurant?.name || 'R').charAt(0).toUpperCase()}</div>
        <div>
          <div class="top-name">${restaurant?.name || 'Restaurant'}</div>
          <div class="top-sub">
            ${restaurant?.full_address ? `<div>${restaurant.full_address}</div>` : ''}
            ${restaurant?.phone ? `<div>Phone: ${restaurant.phone}</div>` : ''}
            ${restaurant?.email ? `<div>${restaurant.email}</div>` : ''}
          </div>
        </div>
      </div>
      <div class="top-inv">
        <div class="t1">Invoice</div>
        <div class="t2">${sale.invoice_number || '-'}</div>
        <div class="t3">${date}</div>
      </div>
    </div>

    <table class="info-table">
      <tr>
        <td>
          <div class="info-box">
            <div class="info-label">Order Details</div>
            <div class="info-row"><span class="k">Order Type</span><span class="v">${(sale.order_type || '-').replace('_', ' ')}</span></div>
            <div class="info-row"><span class="k">Status</span><span class="v">${(sale.status || '-').replace('_', ' ')}</span></div>
            ${sale.table ? `<div class="info-row"><span class="k">Table</span><span class="v">${sale.table.name}</span></div>` : ''}
            ${sale.branch ? `<div class="info-row"><span class="k">Branch</span><span class="v">${sale.branch.name}</span></div>` : ''}
            <div class="info-row"><span class="k">Cashier</span><span class="v">${sale.user?.name || '-'}</span></div>
          </div>
        </td>
        <td>
          <div class="info-box">
            <div class="info-label">Customer</div>
            <div class="info-row"><span class="k">Name</span><span class="v">${sale.customer?.name || 'Walk-in Customer'}</span></div>
            ${sale.customer?.phone ? `<div class="info-row"><span class="k">Phone</span><span class="v">${sale.customer.phone}</span></div>` : ''}
            ${sale.customer?.address ? `<div class="info-row"><span class="k">Address</span><span class="v">${sale.customer.address}</span></div>` : ''}
            <div class="info-row"><span class="k">Payment</span><span class="v"><span class="status">${(sale.payment_status || 'unpaid').replace('_', ' ')}</span></span></div>
          </div>
        </td>
      </tr>
    </table>

    <div class="block">
      <div class="block-title">Order Items</div>
      <table class="data-table">
        <thead><tr>
          <th style="width:40px">#</th><th>Item</th><th style="text-align:center">Qty</th><th class="r">Price</th><th class="r">Total</th>
        </tr></thead>
        <tbody>${items}</tbody>
      </table>
    </div>

    <div class="bottom">
      <div class="notes">
        <div class="nt">Notes</div>
        ${sale.notes ? `<p><strong>Order:</strong> ${sale.notes}</p>` : '<p style="color:#94a3b8;">No order notes.</p>'}
        ${sale.kitchen_notes ? `<p style="margin-top:6px;"><strong>Kitchen:</strong> ${sale.kitchen_notes}</p>` : ''}
      </div>
      <div class="totals">
        <div class="totals-row"><span class="label">Subtotal</span><span class="value">${formatAmount(sale.subtotal)}</span></div>
        ${parseFloat(sale.discount_amount) > 0 ? `<div class="totals-row"><span class="label">Discount</span><span class="value" style="color:#b91c1c">-${formatAmount(sale.discount_amount)}</span></div>` : ''}
        ${parseFloat(sale.tax_amount) > 0 ? `<div class="totals-row"><span class="label">VAT / Tax</span><span class="value">+${formatAmount(sale.tax_amount)}</span></div>` : ''}
        ${parseFloat(sale.delivery_charge) > 0 ? `<div class="totals-row"><span class="label">Delivery</span><span class="value">+${formatAmount(sale.delivery_charge)}</span></div>` : ''}
        ${sale.coupon_code ? `<div class="totals-row"><span class="label">Coupon</span><span class="value" style="color:#15803d">${sale.coupon_code}</span></div>` : ''}
        ${parseFloat(sale.tip_amount) > 0 ? `<div class="totals-row"><span class="label">Tip</span><span class="value">+${formatAmount(sale.tip_amount)}</span></div>` : ''}
        <div class="totals-row total"><span class="label">Total</span><span class="value">${formatAmount(sale.total)}</span></div>
        ${due > 0 ? `<div class="totals-row"><span class="label">Amount Paid</span><span class="value paid">${formatAmount(sale.amount_paid)}</span></div>
        <div class="totals-row"><span class="label">Due</span><span class="value due">${formatAmount(due)}</span></div>` : `<div class="totals-row"><span class="label">Paid</span><span class="value paid">${formatAmount(sale.amount_paid)}</span></div>`}
      </div>
    </div>

    ${payments}

    <div class="footer">
      <div class="thanks">Thank you for your visit!</div>
      <div class="sub">We hope to serve you again soon.</div>
    </div>
  </div>
</body></html>`;
}

function buildThermalHtml(sale, restaurant, formatAmount, t) {
  const date = sale.created_at ? new Date(sale.created_at).toLocaleString() : '-';
  const items = (sale.items || [])
    .map(
      (item) => {
        const modifierPrices = item.modifiers && item.modifiers.length > 0
          ? item.modifiers.reduce((sum, m) => sum + (parseFloat(m.price) || 0), 0)
          : 0;
        const basePrice = parseFloat(item.unit_price) - modifierPrices;
        const modifierRows = item.modifiers && item.modifiers.length > 0
          ? item.modifiers.map((m) => `<div class="item-row">${m.name}${m.price ? ` <span style="float:right;">+${formatAmount(m.price)}</span>` : ''}</div>`).join('')
          : '';
        return `<div style="margin-bottom:6px;">
        <div class="row"><span>${item.item_name} x${item.quantity}</span><span class="bold">${formatAmount(basePrice)}</span></div>
        ${modifierRows}
        <div class="row"><span class="bold">Total:</span><span class="bold">${formatAmount(item.total)}</span></div>
      </div>`;
      }
    )
    .join('');

  const due = Math.max(0, (parseFloat(sale.total) || 0) - (parseFloat(sale.amount_paid) || 0));

  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<title>Receipt ${sale.invoice_number || sale.id}</title>
<style>
  @media print { @page { size: 80mm auto; margin: 2mm; } body { margin: 0; } }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Courier New', monospace; color: #000; background: #fff; padding: 8px; width: 72mm; font-size: 12px; line-height: 1.4; }
  .center { text-align: center; }
  .bold { font-weight: 700; }
  .divider { border-top: 1px dashed #000; margin: 6px 0; }
  .row { display: flex; justify-content: space-between; }
  .item-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
</style></head><body>
  <div class="center bold" style="font-size:15px;margin-bottom:2px;">${restaurant?.name || 'Restaurant'}</div>
  ${restaurant?.full_address ? `<div class="center" style="font-size:10px;color:#555;">${restaurant.full_address}</div>` : ''}
  ${restaurant?.phone ? `<div class="center" style="font-size:10px;color:#555;">${restaurant.phone}</div>` : ''}
  <div class="divider"></div>
  <div class="row"><span>Invoice:</span><span class="bold">${sale.invoice_number || '-'}</span></div>
  <div class="row"><span>Date:</span><span>${date}</span></div>
  <div class="row"><span>Type:</span><span>${(sale.order_type || '-').replace('_', ' ')}</span></div>
  ${sale.table ? `<div class="row"><span>Table:</span><span>${sale.table.name}</span></div>` : ''}
  ${sale.customer ? `<div class="row"><span>Customer:</span><span>${sale.customer.name}</span></div>` : ''}
  <div class="divider"></div>
  <div class="bold" style="margin-bottom:4px;">ITEMS</div>
  ${items}
  <div class="divider"></div>
  <div class="row"><span>Subtotal:</span><span>${formatAmount(sale.subtotal)}</span></div>
  ${parseFloat(sale.discount_amount) > 0 ? `<div class="row"><span>Discount:</span><span>-${formatAmount(sale.discount_amount)}</span></div>` : ''}
  ${parseFloat(sale.tax_amount) > 0 ? `<div class="row"><span>Tax:</span><span>+${formatAmount(sale.tax_amount)}</span></div>` : ''}
  ${parseFloat(sale.delivery_charge) > 0 ? `<div class="row"><span>Delivery:</span><span>+${formatAmount(sale.delivery_charge)}</span></div>` : ''}
  <div class="divider"></div>
  <div class="row bold" style="font-size:14px;"><span>TOTAL:</span><span>${formatAmount(sale.total)}</span></div>
  ${due > 0 ? `<div class="row"><span>Paid:</span><span>${formatAmount(sale.amount_paid)}</span></div>
  <div class="row bold"><span>DUE:</span><span>${formatAmount(due)}</span></div>` : `<div class="row"><span>Status:</span><span class="bold">PAID IN FULL</span></div>`}
  <div class="divider"></div>
  <div class="center" style="margin-top:8px;font-size:11px;">Thank you!</div>
</body></html>`;
}

export default function ReceiptPrint({ sale, type = 'a4', triggerRef, children }) {
  const { t } = useTranslation();
  const { formatAmount } = useCurrencyFormatter();
  const { restaurant } = usePermission();
  const iframeRef = useRef(null);

  const handlePrint = () => {
    if (!sale) return;
    const html = type === 'thermal'
      ? buildThermalHtml(sale, restaurant, formatAmount, t)
      : buildA4Html(sale, restaurant, formatAmount, t);

    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }, 300);
  };

  if (triggerRef) {
    triggerRef.current = handlePrint;
  }

  return (
    <>
      <iframe
        ref={iframeRef}
        style={{ display: 'none', position: 'fixed', top: 0, left: 0, width: 0, height: 0 }}
        title="print-frame"
      />
      {children ? (
        <span onClick={handlePrint} style={{ cursor: 'pointer' }}>{children}</span>
      ) : null}
    </>
  );
}

export { buildA4Html, buildThermalHtml };
