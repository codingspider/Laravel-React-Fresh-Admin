import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrencyFormatter } from '../../../useCurrencyFormatter';
import { usePermission } from '../../../context/PermissionContext';
import { toAbsUrl, writeAndPrint, createPrintFrame } from '../../../utils/printUtil';

const isOn = (settings, key) => {
  const v = settings?.[key];
  return v === true || v === 'true' || v === 1 || v === '1';
};

function buildAddressParts(restaurant, settings) {
  const parts = [];
  if (isOn(settings, 'show_address') && restaurant?.address) parts.push(restaurant.address);
  if (isOn(settings, 'show_city') && restaurant?.city) parts.push(restaurant.city);
  if (isOn(settings, 'show_state') && restaurant?.state) parts.push(restaurant.state);
  if (isOn(settings, 'show_zip') && restaurant?.zip_code) parts.push(restaurant.zip_code);
  return parts;
}

function logoMarkup(restaurant, settings, className) {
  const logo = settings?.logo || restaurant?.logo;
  const showLogo = isOn(settings, 'show_logo') && logo;
  if (showLogo) {
    return `<img src="${toAbsUrl(logo)}" alt="${(restaurant?.name || 'Logo').replace(/"/g, '')}" class="${className}" />`;
  }
  return `<div class="${className.replace('-img', '')}">${(restaurant?.name || 'R').charAt(0).toUpperCase()}</div>`;
}

