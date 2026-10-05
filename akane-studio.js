import { render, el, button } from './rate-core.js?v=akane-studio-1';
import { tosModel } from './tos-core.js?v=akane-studio-1';
const sheet = document.createElement('link');
sheet.rel = 'stylesheet';
sheet.href = 'rate-builder.css?v=akane-studio-1';
document.head.append(sheet);
const style = el('style');
style.textContent = `.akane-choice-row{display:flex;align-items:center;justify-content:space-between;gap:8px}.akane-choice-row>label{flex:1;min-width:0}.akane-choice-row button{padding:6px 12px!important}.akane-choice-row .row{gap:6px}.akane-layout[hidden]{display:none!important}.akane-layout .calculator{margin:0!important;width:100%!important;box-sizing:border-box}.akane-layout .akane-calculator-slot{width:100%}.akane-layout .rate-public-card{margin:16px 0;background:#fffaf5;border-color:#ffb7c5}.akane-type-settings{margin-top:20px;padding:16px;border:1px solid #ffb7c5;border-radius:18px}.akane-type-settings fieldset{margin:14px 0}.akane-type-settings label{display:flex!important;align-items:center;gap:8px;margin:8px 0}.akane-type-settings input[type=checkbox]{width:18px!important;height:18px;accent-color:#ac4e68}.akane-type-settings .row{flex-wrap:wrap}.akane-custom-links{padding:22px;margin:20px 0;background:#fffaf5;border-radius:24px}.akane-custom-links a{display:inline-flex;padding:12px 20px;background:#ffa6ba;color:white;border-radius:999px;text-decoration:none;margin:6px}.akane-custom-links[hidden]{display:none!important}.tos-dialog{background:#fffaf0!important}.tos-dialog .tos-heading{background:#fff0f5!important}.tos-dialog .tos-content{background:#fffaf0!important}.tos-content .rate-public-card{padding:12px 0;border:0;box-shadow:none;background:transparent!important}.tos-content .rate-page-title{display:none}.tos-language{display:none!important}@media(max-width:680px){.akane-layout .rate-public-card{padding:16px}.akane-type-settings{padding:12px}}`;

