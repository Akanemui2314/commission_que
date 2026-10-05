// Editor preview only. Uses saved taxonomy and prices without writing site data.
export function renderCalculatorPreview(target, block, data) {
  const make = (tag, className = '', text = '') => {
    const node = document.createElement(tag);
    node.className = className;
    node.textContent = text;
    return node;
  };
  if (!document.getElementById('calculator-preview-style')) {
    const style = make('style');
    style.id = 'calculator-preview-style';
    style.textContent = `.calculator-preview{display:grid;grid-template-columns:1fr 1fr;gap:32px;background:white;padding:28px;border-radius:28px;color:#5a4a42}.calculator-preview fieldset{border:0;padding:0;margin:20px 0}.calculator-preview legend{margin-bottom:12px;color:#8b7870}.calculator-preview .cp-choices,.cp-counter{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.calculator-preview button{border:2px solid #ffb7c5;border-radius:999px;background:white;color:#ce6681;padding:10px 16px;font-family:inherit;font-weight:600;font-size:16px;cursor:pointer}.calculator-preview button[aria-pressed=true]{background:#ffb7c5;color:white}.calculator-preview button:disabled{opacity:.45}.cp-price{font-size:48px;color:#ac4e68;margin:12px 0}.cp-note{background:#fff5f8;padding:22px;border-radius:22px;margin:22px 0}.cp-note li{margin:12px 0}.calculator-preview input[type=checkbox]{width:18px;height:18px}.cp-selection{color:#8b7870}.cp-counter output{padding:0 12px}.cp-breakdown{margin-top:16px}@media(max-width:700px){.calculator-preview{grid-template-columns:1fr;padding:16px;gap:16px}}`;
    document.head.append(style);
  }
  const types = Object.keys(data.scales || {}).filter(type => data.scales[type]?.length && data.finishes?.[type]?.length);
  if (!types.length) {
    target.append(make('p', '', 'ยังไม่มี Type และราคา กรุณาตั้งค่าที่ Price settings'));
    return;
  }
  let type = types[0], scale = 0, finish = 0, count = 1, commercial = false, expanded = false;
  const view = make('section', 'calculator-preview');
  view.setAttribute('aria-label', 'ตัวอย่างตัวคำนวณราคาจริง');
  const left = make('div'), right = make('div');
  left.append(make('small', '', 'รายละเอียดคอมมิชชั่น'), make('h2', '', block.title || 'เช็คราคา'));
  const counter = make('div', 'cp-counter');
  const control = (label, handler) => {
    const button = make('button', '', label);
    button.type = 'button';
    button.onclick = handler;
    return button;
  };
  const minus = control('−', () => { count = Math.max(1, count - 1); update(); });
  minus.setAttribute('aria-label', 'ลดจำนวนตัวละคร');
  const number = make('output', '', '1');
  const plus = control('+', () => { count++; update(); });
  plus.setAttribute('aria-label', 'เพิ่มจำนวนตัวละคร');
  counter.append(make('span', '', 'Characters'), minus, number, plus);
  left.append(counter);
  const groups = ['ประเภทงาน', 'สเกลภาพ', 'การลงสี'].map(label => {
    const field = make('fieldset'), choices = make('div', 'cp-choices');
    field.append(make('legend', '', label), choices); left.append(field); return choices;
  });
  const selection = make('div', 'cp-selection'), price = make('div', 'cp-price');
  price.setAttribute('aria-live', 'polite');
  const use = make('label'), checkbox = make('input'); checkbox.type = 'checkbox';
  checkbox.onchange = () => { commercial = checkbox.checked; update(); };
  use.append(checkbox, document.createTextNode(' ใช้เชิงพาณิชย์ ×2'));
  const note = make('section', 'cp-note'), list = make('ul');
  note.append(make('h3', '', 'Note'), list);
  const notes = (block.note || 'ราคาสำหรับ 1 ตัวละครค่ะ\nราคานี้ยังไม่รวมฉากหลังนะคะ ฉากหลังคิดเพิ่มตามดีเทลค่ะ!\nมากกว่า 1 ตัวละคร และราคาที่เลือกตั้งแต่ 500 บาท ลด 50 บาทครั้งเดียวต่อภาพค่ะ\nราคาที่แสดงเป็นราคาพื้นฐานนะคะ อาจมีค่าใช้จ่ายเพิ่มเติมตามรายละเอียดของงานค่ะ').split('\n').filter(line => line.trim());
  for (const text of notes) list.append(make('li', '', text));
  const breakdown = make('div', 'cp-breakdown');
  right.append(selection, price, use, note, control('Price breakdown', () => { expanded = !expanded; update(); }), breakdown);
  view.append(left, right); target.append(view);
  function update() {
    scale = Math.min(scale, data.scales[type].length - 1);
    finish = Math.min(finish, data.finishes[type].length - 1);
    [types, data.scales[type], data.finishes[type]].forEach((labels, group) => {
      groups[group].replaceChildren();
      labels.forEach((label, index) => {
        const chosen = group === 0 ? type === label : (group === 1 ? scale : finish) === index;
        const button = control(group === 0 ? data.typeNames?.[label] || label : label, () => {
          if (group === 0) { type = label; scale = 0; finish = 0; }
          else if (group === 1) scale = index; else finish = index;
          update();
        });
        button.setAttribute('aria-pressed', String(chosen)); groups[group].append(button);
      });
    });
    const unit = Number(data.pricing?.[type]?.[scale]?.[finish]) || 0;
    const discount = count > 1 && unit >= 500 ? 50 : 0;
    const subtotal = unit * count - discount;
    const total = subtotal * (commercial ? 2 : 1);
    number.textContent = count; minus.disabled = count === 1;
    selection.textContent = `${data.typeNames?.[type] || type} · ${data.scales[type][scale]} · ${data.finishes[type][finish]}`;
    price.textContent = `฿${total.toLocaleString('th-TH')}`;
    breakdown.hidden = !expanded;
    breakdown.textContent = `${count} ตัวละคร × ฿${unit.toLocaleString('th-TH')} − ส่วนลด ฿${discount}${commercial ? ' × เชิงพาณิชย์ 2' : ''} = ฿${total.toLocaleString('th-TH')}`;
  }
  update();
}