function buildA4Html(sale, restaurant, formatAmount, t) {
  const settings = restaurant?.receipt_settings || {};
  const date = sale.created_at ? new Date(sale.created_at).toLocaleString() : '-';
  const due = Math.max(0, (parseFloat(sale.total) || 0) - (parseFloat(sale.amount_paid) || 0));

  const items = (sale.items || [])
    .map((item) => {
      const qty = item.quantity;
      const itemTotal = (parseFloat(item.unit_price) || 0) * qty;
      const modifiers = (item.modifiers || []).map((m) => {
        const modTotal = (parseFloat(m.price) || 0) * qty;
        return `<tr class="mod-tr">
          <td class="c-item mod-cell">- ${m.name} <span class="qty">x${qty}</span></td>
          <td class="c-total">${modTotal > 0 ? formatAmount(modTotal) : ''}</td>
        </tr>`;
      }).join('');
      return `
        <tr>
          <td class="c-item"><div class="item-name">${item.item_name} <span class="qty">x${qty}</span></div></td>
          <td class="c-total">${formatAmount(itemTotal)}</td>
        </tr>
        ${modifiers}`;
    })
    .join('');

  const addrParts = buildAddressParts(restaurant, settings);
  const addressHtml = addrParts.length > 0 ? `<div>${addrParts.join(', ')}</div>` : '';
  const taxNumberHtml = isOn(settings, 'show_tax_number') && settings.tax_number
    ? `<div>${t('tax_number')}: ${settings.tax_number}</div>` : '';
  const headerTextHtml = settings.header_text
    ? `<div class="header-text">${settings.header_text}</div>` : '';
  const footerText = settings.footer_text || 'Thank you for your visit!';

  const payments = (sale.payments && sale.payments.length > 0 && isOn(settings, 'show_payment_info')) ? `
    <div class="block">
      <div class="block-title">${t('payment_summary')}</div>
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
  .top { background: #0f172a; color: #fff; border-radius: 10px; padding: 22px 26px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; }
  .top-brand { display: flex; align-items: center; gap: 14px; }
  .top-logo-img { width: 46px; height: 46px; border-radius: 9px; object-fit: cover; }
  .top-logo { width: 46px; height: 46px; border-radius: 9px; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800; color: #fff; }
  .top-name { font-size: 20px; font-weight: 800; letter-spacing: -0.01em; }
  .top-sub { font-size: 11.5px; color: #94a3b8; line-height: 1.5; margin-top: 2px; }
  .top-inv { text-align: right; }
  .top-inv .t1 { font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #94a3b8; font-weight: 600; }
  .top-inv .t2 { font-size: 17px; font-weight: 700; font-family: 'Consolas', monospace; color: #fff; margin-top: 3px; }
  .top-inv .t3 { font-size: 11px; color: #94a3b8; margin-top: 3px; }
  .header-text { text-align: center; font-size: 12px; color: #64748b; margin-bottom: 18px; }
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
  .qty { color: #94a3b8; font-weight: 500; font-size: 11px; margin-left: 2px; }
  .mod-tr td { border-top: none !important; padding-top: 2px; padding-bottom: 2px; }
  .mod-cell { padding-left: 26px; color: #64748b; font-size: 12px; }
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
        ${logoMarkup(restaurant, settings, 'top-logo-img')}
        <div>
          <div class="top-name">${restaurant?.name || 'Restaurant'}</div>
          <div class="top-sub">
            ${addressHtml}
            ${restaurant?.phone ? `<div>${t('phone_number')}: ${restaurant.phone}</div>` : ''}
            ${restaurant?.email ? `<div>${restaurant.email}</div>` : ''}
            ${taxNumberHtml}
          </div>
        </div>
      </div>
      <div class="top-inv">
        <div class="t1">Invoice</div>
        <div class="t2">${sale.invoice_number || '-'}</div>
        <div class="t3">${date}</div>
      </div>
    </div>

    ${headerTextHtml}

    <table class="info-table">
      <tr>
        <td>
          <div class="info-box">
            <div class="info-label">${t('order_details')}</div>
            <div class="info-row"><span class="k">${t('order_type')}</span><span class="v">${(sale.order_type || '-').replace('_', ' ')}</span></div>
            <div class="info-row"><span class="k">${t('status')}</span><span class="v">${(sale.status || '-').replace('_', ' ')}</span></div>
            ${isOn(settings, 'show_table_number') && sale.table ? `<div class="info-row"><span class="k">${t('table')}</span><span class="v">${sale.table.name}</span></div>` : ''}
            ${sale.branch ? `<div class="info-row"><span class="k">${t('branch')}</span><span class="v">${sale.branch.name}</span></div>` : ''}
            ${isOn(settings, 'show_waiter_name') ? `<div class="info-row"><span class="k">${t('waiter')}</span><span class="v">${sale.user?.name || '-'}</span></div>` : ''}
          </div>
        </td>
        <td>
          <div class="info-box">
            <div class="info-label">${t('customer')}</div>
            <div class="info-row"><span class="k">${t('name')}</span><span class="v">${sale.customer?.name || sale.guest_name || 'Walk-in Customer'}</span></div>
            ${(sale.customer?.phone || sale.guest_phone) ? `<div class="info-row"><span class="k">${t('phone_number')}</span><span class="v">${sale.customer?.phone || sale.guest_phone}</span></div>` : ''}
            ${sale.customer?.address ? `<div class="info-row"><span class="k">${t('address')}</span><span class="v">${sale.customer.address}</span></div>` : ''}
            <div class="info-row"><span class="k">${t('payment')}</span><span class="v"><span class="status">${(sale.payment_status || 'unpaid').replace('_', ' ')}</span></span></div>
          </div>
        </td>
      </tr>
    </table>

    <div class="block">
      <div class="block-title">${t('order_items')}</div>
      <table class="data-table">
        <thead><tr>
          <th>${t('item')}</th><th class="r">${t('amount')}</th>
        </tr></thead>
        <tbody>${items}</tbody>
      </table>
    </div>

    <div class="bottom">
      <div class="notes">
        <div class="nt">${t('notes')}</div>
        ${sale.notes ? `<p><strong>${t('order')}:</strong> ${sale.notes}</p>` : '<p style="color:#94a3b8;">No order notes.</p>'}
        ${isOn(settings, 'show_kitchen_notes') && sale.kitchen_notes ? `<p style="margin-top:6px;"><strong>${t('kitchen_notes')}:</strong> ${sale.kitchen_notes}</p>` : ''}
      </div>
      <div class="totals">
        <div class="totals-row"><span class="label">${t('subtotal')}</span><span class="value">${formatAmount(sale.subtotal)}</span></div>
        ${isOn(settings, 'show_discount_info') && parseFloat(sale.discount_amount) > 0 ? `<div class="totals-row"><span class="label">${t('discount')}</span><span class="value" style="color:#b91c1c">-${formatAmount(sale.discount_amount)}</span></div>` : ''}
        ${isOn(settings, 'show_tax_info') && parseFloat(sale.tax_amount) > 0 ? `<div class="totals-row"><span class="label">${t('vat_tax')}</span><span class="value">+${formatAmount(sale.tax_amount)}</span></div>` : ''}
        ${parseFloat(sale.delivery_charge) > 0 ? `<div class="totals-row"><span class="label">${t('delivery')}</span><span class="value">+${formatAmount(sale.delivery_charge)}</span></div>` : ''}
        ${sale.coupon_code ? `<div class="totals-row"><span class="label">${t('coupon')}</span><span class="value" style="color:#15803d">${sale.coupon_code}</span></div>` : ''}
        ${parseFloat(sale.tip_amount) > 0 ? `<div class="totals-row"><span class="label">${t('tip')}</span><span class="value">+${formatAmount(sale.tip_amount)}</span></div>` : ''}
        <div class="totals-row total"><span class="label">${t('total')}</span><span class="value">${formatAmount(sale.total)}</span></div>
        ${due > 0 ? `<div class="totals-row"><span class="label">${t('amount_paid')}</span><span class="value paid">${formatAmount(sale.amount_paid)}</span></div>
        <div class="totals-row"><span class="label">${t('due')}</span><span class="value due">${formatAmount(due)}</span></div>` : `<div class="totals-row"><span class="label">${t('paid')}</span><span class="value paid">${formatAmount(sale.amount_paid)}</span></div>`}
      </div>
    </div>

    ${payments}

    <div class="footer">
      <div class="thanks">${footerText}</div>
      <div class="sub">${t('footer_sub_text')}</div>
    </div>
  </div>
</body></html>`;
}

