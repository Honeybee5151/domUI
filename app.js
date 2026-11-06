/**
 * Character select screen: builds one trading card per character and handles selection
 * (click/tap, or arrow keys + Enter).
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

  function buildCard(template, character, index) {
    const sign = findSign(character.birthsign);
    const card = template.content.firstElementChild.cloneNode(true);

    // The card's colours all derive from these two (see styles.css)
    card.style.setProperty("--sign-color", sign.color);
    card.style.setProperty("--sign-shade", sign.shade);
    card.dataset.index = String(index);
    card.setAttribute("aria-label", `${character.name}, level ${character.level}, ${character.hp} HP, ${sign.name}`);

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
    if (character.image) {
      const img = document.createElement("img");
      img.src = character.image;
      img.alt = character.name;
      img.loading = "lazy";
      art.appendChild(img);
    } else {
      art.appendChild(placeholderArt());
    }

    return card;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("card-grid");
    const template = document.getElementById("card-template");
    const status = document.getElementById("select-status");
    const characters = window.CHARACTERS || [];

    const cards = characters.map((c, i) => buildCard(template, c, i));
    cards.forEach((card) => grid.appendChild(card));

    let selected = -1;

    function select(index) {
      if (index < 0 || index >= cards.length) return;
      selected = index;
      cards.forEach((card, i) => {
        const on = i === index;
        card.classList.toggle("is-selected", on);
        card.setAttribute("aria-selected", String(on));
        card.tabIndex = on ? 0 : -1;
      });
      cards[index].focus({ preventScroll: true });
      cards[index].scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
      const c = characters[index];
      status.textContent = c.name;
      document.dispatchEvent(new CustomEvent("characterselected", { detail: { index, character: c } }));
    }

    grid.addEventListener("click", (e) => {
      const card = e.target.closest(".char-card");
      if (card) select(Number(card.dataset.index));
    });

    // Arrow keys move the selection across the grid
    grid.addEventListener("keydown", (e) => {
      if (!cards.length) return;
      // Cards per row = how many share the first card's row
      const cols = cards.filter((c) => c.offsetTop === cards[0].offsetTop).length || 1;
      const moves = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -cols, ArrowDown: cols };
      if (e.key in moves) {
        e.preventDefault();
        const from = selected < 0 ? 0 : selected;
        select(Math.min(cards.length - 1, Math.max(0, from + moves[e.key])));
      }
    });

    // ---- Right-click / long-press: equipment, inventory and backpack ----
    const panel = document.getElementById("slots-panel");
    const counts = window.SLOT_COUNTS;

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

      const total = counts.equipment + counts.inventory + (hasBackpack ? counts.backpack : 0);
      const used = [...(c.equipment || []), ...(c.inventory || []), ...(hasBackpack ? c.backpack : [])].filter(Boolean).length;
      panel.querySelector(".slots-total").textContent = `${used} / ${total} slots used` + (hasBackpack ? "" : " · no backpack");

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

    // Only one card is in the tab order at a time (roving tabindex)
    cards.forEach((card, i) => (card.tabIndex = i === 0 ? 0 : -1));
  });
})();
