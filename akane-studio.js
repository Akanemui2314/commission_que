import { render, el, button } from './rate-core.js?v=akane-studio-1';
import { tosModel } from './tos-core.js?v=akane-studio-1';
const sheet = document.createElement('link');
sheet.rel = 'stylesheet';
sheet.href = 'rate-builder.css?v=akane-studio-1';
document.head.append(sheet);
const style = el('style');
style.textContent = `.akane-layout[hidden]{display:none!important}.akane-layout .calculator{margin:0!important;width:100%!important;box-sizing:border-box}.akane-layout .akane-calculator-slot{width:100%}.akane-layout .rate-public-card{margin:16px 0;background:#fffaf5;border-color:#ffb7c5}.akane-type-settings{margin-top:20px;padding:16px;border:1px solid #ffb7c5;border-radius:18px}.akane-type-settings fieldset{margin:14px 0}.akane-type-settings label{display:flex!important;align-items:center;gap:8px;margin:8px 0}.akane-type-settings input[type=checkbox]{width:18px!important;height:18px;accent-color:#ac4e68}.akane-type-settings .row{flex-wrap:wrap}.akane-custom-links{padding:22px;margin:20px 0;background:#fffaf5;border-radius:24px}.akane-custom-links a{display:inline-flex;padding:12px 20px;background:#ffa6ba;color:white;border-radius:999px;text-decoration:none;margin:6px}.akane-custom-links[hidden]{display:none!important}#akane-concepts[data-admin="true"] .tos-admin{display:none!important}.tos-content .rate-public-card{padding:12px 0;border:0;box-shadow:none}.tos-content .rate-page-title{display:none}.tos-language{display:none!important}@media(max-width:680px){.akane-layout .rate-public-card{padding:16px}.akane-type-settings{padding:12px}}`;
document.head.append(style);
const layouts = new WeakMap();
function apply(surface, data) {
  window.AkanePageData = data;
  if (document.querySelector('#akane-concepts')?.dataset.admin === 'true') {
    admin(surface);
    return;
  }
  if (!data?.calculatorContent) return;
  const calculator = surface.querySelector('.calculator');
  if (!calculator) return;
  let info = layouts.get(surface);
  if (!info) {
    const canvas = el('div', 'akane-layout');
    calculator.before(canvas);
    info = {
      canvas,
      calculator,
      pages: {},
      title: calculator.querySelector('h2').textContent,
      notes: calculator.querySelector('.price-notes ul').innerHTML,
    };
    layouts.set(surface, info);
    new MutationObserver(() => {
      canvas.hidden = calculator.hidden;
    }).observe(calculator, { attributes: true, attributeFilter: ['hidden'] });
  }
  const paint = () => {
    const anchor = el('div');
    info.calculator.replaceWith(anchor);
    render(info.canvas, data.calculatorContent, info.pages, paint);
    const slot = info.canvas.querySelector('.akane-calculator-slot');
    if (slot) {
      const config = data.calculatorContent.sections
        .flatMap((s) => s.blocks)
        .find((b) => b.kind === 'calculator');
      info.calculator.querySelector('h2').textContent = config?.title || info.title;
      info.calculator.querySelector('.price-notes ul').innerHTML = info.notes;
      if (config?.note) {
        const list = info.calculator.querySelector('.price-notes ul');
        list.replaceChildren(
          ...config.note
            .split('\n')
            .filter(Boolean)
            .map((text) => el('li', '', text)),
        );
      }
      slot.replaceChildren(info.calculator);
    } else {
      info.canvas.append(info.calculator);
    }
    anchor.remove();
    info.canvas.hidden = info.calculator.hidden;
  };
  paint();
}
function terms(target, language, data) {
  const content = data ? tosModel(data) : null;
  if (!content) return false;
  render(target, content, {}, () => terms(target, language, data));
  return true;
}
function admin(surface) {
  if (document.querySelector('#akane-concepts')?.dataset.admin !== 'true') return;
  let links = surface.querySelector('.akane-custom-links');
  if (!links) {
    links = el('section', 'akane-custom-links');
    links.append(el('h2', '', 'Customize pages'));
    for (const [label, url] of [
      ['Customize Check Price', 'price-rate-admin.html'],
      ['Customize TOS', 'tos-admin.html'],
    ]) {
      const a = el('a', '', label + ' ↗');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener';
      links.append(a);
    }
    surface.querySelector('.tos-admin').before(links);
    surface
      .querySelectorAll('.tos-editor,.save-tos,.tos-save-result')
      .forEach((node) => (node.hidden = true));
  }
  links.hidden = !window.AkaneAuth.isOwner(window.AkaneAuth.user);
  typeSettings(surface);
}
function typeSettings(surface) {
  if (
    document.querySelector('#akane-concepts')?.dataset.admin !== 'true' ||
    !surface.akaneTypeEditor
  )
    return;
  const api = surface.akaneTypeEditor,
    config = api.get();
  if (!config.scales || !config.finishes) return;
  let panel = surface.querySelector('.akane-type-settings');
  if (!panel) {
    panel = el('details', 'akane-type-settings');
    surface.querySelector('.work-fields-column').append(panel);
  }
  const open = panel.open;
  panel.replaceChildren(el('summary', '', 'Customize Scale / Color · ' + config.name));
  panel.open = open;
  const status = el('p');
  status.setAttribute('role', 'status');
  for (const [kind, label, all] of [
    ['scales', 'สเกลภาพ', config.allScales],
    ['finishes', 'Customize Color Scale', config.allFinishes],
  ]) {
    const fieldset = el('fieldset');
    fieldset.append(el('legend', '', label));
    const selected = config[kind];
    for (const name of [...new Set([...selected, ...all])]) {
      const row = el('label'),
        check = el('input');
      check.type = 'checkbox';
      check.checked = selected.includes(name);
      check.setAttribute('aria-label', config.name + ' ' + label + ' ' + name);
      check.onchange = async () => {
        const choices = [...fieldset.querySelectorAll('input[type=checkbox]')]
          .filter((i) => i.checked)
          .map((i) => i.dataset.choice);
        fieldset.disabled = true;
        try {
          await api.update(kind, choices);
        } catch (e) {
          check.checked = !check.checked;
          status.textContent = e.message;
        } finally {
          fieldset.disabled = false;
        }
      };
      check.dataset.choice = name;
      row.append(check, document.createTextNode(name));
      fieldset.append(row);
    }
    const row = el('div', 'row'),
      input = el('input');
    input.placeholder = 'ชื่อใหม่';
    input.setAttribute('aria-label', 'เพิ่ม ' + label + ' สำหรับ ' + config.name);
    const add = button('+ เพิ่ม', async () => {
      const name = input.value.trim();
      if (!name) return;
      fieldset.disabled = true;
      try {
        await api.update(kind, [...selected, name]);
      } catch (e) {
        status.textContent = e.message;
      } finally {
        fieldset.disabled = false;
      }
    });
    row.append(input, add);
    fieldset.append(row);
    panel.append(fieldset);
  }
  panel.append(status);
}
window.AkaneVisual = { apply, terms, admin, typeSettings };
for (const surface of document.querySelectorAll('#akane-concepts .ak')) {
  admin(surface);
  if (window.AkanePageData) apply(surface, window.AkanePageData);
}
if (location.hash === '#calculator') {
  const show = () => {
    const trigger = document.querySelector('a[data-local="commission"]');
    if (trigger) trigger.click();
  };
  window.addEventListener('load', show, { once: true });
}