function buildThermalHtml(sale, restaurant, formatAmount, t) {
  const settings = restaurant?.receipt_settings || {};
  const date = sale.created_at ? new Date(sale.created_at).toLocaleString() : '-';
  const items = (sale.items || [])
    .map((item) => {
      const qty = item.quantity;
      const itemTotal = (parseFloat(item.unit_price) || 0) * qty;
      const modifierRows = (item.modifiers || []).map((m) => {
        const modTotal = (parseFloat(m.price) || 0) * qty;
        return `<div class="item-row"><span class="mod-name">- ${m.name} x${qty}</span><span>${modTotal > 0 ? formatAmount(modTotal) : ''}</span></div>`;
      }).join('');
      return `<div class="item-block">
        <div class="row"><span>${item.item_name} x${qty}</span><span class="bold">${formatAmount(itemTotal)}</span></div>
        ${modifierRows}
      </div>`;
    })
    .join('');

  const due = Math.max(0, (parseFloat(sale.total) || 0) - (parseFloat(sale.amount_paid) || 0));

  const addrParts = buildAddressParts(restaurant, settings);
  const addressHtml = addrParts.length > 0
    ? `<div class="center" style="font-size:10px;color:#555;">${addrParts.join(', ')}</div>` : '';
  const phoneHtml = restaurant?.phone ? `<div class="center" style="font-size:10px;color:#555;">${t('phone_number')}: ${restaurant.phone}</div>` : '';
  const headerTextHtml = settings.header_text ? `<div class="center" style="font-size:11px;margin-top:4px;">${settings.header_text}</div>` : '';
  const taxNumberHtml = isOn(settings, 'show_tax_number') && settings.tax_number
    ? `<div class="row"><span>${t('tax_number')}:</span><span>${settings.tax_number}</span></div>` : '';
  const footerText = settings.footer_text || 'Thank you!';
  const logo = settings?.logo || restaurant?.logo;
  const showLogo = isOn(settings, 'show_logo') && logo;
  const logoHtml = showLogo
    ? `<img src="${toAbsUrl(logo)}" alt="${(restaurant?.name || 'Logo').replace(/"/g, '')}" style="width:64px;max-height:64px;object-fit:contain;display:block;margin:0 auto 4px;" />`
    : '';

  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<title>Receipt ${sale.invoice_number || sale.id}</title>
<style>
  @page { size: 80mm auto; margin: 0; }
  @media print {
    html, body { height: auto; overflow: visible; }
    body { margin: 0; }
    .row, .item-block, .center { page-break-inside: avoid; }
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Courier New', monospace; color: #000; background: #fff; padding: 8px; width: 72mm; min-width: 72mm; max-width: 72mm; font-size: 12px; line-height: 1.4; word-wrap: break-word; }
  .center { text-align: center; }
  .bold { font-weight: 700; }
  .divider { border-top: 1px dashed #000; margin: 6px 0; }
  .row { display: flex; justify-content: space-between; }
  .row span:first-child, .item-row span:first-child { margin-right: 8px; word-break: break-word; }
  .item-block { margin-bottom: 7px; }
  .item-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
  .mod-name { padding-left: 8px; font-size: 11px; color: #555; }
  img { max-width: 64px; }
</style></head><body>
  ${logoHtml}
  <div class="center bold" style="font-size:15px;margin-bottom:2px;">${restaurant?.name || 'Restaurant'}</div>
  ${addressHtml}
  ${phoneHtml}
  ${headerTextHtml}
  <div class="divider"></div>
  <div class="row"><span>${t('invoice')}:</span><span class="bold">${sale.invoice_number || '-'}</span></div>
  <div class="row"><span>${t('date')}:</span><span>${date}</span></div>
  <div class="row"><span>${t('order_type')}:</span><span>${(sale.order_type || '-').replace('_', ' ')}</span></div>
  ${isOn(settings, 'show_table_number') && sale.table ? `<div class="row"><span>${t('table')}:</span><span>${sale.table.name}</span></div>` : ''}
  ${(sale.customer || sale.guest_name) ? `<div class="row"><span>${t('customer')}:</span><span>${sale.customer?.name || sale.guest_name}</span></div>` : ''}
  ${taxNumberHtml}
  <div class="divider"></div>
  <div class="bold" style="margin-bottom:4px;">${t('items')}</div>
  ${items}
  <div class="divider"></div>
  <div class="row"><span>${t('subtotal')}:</span><span>${formatAmount(sale.subtotal)}</span></div>
  ${isOn(settings, 'show_discount_info') && parseFloat(sale.discount_amount) > 0 ? `<div class="row"><span>${t('discount')}:</span><span>-${formatAmount(sale.discount_amount)}</span></div>` : ''}
  ${isOn(settings, 'show_tax_info') && parseFloat(sale.tax_amount) > 0 ? `<div class="row"><span>${t('vat_tax')}:</span><span>+${formatAmount(sale.tax_amount)}</span></div>` : ''}
  ${parseFloat(sale.delivery_charge) > 0 ? `<div class="row"><span>${t('delivery')}:</span><span>+${formatAmount(sale.delivery_charge)}</span></div>` : ''}
  <div class="divider"></div>
  <div class="row bold" style="font-size:14px;"><span>${t('total')}:</span><span>${formatAmount(sale.total)}</span></div>
  ${due > 0 ? `<div class="row"><span>${t('paid')}:</span><span>${formatAmount(sale.amount_paid)}</span></div>
  <div class="row bold"><span>${t('due')}:</span><span>${formatAmount(due)}</span></div>` : `<div class="row"><span>${t('status')}:</span><span class="bold">PAID IN FULL</span></div>`}
  <div class="divider"></div>
  <div class="center" style="margin-top:8px;font-size:11px;">${footerText}</div>
</body></html>`;
}

function printHtml(html) {
  const iframe = createPrintFrame();
  writeAndPrint(iframe, html).then(() => {
    setTimeout(() => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 1000);
  });
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
        title="print-frame"
      />
      {children ? (
        <span onClick={handlePrint} style={{ cursor: 'pointer' }}>{children}</span>
      ) : null}
    </>
  );
}

export { buildA4Html, buildThermalHtml, printHtml };
