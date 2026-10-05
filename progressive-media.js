/* Customer artwork loads near the viewport, independently of page data. */
(() => {
  'use strict';
  const empty =
    'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22320%22 height=%22200%22/%3E';
  const tracked = new WeakMap();
  const queue = [];
  let active = 0;
  window.AkaneProgressiveMedia = { placeholder: (ref) => empty + '#' + ref };
  const reference = (element) => {
    const src = element.getAttribute('src') || '';
    const i = src.indexOf('#akane-media:');
    return i < 0 ? null : src.slice(i + 1);
  };
  async function display(element, ref) {
    try {
      const src = await window.AkaneCloud.resolveMedia(ref);
      if (!element.isConnected || reference(element) !== ref) return;
      let media = element;
      if (src.startsWith('data:video/') && element.tagName === 'IMG') {
        media = document.createElement('video');
        for (const attr of element.attributes) {
          if (!['src', 'alt', 'loading', 'decoding'].includes(attr.name))
            media.setAttribute(attr.name, attr.value);
        }
        media.controls = true;
        media.playsInline = true;
        media.preload = 'metadata';
        media.setAttribute('aria-label', element.alt || 'Video preview');
        element.replaceWith(media);
      }
      media.src = src;
      media.removeAttribute('aria-busy');
    } catch (error) {
      if (!element.isConnected) return;
      tracked.delete(element);
      element.removeAttribute('aria-busy');
      element.setAttribute('aria-label', 'โหลดภาพไม่สำเร็จ แตะเพื่อลองใหม่');
      element.addEventListener('click', () => enqueue(element, ref), { once: true });
      console.warn('Artwork could not load', error.message);
    }
  }
  function pump() {
    while (active < 3 && queue.length) {
      const [element, ref] = queue.shift();
      if (!element.isConnected || reference(element) !== ref) continue;
      active++;
      display(element, ref).finally(() => {
        active--;
        pump();
      });
    }
  }
  function enqueue(element, ref) {
    queue.push([element, ref]);
    pump();
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        const ref = reference(entry.target);
        if (ref) enqueue(entry.target, ref);
      }
    },
    { rootMargin: '200px' },
  );
  function watch(element) {
    const ref = reference(element);
    if (!ref || tracked.get(element) === ref) return;
    tracked.set(element, ref);
    element.setAttribute('aria-busy', 'true');
    observer.observe(element);
  }
  function scan(node) {
    if (node.nodeType !== 1) return;
    if (node.matches('img,video')) watch(node);
    node.querySelectorAll('img,video').forEach(watch);
  }
  new MutationObserver((changes) => {
    for (const change of changes) {
      if (change.type === 'attributes') watch(change.target);
      else change.addedNodes.forEach(scan);
    }
  }).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src'],
  });
  scan(document.documentElement);
})();
