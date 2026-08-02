/**
 * Shared helpers for the print iframe flow.
 * `uploadImage()` stores relative paths (e.g. uploads/restaurant/logo/x.png),
 * so image URLs must be absolutised before printing, and printing must wait
 * for images to finish loading so the page is measured with them in place.
 */

export const toAbsUrl = (path) => {
  if (!path) return path;
  if (/^(https?:)?\/\//i.test(path)) return path;
  return `${window.location.origin}/${String(path).replace(/^\/+/, '')}`;
};

/**
 * Create a print iframe. It must be a real, sized element (not display:none
 * or 0x0), otherwise Chrome can fall back to the printer driver's default
 * paper size and paginate/cut like fixed pages instead of a continuous roll.
 * It is kept off-screen so it never flashes or shifts the layout.
 */
export const createPrintFrame = () => {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.top = '0';
  iframe.style.left = '-2000px';
  iframe.style.width = '80mm';
  iframe.style.height = '1200mm';
  iframe.style.border = '0';
  iframe.title = 'print-frame';
  document.body.appendChild(iframe);
  return iframe;
};

const waitForImages = (doc, timeout = 5000) =>
  new Promise((resolve) => {
    const imgs = Array.from(doc.images || []);
    if (imgs.length === 0) {
      resolve();
      return;
    }

    let pending = imgs.length;
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    imgs.forEach((img) => {
      if (img.complete) {
        pending -= 1;
        if (pending === 0) finish();
      } else {
        img.addEventListener('load', () => {
          pending -= 1;
          if (pending === 0) finish();
        }, { once: true });
        img.addEventListener('error', () => {
          pending -= 1;
          if (pending === 0) finish();
        }, { once: true });
      }
    });

    setTimeout(finish, timeout);
  });

/**
 * Write HTML into a hidden iframe and trigger the print dialog after the
 * document (and any images) have finished rendering.
 */
export const writeAndPrint = async (iframe, html, delay = 300) => {
  if (!iframe) return;
  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();

  await waitForImages(doc);

  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  }, delay);
};

