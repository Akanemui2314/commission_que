(async () => {
  const root = document.getElementById("akane-concepts");
  const prices = {
    Character: [
      [200, 250, 350],
      [300, 350, 500],
      [400, 450, 700],
      [500, 600, 850],
      [600, 800, 1200],
    ],
    Chibi: [
      [100, 150],
      [200, 250],
      [300, 350],
    ],
  };
  const scales = {
    Character: ["Head shot", "Bust-up", "Half body", "Knee-up", "Full body"],
    Chibi: ["Head shot", "Half body", "Full body"],
  };
  const finishes = {
    Character: ["Sketch", "Flat Color", "Full Color"],
    Chibi: ["Sketch", "Full Color"],
  };
  const categories = [
    "Full Body",
    "Half Body",
    "Bust-up",
    "Head Shot",
    "Knee-up",
    "Chibi",
  ];
  let cloudError = "";
  const saved = null;
  let previewCache = null;
  let cloudReady = false;
  function readPreview() {
    return previewCache;
  }
  const typeNames = {
    Character: "Full Scale",
    Chibi: "Chibi",
    ...(saved?.typeNames || {}),
  };
  if (saved?.scales) Object.assign(scales, saved.scales);
  if (saved?.finishes) Object.assign(finishes, saved.finishes);
  if (saved?.pricing) Object.assign(prices, saved.pricing);
  const galleryTypes = saved?.galleryTypes || [
    { id: "full", name: "Full Scale" },
    { id: "chibi", name: "Chibi" },
  ];
  const galleryScales = saved?.galleryScales || [
    "Full Body",
    "Half Body",
    "Bust-up",
    "Head Shot",
    "Knee-up",
  ];
  const galleryFinishes = saved?.galleryFinishes || [
    "Full Color",
    "Flat Color",
    "Sketch",
  ];
  if (saved?.scales) {
    for (const type of Object.keys(scales))
      if (
        Array.isArray(saved.scales[type]) &&
        saved.scales[type].length &&
        saved.scales[type].every((v) => typeof v === "string" && v.trim())
      )
        scales[type] = saved.scales[type];
  }
  categories.splice(0, categories.length, ...galleryTypes.map((t) => t.name));
  let offers = Array.isArray(saved?.offers)
    ? saved.offers.map(normalizeOffer)
    : [];
  function normalizeOffer(item) {
    return {
      ...item,
      images: Array.isArray(item.images)
        ? item.images
        : item.cover
          ? [item.cover]
          : [],
      addons: Array.isArray(item.addons) ? item.addons : [],
      title: item.title || item.thTitle || item.enTitle || "",
      details: item.details || item.th || item.en || "",
      included: item.included || item.thIncluded || item.enIncluded || "",
    };
  }
  if (saved?.pricing) {
    for (const type of Object.keys(scales))
      if (
        Array.isArray(saved.pricing[type]) &&
        saved.pricing[type].length === scales[type].length &&
        saved.pricing[type].every(
          (row, i) =>
            Array.isArray(row) &&
            row.length === finishes[type].length &&
            row.every((v) => Number.isFinite(v) && v >= 0),
        )
      )
        prices[type] = saved.pricing[type];
  }
  let language = saved?.language === "en" ? "en" : "th";
  const originalText = new WeakMap();
  const thaiLabels = {
    Commission: "Commission",
    "Check prices": "เช็คราคา",
    Queue: "ตารางคิว",
    Adoptable: "Adoptable",
    "HEWWO!": "สวัสดีค่า!",
    "Hewwo!": "สวัสดีค่า!",
    Akanezz2314: "Akanezz2314",
    Commission: "Commission",
    "Check prices": "เช็คราคา",
    Gallery: "Gallery",
    "Commission details": "รายละเอียดคอมมิชชั่น",
    "Thank you for your interest! ♥️": "ขอบคุณสำหรับความสนใจค่า ♥️",
    "Commission sample": "ตัวอย่างงานคอมมิชชั่น",
    "Character art": "ภาพตัวละคร",
    Chibi: "Chibi",
    Illustration: "ภาพประกอบ",
    Character: "Full Scale",
    Chibi: "Chibi",
    "Head shot": "Head shot",
    "Bust-up": "Bust-up",
    "Half body": "Half body",
    "Knee-up": "Knee-up",
    "Full body": "Full body",
    Sketch: "Sketch",
    "Flat Color": "Flat Color",
    "Full Color": "Full Color",
    Color: "Full Color",
  };
  const translations = {
    "สนใจงานหรือมีคำถามเพิ่มเติม ทักมาสอบถามได้เสมอเลยนะคะ ♥️":
      "Happy to see you here! If you have anything please contact me ♥️",
    "สถานะรับงาน / ตารางคิว": "Commission status / Queue",
    "ดู Showcase": "View Showcase",
    "พื้นที่ภาพแนะนำของ Akane": "Akane’s featured artwork",
    เลือกจากผลงานที่อัปโหลด: "Selected from uploaded works",
    Showcase: "Showcase",
    เช็คราคา: "Check prices",
    ประเภทงาน: "Type",
    สเกลภาพ: "Scale",
    การลงสี: "Coloring",
    "ใช้เชิงพาณิชย์ ×2": "Commercial use ×2",
    "ราคาสำหรับ 1 ตัวละครค่ะ": "Price for 1 character",
    "ราคานี้ยังไม่รวมฉากหลังนะคะ ฉากหลังคิดเพิ่มตามดีเทลค่ะ!":
      "Background not included! The extra cost depends on the details.",
    "ราคาที่แสดงเป็นราคาพื้นฐานนะคะ อาจมีค่าใช้จ่ายเพิ่มเติมตามดีเทลอื่นๆ โดยจะประเมินจากรายละเอียดของงานค่ะ":
      "The displayed price is a base rate. Additional charges may apply after reviewing the details of your commission.",
    "มากกว่า 1 ตัวละคร และราคาที่เลือกตั้งแต่ 500 บาท ลด 50 บาทครั้งเดียวต่อภาพค่ะ":
      "For more than one character at a selected rate of ฿500 or more, get ฿50 off once per image.",
    "Price breakdown": "View selected details",
    อ่านข้อตกลงก่อนจ้างงานด้วยนะคะ: "Please read the TOS before ordering",
    "Facebook: นุเนะ แมวเม่น": "Facebook: Akanezz2314",
    "ดูแบบร่างหลังบ้าน · ส่วนนี้มีเฉพาะในพรีวิว":
      "Preview the admin page · preview only",
    จัดการข้อมูลและเผยแพร่สู่หน้าลูกค้า:
      "Separate admin page · owner sign-in required",
    เพิ่มผลงาน: "Add artwork",
    จัดการผลงาน: "Manage artwork",
    แอนิเมชันพื้นหลัง: "Background animation",
    ประกาย: "Sparkles",
    กลีบดอกไม้: "Petals",
    จุดลอย: "Floating dots",
    ไม่ใช้แอนิเมชัน: "No animation",
    เลือกภาพผลงาน: "Choose artwork",
    ชื่อผลงาน: "Artwork title",
    หมวดหมู่: "Category",
    Overview: "Overview",
    หยุดเลื่อน: "Pause slideshow",
    เลื่อนต่อ: "Resume slideshow",
    พื้นที่รูปผลงาน: "Artwork placeholder",
    ทั้งหมด: "All",
    "Tag สเกลผลงาน": "Artwork scale tag",
    "Tag การลงสี": "Coloring tag",
    "เลือก Tag สเกลก่อนค่ะ": "Please choose a scale tag",
    "Coming soon": "No artwork in this category yet",
    "หมวดที่ลูกค้าเห็นมาจาก Tag ที่ใส่ตอนลงผลงานค่ะ":
      "The gallery category comes from the artwork tag.",
    แสดงในหน้าลูกค้า: "Show on the customer page",
    บันทึกตัวอย่าง: "Save preview",
    จัดการผลงานและราคา: "Manage works and prices",
    เผยแพร่: "Published",
    ฉบับร่าง: "Draft",
    "ตั้งเป็นภาพแนะนำ · ปรับลำดับ · ซ่อนผลงาน":
      "Feature · Reorder · Hide artwork",
    ภาพที่ยังไม่เผยแพร่: "Unpublished artwork",
    "ตั้งราคาตามประเภท / สเกล / การลงสี":
      "Set prices by style / scale / finish",
    รูปที่ซ่อนจะไม่ถูกส่งให้หน้าลูกค้า:
      "Hidden works stay off the customer page",
    "บันทึกตัวอย่างแล้วค่ะ ยังไม่ได้ลงเว็บจริงนะคะ":
      "Preview saved! This is not on the live site yet.",
    ใส่ชื่อผลงานก่อนค่ะ: "Please enter an artwork title",
    "ถ้าสนใจ ทักมาพร้อมบรีฟกับเรฟตัวละครได้เลยค่ะ":
      "If you’re interested, please message me with your brief and character references!",
  };
  function translate(surface) {
    const walker = document.createTreeWalker(surface, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (["SCRIPT", "STYLE"].includes(node.parentElement?.tagName)) continue;
      if (!originalText.has(node)) originalText.set(node, node.textContent);
      const original = originalText.get(node);
      const trimmed = original.trim();
      if (
        categories.includes(trimmed) &&
        node.parentElement.closest(
          ".category-section,.category-filters,.work-category",
        )
      ) {
        node.textContent = original;
        continue;
      }
      const match = trimmed.match(/^พื้นที่รูปผลงาน (\d+)$/);
      node.textContent =
        language === "en"
          ? translations[trimmed]
            ? original.replace(trimmed, translations[trimmed])
            : match
              ? "Artwork placeholder " + match[1]
              : original
          : thaiLabels[trimmed]
            ? original.replace(trimmed, thaiLabels[trimmed])
            : original;
    }
    surface
      .querySelectorAll(".language")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.language === language)),
      );
    surface.setAttribute("lang", language);
    const input = surface.querySelector(".work-title");
    if (input)
      input.placeholder =
        language === "en"
          ? "e.g. Character commission"
          : "เช่น Character commission";
  }
  root.querySelectorAll(".ak").forEach((surface, index) => {
    let state = {
      type: "Character",
      scale: 1,
      finish: 2,
      commercial: false,
      ...(saved?.selections?.[index] || {}),
    };
    const characters = [state];
    let activeCharacter = 0;
    let orderCommercial = state.commercial;
    const look = {
      radius: 22,
      motion: true,
      animation: saved?.animation || "petals",
      view: root.dataset.admin === "true" ? "admin" : "customer",
    };
    surface.innerHTML = `<div class="sparkles" aria-hidden="true">${Array.from({ length: 16 }, (_, i) => `<span style="left:${(i * 29) % 98}%;top:${(i * 17) % 96}%;animation-delay:-${i}s">${i % 3 ? "✧" : "❀"}</span>`).join("")}</div><div class="interior">
<header><div class="brand">Akanezz2314 <small>COMMISSION / GALLERY</small></div><nav aria-label="เมนูเว็บไซต์"><a href="#" data-local="gallery">Commission</a><a href="shop.html" target="_blank" rel="noopener">Adoptable</a><div class="row" aria-label="Language"><button type="button" class="language cursor-interaction" data-language="th">TH</button><button type="button" class="language cursor-interaction" data-language="en">EN</button></div><button type="button" class="admin-entry cursor-interaction" aria-label="Open admin">🔧</button></nav></header><div class="contact-top"><span>Contact</span><a href="https://twitter.com/AKANEzz2314" target="_blank" rel="noopener">X / Twitter</a><a href="https://www.deviantart.com/akanezz2314" target="_blank" rel="noopener">DeviantArt</a><a href="https://www.facebook.com/akanemui2314" target="_blank" rel="noopener">Facebook</a><a href="mailto:akanezz2314@gmail.com">Email</a><a href="https://toyhou.se/Akanezz2314" target="_blank" rel="noopener">Toyhouse</a></div>
<section class="hero"><div><span class="eyebrow">Hewwo!</span><h1>Akanezz2314<br><span style="display:block;font-size:21px;font-family:Tahoma,sans-serif;margin-top:8px">Commission</span></h1><p>สนใจงานหรือมีคำถามเพิ่มเติม ทักมาสอบถามได้เสมอเลยนะคะ ♥️</p><div class="row"><a href="#" data-local="commission">เช็คราคา</a><a class="pill" href="queue.html" target="_blank" rel="noopener">สถานะรับงาน / ตารางคิว</a><button type="button" class="tos-open cursor-interaction">TOS / ข้อตกลงการจ้างงาน</button></div></div><div class="hero-art"><div><i data-lucide="image" aria-hidden="true"></i>พื้นที่ภาพแนะนำของ Akane<br><span class="small">เลือกจากผลงานที่อัปโหลด</span></div></div></section>
<div class="content-grid"><section class="works"><section class="open-commissions"><div class="available-heading row"><h2>Available</h2><span class="availability-toggle" role="status" aria-live="polite"><span class="availability-knob" aria-hidden="true"></span><span class="availability-label">OFF</span></span></div><div class="offer-list"></div></section><span class="eyebrow">Gallery</span><h2>Showcase</h2><section class="latest-carousel" aria-label="Showcase artwork"><div class="latest-stage"></div><div class="latest-controls row"><button type="button" class="cursor-interaction latest-prev" aria-label="Previous artwork">‹</button><span class="latest-count"></span><button type="button" class="cursor-interaction latest-next" aria-label="Next artwork">›</button></div></section><h2 class="category-title">Overview</h2><div class="category-filters choices" aria-label="หมวดผลงาน"></div><div class="gallery-tag-filters row"></div><div class="grouped-gallery" aria-live="polite"></div></section>
<section class="calculator" hidden aria-label="เลือกรูปแบบคอมมิชชั่น"><div><span class="eyebrow">Commission details</span><h2>เช็คราคา</h2><div class="character-counter row"><span>Characters</span><button type="button" class="cursor-interaction character-minus" aria-label="Remove character">−</button><output class="character-count">1</output><button type="button" class="cursor-interaction character-plus" aria-label="Add character">+</button></div><div class="character-tabs choices" hidden></div><fieldset><legend>ประเภทงาน</legend><div class="choices types"></div></fieldset><fieldset><legend>สเกลภาพ</legend><div class="choices scales"></div></fieldset><fieldset><legend>การลงสี</legend><div class="choices finishes"></div></fieldset></div><div class="quote"><div class="small selection"></div><div class="price" aria-live="polite"></div><label class="small"><input class="commercial" type="checkbox">ใช้เชิงพาณิชย์ ×2</label><section class="price-notes" aria-label="Price notes"><h3>Note</h3><ul><li class="single-character-note">ราคาสำหรับ 1 ตัวละครค่ะ</li><li>ราคานี้ยังไม่รวมฉากหลังนะคะ ฉากหลังคิดเพิ่มตามดีเทลค่ะ!</li><li>มากกว่า 1 ตัวละคร และราคาที่เลือกตั้งแต่ 500 บาท ลด 50 บาทครั้งเดียวต่อภาพค่ะ</li><li>ราคาที่แสดงเป็นราคาพื้นฐานนะคะ อาจมีค่าใช้จ่ายเพิ่มเติมตามดีเทลอื่นๆ โดยจะประเมินจากรายละเอียดของงานค่ะ</li></ul></section><button class="primary cursor-interaction brief">Price breakdown</button><div class="brief-result" aria-live="polite" hidden></div></div></section></div>
<footer class="footer"><span>Thank you for your interest! ♥️</span><a href="https://www.facebook.com/akanemui2314" target="_blank" rel="noopener">Facebook: นุเนะ แมวเม่น</a><div class="effect-buttons row" role="group" aria-label="Background effects"><button type="button" class="cursor-interaction" data-effect="petals" aria-label="Petals">❀</button><button type="button" class="cursor-interaction" data-effect="sparkles" aria-label="Sparkles">✦</button><button type="button" class="cursor-interaction" data-effect="dots" aria-label="Floating dots">•</button><button type="button" class="cursor-interaction" data-effect="none" aria-label="No animation">⊘</button></div></footer>
<section class="admin-preview" hidden><h2>จัดการผลงาน</h2><div class="small">จัดการข้อมูลและเผยแพร่สู่หน้าลูกค้า</div><div class="admin-grid"><section class="admin-panel"><h3>เพิ่มผลงาน</h3><div class="upload"><i data-lucide="image-plus" aria-hidden="true"></i><div>เลือกภาพผลงาน</div><p class="small">JPG / PNG / GIF / Animated WebP / APNG / MP4 / WebM</p><input type="file" accept="image/*,video/mp4,video/webm,video/quicktime,.gif,.webp,.apng,.mp4,.webm,.mov" aria-label="ภาพตัวอย่าง"><img hidden alt="ภาพตัวอย่างที่เลือก"></div><div class="work-crop-editor" hidden></div><label>ชื่อผลงาน<input class="work-title" placeholder="เช่น Character commission"></label><fieldset><legend>Type</legend><div class="work-types choices"></div></fieldset><div class="tos-edit-grid"><label>สเกลภาพ<select class="work-category"></select></label><label>การลงสี<select class="work-finish"></select></label></div><details class="taxonomy-manager"><summary>Custom Type &amp; Color</summary><label>หมวดที่ต้องการจัดการ<select class="taxonomy-kind"><option value="types">Type</option><option value="scales">สเกลภาพ</option><option value="finishes">การลงสี</option></select></label><div class="row"><input class="taxonomy-name" aria-label="ชื่อหมวดใหม่" placeholder="ชื่อใหม่"><button type="button" class="cursor-interaction taxonomy-add">+ เพิ่ม</button></div><div class="taxonomy-list"></div><p class="taxonomy-result small" role="status"></p></details><p class="small">Type และ Tag ที่บันทึกจะอัปเดตหมวดใน Gallery อัตโนมัติ</p><label><input class="publish" type="checkbox" checked> แสดงในหน้าลูกค้า</label><div class="row" style="margin-top:0"><button class="primary cursor-interaction save">บันทึกตัวอย่าง</button></div><p class="small save-result" aria-live="polite"></p><button type="button" class="cursor-interaction cancel-work-edit" hidden>Cancel edit</button><div class="work-library-heading"><h3 class="work-library-title">Uploaded artworks</h3><button type="button" class="cursor-interaction sort-showcase">Sort</button></div><div class="work-library"></div></section><section class="admin-panel"><h3>Price settings</h3><div class="price-settings"></div><button type="button" class="cursor-interaction primary save-prices">Save prices</button><p class="price-settings-result small" aria-live="polite"></p><p class="small">ตั้งราคาตามประเภท / สเกล / การลงสี<br>รูปที่ซ่อนจะไม่ถูกส่งให้หน้าลูกค้า</p></section></div></section><section class="backup-admin admin-panel" hidden><h2>สถานะการเผยแพร่</h2><p class="small">บันทึกข้อมูลและไฟล์ภาพเข้า Firebase แล้วหน้าลูกค้าจะอัปเดตอัตโนมัติ</p><p class="cloud-status small" role="status"></p></section><section class="offers-admin admin-panel" hidden><h2>Commission settings</h2><div class="offer-admin-list"></div><button type="button" class="cursor-interaction add-offer">+ Add commission</button><div class="offer-editor" hidden><div class="offer-form-groups"><section class="offer-form-group"><h3>Commission details</h3><div class="tos-edit-grid"><label class="offer-form-title">Title<input data-offer-field="title"></label><label>Details<textarea rows="5" data-offer-field="details"></textarea></label><label>What's included<textarea rows="5" data-offer-field="included"></textarea></label></div></section><section class="offer-form-group"><h3>Pricing & usage</h3><div class="tos-edit-grid"><label>Starting price (THB)<input type="number" min="0" data-offer-field="price"></label><label>Add-ons (หนึ่งรายการต่อบรรทัด: ชื่อ | ราคา)<textarea class="offer-addons" rows="4" placeholder="Extra outfit | 200"></textarea></label><label class="offer-use-setting"><input type="checkbox" class="offer-commercial"> Commercial Use allowed</label></div></section><section class="offer-form-group"><h3>Availability & contact</h3><div class="tos-edit-grid"><label>Status<select data-offer-field="status"><option value="open">Open</option><option value="waitlist">Waitlist</option><option value="hidden">Hidden</option></select></label><label>Slots (เว้นว่างได้)<input type="number" min="1" data-offer-field="slots"></label><label>Contact link<input type="url" data-offer-field="link" placeholder="https://..."></label></div></section><section class="offer-form-group"><h3>Preview images</h3><div class="tos-edit-grid"><label>ภาพปก · Images / GIF / Video<input class="offer-cover" type="file" accept="image/*,video/mp4,video/webm,video/quicktime,.gif,.webp,.apng,.mp4,.webm,.mov"><span class="offer-image-count small"></span><img class="offer-cover-preview" hidden alt="Cover preview"><button type="button" class="cursor-interaction change-offer-cover">เลือก / เปลี่ยนภาพปก</button></label><div><p class="small">ภาพตัวอย่างเพิ่มเติมจะแสดงต่อจากภาพปกในรายละเอียดคอมมิชชั่น</p><button type="button" class="cursor-interaction add-offer-samples">+ เพิ่มภาพตัวอย่าง</button><input class="offer-samples" type="file" accept="image/*,video/mp4,video/webm,video/quicktime,.gif,.webp,.apng,.mp4,.webm,.mov" multiple hidden></div></div></section></div><div class="crop-editor"></div><button type="button" class="primary cursor-interaction save-offer">Save commission</button><p class="offer-save-result small" aria-live="polite"></p></div></section><dialog class="showcase-sort-dialog" aria-labelledby="showcase-sort-title"><div class="showcase-sort-heading row"><h2 id="showcase-sort-title">จัดลำดับ Showcase</h2><button type="button" class="cursor-interaction showcase-sort-close" aria-label="ปิดจัดลำดับ">×</button></div><p class="small">ลาก ☰ หรือกด ↑ ↓ เพื่อจัดลำดับ · 10 ภาพแรกจะแสดงใน Showcase</p><div class="showcase-sort-list" aria-label="ลำดับผลงาน"></div><p class="showcase-sort-result small" role="status"></p><div class="showcase-sort-footer row"><button type="button" class="cursor-interaction showcase-sort-cancel">ยกเลิก</button><button type="button" class="primary cursor-interaction showcase-sort-save">บันทึกลำดับ</button></div></dialog><dialog class="artwork-lightbox"><button type="button" class="artwork-lightbox-close cursor-interaction" aria-label="Close full artwork">×</button><button type="button" class="artwork-lightbox-prev cursor-interaction" aria-label="Previous full artwork">‹</button><div class="artwork-lightbox-content"></div><button type="button" class="artwork-lightbox-next cursor-interaction" aria-label="Next full artwork">›</button></dialog><dialog class="offer-dialog" aria-labelledby="offer-dialog-title"><div class="offer-dialog-heading row"><h2 id="offer-dialog-title">Commission details</h2><button type="button" class="cursor-interaction offer-dialog-close" aria-label="Close commission details">×</button></div><div class="offer-dialog-content"></div></dialog><dialog class="tos-dialog"><div class="tos-heading row"><h2>TOS</h2><div class="row"><button type="button" class="cursor-interaction tos-language" data-tos-language="th">TH</button><button type="button" class="cursor-interaction tos-language" data-tos-language="en">EN</button><button type="button" class="cursor-interaction tos-close" aria-label="Close terms">×</button></div></div><div class="tos-content"></div></dialog></div>`;
    const query = (s) => surface.querySelector(s);
    let category = "All",
      galleryScale = "All",
      galleryFinish = "All";
    let artworks = Array.isArray(saved?.artworks)
      ? saved.artworks.filter((art) => art.image)
      : [];

    function showcaseRank(art) {
      return typeof art?.showcaseOrder === "number" &&
        Number.isFinite(art.showcaseOrder) &&
        art.showcaseOrder >= 0
        ? art.showcaseOrder
        : Infinity;
    }
    function orderedArtworkEntries(list) {
      return list
        .map((art, index) => ({ art, index }))
        .filter((entry) => entry.art.image)
        .sort((a, b) => {
          const ar = showcaseRank(a.art),
            br = showcaseRank(b.art);
          if (ar !== br) return ar < br ? -1 : 1;
          return (
            (Number(b.art.uploadedAt) || 0) - (Number(a.art.uploadedAt) || 0) ||
            a.index - b.index
          );
        });
    }
    let showcaseCloudVersion = 0,
      showcaseDraft = null,
      showcaseSource = null,
      showcaseDraftVersion = 0,
      showcaseSaving = false,
      showcaseDragIndex = null;
    let tiltFrame = 0;
    let manualPosition = 0;
    let manualTarget = 0;
    function drawLatest() {
      if (root.dataset.admin === "true") return;
      const latestArtworks = orderedArtworkEntries(artworks)
        .slice(0, 10)
        .map((entry) => entry.art);
      cancelAnimationFrame(tiltFrame);
      manualPosition = 0;
      manualTarget = 0;
      const stage = query(".latest-stage");
      stage.replaceChildren();
      query(".latest-controls").hidden = latestArtworks.length < 2;
      query(".latest-carousel").hidden = latestArtworks.length === 0;
      if (!latestArtworks.length) return;
      const track = document.createElement("div");
      track.className = "latest-track";
      // Repeat both ways so stepping across either end stays continuous.
      for (let copy = 0; copy < (latestArtworks.length > 1 ? 3 : 1); copy++) {
        const group = document.createElement("div");
        group.className = "latest-group";
        if (latestArtworks.length > 1 && copy !== 1)
          group.setAttribute("aria-hidden", "true");
        latestArtworks.forEach((art) => {
          const figure = document.createElement("figure");
          const slot = document.createElement("div");
          slot.className = "art-slot";
          if (art.image) {
            const img = makeMedia(art.image, art.title);
            applyCrop(img, art.crop);
            slot.appendChild(img);
          } else {
            const text = document.createElement("span");
            text.textContent = "พื้นที่รูปผลงาน";
            slot.appendChild(text);
          }
          figure.appendChild(slot);
          figure.setAttribute("aria-label", art.title);
          const cell = document.createElement("div");
          cell.className = "carousel-cell";
          cell.appendChild(figure);
          group.appendChild(cell);
        });
        track.appendChild(group);
      }
      stage.appendChild(track);
      const cells = [...track.querySelectorAll(".carousel-cell")];
      let previous = 0;
      function frame(time) {
        if (!stage.isConnected) return;
        const delta = previous ? Math.min((time - previous) / 1000, 0.05) : 0;
        previous = time;
        const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
        manualPosition = reduced
          ? manualTarget
          : manualPosition +
            (manualTarget - manualPosition) * (1 - Math.exp(-delta * 7));
        if (Math.abs(manualTarget - manualPosition) < 0.0005) {
          manualPosition = manualTarget;
          if (Math.abs(manualPosition) >= latestArtworks.length) {
            const turns =
              Math.trunc(manualPosition / latestArtworks.length) *
              latestArtworks.length;
            manualPosition -= turns;
            manualTarget -= turns;
          }
        }
        query(".latest-prev").disabled = false;
        query(".latest-next").disabled = false;
        const bounds = stage.getBoundingClientRect();
        const width = cells[0].getBoundingClientRect().width;
        const shift =
          bounds.width / 2 -
          width / 2 -
          ((latestArtworks.length > 1 ? latestArtworks.length : 0) +
            manualPosition) *
            width;
        track.style.transform = `translate3d(${shift}px,0,0)`;
        const center = bounds.left + bounds.width / 2;
        // Derive positions from fixed cell widths; avoid per-cell layout reads.
        cells.forEach((cell, index) => {
          const offset = Math.max(
            -1,
            Math.min(
              1,
              (bounds.left + shift + (index + 0.5) * width - center) /
                (bounds.width * 0.5),
            ),
          );
          const figure = cell.firstElementChild;
          figure.style.transform = `rotateY(${-offset * 26}deg)`;
          figure.style.opacity = String(1 - Math.abs(offset) * 0.2);
          figure.style.setProperty(
            "--tilt-shade",
            String(Math.abs(offset) * 0.19),
          );
          figure.style.setProperty(
            "--tilt-direction",
            offset < 0 ? "to left" : "to right",
          );
        });
        tiltFrame =
          Math.abs(manualTarget - manualPosition) > 0.0005
            ? requestAnimationFrame(frame)
            : 0;
      }
      surface._wakeLatest = () => {
        if (!tiltFrame) {
          previous = 0;
          tiltFrame = requestAnimationFrame(frame);
        }
      };
      tiltFrame = requestAnimationFrame(frame);
      translate(surface);
    }
    window.addEventListener("resize", () => surface._wakeLatest?.(), {
      passive: true,
    });
    query(".latest-prev").addEventListener("click", async () => {
      manualTarget--;
      surface._wakeLatest?.();
    });
    query(".latest-next").addEventListener("click", async () => {
      manualTarget++;
      surface._wakeLatest?.();
    });

    let touchStart = null;
    query(".latest-stage").addEventListener(
      "touchstart",
      async (event) => {
        touchStart = event.changedTouches[0].clientX;
      },
      { passive: true },
    );
    query(".latest-stage").addEventListener(
      "touchend",
      async (event) => {
        if (touchStart === null) return;
        const delta = event.changedTouches[0].clientX - touchStart;
        if (Math.abs(delta) > 45) {
          manualTarget += delta < 0 ? 1 : -1;
          surface._wakeLatest?.();
        }
        touchStart = null;
      },
      { passive: true },
    );

    let fullArtworkItems = [];
    let fullArtworkIndex = 0;
    function renderFullArtwork() {
      const art = fullArtworkItems[fullArtworkIndex];
      if (!art) return;
      const target = query(".artwork-lightbox-content");
      target.querySelectorAll("video").forEach((video) => video.pause());
      target.replaceChildren();
      const media = makeMedia(art.image, art.title);
      media.draggable = false;
      if (media.tagName === "VIDEO")
        media.setAttribute("controlsList", "nodownload");
      target.append(media);
      query(".artwork-lightbox-prev").hidden = fullArtworkItems.length < 2;
      query(".artwork-lightbox-next").hidden = fullArtworkItems.length < 2;
    }
    function openFullArtwork(art, items = artworks) {
      fullArtworkItems = items.filter((item) => item.image);
      fullArtworkIndex = Math.max(0, fullArtworkItems.indexOf(art));
      renderFullArtwork();
      query(".artwork-lightbox").showModal();
    }
    function stepFullArtwork(step) {
      if (!fullArtworkItems.length) return;
      fullArtworkIndex =
        (fullArtworkIndex + step + fullArtworkItems.length) %
        fullArtworkItems.length;
      renderFullArtwork();
    }
    query(".artwork-lightbox-prev").addEventListener("click", async () =>
      stepFullArtwork(-1),
    );
    query(".artwork-lightbox-next").addEventListener("click", async () =>
      stepFullArtwork(1),
    );
    query(".artwork-lightbox").addEventListener("keydown", async (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        stepFullArtwork(1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        stepFullArtwork(-1);
      }
    });
    query(".artwork-lightbox-close").addEventListener("click", async () =>
      query(".artwork-lightbox").close(),
    );
    query(".artwork-lightbox").addEventListener("contextmenu", async (event) =>
      event.preventDefault(),
    );
    query(".artwork-lightbox").addEventListener("dragstart", async (event) =>
      event.preventDefault(),
    );
    query(".artwork-lightbox").addEventListener("close", async () =>
      query(".artwork-lightbox-content").replaceChildren(),
    );
    query(".grouped-gallery").addEventListener("contextmenu", async (event) =>
      event.preventDefault(),
    );
    // Delegate to the surface so newly loaded artwork is protected too.
    for (const eventName of ["contextmenu", "dragstart"]) {
      surface.addEventListener(eventName, (event) => {
        if (event.target.closest("img, video, .carousel, .offer-media, .artwork-full-trigger")) event.preventDefault();
      });
    }
    function drawGallery() {
      if (root.dataset.admin === "true") return;
      if (category !== "All" && !categories.includes(category))
        category = "All";
      if (galleryScale !== "All" && !galleryScales.includes(galleryScale))
        galleryScale = "All";
      if (galleryFinish !== "All" && !galleryFinishes.includes(galleryFinish))
        galleryFinish = "All";
      query(".category-filters").replaceChildren();
      ["All", ...categories].forEach((tag) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "cursor-interaction";
        button.dataset.category = tag;
        button.setAttribute("aria-pressed", String(category === tag));
        button.textContent = tag === "All" ? "ทั้งหมด" : tag;
        query(".category-filters").appendChild(button);
      });
      drawGalleryTagFilters();
      const target = query(".grouped-gallery");
      target.dataset.filter = category;
      target.replaceChildren();
      const displayed = category === "All" ? categories : [category];
      displayed.forEach((tag) => {
        const type = galleryTypes.find((t) => t.name === tag);
        const matching = artworks.filter(
          (a) =>
            (a.typeId || "full") === type?.id &&
            (galleryScale === "All" ||
              (a.scale || a.tags[0]) === galleryScale) &&
            (galleryFinish === "All" ||
              (a.finish || a.tags[1]) === galleryFinish),
        );
        if (!matching.length) return;
        const section = document.createElement("section");
        section.className = "category-section";
        if (["full", "chibi"].includes(type?.id)) section.classList.add("square-gallery");
        const header = document.createElement("div");
        header.className = "category-carousel-heading row";
        const heading = document.createElement("h3");
        heading.textContent = tag;
        header.append(heading);
        const viewport = document.createElement("div");
        viewport.className = "category-carousel-viewport";
        const track = document.createElement("div");
        track.className = "category-carousel-track";
        const frames = [];
        matching
          .filter((art) => art.image)
          .forEach((art) => {
            const figure = document.createElement("figure");
            figure.className = "category-carousel-image";
            const media = makeMedia(art.image, art.title);
            applyCrop(media, art.crop);
            media.draggable = false;
            const view = document.createElement("button");
            view.type = "button";
            view.className = "artwork-full-trigger cursor-interaction";
            view.setAttribute("aria-label", `View full artwork ${art.title}`);
            view.append(media);
            view.addEventListener("click", async () =>
              openFullArtwork(art, matching),
            );
            figure.append(view);
            track.append(figure);
            frames.push(figure);
          });
        viewport.append(track);
        if (frames.length > 1) {
          let current = 0;
          const controls = document.createElement("div");
          controls.className = "row";
          for (const [text, step, label] of [
            ["‹", -1, "Previous"],
            ["›", 1, "Next"],
          ]) {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = text;
            button.className = "cursor-interaction";
            button.setAttribute("aria-label", `${label} ${tag} artwork`);
            button.addEventListener("click", async () => {
              current = (current + step + frames.length) % frames.length;
              track.querySelectorAll("video").forEach((video) => video.pause());
              track.style.transform = `translateX(-${frames[current].offsetLeft}px)`;
            });
            controls.append(button);
          }
          header.append(controls);
        }
        section.append(header, viewport);
        target.appendChild(section);
      });
      if (!target.children.length) {
        const empty = document.createElement("p");
        empty.textContent = "Coming soon";
        target.appendChild(empty);
      }
      translate(surface);
    }
    surface._drawGallery = drawGallery;
    query(".category-filters").addEventListener("click", async (event) => {
      const button = event.target.closest("button[data-category]");
      if (!button) return;
      category = button.dataset.category;
      galleryScale = "All";
      galleryFinish = "All";
      drawGallery();
    });

    async function remember() {
      if (!cloudReady) return false;
      if (root.dataset.admin !== "true" || !adminUnlocked()) return true;
      const data = {
        language,
        pricing: prices,
        animation: look.animation,
        terms,
        scales,
        finishes,
        typeNames,
        categories,
        galleryTypes,
        galleryScales,
        galleryFinishes,
        artworks,
        offers: offers.map(({ cover, ...item }) => item),
      };
      const buttons = [
        ...surface.querySelectorAll(
          ".admin-preview button,.offers-admin button",
        ),
      ];
      buttons.forEach((b) => (b.disabled = true));
      query(".cloud-status").textContent = "กำลังบันทึกและเผยแพร่…";
      try {
        await window.AkaneCloud.save(data);
        previewCache = data;
        query(".cloud-status").textContent =
          "บันทึกเข้า Firebase และเผยแพร่แล้วค่ะ";
        return true;
      } catch (error) {
        cloudError = window.AkaneCloud?.errorMessage(error) || error.message;
        query(".cloud-status").textContent = cloudError;
        return false;
      } finally {
        buttons.forEach((b) => (b.disabled = false));
      }
    }

    function render() {
      if (!scales[state.type]) state.type = Object.keys(scales)[0];
      state.scale = Math.min(
        Math.max(0, state.scale),
        scales[state.type].length - 1,
      );
      state.finish = Math.min(
        Math.max(0, state.finish),
        finishes[state.type].length - 1,
      );
      [
        [".types", Object.keys(scales), "type"],
        [".scales", scales[state.type], "scale"],
        [".finishes", finishes[state.type], "finish"],
      ].forEach(([selector, labels, key]) => {
        query(selector).innerHTML = labels
          .map(
            (label, i) =>
              `<button class="cursor-interaction" type="button" data-key="${key}" data-value="${escapeText(key === "type" ? label : i)}" aria-pressed="${state[key] === (key === "type" ? label : i)}">${escapeText(key === "type" ? typeNames[label] || label : label)}</button>`,
          )
          .join("");
      });
      const unitPrice =
        Number(prices[state.type]?.[state.scale]?.[state.finish]) || 0;
      const imageDiscount = characters.length > 1 && unitPrice >= 500 ? 50 : 0;
      const total =
        (unitPrice * characters.length - imageDiscount) *
        (orderCommercial ? 2 : 1);
      query(".price").textContent = `฿${total.toLocaleString("th-TH")}`;
      query(".selection").textContent =
        `${typeNames[state.type] || state.type} · ${scales[state.type][state.scale]} · ${finishes[state.type][state.finish]}`;
      query(".commercial").checked = orderCommercial;
      surface._selection = { ...state };
      const singleNote = query(".single-character-note");
      if (singleNote) singleNote.hidden = characters.length > 1;
      query(".character-count").textContent = characters.length;
      query(".character-minus").disabled = characters.length === 1;
      query(".character-tabs").innerHTML = characters
        .map(
          (char, i) =>
            `<button type="button" class="cursor-interaction" data-character="${i}" aria-pressed="${i === activeCharacter}">Character ${i + 1}</button>`,
        )
        .join("");
      if (!query(".brief-result").hidden) drawBreakdown();
      translate(surface);
    }
    surface.addEventListener("click", async (event) => {
      const langButton = event.target.closest("button[data-language]");
      if (langButton) {
        language = langButton.dataset.language;
        root.querySelectorAll(".ak").forEach((s) => {
          translate(s);
          s._drawGallery?.();
          s._drawOffers?.();
        });
        await remember();
        return;
      }
      const button = event.target.closest("button[data-key]");
      if (button) {
        const key = button.dataset.key;
        state[key] =
          key === "type" ? button.dataset.value : Number(button.dataset.value);
        render();
        await remember();
      }
      const anchor = event.target.closest("a[data-local]");
      if (anchor) {
        event.preventDefault();
        const pricing = anchor.dataset.local === "commission";
        query(".calculator").hidden = !pricing;
        query(".works").hidden = pricing;
        query(".hero").hidden = pricing;
        surface
          .querySelectorAll("nav a[data-local]")
          .forEach((a) =>
            a.setAttribute(
              "aria-current",
              a.dataset.local === anchor.dataset.local ? "page" : "false",
            ),
          );
        query(pricing ? ".calculator" : ".works").scrollIntoView({
          behavior: look.motion ? "smooth" : "auto",
          block: "start",
        });
      }
    });
    query(".commercial").addEventListener("change", async (event) => {
      orderCommercial = event.target.checked;
      characters.forEach((c) => (c.commercial = orderCommercial));
      render();
      await remember();
    });
    function drawBreakdown() {
      const target = query(".brief-result");
      target.replaceChildren();
      let subtotal = 0;
      const unit =
        Number(prices[state.type]?.[state.scale]?.[state.finish]) || 0;
      subtotal = unit * characters.length;
      const discount = characters.length > 1 && unit >= 500 ? 50 : 0;
      const line = document.createElement("div");
      line.className = "breakdown-row";
      const description = document.createElement("span");
      description.textContent = `${typeNames[state.type] || state.type} / ${scales[state.type][state.scale]} / ${finishes[state.type][state.finish]} · ${characters.length} Characters × ฿${unit.toLocaleString()}`;
      const amount = document.createElement("span");
      amount.textContent = `฿${subtotal.toLocaleString()}`;
      line.append(description, amount);
      target.appendChild(line);
      if (discount) {
        const row = document.createElement("div");
        row.className = "breakdown-row";
        row.innerHTML = `<span>${language === "en" ? "Multi-character discount (once per image)" : "ส่วนลดหลายตัวละคร (ครั้งเดียวต่อภาพ)"}</span><span>−฿50</span>`;
        target.appendChild(row);
        subtotal -= discount;
      }
      for (const [label, amount] of [
        ["Subtotal", subtotal],
        ...(orderCommercial ? [["Commercial use ×2", subtotal]] : []),
        ["Total", subtotal * (orderCommercial ? 2 : 1)],
      ]) {
        const row = document.createElement("div");
        row.className = "breakdown-row";
        row.innerHTML = `<span>${label}</span><span>฿${amount.toLocaleString()}</span>`;
        target.appendChild(row);
      }
    }
    query(".brief").addEventListener("click", async () => {
      query(".brief-result").hidden = !query(".brief-result").hidden;
      if (!query(".brief-result").hidden) drawBreakdown();
    });
    query(".character-plus").addEventListener("click", async () => {
      characters.push({});
      render();
    });
    query(".character-minus").addEventListener("click", async () => {
      if (characters.length === 1) return;
      characters.pop();
      render();
    });
    query(".character-tabs").addEventListener("click", async (event) => {
      const button = event.target.closest("button[data-character]");
      if (!button) return;
      activeCharacter = Number(button.dataset.character);
      state = characters[activeCharacter];
      render();
    });
    surface.querySelectorAll("[data-effect]").forEach((button) =>
      button.addEventListener("click", async () => {
        look.animation = button.dataset.effect;
        appearance();
        await remember();
      }),
    );
    let workType = galleryTypes[0]?.id || "full";
    function escapeText(value) {
      return String(value).replace(
        /[&<>"']/g,
        (char) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[char],
      );
    }
    function fillOptions(select, values) {
      const old = select.value;
      select.replaceChildren(...values.map((v) => new Option(v, v)));
      if (values.includes(old)) select.value = old;
    }
    function drawTaxonomy() {
      if (root.dataset.admin !== "true") return;
      if (!galleryTypes.some((t) => t.id === workType))
        workType = galleryTypes[0]?.id || "full";
      const target = query(".work-types");
      target.replaceChildren();
      galleryTypes.forEach((t) => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = t.name;
        b.className = "cursor-interaction";
        b.setAttribute("aria-pressed", String(t.id === workType));
        b.addEventListener("click", () => {
          workType = t.id;
          drawTaxonomy();
        });
        target.append(b);
      });
      const priceKey =
        workType === "full"
          ? "Character"
          : workType === "chibi"
            ? "Chibi"
            : workType;
      fillOptions(query(".work-category"), scales[priceKey] || galleryScales);
      fillOptions(query(".work-finish"), galleryFinishes);
      const list = query(".taxonomy-list");
      list.replaceChildren();
      const kind = query(".taxonomy-kind").value;
      const values =
        kind === "types"
          ? galleryTypes.map((t) => t.name)
          : kind === "scales"
            ? galleryScales
            : galleryFinishes;
      values.forEach((name, i) => {
        const row = document.createElement("div");
        row.className = "row";
        row.style.marginTop = "10px";
        const input = document.createElement("input");
        input.value = name;
        input.setAttribute("aria-label", `แก้ชื่อ ${name}`);
        const b = document.createElement("button");
        b.type = "button";
        b.className = "cursor-interaction";
        b.textContent = "บันทึกชื่อ";
        b.dataset.taxonomySave = "true";
        b.addEventListener("click", async () => {
          const value = input.value.trim();
          if (
            !value ||
            values.some(
              (v, j) => j !== i && v.toLowerCase() === value.toLowerCase(),
            )
          ) {
            query(".taxonomy-result").textContent =
              "ใส่ชื่อที่ไม่ว่างและไม่ซ้ำค่ะ";
            return;
          }
          const backup = JSON.stringify({
            galleryTypes,
            galleryScales,
            galleryFinishes,
            scales,
            finishes,
            prices,
            typeNames,
            artworks,
          });
          if (kind === "types") {
            const id = galleryTypes[i].id;
            galleryTypes[i].name = value;
            const key =
              id === "full" ? "Character" : id === "chibi" ? "Chibi" : id;
            typeNames[key] = value;
          } else {
            const choices = kind === "scales" ? galleryScales : galleryFinishes;
            choices[i] = value;
            artworks.forEach((art) => {
              if (kind === "scales" && (art.scale || art.tags[0]) === name) {
                art.scale = value;
                art.tags[0] = value;
              }
              if (kind === "finishes" && (art.finish || art.tags[1]) === name) {
                art.finish = value;
                art.tags[1] = value;
              }
            });
            Object.values(kind === "scales" ? scales : finishes).forEach(
              (labels) =>
                labels.forEach((v, j) => {
                  if (v.toLowerCase() === name.toLowerCase()) labels[j] = value;
                }),
            );
          }
          categories.splice(
            0,
            categories.length,
            ...galleryTypes.map((t) => t.name),
          );
          if (!(await remember())) {
            restoreTaxonomy(backup);
            query(".taxonomy-result").textContent = cloudError;
            return;
          }
          refreshTaxonomy();
          query(".taxonomy-result").textContent =
            "เปลี่ยนชื่อและอัปเดต Gallery แล้วค่ะ";
        });
        row.append(input, b);
        if (kind === "types") {
          row.dataset.typeId = galleryTypes[i].id;
          const handle = document.createElement("button");
          handle.type = "button";
          handle.textContent = "⋮⋮";
          handle.className = "akane-drag-handle cursor-interaction";
          handle.setAttribute("aria-label", `ลากจัดลำดับ Type ${name}`);
          const remove = document.createElement("button");
          remove.type = "button";
          remove.textContent = "ลบ";
          remove.className = "cursor-interaction";
          remove.setAttribute("aria-label", `ลบ Type ${name}`);
          remove.disabled = galleryTypes.length <= 1;
          const persistTypes = async (next, removed) => {
            const backup = JSON.stringify({
              galleryTypes,
              galleryScales,
              galleryFinishes,
              scales,
              finishes,
              prices,
              typeNames,
              artworks,
            });
            const oldWorkType = workType;
            galleryTypes.splice(0, galleryTypes.length, ...next);
            const keyFor = (id) =>
              id === "full" ? "Character" : id === "chibi" ? "Chibi" : id;
            if (removed) {
              const key = keyFor(removed);
              for (const obj of [scales, finishes, prices, typeNames])
                delete obj[key];
              // Keep artwork files; move their category to the remaining first Type.
              artworks.forEach((art) => {
                if (art.typeId === removed) art.typeId = next[0].id;
              });
              if (workType === removed) workType = next[0].id;
            }
            for (const obj of [scales, finishes, prices, typeNames]) {
              const entries = next.map((type) => [
                keyFor(type.id),
                obj[keyFor(type.id)],
              ]);
              Object.keys(obj).forEach((key) => delete obj[key]);
              entries.forEach(([key, value]) => {
                obj[key] = value;
              });
            }
            categories.splice(
              0,
              categories.length,
              ...next.map((type) => type.name),
            );
            if (!(await remember())) {
              restoreTaxonomy(backup);
              workType = oldWorkType;
              refreshTaxonomy();
              query(".taxonomy-result").textContent = cloudError;
              return;
            }
            refreshTaxonomy();
            query(".taxonomy-result").textContent = removed
              ? "ลบ Type แล้ว โดยเก็บภาพผลงานไว้"
              : "บันทึกลำดับ Type แล้ว";
          };
          remove.onclick = () => {
            const id = row.dataset.typeId;
            const next = galleryTypes.filter((type) => type.id !== id);
            if (!next.length) return;
            const count = artworks.filter((art) => art.typeId === id).length;
            if (
              !window.confirm(
                `ลบ Type ${name}?${count ? ` ภาพผลงาน ${count} รายการจะยังอยู่ และย้ายไป ${next[0].name}` : ""}`,
              )
            )
              return;
            persistTypes(next, id);
          };
          handle.onpointerdown = (event) => {
            if (event.button !== 0) return;
            event.preventDefault();
            handle.setPointerCapture(event.pointerId);
            const original = galleryTypes.map((type) => type.id).join(",");
            row.classList.add("dragging");
            handle.onpointermove = (move) => {
              const target = document
                .elementFromPoint(move.clientX, move.clientY)
                ?.closest("[data-type-id]");
              if (!target || target === row || target.parentNode !== list)
                return;
              const box = target.getBoundingClientRect();
              list.insertBefore(
                row,
                move.clientY > box.top + box.height / 2
                  ? target.nextSibling
                  : target,
              );
            };
            const finish = (cancelled) => {
              row.classList.remove("dragging");
              handle.onpointermove =
                handle.onpointerup =
                handle.onpointercancel =
                  null;
              const ids = [...list.children].map((item) => item.dataset.typeId);
              if (cancelled) {
                drawTaxonomy();
                return;
              }
              if (ids.join(",") !== original)
                persistTypes(
                  ids.map((id) => galleryTypes.find((type) => type.id === id)),
                );
            };
            handle.onpointerup = () => finish(false);
            handle.onpointercancel = () => finish(true);
          };
          row.prepend(handle);
          row.append(remove);
        }
        list.append(row);
      });
    }
    function restoreTaxonomy(json) {
      const old = JSON.parse(json);
      for (const [list, key] of [
        [galleryTypes, "galleryTypes"],
        [galleryScales, "galleryScales"],
        [galleryFinishes, "galleryFinishes"],
      ])
        list.splice(0, list.length, ...old[key]);
      for (const [obj, key] of [
        [scales, "scales"],
        [finishes, "finishes"],
        [prices, "prices"],
        [typeNames, "typeNames"],
      ]) {
        Object.keys(obj).forEach((k) => delete obj[k]);
        Object.assign(obj, old[key]);
      }
      artworks = old.artworks;
      categories.splice(
        0,
        categories.length,
        ...galleryTypes.map((t) => t.name),
      );
    }
    function refreshTaxonomy() {
      category = "All";
      galleryScale = "All";
      galleryFinish = "All";
      drawTaxonomy();
      drawPriceSettings();
      drawGallery();
      drawWorkLibrary();
      render();
    }
    query(".taxonomy-kind").addEventListener("change", drawTaxonomy);
    query(".taxonomy-add").addEventListener("click", async () => {
      const kind = query(".taxonomy-kind").value,
        name = query(".taxonomy-name").value.trim();
      const values =
        kind === "types"
          ? galleryTypes.map((t) => t.name)
          : kind === "scales"
            ? galleryScales
            : galleryFinishes;
      if (!name || values.some((v) => v.toLowerCase() === name.toLowerCase())) {
        query(".taxonomy-result").textContent = "ใส่ชื่อใหม่ที่ไม่ซ้ำค่ะ";
        return;
      }
      const backup = JSON.stringify({
        galleryTypes,
        galleryScales,
        galleryFinishes,
        scales,
        finishes,
        prices,
        typeNames,
        artworks,
      });
      if (kind === "types") {
        const id = "type-" + crypto.randomUUID();
        galleryTypes.push({ id, name });
        typeNames[id] = name;
        scales[id] = [...galleryScales];
        finishes[id] = [...galleryFinishes];
        prices[id] = galleryScales.map(() => galleryFinishes.map(() => 0));
        workType = id;
      } else if (kind === "scales") {
        galleryScales.push(name);
        for (const id of Object.keys(scales)) {
          scales[id].push(name);
          prices[id].push(finishes[id].map(() => 0));
        }
      } else {
        galleryFinishes.push(name);
        for (const id of Object.keys(finishes)) {
          finishes[id].push(name);
          prices[id].forEach((row) => row.push(0));
        }
      }
      categories.splice(
        0,
        categories.length,
        ...galleryTypes.map((t) => t.name),
      );
      if (!(await remember())) {
        restoreTaxonomy(backup);
        query(".taxonomy-result").textContent = cloudError;
        return;
      }
      query(".taxonomy-name").value = "";
      refreshTaxonomy();
      query(".taxonomy-result").textContent = "เพิ่มและอัปเดต Gallery แล้วค่ะ";
    });
    function drawGalleryTagFilters() {
      const target = query(".gallery-tag-filters");
      target.replaceChildren();
      for (const [label, values, selected, set] of [
        ["สเกลภาพ", galleryScales, galleryScale, (v) => (galleryScale = v)],
        ["การลงสี", galleryFinishes, galleryFinish, (v) => (galleryFinish = v)],
      ]) {
        const wrap = document.createElement("label");
        wrap.textContent = label;
        const select = document.createElement("select");
        select.setAttribute("aria-label", label);
        select.replaceChildren(
          new Option("ทั้งหมด", "All"),
          ...values.map((v) => new Option(v, v)),
        );
        select.value = selected;
        select.addEventListener("change", () => {
          set(select.value);
          drawGallery();
        });
        wrap.append(select);
        target.append(wrap);
      }
    }
    function drawPriceSettings() {
      if (root.dataset.admin !== "true") return;
      query(".price-settings").replaceChildren();
      for (const type of Object.keys(scales)) {
        const section = document.createElement("section");
        const heading = document.createElement("h3");
        heading.textContent = typeNames[type] || type;
        section.appendChild(heading);
        const table = document.createElement("table");
        table.className = "pricing-table";
        const head = document.createElement("thead");
        const header = document.createElement("tr");
        ["Scale", ...finishes[type]].forEach((name) => {
          const cell = document.createElement("th");
          cell.scope = "col";
          cell.textContent = name;
          header.appendChild(cell);
        });
        head.appendChild(header);
        table.appendChild(head);
        const body = document.createElement("tbody");
        prices[type].forEach((row, i) => {
          const tr = document.createElement("tr");
          const scale = document.createElement("th");
          scale.scope = "row";
          scale.textContent = scales[type][i];
          tr.appendChild(scale);
          row.forEach((amount, j) => {
            const cell = document.createElement("td");
            const input = document.createElement("input");
            input.type = "number";
            input.min = "0";
            input.step = "1";
            input.value = amount;
            input.dataset.priceType = type;
            input.dataset.priceScale = i;
            input.dataset.priceFinish = j;
            input.setAttribute(
              "aria-label",
              `${type} ${scales[type][i]} ${finishes[type][j]} price in THB`,
            );
            cell.appendChild(input);
            tr.appendChild(cell);
          });
          body.appendChild(tr);
        });
        table.appendChild(body);
        section.appendChild(table);
        query(".price-settings").appendChild(section);
      }
    }
    drawPriceSettings();
    query(".save-prices").addEventListener("click", async () => {
      const inputs = [...surface.querySelectorAll("[data-price-type]")];
      if (
        inputs.some(
          (i) =>
            i.value.trim() === "" ||
            !Number.isFinite(Number(i.value)) ||
            Number(i.value) < 0,
        )
      ) {
        query(".price-settings-result").textContent =
          language === "en"
            ? "Please enter a price of 0 or more."
            : "ใส่ราคาเป็นเลข 0 ขึ้นไปนะคะ";
        return;
      }
      inputs.forEach(
        (input) =>
          (prices[input.dataset.priceType][Number(input.dataset.priceScale)][
            Number(input.dataset.priceFinish)
          ] = Number(input.value)),
      );
      render();
      const ok = await remember();
      if (!ok) {
        query(".price-settings-result").textContent = cloudError;
        return;
      }
      query(".price-settings-result").textContent =
        language === "en" ? "Prices published." : "บันทึกราคาและเผยแพร่แล้วค่ะ";
    });
    window.addEventListener("focus", () => {
      if (root.dataset.admin !== "true")
        window.dispatchEvent(
          new StorageEvent("storage", { key: "akane-preview-update" }),
        );
    });
    surface._applyCloud = (updated) => {
      if (!updated) return;
      window.AkanePageData = updated;
      queueMicrotask(() => window.AkaneVisual?.apply(surface, updated));
      showcaseCloudVersion++;
      if (query(".showcase-sort-dialog").open && !showcaseSaving) {
        query(".showcase-sort-result").textContent =
          "ข้อมูลอัปเดตจากอีกหน้า กรุณาปิดแล้วกด Sort ใหม่ก่อนบันทึกค่ะ";
      }
      Object.assign(scales, updated.scales || {});
      Object.assign(finishes, updated.finishes || {});
      Object.assign(prices, updated.pricing || {});
      Object.assign(typeNames, updated.typeNames || {});
      if (updated.galleryTypes)
        galleryTypes.splice(0, galleryTypes.length, ...updated.galleryTypes);
      if (updated.galleryScales)
        galleryScales.splice(0, galleryScales.length, ...updated.galleryScales);
      if (updated.galleryFinishes)
        galleryFinishes.splice(
          0,
          galleryFinishes.length,
          ...updated.galleryFinishes,
        );
      categories.splice(
        0,
        categories.length,
        ...galleryTypes.map((t) => t.name),
      );
      artworks = updated.artworks || [];
      offers = (updated.offers || []).map(normalizeOffer);
      if (validTerms(updated.terms))
        terms.splice(0, terms.length, ...updated.terms);
      if (updated.animation) look.animation = updated.animation;
      drawPriceSettings();
      drawTaxonomy();
      drawGallery();
      drawLatest();
      drawWorkLibrary();
      drawOffers();
      drawOfferAdmin();
      render();
      appearance();
    };

    const terms = Array.from({ length: 6 }, () => ({
      thTitle: "",
      enTitle: "",
      th: "",
      en: "",
    }));
    let termsLanguage = language;
    let editingOffer = -1;
    let offerCover = "";
    let offerImages = [];
    let offerCrops = [];
    function videoPoster(src) {
      const cache = (window.akaneVideoPosterCache ||= new Map());
      if (cache.has(src)) return cache.get(src);
      const promise = (async () => {
        const cached = await window.AkaneCloud?.getPoster?.(src);
        if (cached) return cached;
        return new Promise((resolve) => {
          const probe = document.createElement("video");
          probe.muted = true;
          probe.playsInline = true;
          probe.preload = "auto";
          let done = false;
          const finish = (poster) => {
            if (done) return;
            done = true;
            clearTimeout(timer);
            probe.pause();
            probe.removeAttribute("src");
            probe.load();
            if (poster) window.AkaneCloud?.putPoster?.(src, poster);
            resolve(poster);
          };
          const capture = () => {
            if (done || probe.readyState < 2 || !probe.videoWidth) return;
            try {
              const canvas = document.createElement("canvas");
              canvas.width = Math.min(960, probe.videoWidth);
              canvas.height = Math.max(
                1,
                Math.round(
                  (canvas.width * probe.videoHeight) / probe.videoWidth,
                ),
              );
              canvas
                .getContext("2d")
                .drawImage(probe, 0, 0, canvas.width, canvas.height);
              finish(canvas.toDataURL("image/jpeg", 0.85));
            } catch {
              finish("");
            }
          };
          const timer = setTimeout(() => finish(""), 20000);
          probe.addEventListener("error", () => finish(""), {
            once: true,
          });
          probe.addEventListener(
            "loadedmetadata",
            () => {
              const time = Number.isFinite(probe.duration)
                ? Math.min(1, probe.duration / 2)
                : 0;
              if (time > 0) {
                probe.addEventListener("seeked", capture, { once: true });
                probe.currentTime = time;
              } else {
                probe.addEventListener("loadeddata", capture, {
                  once: true,
                });
                capture();
              }
            },
            { once: true },
          );
          probe.src = src;
          probe.load();
        });
      })();
      cache.set(src, promise);
      return promise;
    }
    function makeMedia(src, label) {
      const isVideo = /^data:video\//i.test(src || "");
      const media = document.createElement(isVideo ? "video" : "img");
      if (isVideo) {
        media.controls = true;
        media.setAttribute("controlslist", "nodownload");
        media.disablePictureInPicture = true;
        media.playsInline = true;
        media.preload = "none";
        media.setAttribute("aria-label", label || "Video preview");
        videoPoster(src).then((poster) => {
          if (poster) media.poster = poster;
        });
      } else {
        media.alt = label || "Preview";
        media.loading = "lazy";
        media.decoding = "async";
      }
      media.draggable = false;
      media.src = src;
      return media;
    }

    let workCrop = { x: 50, y: 50, zoom: 1 };
    let editingWork = -1;
    const workPanelHome = document.createComment("Artwork editor home");
    query(".work-upload-panel")?.before(workPanelHome);
    function showUploadMedia(src) {
      const old = query(".upload img,.upload video");
      const media = makeMedia(src, "ภาพตัวอย่างที่เลือก");
      old.replaceWith(media);
      workCrop = cropValue();
      drawWorkCrop(src);
    }
    function drawWorkCrop(src) {
      query(".work-crop-tools").hidden = true;
      query(".work-crop-editor").hidden = true;
      query(".work-crop-editor").replaceChildren();
      const frame = query(".upload-preview-frame") || query(".upload");
      frame
        .querySelectorAll(
          ".direct-crop-toggle,.direct-crop-reset,.direct-crop-hint",
        )
        .forEach((el) => el.remove());
      const media = query(".upload img,.upload video");
      applyCrop(media, workCrop);
      enableDirectCrop(
        frame,
        media,
        () => workCrop,
        (value) => {
          workCrop = cropValue(value);
          applyCrop(media, workCrop);
        },
      );
    }

    function enableDirectCrop(frame, media, getCrop, onChange) {
      frame._cropAbort?.abort();
      const abort = new AbortController();
      frame._cropAbort = abort;
      const listen = (type, handler, options = {}) =>
        frame.addEventListener(type, handler, {
          ...options,
          signal: abort.signal,
        });
      frame.classList.add("direct-crop-frame");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "direct-crop-toggle";
      button.textContent = "Crop";
      button.title = "ปรับ Crop · ลากภาพเพื่อจัดตำแหน่ง";
      button.setAttribute("aria-label", "ลากปรับ Crop");
      button.setAttribute("aria-pressed", "false");
      frame.append(button);
      const reset = document.createElement("button");
      reset.type = "button";
      reset.className = "direct-crop-reset";
      reset.textContent = "↺";
      reset.title = "Reset crop";
      reset.setAttribute("aria-label", "Reset crop");
      reset.hidden = true;
      frame.append(reset);
      const hint = document.createElement("span");
      hint.className = "direct-crop-hint";
      hint.textContent = "ลากภาพ · เลื่อนล้อเพื่อซูม";
      hint.hidden = true;
      frame.append(hint);
      let active = false;
      const points = new Map();
      let lastPinch = 0;
      function setActive(next) {
        active = next;
        frame.classList.toggle("is-cropping", active);
        button.setAttribute("aria-pressed", String(active));
        button.title = active ? "เสร็จสิ้นการปรับ Crop" : "ปรับ Crop · ลากภาพ";
        button.textContent = active ? "Done" : "Crop";
        reset.hidden = !active;
        hint.hidden = !active;
        media.controls = media.tagName === "VIDEO" && !active;
        if (!active) {
          points.clear();
          lastPinch = 0;
        }
        media.draggable = false;
      }
      button.onclick = () => setActive(!active);
      reset.onclick = () => onChange(cropValue());
      frame.tabIndex = 0;
      frame.setAttribute("aria-label", "ภาพตัวอย่าง กดปุ่ม Crop แล้วลากภาพ");
      listen("pointerdown", (e) => {
        if (!active || e.target.closest("button")) return;
        e.preventDefault();
        frame.setPointerCapture(e.pointerId);
        points.set(e.pointerId, { x: e.clientX, y: e.clientY });
        lastPinch = points.size === 2 ? distance() : 0;
      });
      function distance() {
        const p = [...points.values()];
        return p.length < 2 ? 0 : Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
      }
      listen("pointermove", (e) => {
        if (!active || !points.has(e.pointerId)) return;
        const previous = points.get(e.pointerId);
        points.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const crop = cropValue(getCrop());
        if (points.size === 2) {
          const d = distance();
          if (lastPinch)
            crop.zoom = Math.min(3, Math.max(1, (crop.zoom * d) / lastPinch));
          lastPinch = d;
        } else {
          const r = frame.getBoundingClientRect();
          crop.x = Math.min(
            100,
            Math.max(0, crop.x - ((e.clientX - previous.x) / r.width) * 100),
          );
          crop.y = Math.min(
            100,
            Math.max(0, crop.y - ((e.clientY - previous.y) / r.height) * 100),
          );
        }
        onChange(crop);
      });
      const end = (e) => {
        points.delete(e.pointerId);
        lastPinch = 0;
      };
      listen("pointerup", end);
      listen("pointercancel", end);
      listen(
        "wheel",
        (e) => {
          if (!active) return;
          e.preventDefault();
          const crop = cropValue(getCrop());
          crop.zoom = Math.min(
            3,
            Math.max(1, crop.zoom * Math.exp(-e.deltaY * 0.002)),
          );
          onChange(crop);
        },
        { passive: false },
      );
      listen("keydown", (e) => {
        if (!active || e.target !== frame) return;
        const crop = cropValue(getCrop());
        const keys = {
          ArrowLeft: ["x", 2],
          ArrowRight: ["x", -2],
          ArrowUp: ["y", 2],
          ArrowDown: ["y", -2],
        };
        if (e.key === "Escape") {
          setActive(false);
          return;
        }
        if (keys[e.key]) {
          e.preventDefault();
          const [k, d] = keys[e.key];
          crop[k] = Math.min(100, Math.max(0, crop[k] + d));
          onChange(crop);
        }
        if (e.key === "+" || e.key === "-") {
          e.preventDefault();
          crop.zoom = Math.min(
            3,
            Math.max(1, crop.zoom + (e.key === "+" ? 0.1 : -0.1)),
          );
          onChange(crop);
        }
      });
    }

    function cropValue(value) {
      return {
        x: Math.min(100, Math.max(0, Number(value?.x ?? 50))),
        y: Math.min(100, Math.max(0, Number(value?.y ?? 50))),
        zoom: Math.min(3, Math.max(1, Number(value?.zoom ?? 1))),
      };
    }
    function applyCrop(img, value) {
      const crop = cropValue(value);
      img.style.objectPosition = `${crop.x}% ${crop.y}%`;
      img.style.transformOrigin = `${crop.x}% ${crop.y}%`;
      img.style.transform = `scale(${crop.zoom})`;
    }
    function drawCropEditor() {
      const editor = query(".crop-editor");
      editor.replaceChildren();
      offerImages.forEach((src, index) => {
        const section = document.createElement("section");
        section.className = "crop-item";
        const heading = document.createElement("h3");
        heading.textContent =
          index === 0 ? "Crop · ภาพปก" : `Crop · ภาพตัวอย่าง ${index}`;
        const frame = document.createElement("div");
        frame.className = "crop-frame";
        const img = makeMedia(src, `Crop preview ${index + 1}`);
        frame.append(img);
        applyCrop(img, offerCrops[index]);
        section.append(heading, frame);
        if (index === 0) {
          const replaceCover = document.createElement("button");
          replaceCover.type = "button";
          replaceCover.className = "cursor-interaction replace-media-icon";
          replaceCover.textContent = "🔁";
          replaceCover.title = "เปลี่ยนภาพปก";
          replaceCover.setAttribute("aria-label", "เปลี่ยนภาพปก");
          replaceCover.addEventListener("click", async () =>
            query(".offer-cover").click(),
          );
          heading.append(replaceCover);
        }
        if (index > 0) {
          const actions = document.createElement("div");
          actions.className = "row";
          const replace = document.createElement("button");
          replace.type = "button";
          replace.className = "cursor-interaction";
          replace.textContent = "🔁";
          replace.classList.add("replace-media-icon");
          replace.setAttribute("aria-label", "เปลี่ยนภาพตัวอย่าง");
          replace.title = "เปลี่ยนภาพตัวอย่าง";
          const picker = document.createElement("input");
          picker.type = "file";
          picker.accept = query(".offer-cover").accept;
          picker.hidden = true;
          replace.addEventListener("click", async () => picker.click());
          picker.addEventListener("change", async () => {
            const file = picker.files[0];
            if (!file) return;
            try {
              const [src] = await readOfferMedia([file]);
              offerImages[index] = src;
              offerCrops[index] = cropValue();
              refreshOfferMedia();
              query(".offer-save-result").textContent =
                "เปลี่ยนภาพแล้ว กด Save commission เพื่อบันทึกค่ะ";
            } catch {
              query(".offer-save-result").textContent =
                "อ่านไฟล์ไม่สำเร็จ กรุณาลองอีกครั้งค่ะ";
            }
          });
          const remove = document.createElement("button");
          remove.type = "button";
          remove.className = "cursor-interaction";
          remove.textContent = "ลบภาพ";
          remove.addEventListener("click", async () => {
            offerImages.splice(index, 1);
            offerCrops.splice(index, 1);
            refreshOfferMedia();
            query(".offer-save-result").textContent =
              "ลบภาพตัวอย่างแล้ว กด Save commission เพื่อบันทึกค่ะ";
          });
          heading.append(replace);
          actions.append(remove, picker);
          section.append(actions);
        }
        enableDirectCrop(
          frame,
          img,
          () => offerCrops[index],
          (value) => {
            offerCrops[index] = cropValue(value);
            applyCrop(img, offerCrops[index]);
          },
        );
        const reset = document.createElement("button");
        reset.type = "button";
        reset.className = "cursor-interaction";
        reset.textContent = "Reset crop";
        reset.addEventListener("click", async () => {
          offerCrops[index] = cropValue();
          drawCropEditor();
        });
        section.append(reset);
        const save = document.createElement("button");
        save.type = "button";
        save.className = "primary cursor-interaction crop-save";
        save.textContent = "Save crop & commission";
        save.addEventListener("click", async () =>
          query(".save-offer").click(),
        );
        section.append(save);
        editor.append(section);
      });
    }
    function drawOffers(expanded = false, selected = null) {
      const available = offers.some((item) => item.status === "open");
      const toggle = query(".availability-toggle");
      toggle.dataset.on = String(available);
      query(".availability-label").textContent = available ? "ON" : "OFF";
      toggle.setAttribute(
        "aria-label",
        available ? "Available: ON" : "Available: OFF",
      );
      const target = query(expanded ? ".offer-dialog-content" : ".offer-list");
      target.replaceChildren();
      const visible = selected
        ? [selected]
        : offers.filter(
            (item) => item.status === "open" || item.status === "waitlist",
          );
      if (!visible.length) {
        const empty = document.createElement("div");
        empty.className = "offer-empty";
        const title = document.createElement("h3");
        title.textContent = "Coming soon";
        const text = document.createElement("p");
        text.textContent =
          language === "en"
            ? "New commissions will appear here. Feel free to message me!"
            : "ถ้ามีคอมมิชชั่นเปิดใหม่ จะมาอัปเดตตรงนี้นะคะ ทักมาสอบถามก่อนได้ค่า ♥️";
        empty.append(title, text);
        target.appendChild(empty);
        return;
      }
      visible.forEach((item) => {
        const card = document.createElement("article");
        card.className = "offer-card";
        if (!expanded) {
          const ribbon = document.createElement("span");
          ribbon.className = "offer-ribbon";
          ribbon.setAttribute("aria-hidden", "true");
          card.appendChild(ribbon);
        }
        const image = document.createElement("div");
        image.className = "offer-image";
        const previews = item.images?.length
          ? item.images
          : item.cover
            ? [item.cover]
            : [];
        if (expanded && previews.length) {
          image.classList.add("offer-image-stack");
          const detailArtworks = previews.map((src) => ({ image: src, title: item.title }));
          previews.forEach((src, index) => {
            const frame = document.createElement("div");
            frame.className = "offer-detail-media";
            frame.tabIndex = 0;
            frame.setAttribute("role", "button");
            frame.setAttribute("aria-label", `View full commission image ${index + 1}`);
            const open = () => openFullArtwork(detailArtworks[index], detailArtworks);
            frame.addEventListener("click", open);
            frame.addEventListener("keydown", (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.stopPropagation();
                open();
              }
            });
            frame.style.cursor = "zoom-in";
            const media = makeMedia(src, item.title);
            applyCrop(media, item.crops?.[index]);
            frame.append(media);
            image.append(frame);
          });
        } else if (previews.length) {
          let current = 0;
          let img = makeMedia(previews[0], item.title);
          applyCrop(img, item.crops?.[0]);
          image.appendChild(img);
          if (previews.length > 1) {
            const controls = document.createElement("div");
            controls.className = "preview-arrows row";
            const prev = document.createElement("button");
            prev.type = "button";
            prev.textContent = "‹";
            prev.setAttribute("aria-label", "Previous preview");
            const next = document.createElement("button");
            next.type = "button";
            next.textContent = "›";
            next.setAttribute("aria-label", "Next preview");
            const count = document.createElement("span");
            count.textContent = `1 / ${previews.length}`;
            const move = (step) => {
              current = (current + step + previews.length) % previews.length;
              if (img.tagName === "VIDEO") img.pause();
              const replacement = makeMedia(previews[current], item.title);
              img.replaceWith(replacement);
              img = replacement;
              applyCrop(img, item.crops?.[current]);
              count.textContent = `${current + 1} / ${previews.length}`;
            };
            prev.addEventListener("click", async () => move(-1));
            next.addEventListener("click", async () => move(1));
            controls.append(prev, count, next);
            image.appendChild(controls);
          }
        } else image.textContent = "Commission preview";
        const content = document.createElement("div");
        content.className = "offer-info";
        const status = document.createElement("span");
        status.className = "pill";
        status.textContent = item.status === "waitlist" ? "Waitlist" : "Open";
        const title = document.createElement("h3");
        title.textContent = item.title;
        const price = document.createElement("p");
        price.className = "offer-price";
        price.textContent = `Price ฿${Number(item.price).toLocaleString()}`;
        const detail = document.createElement("p");
        detail.className = "offer-description";
        detail.textContent = item.details;
        const included = document.createElement("div");
        included.className = "offer-included";
        if (item.included) {
          const label = document.createElement("h4");
          label.textContent = "You'll get";
          const list = document.createElement("ul");
          item.included
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .forEach((text) => {
              const li = document.createElement("li");
              li.textContent = text.replace(/^[-•]\s*/, "");
              list.appendChild(li);
            });
          included.append(label, list);
        }
        const contact = document.createElement("a");
        contact.textContent =
          item.status === "waitlist" ? "Join wait list" : "Accept";
        contact.className = "offer-cta";
        contact.dataset.status = item.status;
        contact.href = /^https?:\/\//i.test(item.link || "")
          ? item.link
          : "https://www.facebook.com/akanemui2314";
        contact.target = "_blank";
        contact.rel = "noopener";
        if (expanded) {
          content.append(status, title, price, detail, included, contact);
          const estimate = buildOfferEstimate(item);
          contact.before(estimate);
        } else {
          const preview = document.createElement("p");
          preview.className = "offer-summary";
          preview.textContent = item.details;
          const view = document.createElement("button");
          view.type = "button";
          view.className = "cursor-interaction offer-view";
          view.textContent = "View details";
          view.addEventListener("click", async () => {
            drawOffers(true, item);
            query(".offer-dialog").showModal();
          });
          content.append(status, title, price, preview, view, contact);
        }
        if (item.slots) {
          const slots = document.createElement("p");
          slots.className = "offer-slots";
          slots.textContent = `${item.slots} slots available`;
          const badges = document.createElement("div");
          badges.className = "offer-badges row";
          status.replaceWith(badges);
          badges.append(status, slots);
        }
        const usage = document.createElement("div");
        usage.className = "offer-usage";
        const check = document.createElement("span");
        check.setAttribute("aria-hidden", "true");
        check.textContent = "✓";
        const label = document.createElement("span");
        label.textContent = item.commercialAllowed
          ? "Personal / Commercial Use"
          : "Personal Use Only";
        usage.append(check, label);
        price.after(usage);
        card.append(image, content);
        target.appendChild(card);
      });
    }
    surface._drawOffers = () => drawOffers();
    query(".offer-dialog-close").addEventListener("click", async () =>
      query(".offer-dialog").close(),
    );
    query(".offer-dialog").addEventListener("click", async (event) => {
      if (event.target !== query(".offer-dialog")) return;
      const bounds = event.target.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      )
        event.target.close();
    });
    function buildOfferEstimate(item) {
      const panel = document.createElement("section");
      panel.className = "offer-estimate";
      const title = document.createElement("h4");
      title.textContent = "License scope";
      panel.appendChild(title);
      const choices = document.createElement("div");
      choices.className = "row";
      let multiplier = 1;
      const licenses = [];
      for (const [name, factor] of [
        ["Personal Use", 1],
        ...(item.commercialAllowed ? [["Commercial Use", 2]] : []),
      ]) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "cursor-interaction";
        button.textContent = name + (factor === 1 ? " · Included" : " · ×2");
        button.setAttribute("aria-pressed", String(factor === 1));
        button.addEventListener("click", async () => {
          multiplier = factor;
          licenses.forEach((entry) =>
            entry.button.setAttribute(
              "aria-pressed",
              String(entry.factor === factor),
            ),
          );
          update();
        });
        licenses.push({ button, factor });
        choices.appendChild(button);
      }
      panel.appendChild(choices);
      const inputs = [];
      if (item.addons?.length) {
        const heading = document.createElement("h4");
        heading.textContent = "Add-ons";
        panel.appendChild(heading);
        item.addons.forEach((addon) => {
          const label = document.createElement("label");
          label.className = "offer-addon";
          const name = document.createElement("span");
          name.textContent = `${addon.name} · +฿${Number(addon.price).toLocaleString()}`;
          const input = document.createElement("input");
          input.type = "number";
          input.min = "0";
          input.step = "1";
          input.value = "0";
          input.setAttribute("aria-label", addon.name + " quantity");
          input.addEventListener("input", update);
          label.append(name, input);
          inputs.push({ input, price: Number(addon.price) });
          panel.appendChild(label);
        });
      }
      const total = document.createElement("output");
      total.className = "offer-total";
      total.setAttribute("aria-live", "polite");
      const note = document.createElement("p");
      note.className = "small";
      note.textContent =
        language === "en"
          ? "Base estimate. The final price depends on the details."
          : "ราคาประเมินเบื้องต้น อาจคิดเพิ่มตามรายละเอียดงานค่ะ";
      panel.append(total, note);
      function update() {
        const extras = inputs.reduce(
          (sum, { input, price }) =>
            sum + Math.max(0, Math.floor(Number(input.value) || 0)) * price,
          0,
        );
        total.textContent = `Total ฿${((Number(item.price) + extras) * multiplier).toLocaleString()}`;
      }
      update();
      return panel;
    }
    function editOffer(index) {
      editingOffer = index;
      const item = offers[index] || { status: "open", price: 0 };
      query(".offer-editor").hidden = false;
      surface
        .querySelectorAll("[data-offer-field]")
        .forEach(
          (field) => (field.value = item[field.dataset.offerField] ?? ""),
        );
      query(".offer-commercial").checked = item.commercialAllowed === true;
      offerImages = [...(item.images || (item.cover ? [item.cover] : []))];
      offerCover = offerImages[0] || "";
      offerCrops = offerImages.map((_, i) => ({
        ...cropValue(item.crops?.[i]),
      }));
      drawCropEditor();
      query(".offer-addons").value = (item.addons || [])
        .map((a) => `${a.name} | ${a.price}`)
        .join("\n");
      query(".offer-image-count").textContent = offerImages.length
        ? `ภาพปก 1 · ภาพตัวอย่าง ${offerImages.length - 1}`
        : "ยังไม่มีภาพปก";
      query(".offer-cover").value = "";
      query(".offer-cover-preview").hidden = !offerCover;
      const oldPreview = query(".offer-cover-preview");
      const newPreview = makeMedia(offerCover, "Cover preview");
      newPreview.className = "offer-cover-preview";
      newPreview.hidden = !offerCover;
      oldPreview.replaceWith(newPreview);
      query(".offer-save-result").textContent = "";
    }
    function drawOfferAdmin() {
      if (root.dataset.admin !== "true") return;
      const target = query(".offer-admin-list");
      target.replaceChildren();
      offers.forEach((item, index) => {
        const row = document.createElement("div");
        row.className = "offer-admin-bubble";
        const name = document.createElement("span");
        name.className = "offer-admin-name";
        name.textContent = item.title;
        const status = document.createElement("span");
        status.className = "offer-admin-status";
        status.dataset.status = item.status;
        status.textContent =
          { open: "Open", waitlist: "Waitlist", hidden: "Hidden" }[
            item.status
          ] || item.status;
        const edit = document.createElement("button");
        edit.type = "button";
        edit.textContent = "Edit";
        edit.className = "cursor-interaction";
        edit.addEventListener("click", async () => editOffer(index));
        row.append(name, status, edit);
        target.appendChild(row);
      });
    }
    query(".add-offer").addEventListener("click", async () => editOffer(-1));
    function readOfferMedia(files) {
      return Promise.all(
        files.map(
          (file) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            }),
        ),
      );
    }
    function refreshOfferMedia() {
      offerCover = offerImages[0] || "";
      drawCropEditor();
      const oldPreview = query(".offer-cover-preview");
      const preview = makeMedia(offerCover, "Cover preview");
      preview.className = "offer-cover-preview";
      preview.hidden = !offerCover;
      oldPreview.replaceWith(preview);
      query(".offer-image-count").textContent = offerImages.length
        ? `ภาพปก 1 · ภาพตัวอย่าง ${offerImages.length - 1}`
        : "ยังไม่มีภาพปก";
    }
    query(".change-offer-cover").addEventListener("click", async (event) => {
      event.preventDefault();
      query(".offer-cover").click();
    });
    query(".offer-cover").addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      try {
        const [src] = await readOfferMedia([file]);
        if (offerImages.length) {
          offerImages[0] = src;
          offerCrops[0] = cropValue();
        } else {
          offerImages.push(src);
          offerCrops.push(cropValue());
        }
        refreshOfferMedia();
      } catch {
        query(".offer-save-result").textContent =
          "อ่านไฟล์ไม่สำเร็จ กรุณาลองอีกครั้งค่ะ";
      }
      event.target.value = "";
    });
    query(".add-offer-samples").addEventListener("click", async () => {
      if (!offerImages.length) {
        query(".offer-save-result").textContent =
          "เลือกภาพปกก่อน แล้วเพิ่มภาพตัวอย่างได้ค่ะ";
        query(".offer-cover").click();
        return;
      }
      query(".offer-samples").click();
    });
    query(".offer-samples").addEventListener("change", async (event) => {
      const files = [...event.target.files];
      if (!files.length) return;
      try {
        const media = await readOfferMedia(files);
        offerImages.push(...media);
        offerCrops.push(...media.map(() => cropValue()));
        refreshOfferMedia();
        query(".offer-save-result").textContent =
          "เพิ่มภาพตัวอย่างแล้ว กด Save commission เพื่อบันทึกค่ะ";
      } catch {
        query(".offer-save-result").textContent =
          "อ่านไฟล์ไม่สำเร็จ กรุณาลองอีกครั้งค่ะ";
      }
      event.target.value = "";
    });
    query(".save-offer").addEventListener("click", async () => {
      const addons = [];
      for (const line of query(".offer-addons")
        .value.split("\n")
        .filter((v) => v.trim())) {
        const [name, amount, ...extra] = line.split("|");
        if (
          !name?.trim() ||
          amount === undefined ||
          !amount.trim() ||
          extra.length ||
          !Number.isFinite(Number(amount)) ||
          Number(amount) < 0
        ) {
          query(".offer-save-result").textContent =
            "Add-ons ใช้รูปแบบ ชื่อ | ราคา (เลข 0 ขึ้นไป) ค่ะ";
          return;
        }
        addons.push({ name: name.trim(), price: Number(amount) });
      }
      const item = {
        images: offerImages,
        crops: offerCrops,
        addons,
        cover: offerCover,
        commercialAllowed: query(".offer-commercial").checked,
      };
      surface
        .querySelectorAll("[data-offer-field]")
        .forEach(
          (field) => (item[field.dataset.offerField] = field.value.trim()),
        );
      if (
        !item.title ||
        !item.details ||
        item.price === "" ||
        !Number.isFinite(Number(item.price)) ||
        Number(item.price) < 0
      ) {
        query(".offer-save-result").textContent =
          "ใส่ชื่อและรายละเอียด พร้อมราคา 0 ขึ้นไปค่ะ";
        return;
      }
      if (item.link && !/^https?:\/\//i.test(item.link)) {
        query(".offer-save-result").textContent =
          "ใส่ลิงก์ที่เริ่มด้วย https:// หรือ http:// ค่ะ";
        return;
      }
      if (
        item.slots &&
        (!Number.isInteger(Number(item.slots)) || Number(item.slots) < 1)
      ) {
        query(".offer-save-result").textContent =
          "จำนวนคิวต้องเป็นจำนวนเต็มตั้งแต่ 1 ขึ้นไปค่ะ";
        return;
      }
      item.price = Number(item.price);
      if (editingOffer < 0) {
        offers.push(item);
        editingOffer = offers.length - 1;
      } else offers[editingOffer] = item;
      const persisted = await remember();
      drawOffers();
      drawOfferAdmin();
      query(".offer-save-result").textContent = persisted
        ? "บันทึกคอมมิชชั่นและ Crop แล้วค่ะ"
        : cloudError || "บันทึก Firebase ไม่สำเร็จ กรุณาลองอีกครั้งค่ะ";
    });
    drawTaxonomy();
    drawOffers();
    drawOfferAdmin();
    function validTerms(value) {
      return (
        Array.isArray(value) &&
        value.length > 0 &&
        value.every((item) =>
          ["thTitle", "enTitle", "th", "en"].every(
            (key) => typeof item[key] === "string",
          ),
        )
      );
    }
    if (validTerms(saved?.terms)) terms.splice(0, terms.length, ...saved.terms);
    function drawTerms() {
      const target = query(".tos-content");
      if (
        window.AkaneVisual?.terms(target, termsLanguage, window.AkanePageData)
      )
        return;
      target.replaceChildren();
      for (const item of terms) {
        const heading = document.createElement("h3");
        const flower = document.createElement("span");
        flower.className = "tos-flower";
        flower.setAttribute("aria-hidden", "true");
        flower.textContent = "✿";
        const title = document.createElement("span");
        title.textContent = item[termsLanguage + "Title"];
        heading.append(flower, title);
        const text = document.createElement("p");
        text.textContent = item[termsLanguage];
        target.append(heading, text);
      }
      surface
        .querySelectorAll("[data-tos-language]")
        .forEach((button) =>
          button.setAttribute(
            "aria-pressed",
            String(button.dataset.tosLanguage === termsLanguage),
          ),
        );
    }
    query(".tos-open").addEventListener("click", async () => {
      termsLanguage = language;
      drawTerms();
      query(".tos-dialog").showModal();
    });
    query(".tos-close").addEventListener("click", async () =>
      query(".tos-dialog").close(),
    );
    surface.querySelectorAll("[data-tos-language]").forEach((button) =>
      button.addEventListener("click", async () => {
        termsLanguage = button.dataset.tosLanguage;
        drawTerms();
      }),
    );
    query(".tos-dialog").addEventListener("click", async (event) => {
      if (event.target === query(".tos-dialog")) {
        const r = event.target.getBoundingClientRect();
        if (
          event.clientX < r.left ||
          event.clientX > r.right ||
          event.clientY < r.top ||
          event.clientY > r.bottom
        )
          event.target.close();
      }
    });
    query("input[type=file]").addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        showUploadMedia(reader.result);
      };
      reader.readAsDataURL(file);
    });
    let workLibraryPage = 1;
    function drawWorkLibrary() {
      if (root.dataset.admin !== "true") return;
      if (query(".work-upload-panel"))
        workPanelHome.after(query(".work-upload-panel"));
      const target = query(".work-library");
      target.replaceChildren();
      const entries = orderedArtworkEntries(artworks);
      const pageCount = Math.max(1, Math.ceil(entries.length / 10));
      workLibraryPage = Math.min(workLibraryPage, pageCount);
      entries
        .slice((workLibraryPage - 1) * 10, workLibraryPage * 10)
        .forEach(({ art, index }) => {
          const row = document.createElement("div");
          row.className = "offer-admin-bubble";
          const title = document.createElement("span");
          title.className = "offer-admin-name";
          title.textContent = art.title;
          title.title = art.title;
          const edit = document.createElement("button");
          edit.type = "button";
          edit.textContent = "Edit";
          edit.className = "cursor-interaction";
          edit.addEventListener("click", async () => {
            editingWork = index;
            query(".work-title").value = art.title;
            workType = art.typeId || "full";
            drawTaxonomy();
            query(".work-category").value = art.scale || art.tags[0];
            query(".work-finish").value = art.finish || art.tags[1];
            query(".publish").checked = true;
            showUploadMedia(art.image);
            workCrop = cropValue(art.crop);
            drawWorkCrop(art.image);
            query(".save").textContent = "Save changes";
            query(".cancel-work-edit").hidden = false;
            query(".save-result").textContent = "";
            row.after(query(".work-upload-panel"));
            query(".work-upload-panel").style.gridColumn = "1 / -1";
            query(".work-upload-panel").scrollIntoView({
              block: "nearest",
              behavior: "smooth",
            });
            query(".work-title").focus({ preventScroll: true });
          });
          const remove = document.createElement("button");
          remove.type = "button";
          remove.textContent = "Delete";
          remove.className = "cursor-interaction delete-work";
          remove.setAttribute("aria-label", `Delete ${art.title}`);
          remove.addEventListener("click", async () => {
            if (!window.confirm(`ลบผลงาน “${art.title}” ใช่ไหมคะ?`)) return;
            const removed = artworks.splice(index, 1)[0];
            if (!(await remember())) {
              artworks.splice(index, 0, removed);
              query(".save-result").textContent =
                "ลบไม่สำเร็จ กรุณาลองอีกครั้งค่ะ";
              return;
            }
            if (editingWork === index) query(".cancel-work-edit").click();
            else if (editingWork > index) editingWork--;
            category = "All";
            drawGallery();
            drawLatest();
            drawWorkLibrary();
            query(".save-result").textContent = "ลบผลงานแล้วค่ะ";
          });
          const replace = document.createElement("button");
          replace.type = "button";
          replace.textContent = "Change media";
          replace.className = "cursor-interaction";
          replace.setAttribute("aria-label", `Change media ${art.title}`);
          replace.addEventListener("click", async () => {
            edit.click();
            query(".upload input[type=file]").click();
          });
          row.append(title, edit, replace, remove);
          target.append(row);
        });
      if (pageCount > 1) {
        const pages = document.createElement("nav");
        pages.className = "work-library-pages row";
        pages.setAttribute("aria-label", "Artwork pages");
        for (let page = 1; page <= pageCount; page++) {
          const button = document.createElement("button");
          button.type = "button";
          button.textContent = String(page);
          button.className = "cursor-interaction";
          button.setAttribute("aria-label", `Artwork page ${page}`);
          button.setAttribute(
            "aria-current",
            page === workLibraryPage ? "page" : "false",
          );
          button.setAttribute("aria-pressed", String(page === workLibraryPage));
          button.addEventListener("click", async () => {
            workLibraryPage = page;
            drawWorkLibrary();
          });
          pages.append(button);
        }
        target.append(pages);
      }
    }

    function setShowcaseBusy(busy) {
      showcaseSaving = busy;
      query(".showcase-sort-dialog")
        .querySelectorAll("button")
        .forEach((button) => (button.disabled = busy));
      if (!busy && showcaseDraft) drawShowcaseDraft();
    }
    function closeShowcaseSort() {
      if (showcaseSaving) return;
      query(".showcase-sort-dialog").close();
      showcaseDraft = null;
      showcaseSource = null;
      showcaseDragIndex = null;
    }
    function moveShowcaseDraft(from, to) {
      if (
        showcaseSaving ||
        !showcaseDraft ||
        from < 0 ||
        to < 0 ||
        from >= showcaseDraft.length ||
        to >= showcaseDraft.length ||
        from === to
      )
        return;
      const [entry] = showcaseDraft.splice(from, 1);
      showcaseDraft.splice(to, 0, entry);
      drawShowcaseDraft();
    }
    function drawShowcaseDraft() {
      const list = query(".showcase-sort-list");
      list.replaceChildren();
      if (!showcaseDraft?.length) {
        const empty = document.createElement("p");
        empty.className = "small";
        empty.textContent = "ยังไม่มีผลงานให้จัดลำดับ";
        list.append(empty);
        return;
      }
      showcaseDraft.forEach((entry, index) => {
        const row = document.createElement("div");
        row.className = "showcase-sort-row";
        row.dataset.showcaseIndex = index;
        const handle = document.createElement("button");
        handle.type = "button";
        handle.className = "showcase-drag-handle";
        handle.textContent = "☰";
        handle.draggable = true;
        handle.setAttribute("aria-label", `ลากจัดลำดับ ${entry.art.title}`);
        handle.addEventListener("dragstart", (event) => {
          if (showcaseSaving) {
            event.preventDefault();
            return;
          }
          showcaseDragIndex = index;
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", String(index));
          row.classList.add("is-dragging");
        });
        handle.addEventListener("dragend", () => {
          showcaseDragIndex = null;
          row.classList.remove("is-dragging");
        });
        row.addEventListener("dragover", (event) => {
          if (showcaseDragIndex === null || showcaseSaving) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
          row.classList.add("is-drop-target");
        });
        row.addEventListener("dragleave", () =>
          row.classList.remove("is-drop-target"),
        );
        row.addEventListener("drop", (event) => {
          event.preventDefault();
          row.classList.remove("is-drop-target");
          if (showcaseDragIndex !== null)
            moveShowcaseDraft(showcaseDragIndex, index);
          showcaseDragIndex = null;
        });
        const order = document.createElement("span");
        order.className = "showcase-sort-number";
        order.textContent = String(index + 1);
        const thumb = document.createElement("div");
        thumb.className = "showcase-sort-thumb";
        const media = makeMedia(entry.art.image, "");
        media.draggable = false;
        if (media.tagName === "VIDEO") media.controls = false;
        applyCrop(media, entry.art.crop);
        thumb.append(media);
        const title = document.createElement("span");
        title.className = "showcase-sort-name";
        title.textContent = entry.art.title;
        title.title = entry.art.title;
        const state = document.createElement("span");
        state.className = "showcase-sort-state small";
        state.textContent = index < 10 ? "Showcase" : "";
        const up = document.createElement("button");
        up.type = "button";
        up.className = "cursor-interaction showcase-move";
        up.textContent = "↑";
        up.disabled = index === 0;
        up.setAttribute("aria-label", `เลื่อน ${entry.art.title} ขึ้น`);
        up.addEventListener("click", () => {
          moveShowcaseDraft(index, index - 1);
          query(".showcase-sort-list")
            .children[index - 1]?.querySelector(".showcase-move")
            ?.focus();
        });
        const down = document.createElement("button");
        down.type = "button";
        down.className = "cursor-interaction showcase-move";
        down.textContent = "↓";
        down.disabled = index === showcaseDraft.length - 1;
        down.setAttribute("aria-label", `เลื่อน ${entry.art.title} ลง`);
        down.addEventListener("click", () => {
          moveShowcaseDraft(index, index + 1);
          query(".showcase-sort-list")
            .children[index + 1]?.querySelector(".showcase-move")
            ?.focus();
        });
        row.append(handle, order, thumb, title, state, up, down);
        list.append(row);
      });
    }
    function openShowcaseSort() {
      showcaseSource = artworks;
      showcaseDraftVersion = showcaseCloudVersion;
      showcaseDraft = orderedArtworkEntries(artworks);
      showcaseDragIndex = null;
      query(".showcase-sort-result").textContent = "";
      drawShowcaseDraft();
      query(".showcase-sort-dialog").showModal();
    }
    async function saveShowcaseOrder() {
      if (showcaseSaving || !showcaseDraft) return;
      if (
        showcaseSource !== artworks ||
        showcaseDraftVersion !== showcaseCloudVersion
      ) {
        query(".showcase-sort-result").textContent =
          "ข้อมูลเปลี่ยนระหว่างจัดลำดับ กรุณาปิดแล้วกด Sort ใหม่ค่ะ";
        return;
      }
      const original = artworks;
      const ranks = new Map(
        showcaseDraft.map((entry, index) => [entry.art, index]),
      );
      const planned = original.map((art) =>
        ranks.has(art) ? { ...art, showcaseOrder: ranks.get(art) } : art,
      );
      artworks = planned;
      setShowcaseBusy(true);
      query(".showcase-sort-result").textContent = "กำลังบันทึกลำดับ…";
      try {
        const ok = await remember();
        if (!ok) {
          if (artworks === planned) artworks = original;
          query(".showcase-sort-result").textContent =
            cloudError || "บันทึกลำดับไม่สำเร็จ กรุณาลองอีกครั้งค่ะ";
          return;
        }
        workLibraryPage = 1;
        drawLatest();
        drawWorkLibrary();
        setShowcaseBusy(false);
        closeShowcaseSort();
        query(".save-result").textContent =
          "บันทึกลำดับ Showcase และเผยแพร่แล้วค่ะ";
      } catch (error) {
        if (artworks === planned) artworks = original;
        query(".showcase-sort-result").textContent =
          "บันทึกลำดับไม่สำเร็จ กรุณาลองอีกครั้งค่ะ";
      } finally {
        setShowcaseBusy(false);
      }
    }
    query(".sort-showcase").addEventListener("click", openShowcaseSort);
    query(".showcase-sort-save").addEventListener("click", saveShowcaseOrder);
    query(".showcase-sort-cancel").addEventListener("click", closeShowcaseSort);
    query(".showcase-sort-close").addEventListener("click", closeShowcaseSort);
    query(".showcase-sort-dialog").addEventListener("cancel", (event) => {
      if (showcaseSaving) event.preventDefault();
    });
    query(".showcase-sort-dialog").addEventListener("close", () => {
      if (!showcaseSaving) {
        showcaseDraft = null;
        showcaseSource = null;
        showcaseDragIndex = null;
      }
    });

    query(".cancel-work-edit").addEventListener("click", async () => {
      editingWork = -1;
      workPanelHome.after(query(".work-upload-panel"));
      query(".save").textContent = "บันทึกตัวอย่าง";
      query(".cancel-work-edit").hidden = true;
      query(".work-title").value = "";
      query(".work-crop-editor").hidden = true;
      query(".upload img,.upload video").hidden = true;
      query(".upload input").value = "";
    });
    query(".save").addEventListener("click", async () => {
      const title = query(".work-title").value.trim();
      const tag = query(".work-category").value;
      const preview = query(".upload img,.upload video");
      if (!title || !tag || preview.hidden || !preview.getAttribute("src")) {
        query(".save-result").textContent = !title
          ? "ใส่ชื่อผลงานก่อนค่ะ"
          : !tag
            ? "เลือก Tag สเกลก่อนค่ะ"
            : "เลือกภาพหรือวิดีโอก่อนค่ะ";
        return;
      }
      if (!query(".publish").checked) {
        query(".save-result").textContent =
          "ติ๊กแสดงในหน้าลูกค้าเพื่อเผยแพร่ผลงานค่ะ";
        return;
      }
      const item = {
        title,
        typeId: workType,
        scale: tag,
        finish: query(".work-finish").value,
        tags: [tag, query(".work-finish").value],
        image: preview.src,
        crop: { ...workCrop },
        uploadedAt:
          editingWork >= 0 ? artworks[editingWork].uploadedAt || 0 : Date.now(),
      };
      const previous = editingWork >= 0 ? artworks[editingWork] : null;
      if (showcaseRank(previous) !== Infinity)
        item.showcaseOrder = previous.showcaseOrder;
      if (previous && previous.image !== item.image)
        item.uploadedAt = Date.now();
      if (editingWork >= 0) artworks[editingWork] = item;
      else artworks.unshift(item);
      if (!(await remember())) {
        if (editingWork >= 0) artworks[editingWork] = previous;
        else artworks.shift();
        query(".save-result").textContent =
          cloudError || "บันทึก Firebase ไม่สำเร็จ กรุณาลองอีกครั้งค่ะ";
        return;
      }
      category = "All";
      drawGallery();
      drawLatest();
      drawWorkLibrary();
      editingWork = -1;
      workPanelHome.after(query(".work-upload-panel"));
      query(".save").textContent = "บันทึกตัวอย่าง";
      query(".cancel-work-edit").hidden = true;
      query(".save-result").textContent =
        "บันทึกแล้ว ผลงานแสดงในShowcaseและ Overview ค่ะ";
    });

    function adminUnlocked() {
      return Boolean(window.AkaneAuth?.isOwner(window.AkaneAuth.user));
    }
    function showAdminLogin() {
      if (root.dataset.admin === "true") window.AkaneAuth?.show();
      else window.open("admin.html", "_blank", "noopener");
    }

    query(".admin-entry").addEventListener("click", showAdminLogin);
    function appearance() {
      surface.dataset.animation = look.animation;
      surface
        .querySelectorAll("[data-effect]")
        .forEach((button) =>
          button.setAttribute(
            "aria-pressed",
            String(button.dataset.effect === look.animation),
          ),
        );
      query(".sparkles")
        .querySelectorAll("span")
        .forEach((span, i) => {
          span.textContent =
            look.animation === "petals"
              ? "❀"
              : look.animation === "dots"
                ? "•"
                : i % 3
                  ? "✧"
                  : "✦";
        });
      query(".calculator").style.borderRadius = look.radius + "px";
      query(".sparkles").style.display =
        look.motion && look.animation !== "none" ? "" : "none";
      const admin = look.view === "admin";
      const locked = admin && !adminUnlocked();
      query(".admin-entry").hidden = admin;
      query(".admin-preview").hidden = !admin || locked;
      query(".offers-admin").hidden = !admin || locked;
      query(".backup-admin").hidden = !admin || locked;
      query(".content-grid").hidden = admin;
      query(".footer").hidden = admin;
      query(".hero").hidden = admin || !query(".calculator").hidden;
      query("header nav").hidden = admin;
      query(".contact-top").hidden = admin;
    }
    window.addEventListener("akane:auth", () => {
      appearance();
      window.AkaneVisual?.admin(surface);
    });
    surface.akaneTypeEditor = {
      get(requestedKey) {
        const key =
          (requestedKey && scales[requestedKey] ? requestedKey : null) ||
          (workType === "full"
            ? "Character"
            : workType === "chibi"
              ? "Chibi"
              : workType);
        return {
          key,
          types: Object.keys(scales).map((id) => ({
            id,
            name: typeNames[id] || id,
          })),
          name: typeNames[key] || key,
          scales: scales[key],
          finishes: finishes[key],
          allScales: galleryScales,
          allFinishes: galleryFinishes,
        };
      },
      async update(kind, labels, removed, typeKey) {
        if (
          !labels.length ||
          labels.some((v) => !v.trim()) ||
          new Set(labels.map((v) => v.toLowerCase())).size !== labels.length
        )
          throw new Error("ต้องมีอย่างน้อย 1 รายการ และชื่อไม่ซ้ำ");
        const key = this.get(typeKey).key;
        const oldScales = [...scales[key]],
          oldFinishes = [...finishes[key]],
          oldPrices = prices[key].map((row) => [...row]);
        const newScales = kind === "scales" ? labels : oldScales,
          newFinishes = kind === "finishes" ? labels : oldFinishes;
        scales[key] = [...newScales];
        finishes[key] = [...newFinishes];
        prices[key] = newScales.map((scale) =>
          newFinishes.map(
            (finish) =>
              oldPrices[oldScales.indexOf(scale)]?.[
                oldFinishes.indexOf(finish)
              ] ?? 0,
          ),
        );
        const choices = kind === "scales" ? galleryScales : galleryFinishes;
        const oldChoices = [...choices];
        if (removed)
          choices.splice(
            0,
            choices.length,
            ...choices.filter((v) => v !== removed),
          );
        labels.forEach((v) => {
          if (!choices.includes(v)) choices.push(v);
        });
        if (!(await remember())) {
          scales[key] = oldScales;
          finishes[key] = oldFinishes;
          prices[key] = oldPrices;
          choices.splice(0, choices.length, ...oldChoices);
          throw new Error(cloudError);
        }
        drawPriceSettings();
        drawTaxonomy();
        render();
      },
    };
    queueMicrotask(() => window.AkaneVisual?.admin(surface));
    render();
    drawTaxonomy();
    drawGallery();
    drawLatest();
    drawWorkLibrary();
    appearance();
    query(".cloud-status").textContent =
      cloudError || "เชื่อมต่อ Firebase แล้วค่ะ";
    if (root.dataset.admin === "true" && !adminUnlocked()) showAdminLogin();
  });
  const loadStatus = document.getElementById("initial-load-status");
  loadStatus.textContent = "กำลังโหลดผลงานและข้อมูลคอมมิชชั่น…";
  // Show the interface before Firebase downloads the artwork files.
  await new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve)),
  );

  try {
    if (!window.AkaneCloud) {
      // Wait only for the data connector, not all page images.
      await new Promise((resolve, reject) => {
        const script = document.querySelector(
          'script[src^="commission-cloud.js"]',
        );
        if (!script) return reject(new Error("ไม่พบตัวเชื่อมต่อข้อมูล"));
        script.addEventListener("load", resolve, { once: true });
        script.addEventListener(
          "error",
          () => reject(new Error("โหลดตัวเชื่อมต่อข้อมูลไม่สำเร็จ")),
          { once: true },
        );
      });
    }
    if (!window.AkaneCloud)
      throw new Error("โหลดการเชื่อมต่อไม่สำเร็จ กรุณารีเฟรชหน้า");
    let data = await window.AkaneCloud.load();
    if (!data) {
      const response = await fetch("site-data.json", {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");
      data = await response.json();
    }
    root
      .querySelectorAll(".ak")
      .forEach((surface) => surface._applyCloud?.(data));
    cloudReady = true;
    loadStatus.hidden = true;
    window.AkaneCloud.subscribe(
      (data) => {
        root
          .querySelectorAll(".ak")
          .forEach((surface) => surface._applyCloud?.(data));
      },
      (message) => {
        root
          .querySelectorAll(".cloud-status")
          .forEach((status) => (status.textContent = message));
      },
    );
  } catch (error) {
    loadStatus.textContent =
      window.AkaneCloud?.errorMessage(error) || error.message;
    loadStatus.setAttribute("role", "alert");
  }

  window.addEventListener("openai:set_globals", async (event) => {
    const incoming = event.detail?.globals?.widgetState?.modelContent;
    if (incoming?.language) {
      language = incoming.language === "en" ? "en" : "th";
      root.querySelectorAll(".ak").forEach(translate);
    }
  });
})();
