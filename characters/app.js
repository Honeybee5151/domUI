/**
 * Character select screen: builds one trading card per character.
 *   click / tap            select
 *   double-click / -tap    play (enter the world) — fires a "characterplay" event
 *   right-click / hold     equipment, inventory and backpack
 *   On open only the most recently played character is shown. To see the others:
 *   search box             filter by name or class ("/" to focus, Esc to clear)
 *   Layout button          lay out every character, with its backpack beside its card
 */
(function () {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";

  /** Simple head-and-shoulders silhouette shown until a character has real art. */
  function placeholderArt() {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 32 32");
    svg.setAttribute("class", "art-placeholder");
    svg.setAttribute("aria-hidden", "true");
    // Pixel-style silhouette made of rects so it stays crisp
    const rects = [
      [12, 6, 8, 2], [10, 8, 12, 8], [12, 16, 8, 2], [14, 18, 4, 2],
      [8, 20, 16, 2], [6, 22, 20, 10]
    ];
    for (const [x, y, w, h] of rects) {
      const r = document.createElementNS(SVG_NS, "rect");
      r.setAttribute("x", x);
      r.setAttribute("y", y);
      r.setAttribute("width", w);
      r.setAttribute("height", h);
      svg.appendChild(r);
    }
    return svg;
  }

  /** Small pixel gem in the sign's colour, used until the sign has its own icon. */
  function placeholderSignIcon() {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 8 8");
    svg.setAttribute("class", "sign-placeholder");
    svg.setAttribute("aria-hidden", "true");
    // [x, y, w, h, fill]: body in the sign colour, a light facet and a dark edge
    const rects = [
      [2, 1, 4, 1, "currentColor"], [1, 2, 6, 2, "currentColor"], [2, 4, 4, 1, "currentColor"],
      [3, 5, 2, 1, "currentColor"], [2, 2, 2, 1, "#ffffffb0"], [5, 3, 1, 2, "#00000040"]
    ];
    for (const [x, y, w, h, fill] of rects) {
      const r = document.createElementNS(SVG_NS, "rect");
      r.setAttribute("x", x);
      r.setAttribute("y", y);
      r.setAttribute("width", w);
      r.setAttribute("height", h);
      r.setAttribute("fill", fill);
      svg.appendChild(r);
    }
    return svg;
  }

  /** "2026-11-06" -> "6 Nov 2026" (read as a calendar date, not shifted by time zone). */
  function formatDate(isoDate) {
    const [y, m, d] = String(isoDate).split("-").map(Number);
    if (!y || !m || !d) return String(isoDate);
    const date = new Date(Date.UTC(y, m - 1, d));
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  }

  function findSign(id) {
    const signs = window.BIRTHSIGNS || [];
    return signs.find((s) => s.id === id) || signs[0];
  }

  function itemIcon(item) {
    if (item.icon) {
      const img = document.createElement("img");
      img.src = item.icon;
      img.alt = "";
      return img;
    }
    // Placeholder: a small pixel blob in the item's colour
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 8 8");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("class", "item-placeholder");
    for (const [x, y, w, h, fill] of [
      [2, 1, 4, 1, item.color], [1, 2, 6, 4, item.color], [2, 6, 4, 1, item.color],
      [2, 2, 2, 1, "#ffffff90"], [5, 4, 1, 2, "#00000040"]
    ]) {
      const r = document.createElementNS(SVG_NS, "rect");
      r.setAttribute("x", x);
      r.setAttribute("y", y);
      r.setAttribute("width", w);
      r.setAttribute("height", h);
      r.setAttribute("fill", fill);
      svg.appendChild(r);
    }
    return svg;
  }

  function fillSlots(gridEl, items, size, labels) {
    gridEl.replaceChildren();
    for (let i = 0; i < size; i++) {
      const item = (items || [])[i] || null;
      const slot = document.createElement("span");
      slot.className = "slot" + (item ? " has-item" : "");
      const label = labels ? labels[i] : null;
      if (item) {
        slot.appendChild(itemIcon(item));
        slot.dataset.name = label ? `${item.name} (${label})` : item.name;
        slot.setAttribute("aria-label", slot.dataset.name);
      } else {
        slot.setAttribute("aria-label", label ? `${label}: empty` : "Empty slot");
        if (label) slot.dataset.slotLabel = label;
      }
      slot.setAttribute("role", "img");
      gridEl.appendChild(slot);
    }
  }

  function buildCard(template, character, index) {
    const sign = findSign(character.birthsign);
    const unit = template.content.firstElementChild.cloneNode(true);
    const card = unit.querySelector(".char-card");

    // The card's colours all derive from these two (see styles.css)
    card.style.setProperty("--sign-color", sign.color);
    card.style.setProperty("--sign-shade", sign.shade);
    card.dataset.index = String(index);
    card.setAttribute("aria-label", `${character.name}, ${character.class}, level ${character.level}, ${character.hp} HP, ${sign.name}. Double-click to play.`);

    const nameEl = card.querySelector(".card-name");
    nameEl.textContent = character.name;
    // Long names get a smaller font so they fit next to the level, HP and sign
    if (character.name.length > 9) nameEl.classList.add("is-long");

    const hpEl = card.querySelector(".card-hp");
    if (character.hp != null) {
      hpEl.querySelector(".hp-value").textContent = String(character.hp);
    } else {
      hpEl.hidden = true;
    }

    // The sign is just a symbol; its name only appears on hover
    const signEl = card.querySelector(".card-sign");
    signEl.dataset.name = sign.name;
    if (sign.icon) {
      const icon = document.createElement("img");
      icon.src = sign.icon;
      icon.alt = "";
      signEl.appendChild(icon);
    } else {
      signEl.appendChild(placeholderSignIcon());
    }

    // Ability section: one block per ability (name + short description)
    const abilitiesEl = card.querySelector(".card-abilities");
    for (const ability of character.abilities || []) {
      const block = document.createElement("span");
      block.className = "ability";
      const head = document.createElement("span");
      head.className = "ability-head";
      const tag = document.createElement("span");
      tag.className = "ability-tag";
      tag.textContent = "Ability";
      const n = document.createElement("span");
      n.className = "ability-name";
      n.textContent = ability.name;
      head.append(tag, n);
      const t = document.createElement("span");
      t.className = "ability-text";
      t.textContent = ability.text;
      block.append(head, t);
      abilitiesEl.appendChild(block);
    }

    // Bottom row: small info lines (only "created" for now; more can be added here)
    const foot = card.querySelector(".card-foot");
    const info = [];
    if (character.class) info.push(["Class", character.class]);
    if (character.created) info.push(["Created", formatDate(character.created)]);
    for (const [label, value] of info) {
      const line = document.createElement("span");
      line.className = "foot-line";
      const l = document.createElement("span");
      l.className = "foot-label";
      l.textContent = label;
      const v = document.createElement("span");
      v.className = "foot-value";
      v.textContent = value;
      line.append(l, v);
      foot.appendChild(line);
    }

    const levelEl = card.querySelector(".card-level");
    if (character.level != null) {
      levelEl.querySelector(".level-value").textContent = String(character.level);
    } else {
      levelEl.hidden = true;
    }

    const art = card.querySelector(".card-art");
    const imageSrc = character.image || (window.CLASS_IMAGES || {})[String(character.class).toLowerCase()];
    if (imageSrc) {
      const img = document.createElement("img");
      img.src = imageSrc;
      img.alt = character.name;
      img.loading = "lazy";
      art.appendChild(img);
    } else {
      art.appendChild(placeholderArt());
    }

    // Layout mode: backpack slots beside the card
    unit.style.setProperty("--sign-color", sign.color);
    unit.style.setProperty("--sign-shade", sign.shade);
    const pack = unit.querySelector(".side-pack");
    if (Array.isArray(character.backpack)) {
      fillSlots(pack.querySelector(".side-pack-grid"), character.backpack, window.SLOT_COUNTS.backpack);
    } else {
      pack.classList.add("is-empty");
      pack.querySelector(".side-pack-grid").textContent = "No backpack";
    }

    return unit;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("card-grid");
    const template = document.getElementById("card-template");
    const characters = window.CHARACTERS || [];

    const units = characters.map((c, i) => buildCard(template, c, i));
    const cards = units.map((u) => u.querySelector(".char-card"));
    units.forEach((u) => grid.appendChild(u));

    let selected = -1;
    const isShown = (i) => !units[i].hidden;
    const shownIndexes = () => cards.map((_, i) => i).filter(isShown);

    function select(index, { scroll = true } = {}) {
      if (index < 0 || index >= cards.length) return;
      selected = index;
      cards.forEach((card, i) => {
        const on = i === index;
        card.classList.toggle("is-selected", on);
        card.setAttribute("aria-selected", String(on));
        card.tabIndex = on ? 0 : -1;
      });
      cards[index].focus({ preventScroll: true });
      if (scroll) cards[index].scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
      document.dispatchEvent(new CustomEvent("characterselected", { detail: { index, character: characters[index] } }));
    }

    // ---- Play: double-click (or double-tap, or Enter) enters the world ----
    const overlay = document.getElementById("play-overlay");
    let playing = false;

    function play(index) {
      const c = characters[index];
      if (!c || playing) return;
      playing = true;
      select(index, { scroll: false });
      // This character is now the most recently played
      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      c.lastPlayed = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      savePlayed(c.name, c.lastPlayed);
      const sign = findSign(c.birthsign);
      overlay.style.setProperty("--sign-color", sign.color);
      document.getElementById("play-title").textContent = c.name;
      document.getElementById("play-sub").textContent = `Level ${c.level} ${c.class}`;
      cards[index].classList.add("is-launching");
      overlay.hidden = false;
      requestAnimationFrame(() => overlay.classList.add("is-on"));
      document.getElementById("play-back").focus({ preventScroll: true });
      // The game listens for this to load the world with the chosen character
      document.dispatchEvent(new CustomEvent("characterplay", { detail: { index, character: c } }));
    }

    function leavePlay() {
      if (!playing) return;
      playing = false;
      overlay.classList.remove("is-on");
      overlay.hidden = true;
      cards.forEach((card) => card.classList.remove("is-launching"));
      applyView();
      if (selected >= 0 && !units[selected].hidden) cards[selected].focus({ preventScroll: true });
    }

    document.getElementById("play-back").addEventListener("click", leavePlay);
    document.addEventListener("keydown", (e) => {
      if (playing && e.key === "Escape") leavePlay();
    });

    grid.addEventListener("click", (e) => {
      const card = e.target.closest(".char-card");
      if (card) select(Number(card.dataset.index));
    });

    grid.addEventListener("dblclick", (e) => {
      const card = e.target.closest(".char-card");
      if (card) play(Number(card.dataset.index));
    });

    // Phones: two quick taps on the same card
    let lastTap = { index: -1, time: 0 };
    grid.addEventListener("touchend", (e) => {
      const card = e.target.closest(".char-card");
      if (!card || e.changedTouches.length !== 1) return;
      const index = Number(card.dataset.index);
      const now = Date.now();
      if (lastTap.index === index && now - lastTap.time < 320) {
        e.preventDefault();
        lastTap = { index: -1, time: 0 };
        play(index);
      } else {
        lastTap = { index, time: now };
      }
    });

    // Arrow keys move the selection across the visible cards; Enter plays
    grid.addEventListener("keydown", (e) => {
      const shown = shownIndexes();
      if (!shown.length) return;
      if (e.key === "Enter" && selected >= 0) {
        e.preventDefault();
        play(selected);
        return;
      }
      const first = units[shown[0]];
      const cols = shown.filter((i) => units[i].offsetTop === first.offsetTop).length || 1;
      const moves = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -cols, ArrowDown: cols };
      if (e.key in moves) {
        e.preventDefault();
        const pos = Math.max(0, shown.indexOf(selected));
        const next = Math.min(shown.length - 1, Math.max(0, pos + moves[e.key]));
        select(shown[next]);
      }
    });

    // ---- Search: filter cards by name (or class) as you type ----
    const search = document.getElementById("search");
    const countEl = document.getElementById("result-count");
    const noResults = document.getElementById("no-results");
    const hint = document.getElementById("view-hint");
    hint.querySelector(".hint-count").textContent = String(characters.length);

    // Which character was played last: saved in this browser when you play, otherwise
    // taken from each character's lastPlayed
    const STORAGE_KEY = "domui:lastPlayed";
    function loadPlayed() {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      } catch {
        return {};
      }
    }
    function savePlayed(name, when) {
      try {
        const saved = loadPlayed();
        saved[name] = when;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      } catch {
        /* storage unavailable: only this visit remembers it */
      }
    }
    const savedPlayed = loadPlayed();
    characters.forEach((c) => {
      if (savedPlayed[c.name] && savedPlayed[c.name] > (c.lastPlayed || "")) c.lastPlayed = savedPlayed[c.name];
    });
    function mostRecentIndex() {
      let best = 0;
      characters.forEach((c, i) => {
        if ((c.lastPlayed || "") > (characters[best].lastPlayed || "")) best = i;
      });
      return best;
    }

    /**
     * What's on screen:
     *   - normally just the most recently played character
     *   - while searching, every character that matches
     *   - with Layout on, everyone (still filtered by the search), backpacks beside them
     */
    function applyView() {
      const q = search.value.trim().toLowerCase();
      const layoutOn = grid.classList.contains("is-layout");
      const recent = mostRecentIndex();
      const single = !q && !layoutOn;
      let shown = 0;
      characters.forEach((c, i) => {
        const match = single
          ? i === recent
          : !q || c.name.toLowerCase().includes(q) || String(c.class).toLowerCase().includes(q);
        units[i].hidden = !match;
        if (match) shown++;
      });
      grid.classList.toggle("is-single", single);
      hint.hidden = !single;
      if (single) {
        countEl.textContent = "Last played";
      } else {
        countEl.textContent = q ? `${shown} of ${characters.length}` : `${characters.length} characters`;
      }
      noResults.hidden = shown > 0;
      // Keep one visible card in the tab order
      const visible = shownIndexes();
      cards.forEach((card) => (card.tabIndex = -1));
      const keep = visible.includes(selected) ? selected : visible[0];
      if (keep != null) cards[keep].tabIndex = 0;
    }
    const applySearch = applyView;

    search.addEventListener("input", applySearch);
    search.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && search.value) {
        e.preventDefault();
        e.stopPropagation();
        search.value = "";
        applySearch();
      } else if (e.key === "Enter" || e.key === "ArrowDown") {
        // Jump from the search box to the first matching card
        const visible = shownIndexes();
        if (visible.length) {
          e.preventDefault();
          select(visible.includes(selected) ? selected : visible[0]);
        }
      }
    });
    // "/" jumps to the search box from anywhere
    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement !== search && !playing) {
        e.preventDefault();
        search.focus();
        search.select();
      }
    });

    // ---- Layout: show each character's backpack to the right of its card ----
    const layoutBtn = document.getElementById("layout-toggle");
    layoutBtn.addEventListener("click", () => {
      const on = layoutBtn.getAttribute("aria-pressed") !== "true";
      layoutBtn.setAttribute("aria-pressed", String(on));
      grid.classList.toggle("is-layout", on);
      units.forEach((u) => u.querySelector(".side-pack").setAttribute("aria-hidden", String(!on)));
      applyView();
      if (selected >= 0 && !units[selected].hidden) cards[selected].scrollIntoView({ block: "nearest" });
    });

    // ---- Right-click / long-press: equipment, inventory and backpack ----
    const panel = document.getElementById("slots-panel");
    const counts = window.SLOT_COUNTS;

    function openSlots(index) {
      const c = characters[index];
      const sign = findSign(c.birthsign);
      panel.style.setProperty("--sign-color", sign.color);
      panel.style.setProperty("--sign-shade", sign.shade);
      panel.querySelector(".slots-title").textContent = c.name;

      const sec = (name) => panel.querySelector(`[data-section="${name}"]`);
      fillSlots(sec("equipment").querySelector(".slot-grid"), c.equipment, counts.equipment, window.EQUIPMENT_SLOT_NAMES);
      fillSlots(sec("inventory").querySelector(".slot-grid"), c.inventory, counts.inventory);
      const hasBackpack = Array.isArray(c.backpack);
      sec("backpack").hidden = !hasBackpack;
      if (hasBackpack) fillSlots(sec("backpack").querySelector(".slot-grid"), c.backpack, counts.backpack);

      if (!panel.open) panel.showModal();
    }

    grid.addEventListener("contextmenu", (e) => {
      const card = e.target.closest(".char-card");
      if (!card) return;
      e.preventDefault();
      select(Number(card.dataset.index));
      openSlots(Number(card.dataset.index));
    });

    // Phones: hold a finger on a card for half a second
    let pressTimer = null;
    let pressStart = null;
    grid.addEventListener("touchstart", (e) => {
      const card = e.target.closest(".char-card");
      if (!card || e.touches.length !== 1) return;
      pressStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      pressTimer = setTimeout(() => {
        pressTimer = null;
        longPressFired = true;
        select(Number(card.dataset.index));
        openSlots(Number(card.dataset.index));
      }, 500);
    }, { passive: true });
    const cancelPress = () => {
      if (pressTimer) clearTimeout(pressTimer);
      pressTimer = null;
    };
    // Lifting the finger after a long-press would send a click that lands on the
    // backdrop and closes the panel straight away: swallow it.
    let longPressFired = false;
    grid.addEventListener("touchend", (e) => {
      cancelPress();
      if (longPressFired) {
        e.preventDefault();
        longPressFired = false;
      }
    });
    grid.addEventListener("touchcancel", cancelPress);
    grid.addEventListener("touchmove", (e) => {
      if (!pressStart) return;
      const t = e.touches[0];
      if (Math.hypot(t.clientX - pressStart.x, t.clientY - pressStart.y) > 10) cancelPress();
    }, { passive: true });

    document.getElementById("slots-close").addEventListener("click", () => panel.close());
    // Clicking the dimmed backdrop (outside the panel) closes it; Esc is built into <dialog>
    panel.addEventListener("click", (e) => {
      if (e.target === panel) panel.close();
    });
    panel.addEventListener("close", () => {
      if (selected >= 0) cards[selected].focus({ preventScroll: true });
    });

    // Start on the most recently played character
    applyView();
    if (characters.length) {
      const recent = mostRecentIndex();
      cards[recent].classList.add("is-selected");
      cards[recent].setAttribute("aria-selected", "true");
      selected = recent;
      // Ready to play straight away with Enter
      cards[recent].focus({ preventScroll: true, focusVisible: false });
    }
  });
})();
