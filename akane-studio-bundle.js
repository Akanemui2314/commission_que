(() => {
  // embed-resolver.js?v=embed-20261005
  function resolveEmbed(input, mode = "embed") {
    let raw = String(input || "").trim();
    if (!raw) return { kind: "empty", message: "Paste a link or iframe embed code" };
    if (raw.startsWith("<")) {
      const match = raw.match(/<iframe\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/i);
      if (!match) return { kind: "invalid", message: "Use a URL or iframe embed code" };
      raw = match[1].replace(/&amp;/g, "&");
    }
    let url;
    try {
      url = new URL(raw);
    } catch {
      return { kind: "invalid", message: "Enter a complete https:// URL" };
    }
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password)
      return { kind: "invalid", message: "Only public HTTP or HTTPS links are supported" };
    const source = url.href, host = url.hostname.toLowerCase().replace(/^www\./, "");
    const result = (kind, src = source, provider = host) => ({ kind, src, source, provider });
    if (mode === "bookmark") return result("bookmark");
    if (/\.(gif|png|jpe?g|webp|avif|svg|apng)$/i.test(url.pathname)) return result("image");
    if (/\.(mp4|webm|mov)$/i.test(url.pathname)) return result("video");
    if (/\.(mp3|wav|ogg|m4a)$/i.test(url.pathname)) return result("audio");
    if (host === "youtu.be" || ["youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(host)) {
      const id = host === "youtu.be" ? url.pathname.split("/")[1] : url.searchParams.get("v") || url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1];
      if (!/^[\w-]{11}$/.test(id || ""))
        return { ...result("bookmark"), message: "Use a link to a YouTube video" };
      return result("iframe", "https://www.youtube-nocookie.com/embed/" + id, "YouTube");
    }
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const id = url.pathname.match(/\/(\d+)(?:\/|$)/)?.[1];
      if (id) return result("iframe", "https://player.vimeo.com/video/" + id, "Vimeo");
    }
    if (host === "facebook.com" || host === "m.facebook.com") {
      if (url.pathname.startsWith("/plugins/")) return result("iframe", source, "Facebook");
      if (/^\/share\//.test(url.pathname))
        return {
          ...result("bookmark", source, "Facebook"),
          message: "Facebook share links cannot be reliably embedded. Paste the original public post URL or Facebook iframe code."
        };
      const video = /\/(videos|reel)\//.test(url.pathname) || url.pathname === "/watch/";
      if (video || /\/posts\/|permalink\.php|photo(?:\.php|\/)/.test(url.pathname))
        return result(
          "iframe",
          "https://www.facebook.com/plugins/" + (video ? "video" : "post") + ".php?href=" + encodeURIComponent(source) + "&show_text=true&width=500",
          "Facebook"
        );
      return {
        ...result("bookmark", source, "Facebook"),
        message: "Paste a public post URL to embed this Facebook content"
      };
    }
    if (host === "giphy.com") {
      if (/^\/embed\/[\w-]+/.test(url.pathname)) return result("iframe", source, "GIPHY");
      const id = url.pathname.match(/\/(?:gifs|clips)\/(?:[^/]*-)?([a-zA-Z0-9]+)$/)?.[1];
      if (id) return result("iframe", "https://giphy.com/embed/" + id, "GIPHY");
    }
    if (host === "drive.google.com") {
      const id = url.pathname.match(/\/file\/d\/([^/]+)/)?.[1];
      if (id)
        return result(
          "iframe",
          "https://drive.google.com/file/d/" + encodeURIComponent(id) + "/preview",
          "Google Drive"
        );
    }
    if (host === "docs.google.com") {
      const match = url.pathname.match(/^\/(document|spreadsheets|presentation)\/d\/([^/]+)/);
      if (match && !url.pathname.includes("/pub"))
        return result(
          "iframe",
          "https://docs.google.com/" + match[1] + "/d/" + match[2] + "/" + (match[1] === "presentation" ? "embed" : "preview"),
          "Google Docs"
        );
    }
    if (host === "open.spotify.com")
      return result(
        "iframe",
        source.replace("open.spotify.com/", "open.spotify.com/embed/").replace("/embed/embed/", "/embed/"),
        "Spotify"
      );
    if (host === "loom.com") return result("iframe", source.replace("/share/", "/embed/"), "Loom");
    if (host === "codepen.io" && url.pathname.includes("/pen/"))
      return result("iframe", source.replace("/pen/", "/embed/"), "CodePen");
    if (["x.com", "twitter.com", "instagram.com", "tiktok.com"].includes(host))
      return {
        ...result("bookmark"),
        message: "Use provider iframe code when available, or open the original post"
      };
    return result("iframe");
  }

  // element-library.js?v=embed-20261005
  function safeLink(value) {
    if (typeof value !== "string" || !value.trim()) return null;
    try {
      const url = new URL(value, location.href);
      return ["https:", "http:", "mailto:", "tel:"].includes(url.protocol) ? url.href : null;
    } catch {
      return null;
    }
  }
  function renderExtra(card, block, { el: el2, button: button2, mediaSource: mediaSource2 }) {
    if (block.kind === "calculator") {
      const slot = el2("div", "akane-calculator-slot");
      slot.append(
        el2("h3", "", "Calculator"),
        el2("p", "", "Type / \u0E2A\u0E40\u0E01\u0E25 / \u0E01\u0E32\u0E23\u0E25\u0E07\u0E2A\u0E35 / \u0E23\u0E32\u0E04\u0E32 \u0E40\u0E0A\u0E37\u0E48\u0E2D\u0E21\u0E01\u0E31\u0E1A Price settings")
      );
      card.append(slot);
    }
    if (block.kind === "pricetable") {
      const data = window.AkanePageData || {}, type = block.type || Object.keys(data.scales || {})[0];
      const wrap = el2("div", "rate-table-wrap"), table = el2("table"), head = el2("thead"), tr = el2("tr"), body = el2("tbody");
      tr.append(el2("th", "", "Scale"));
      for (const finish of data.finishes?.[type] || []) tr.append(el2("th", "", finish));
      head.append(tr);
      table.append(head);
      (data.scales?.[type] || []).forEach((scale, i) => {
        const row = el2("tr");
        row.append(el2("th", "", scale));
        (data.finishes?.[type] || []).forEach(
          (_, j) => row.append(
            el2("td", "", Number(data.pricing?.[type]?.[i]?.[j] || 0).toLocaleString() + " \u0E3F")
          )
        );
        body.append(row);
      });
      table.append(body);
      wrap.append(el2("h3", "", data.typeNames?.[type] || type), table);
      card.append(wrap);
    }
    if (block.kind === "list") {
      const list = el2(block.ordered ? "ol" : "ul", "rate-list");
      for (const text of (block.text || "").split("\n")) list.append(el2("li", "", text));
      card.append(list);
    }
    if (["buttons", "links", "icons"].includes(block.kind)) {
      const row = el2("div", "rate-link-group " + block.kind);
      for (const item of block.items || []) {
        const link = el2("a", block.kind === "buttons" ? "rate-link-bubble" : "", item.label);
        const url = safeLink(item.url);
        if (url) {
          link.href = url;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
        } else link.title = "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E15\u0E31\u0E49\u0E07\u0E04\u0E48\u0E32\u0E25\u0E34\u0E07\u0E01\u0E4C";
        row.append(link);
      }
      card.append(row);
    }
    if (block.kind === "divider") {
      const wrap = el2("div", "rate-divider");
      wrap.style.paddingBlock = (Number(block.space) || 24) + "px";
      const hr = el2("hr");
      hr.style.borderColor = block.color || "#ffb7c5";
      wrap.append(hr);
      card.append(wrap);
    }
    if (block.kind === "audio") {
      const wrap = el2("div", "rate-audio");
      wrap.append(el2("p", "", block.title || "\u0E40\u0E2A\u0E35\u0E22\u0E07"));
      const audio = el2("audio");
      audio.controls = true;
      audio.preload = "none";
      if (block.mediaId) mediaSource2(block.mediaId).then((src) => audio.src = src);
      else if (/^data:audio\//.test(block.url || "")) audio.src = block.url;
      else if (safeLink(block.url)) audio.src = safeLink(block.url);
      wrap.append(audio);
      card.append(wrap);
    }
    if (block.kind === "timer") {
      const wrap = el2("div", "rate-timer");
      wrap.append(el2("strong", "", block.text || "\u0E40\u0E2B\u0E25\u0E37\u0E2D\u0E40\u0E27\u0E25\u0E32"));
      const output = el2("p");
      const update = () => {
        const end = Date.parse(block.deadline);
        if (!Number.isFinite(end)) {
          output.textContent = "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E27\u0E31\u0E19\u0E41\u0E25\u0E30\u0E40\u0E27\u0E25\u0E32\u0E17\u0E35\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E32\u0E23";
          return;
        }
        const seconds = Math.max(0, Math.floor((end - Date.now()) / 1e3));
        output.textContent = seconds === 0 ? "\u0E04\u0E23\u0E1A\u0E01\u0E33\u0E2B\u0E19\u0E14\u0E41\u0E25\u0E49\u0E27" : `${Math.floor(seconds / 86400)} \u0E27\u0E31\u0E19 ${Math.floor(seconds / 3600) % 24} \u0E0A\u0E31\u0E48\u0E27\u0E42\u0E21\u0E07 ${Math.floor(seconds / 60) % 60} \u0E19\u0E32\u0E17\u0E35 ${seconds % 60} \u0E27\u0E34\u0E19\u0E32\u0E17\u0E35`;
      };
      update();
      wrap.append(output);
      card.append(wrap);
      const clock = setInterval(() => {
        if (!wrap.isConnected) {
          clearInterval(clock);
          return;
        }
        update();
      }, 1e3);
    }
    if (["embed", "widget"].includes(block.kind)) {
      const wrap = el2("div", "rate-embed"), info = resolveEmbed(block.url, block.embedMode);
      const height = Math.max(100, Math.min(1200, Number(block.height) || 320));
      if (["image", "video", "audio"].includes(info.kind)) {
        const media = el2(info.kind === "image" ? "img" : info.kind);
        media.src = info.src;
        if (info.kind === "image") {
          media.alt = block.caption || "Embedded image";
          media.loading = "lazy";
        } else {
          media.controls = true;
          media.preload = "metadata";
        }
        media.onerror = () => {
          media.hidden = true;
          wrap.prepend(el2("p", "", "Media unavailable. Open the original link below."));
        };
        wrap.append(media);
      } else if (info.kind === "iframe") {
        const frame = el2("iframe");
        frame.src = info.src;
        frame.title = block.caption || info.provider + " embed";
        frame.loading = "lazy";
        frame.height = height;
        frame.setAttribute(
          "sandbox",
          "allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
        );
        frame.allow = "fullscreen; picture-in-picture; encrypted-media";
        frame.referrerPolicy = "strict-origin-when-cross-origin";
        wrap.append(frame);
      }
      if (info.message) wrap.append(el2("p", "rate-embed-note", info.message));
      if (info.source) {
        const link = el2(
          "a",
          "rate-embed-source",
          info.kind === "bookmark" ? "\u2197 " + (block.caption || info.provider) : "Open original \u2197"
        );
        link.href = info.source;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        wrap.append(link);
      }
      card.append(wrap);
    }
    if (block.kind === "form") {
      const form = el2("form", "rate-contact-form");
      form.append(el2("h3", "", block.label || "\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D\u0E40\u0E23\u0E32"));
      for (const name of block.fields || []) {
        const label = el2("label", "", name), input = el2(name === "\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21" ? "textarea" : "input");
        input.name = name;
        input.required = true;
        if (name === "\u0E2D\u0E35\u0E40\u0E21\u0E25") input.type = "email";
        label.append(input);
        form.append(label);
      }
      const submit = el2("button", "", "\u0E2A\u0E48\u0E07\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21");
      submit.type = "submit";
      form.append(submit);
      const message = el2("p");
      message.setAttribute("role", "status");
      form.append(message);
      form.onsubmit = (event) => {
        event.preventDefault();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(block.email || "")) {
          message.textContent = "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E15\u0E31\u0E49\u0E07\u0E04\u0E48\u0E32\u0E2D\u0E35\u0E40\u0E21\u0E25\u0E1C\u0E39\u0E49\u0E23\u0E31\u0E1A\u0E01\u0E48\u0E2D\u0E19";
          return;
        }
        const body = Array.from(new FormData(form), ([name, value]) => name + ": " + value).join(
          "\n"
        );
        location.href = "mailto:" + encodeURIComponent(block.email) + "?subject=" + encodeURIComponent(block.label || "\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D") + "&body=" + encodeURIComponent(body);
        message.textContent = "\u0E40\u0E1B\u0E34\u0E14\u0E41\u0E2D\u0E1B\u0E2D\u0E35\u0E40\u0E21\u0E25\u0E41\u0E25\u0E49\u0E27 \u0E42\u0E1B\u0E23\u0E14\u0E15\u0E23\u0E27\u0E08\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E41\u0E25\u0E30\u0E01\u0E14\u0E2A\u0E48\u0E07";
      };
      card.append(form);
    }
    if (block.kind === "container") {
      const wrap = el2("div", "rate-container");
      wrap.style.setProperty(
        "--container-columns",
        Math.max(1, Math.min(4, Number(block.columns) || 2))
      );
      for (const item of block.items || []) wrap.append(el2("p", "rate-paragraph", item.text));
      card.append(wrap);
    }
    if (block.kind === "control") {
      const wrap = el2("div", "rate-control");
      const link = el2("a", "rate-link-bubble", block.label || "\u0E44\u0E1B\u0E22\u0E31\u0E07 Section");
      link.href = "#section-" + encodeURIComponent(block.target || "");
      wrap.append(link);
      card.append(wrap);
    }
  }

  // rate-core.js?v=akane-studio-1
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== void 0) node.textContent = text;
    return node;
  }
  function button(text, action, label = text) {
    const node = el("button", "", text);
    node.type = "button";
    node.setAttribute("aria-label", label);
    node.onclick = action;
    return node;
  }
  function render(target, model, pages = {}, repaint = null) {
    target.replaceChildren();
    target.append(el("h1", "rate-page-title", model.title || "Price rate"));
    for (const section of model.sections) {
      const card = el("section", "rate-public-card");
      card.dataset.sectionId = section.id;
      card.id = "section-" + section.id;
      card.append(el("h2", "", section.name));
      for (const block of section.blocks) {
        const childStart = card.children.length;
        if (block.kind === "text") {
          const paragraph = el("p", "rate-paragraph", block.text);
          paragraph.style.textAlign = ["left", "center", "right"].includes(block.align) ? block.align : "left";
          card.append(paragraph);
        }
        if (block.kind === "table") {
          const wrap = el("div", "rate-table-wrap"), table = el("table"), head = el("thead"), heading = el("tr");
          for (const text of block.headers) heading.append(el("th", "", text));
          head.append(heading);
          table.append(head);
          const body = el("tbody");
          for (const cells of block.rows) {
            const row = el("tr");
            for (const cell of cells)
              row.append(el("td", "", typeof cell === "string" ? cell : cell.text));
            body.append(row);
          }
          table.append(body);
          wrap.append(table);
          card.append(wrap);
        }
        if (["gallery", "video", "slideshow"].includes(block.kind)) {
          const perPage = Math.max(1, Math.min(6, Number(block.perPage) || 3));
          const images = block.images || [], count = Math.max(1, Math.ceil(images.length / perPage));
          pages[block.id] = Math.max(1, Math.min(count, pages[block.id] || 1));
          if (count > 1) {
            const nav = el("nav", "rate-gallery-nav");
            nav.setAttribute("aria-label", "\u0E2B\u0E19\u0E49\u0E32\u0E20\u0E32\u0E1E " + section.name);
            const prev = button(
              "\u2039",
              () => {
                pages[block.id]--;
                (repaint || (() => render(target, model, pages)))();
              },
              "\u0E20\u0E32\u0E1E\u0E01\u0E48\u0E2D\u0E19\u0E2B\u0E19\u0E49\u0E32"
            );
            const next = button(
              "\u203A",
              () => {
                pages[block.id]++;
                (repaint || (() => render(target, model, pages)))();
              },
              "\u0E20\u0E32\u0E1E\u0E16\u0E31\u0E14\u0E44\u0E1B"
            );
            prev.disabled = pages[block.id] === 1;
            next.disabled = pages[block.id] === count;
            nav.append(prev, el("span", "", `${pages[block.id]} / ${count}`), next);
            card.append(nav);
          }
          const gallery = el("div", "rate-gallery-grid");
          gallery.classList.toggle("rate-media-natural", block.fit === "natural");
          gallery.classList.toggle("rate-media-full", block.fullWidth === true);
          if (!images.length) gallery.append(el("p", "", "\u0E04\u0E25\u0E34\u0E01\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E20\u0E32\u0E1E"));
          gallery.style.setProperty("--rate-columns", perPage);
          for (const item of images.slice(
            (pages[block.id] - 1) * perPage,
            pages[block.id] * perPage
          )) {
            const figure = el("figure"), image = el(item.type === "video" ? "video" : "img");
            if (item.type === "video") {
              image.controls = true;
              image.preload = "metadata";
              image.playsInline = true;
              image.setAttribute("aria-label", item.alt || "\u0E27\u0E34\u0E14\u0E35\u0E42\u0E2D");
              if (item.poster) image.poster = item.poster;
            } else {
              image.alt = item.alt || section.name;
              image.loading = "lazy";
              image.decoding = "async";
            }
            if (item.mediaId)
              mediaSource(item.mediaId).then((src) => {
                if (image.isConnected) image.src = src;
              }).catch(() => {
                figure.append(el("p", "", "\u0E42\u0E2B\u0E25\u0E14\u0E44\u0E1F\u0E25\u0E4C\u0E44\u0E21\u0E48\u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E44\u0E1F\u0E25\u0E4C\u0E43\u0E2B\u0E21\u0E48"));
              });
            else image.src = item.src;
            image.style.objectFit = block.fit === "contain" ? "contain" : "cover";
            image.style.objectPosition = block.position || "center";
            figure.dataset.imageIndex = images.indexOf(item);
            figure.dataset.mediaPosition = block.position || "center";
            figure.append(image);
            gallery.append(figure);
          }
          card.append(gallery);
        }
        renderExtra(card, block, { el, button, mediaSource });
        for (const child of [...card.children].slice(childStart)) {
          child.dataset.blockId = block.id;
          if (block.kind !== "gallery") {
            child.style.textAlign = block.align || "left";
          }
          if (block.fontSize) child.style.fontSize = block.fontSize + "px";
        }
      }
      target.append(card);
    }
  }
  var mediaUrls = /* @__PURE__ */ new Map();
  function mediaDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("akane-prototype-media", 1);
      request.onupgradeneeded = () => request.result.createObjectStore("files");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async function mediaSource(id) {
    if (mediaUrls.has(id)) return mediaUrls.get(id);
    const promise = (async () => {
      const db = await mediaDB();
      try {
        const blob = await new Promise((resolve, reject) => {
          const request = db.transaction("files").objectStore("files").get(id);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        if (!blob) throw new Error("\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E44\u0E1F\u0E25\u0E4C");
        return URL.createObjectURL(blob);
      } finally {
        db.close();
      }
    })();
    mediaUrls.set(id, promise);
    return promise;
  }

  // rate-core.js?v=embed-20261005
  var DEFAULT_SECTIONS = [
    {
      id: "image04",
      name: "Scale",
      blocks: [
        {
          id: "image04",
          kind: "gallery",
          perPage: 1,
          images: [
            {
              src: "rate-images-image04.jpg?v=a29f2c23",
              alt: "Scale"
            }
          ],
          legacyGallery: "image04"
        }
      ]
    },
    {
      id: "text09",
      name: "Render color",
      blocks: [
        {
          id: "table01",
          kind: "table",
          headers: ["Scale", "Price"],
          rows: [
            [
              {
                text: "Bust-Up",
                legacyKey: "table01-0"
              },
              {
                text: "800 \u0E3F",
                legacyKey: "table01-1"
              }
            ],
            [
              {
                text: "Half-Body",
                legacyKey: "table01-2"
              },
              {
                text: "1100 \u0E3F",
                legacyKey: "table01-3"
              }
            ],
            [
              {
                text: "Full-Body",
                legacyKey: "table01-4"
              },
              {
                text: "1300 \u0E3F",
                legacyKey: "table01-5"
              }
            ]
          ]
        },
        {
          id: "list01",
          kind: "text",
          text: "\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23 +80%\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23\u0E41\u0E23\u0E01\nBG start +400\u0E3F (BG\u0E17\u0E35\u0E48\u0E21\u0E35\u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14\u0E40\u0E22\u0E2D\u0E30 / \u0E21\u0E35\u0E01\u0E32\u0E23\u0E43\u0E0A\u0E49perspective)\nsimple BG start 200\u0E3F (BG\u0E17\u0E35\u0E48\u0E21\u0E35\u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14\u0E19\u0E49\u0E2D\u0E22)\n\u0E44\u0E21\u0E48\u0E23\u0E31\u0E1A\u0E07\u0E32\u0E19\u0E40\u0E23\u0E48\u0E07 + \u0E42\u0E2D\u0E21\u0E32\u0E01\u0E32\u0E40\u0E2A\u0E30\npersonal use\u2705 / commercial use \u2705",
          legacyLines: ["list01-0", "list01-1", "list01-2", "list01-3", "list01-4"]
        },
        {
          id: "gallery01",
          kind: "gallery",
          perPage: 3,
          images: [
            {
              src: "rate-gallery01-3fa34d69.jpg?v=a29f2c23",
              alt: "Untitled"
            },
            {
              src: "rate-gallery01-45226038.jpg?v=a29f2c23",
              alt: "Untitled"
            },
            {
              src: "rate-gallery01-d7646b32.jpg?v=a29f2c23",
              alt: "Untitled"
            }
          ],
          legacyGallery: "gallery01"
        }
      ],
      legacyName: "text09"
    },
    {
      id: "text11",
      name: "Simple Color",
      blocks: [
        {
          id: "table02",
          kind: "table",
          headers: ["Scale", "Price"],
          rows: [
            [
              {
                text: "Bust-Up",
                legacyKey: "table02-0"
              },
              {
                text: "600 \u0E3F",
                legacyKey: "table02-1"
              }
            ],
            [
              {
                text: "Half-Body",
                legacyKey: "table02-2"
              },
              {
                text: "800 \u0E3F",
                legacyKey: "table02-3"
              }
            ],
            [
              {
                text: "Full-Body",
                legacyKey: "table02-4"
              },
              {
                text: "1000 \u0E3F",
                legacyKey: "table02-5"
              }
            ]
          ]
        },
        {
          id: "list02",
          kind: "text",
          text: "\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23 +80%\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23\u0E41\u0E23\u0E01\nBG start +350\u0E3F (BG\u0E17\u0E35\u0E48\u0E21\u0E35\u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14\u0E40\u0E22\u0E2D\u0E30 / \u0E21\u0E35\u0E01\u0E32\u0E23\u0E43\u0E0A\u0E49perspective)\nsimple BG start +100\u0E3F (BG\u0E17\u0E35\u0E48\u0E21\u0E35\u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14\u0E19\u0E49\u0E2D\u0E22)\n\u0E07\u0E32\u0E19\u0E40\u0E23\u0E48\u0E07 + \u0E42\u0E2D\u0E21\u0E32\u0E01\u0E32\u0E40\u0E2A\u0E30\u2705\n**personal use\u2705",
          legacyLines: ["list02-0", "list02-1", "list02-2", "list02-3", "list02-4"]
        },
        {
          id: "gallery02",
          kind: "gallery",
          perPage: 3,
          images: [
            {
              src: "rate-gallery02-2cf497fb.jpg?v=a29f2c23",
              alt: "Untitled"
            },
            {
              src: "rate-gallery02-2a17a2ad.jpg?v=a29f2c23",
              alt: "Untitled"
            },
            {
              src: "rate-gallery02-8550a781.jpg?v=a29f2c23",
              alt: "Untitled"
            }
          ],
          legacyGallery: "gallery02"
        }
      ],
      legacyName: "text11"
    },
    {
      id: "text13",
      name: "Simple Color",
      blocks: [
        {
          id: "table03",
          kind: "table",
          headers: ["Chibi A", "Chibi B"],
          rows: [
            [
              {
                text: "Half-Body - 200 \u0E3F",
                legacyKey: "table03-0"
              },
              {
                text: "Half-Body - 100 \u0E3F",
                legacyKey: "table03-1"
              }
            ],
            [
              {
                text: "Full-Body - 400 \u0E3F",
                legacyKey: "table03-2"
              },
              {
                text: "Full-Body - 300 \u0E3F",
                legacyKey: "table03-3"
              }
            ]
          ]
        },
        {
          id: "list03",
          kind: "text",
          text: "\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23 +80%\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23\u0E41\u0E23\u0E01\nBG start +100\u0E3F\n\u0E07\u0E32\u0E19\u0E40\u0E23\u0E48\u0E07 + \u0E42\u0E2D\u0E21\u0E32\u0E01\u0E32\u0E40\u0E2A\u0E30 \u2705\npersonal use\u2705",
          legacyLines: ["list03-0", "list03-1", "list03-2", "list03-3"]
        },
        {
          id: "gallery03",
          kind: "gallery",
          perPage: 3,
          images: [
            {
              src: "rate-gallery03-cc1529e4.png?v=a29f2c23",
              alt: "CHIBI A"
            }
          ],
          legacyGallery: "gallery03"
        },
        {
          id: "gallery04",
          kind: "gallery",
          perPage: 3,
          images: [
            {
              src: "rate-gallery04-d35dd296.png?v=a29f2c23",
              alt: "CHIBI B"
            }
          ],
          legacyGallery: "gallery04"
        }
      ],
      legacyName: "text13"
    }
  ];
  var clone = (value) => structuredClone(value);
  var uid = () => crypto.randomUUID();
  function normalize(site = {}) {
    const saved = site.priceRate || {};
    if ([3, 4].includes(saved.version) && Array.isArray(saved.sections)) {
      const model = clone(saved);
      if (model.version === 3)
        for (const section of model.sections)
          for (const block of section.blocks) {
            if (["gallery", "video", "slideshow"].includes(block.kind) && block.fit !== "natural")
              block.fit = "contain";
          }
      model.version = 4;
      return model;
    }
    const sections = clone(DEFAULT_SECTIONS).filter((section) => section.name !== "Scale");
    for (const section of sections) {
      if (saved.texts?.[section.legacyName] !== void 0)
        section.name = saved.texts[section.legacyName];
      for (const block of section.blocks) {
        if (block.kind === "gallery" && saved.galleries?.[block.legacyGallery])
          block.images = clone(saved.galleries[block.legacyGallery]);
        if (block.kind === "table")
          for (const row of block.rows)
            for (const cell of row) cell.text = saved.texts?.[cell.legacyKey] ?? cell.text;
        if (block.kind === "text")
          block.text = block.text.split("\n").map((line, i) => saved.texts?.[block.legacyLines[i]] ?? line).join("\n");
      }
    }
    for (const section of saved.sections || [])
      sections.push({
        id: section.id || uid(),
        name: section.name || "",
        blocks: [
          { id: uid(), kind: "text", text: section.description || "" },
          { id: uid(), kind: "gallery", perPage: 3, images: clone(section.images || []) }
        ]
      });
    for (const section of sections)
      for (const block of section.blocks) {
        if (block.kind === "gallery") block.fit = "contain";
      }
    return { version: 4, title: "Price rate", sections };
  }

  // tos-core.js?v=akane-studio-1
  function tosModel(site = {}) {
    const fallback = {
      version: 4,
      title: "TOS",
      sections: [
        {
          id: "tos-main",
          name: "",
          blocks: [
            {
              id: "tos-text",
              kind: "text",
              text: (site.terms || []).map((t) => [t.thTitle || t.enTitle, t.th || t.en].filter(Boolean).join("\n")).filter(Boolean).join("\n\n")
            }
          ]
        }
      ]
    };
    return normalize({ priceRate: site.tosContent || fallback });
  }

  // akane-studio.js
  var sheet = document.createElement("link");
  sheet.rel = "stylesheet";
  sheet.href = "rate-builder.css?v=akane-studio-1";
  document.head.append(sheet);
  var style = el("style");
  style.textContent = `.akane-choice-row{display:flex;align-items:center;justify-content:space-between;gap:8px}.akane-choice-row>label{flex:1;min-width:0}.akane-choice-row button{padding:6px 12px!important}.akane-choice-row .row{gap:6px}.akane-layout[hidden]{display:none!important}.akane-layout .calculator{margin:0!important;width:100%!important;box-sizing:border-box}.akane-layout .akane-calculator-slot{width:100%}.akane-layout .rate-public-card{margin:16px 0;background:#fffaf5;border-color:#ffb7c5}.akane-type-settings{margin-top:20px;padding:16px;border:1px solid #ffb7c5;border-radius:18px}.akane-type-settings fieldset{margin:14px 0}.akane-type-settings label{display:flex!important;align-items:center;gap:8px;margin:8px 0}.akane-type-settings input[type=checkbox]{width:18px!important;height:18px;accent-color:#ac4e68}.akane-type-settings .row{flex-wrap:wrap}.akane-custom-links{padding:22px;margin:20px 0;background:#fffaf5;border-radius:24px}.akane-custom-links a{display:inline-flex;padding:12px 20px;background:#ffa6ba;color:white;border-radius:999px;text-decoration:none;margin:6px}.akane-custom-links[hidden]{display:none!important}#akane-concepts .ak .tos-admin.tos-admin{display:none!important}.tos-content .rate-public-card{padding:12px 0;border:0;box-shadow:none}.tos-content .rate-page-title{display:none}.tos-language{display:none!important}@media(max-width:680px){.akane-layout .rate-public-card{padding:16px}.akane-type-settings{padding:12px}}`;
  style.textContent += "#akane-concepts .ak .tos-admin.tos-admin{display:none!important}";
  document.head.append(style);
  var layouts = /* @__PURE__ */ new WeakMap();
  function apply(surface, data) {
    window.AkanePageData = data;
    if (document.querySelector("#akane-concepts")?.dataset.admin === "true") {
      admin(surface);
      return;
    }
    if (!data?.calculatorContent) return;
    const calculator = surface.querySelector(".calculator");
    if (!calculator) return;
    let info = layouts.get(surface);
    if (!info) {
      const canvas = el("div", "akane-layout");
      calculator.before(canvas);
      info = {
        canvas,
        calculator,
        pages: {},
        title: calculator.querySelector("h2").textContent,
        notes: calculator.querySelector(".price-notes ul").innerHTML
      };
      layouts.set(surface, info);
      new MutationObserver(() => {
        canvas.hidden = calculator.hidden;
      }).observe(calculator, { attributes: true, attributeFilter: ["hidden"] });
    }
    const paint = () => {
      const anchor = el("div");
      info.calculator.replaceWith(anchor);
      render(info.canvas, data.calculatorContent, info.pages, paint);
      const slot = info.canvas.querySelector(".akane-calculator-slot");
      if (slot) {
        const config = data.calculatorContent.sections.flatMap((s) => s.blocks).find((b) => b.kind === "calculator");
        info.calculator.querySelector("h2").textContent = config?.title || info.title;
        info.calculator.querySelector(".price-notes ul").innerHTML = info.notes;
        if (config?.note) {
          const list = info.calculator.querySelector(".price-notes ul");
          list.replaceChildren(
            ...config.note.split("\n").filter(Boolean).map((text) => el("li", "", text))
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
    if (document.querySelector("#akane-concepts")?.dataset.admin !== "true") return;
    let links = surface.querySelector(".akane-custom-links");
    if (!links) {
      links = el("section", "akane-custom-links");
      links.append(el("h2", "", "Customize pages"));
      for (const [label, url] of [
        ["Customize Check Price", "price-rate-admin.html"],
        ["Customize TOS", "tos-admin.html"]
      ]) {
        const a = el("a", "", label + " \u2197");
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener";
        links.append(a);
      }
      surface.querySelector(".tos-admin").before(links);
      surface.querySelectorAll(".tos-editor,.save-tos,.tos-save-result").forEach((node) => node.hidden = true);
    }
    links.hidden = !window.AkaneAuth.isOwner(window.AkaneAuth.user);
    typeSettings(surface);
  }
  function typeSettings(surface) {
    if (document.querySelector("#akane-concepts")?.dataset.admin !== "true" || !surface.akaneTypeEditor)
      return;
    const api = surface.akaneTypeEditor, config = api.get();
    if (!config.scales || !config.finishes) return;
    let panel = surface.querySelector(".akane-type-settings");
    if (!panel) {
      panel = el("details", "akane-type-settings");
      surface.querySelector(".work-fields-column").append(panel);
    }
    const open = panel.open;
    panel.replaceChildren(el("summary", "", "Customize Scale / Color \xB7 " + config.name));
    panel.open = open;
    const status = el("p");
    status.setAttribute("role", "status");
    for (const [kind, label, all] of [
      ["scales", "\u0E2A\u0E40\u0E01\u0E25\u0E20\u0E32\u0E1E", config.allScales],
      ["finishes", "Customize Color Scale", config.allFinishes]
    ]) {
      const fieldset = el("fieldset");
      fieldset.append(el("legend", "", label));
      const selected = config[kind];
      for (const name of [.../* @__PURE__ */ new Set([...selected, ...all])]) {
        const row2 = el("label"), check = el("input");
        check.type = "checkbox";
        check.checked = selected.includes(name);
        check.setAttribute("aria-label", config.name + " " + label + " " + name);
        check.onchange = async () => {
          const choices = [...fieldset.querySelectorAll("input[type=checkbox]")].filter((i) => i.checked).map((i) => i.dataset.choice);
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
        row2.append(check, document.createTextNode(name));
        const controls = el("div", "row");
        const save = async (choices, removed) => {
          fieldset.disabled = true;
          status.textContent = "";
          try {
            await api.update(kind, choices, removed);
          } catch (e) {
            status.textContent = e.message;
          } finally {
            fieldset.disabled = false;
          }
        };
        const move = (offset) => {
          const choices = [...api.get()[kind]];
          const index = choices.indexOf(name), next = index + offset;
          if (index < 0 || next < 0 || next >= choices.length) return;
          [choices[index], choices[next]] = [choices[next], choices[index]];
          return save(choices);
        };
        for (const [text, offset] of [["\u2191", -1], ["\u2193", 1]]) {
          const control = button(text, () => move(offset));
          control.setAttribute("aria-label", text + " " + label + " " + name);
          const index = selected.indexOf(name);
          control.disabled = index < 0 || index + offset < 0 || index + offset >= selected.length;
          controls.append(control);
        }
        const remove = button("\u0E25\u0E1A", () => save(api.get()[kind].filter((v) => v !== name), name));
        remove.setAttribute("aria-label", "\u0E25\u0E1A " + label + " " + name);
        controls.append(remove);
        const item = el("div", "akane-choice-row");
        item.append(row2, controls);
        fieldset.append(item);
      }
      const row = el("div", "row"), input = el("input");
      input.placeholder = "\u0E0A\u0E37\u0E48\u0E2D\u0E43\u0E2B\u0E21\u0E48";
      input.setAttribute("aria-label", "\u0E40\u0E1E\u0E34\u0E48\u0E21 " + label + " \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A " + config.name);
      const add = button("+ \u0E40\u0E1E\u0E34\u0E48\u0E21", async () => {
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
  for (const surface of document.querySelectorAll("#akane-concepts .ak")) {
    admin(surface);
    if (window.AkanePageData) apply(surface, window.AkanePageData);
  }
  if (location.hash === "#calculator") {
    const show = () => {
      const trigger = document.querySelector('a[data-local="commission"]');
      if (trigger) trigger.click();
    };
    window.addEventListener("load", show, { once: true });
  }
})();
