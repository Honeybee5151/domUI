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

    card.querySelector(".card-name").textContent = character.name;

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

    // Only one card is in the tab order at a time (roving tabindex)
    cards.forEach((card, i) => (card.tabIndex = i === 0 ? 0 : -1));
  });
})();