style.textContent += '#akane-concepts .ak .taxonomy-manager .akane-type-settings{margin:18px 0 0!important;padding:0!important;border:0!important;background:transparent!important}.akane-option-library{margin:12px 0}.akane-choice-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #ffb7c540}.akane-choice-name{flex:1}.akane-drag-handle{cursor:grab;touch-action:none;user-select:none}.akane-choice-row.dragging{background:#fff0f5;opacity:.75}.akane-type-settings>label{display:block!important}.akane-type-settings .row>select,.akane-type-settings .row>input{flex:1;min-width:140px}.akane-type-settings .akane-choice-row>button{flex-shrink:0}';
style.textContent += '.akane-choice-name{cursor:text}.taxonomy-list input[readonly]{border-color:transparent!important;background:transparent!important;cursor:text}.akane-choice-row.dragging,.taxonomy-list .dragging{background:#fff0f5}.akane-drag-handle:active{cursor:grabbing}';
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
    surface.querySelector('.admin-preview').after(links);
    surface
      .querySelectorAll('.tos-editor,.save-tos,.tos-save-result')
      .forEach((node) => (node.hidden = true));
  }
  links.hidden = !window.AkaneAuth.isOwner(window.AkaneAuth.user);
  typeSettings(surface);
}
// Keep pointer listeners on the document: moving a row must not lose the drag.
function dragOrder(handle, row, list, save) {
  handle.onpointerdown = (event) => {
    if (event.button !== 0 || handle.disabled) return;
    event.preventDefault();
    const before = [...list.children];
    row.classList.add('dragging');
    const move = (event) => {
      const otherRows = [...list.children].filter(item => item !== row);
      const target = otherRows.find(item => event.clientY < item.getBoundingClientRect().top + item.getBoundingClientRect().height / 2);
      list.insertBefore(row, target || null);
    };
    const finish = (event) => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', finish);
      document.removeEventListener('pointercancel', cancel);
      row.classList.remove('dragging');
      const after = [...list.children];
      if (after.some((item, index) => item !== before[index])) save(after);
    };
    const cancel = () => {
      before.forEach(item => list.append(item));
      finish();
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', finish, {once:true});
    document.addEventListener('pointercancel', cancel, {once:true});
  };
}
function editableName(label, name, save) {
  label.tabIndex = 0;
  label.setAttribute('role', 'button');
  label.setAttribute('aria-label', 'แก้ชื่อ ' + name);
  const edit = () => {
    const input = el('input');
    input.value = name;
    input.setAttribute('aria-label', 'ชื่อใหม่ของ ' + name);
    label.replaceWith(input);
    input.focus();
    input.select();
    let finished = false;
    const finish = (cancelled) => {
      if (finished) return;
      finished = true;
      const value = input.value.trim();
      input.replaceWith(label);
      if (!cancelled && value && value !== name) save(value);
    };
    input.onblur = () => finish(false);
    input.onkeydown = (event) => {
      if (event.key === 'Enter' || event.key === 'Escape') {
        event.preventDefault();
        finish(event.key === 'Escape');
      }
    };
  };
  label.onclick = edit;
  label.onkeydown = event => { if (event.key === 'Enter') edit(); };
}
function typeSettings(surface) {
  if (document.querySelector('#akane-concepts')?.dataset.admin !== 'true' || !surface.akaneTypeEditor) return;
  const api = surface.akaneTypeEditor;
  const parent = surface.querySelector('.taxonomy-manager');
  if (!parent) return;
  parent.querySelector('summary').textContent = 'Custom Type & Color';
  let panel = parent.querySelector('.akane-type-settings');
  if (!panel) {
    surface.querySelector('.akane-type-settings')?.remove();
    const library = el('details', 'akane-option-library');
    library.append(el('summary', '', 'เพิ่ม / เปลี่ยนชื่อ Type และตัวเลือก'));
    for (const child of [...parent.children]) {
      if (child.tagName !== 'SUMMARY') library.append(child);
    }
    parent.append(library);
    panel = el('div', 'akane-type-settings');
    parent.append(panel);
  }
  const config = api.get(panel.dataset.typeKey);
  panel.dataset.typeKey = config.key;
  panel.replaceChildren();
  const typeLabel = el('label', '', 'เลือก Type ที่ต้องการตั้งค่า');
  const typeSelect = el('select');
  for (const type of config.types) typeSelect.add(new Option(type.name, type.id));
  typeSelect.value = config.key;
  typeSelect.onchange = () => { panel.dataset.typeKey = typeSelect.value; typeSettings(surface); };
  typeLabel.append(typeSelect);
  panel.append(typeLabel, el('p', 'small', 'ลากที่ ⋮⋮ เพื่อจัดลำดับ ตัวเลือกและราคาจะเชื่อมกับ Price settings'));
  const status = el('p');
  status.setAttribute('role', 'status');
  for (const [kind, title, available] of [['scales', 'สเกลภาพ', config.allScales], ['finishes', 'การลงสี', config.allFinishes]]) {
    const fieldset = el('fieldset');
    fieldset.append(el('legend', '', title));
    const list = el('div', 'akane-choice-list');
    const save = async (choices, removed) => {
      fieldset.disabled = true;
      status.textContent = 'กำลังบันทึก…';
      try { await api.update(kind, choices, removed, config.key); }
      catch (error) { status.textContent = error.message; typeSettings(surface); panel.lastChild.textContent = error.message; }
      finally { fieldset.disabled = false; }
    };
    for (const name of config[kind]) {
      const item = el('div', 'akane-choice-row');
      item.dataset.choice = name;
      const handle = button('⋮⋮', () => {});
      handle.classList.add('akane-drag-handle');
      handle.setAttribute('aria-label', 'ลากจัดลำดับ ' + title + ' ' + name);
      dragOrder(handle, item, list, rows => save(rows.map(row => row.dataset.choice)));
      const label = el('span', 'akane-choice-name', name);
      editableName(label, name, async value => {
        try { await api.rename(kind, name, value); }
        catch (error) { status.textContent = error.message; }
      });
      const remove = button('ลบ', () => save(api.get(config.key)[kind].filter(value => value !== name), name));
      remove.setAttribute('aria-label', 'ลบ ' + title + ' ' + name + ' จาก ' + config.name);
      item.append(handle, label, remove);
      list.append(item);
    }
    const addRow = el('div', 'row');
    const select = el('select');
    select.setAttribute('aria-label', 'เพิ่ม ' + title + ' ที่มีอยู่');
    select.add(new Option('เลือกตัวเลือกที่มีอยู่', ''));
    for (const name of available.filter(value => !config[kind].includes(value))) select.add(new Option(name, name));
    const input = el('input');
    input.placeholder = 'หรือพิมพ์ชื่อใหม่';
    input.setAttribute('aria-label', 'เพิ่ม ' + title + ' ใหม่สำหรับ ' + config.name);
    const add = button('+ เพิ่ม', () => {
      const name = input.value.trim() || select.value;
      if (name) save([...api.get(config.key)[kind], name]);
    });
    addRow.append(select, input, add);
    fieldset.append(list, addRow);
    panel.append(fieldset);
  }
  panel.append(status);
}
window.AkaneVisual = { apply, terms, admin, typeSettings, dragOrder };
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
