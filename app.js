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

  function buildCard(template, character, index) {
    const sign = window.birthSign(character.birthday);
    const card = template.content.firstElementChild.cloneNode(true);

    card.dataset.element = sign.element;
    card.dataset.index = String(index);
    card.setAttribute("aria-label", `${character.name}, ${sign.name}`);

    card.querySelector(".card-name").textContent = character.name;

    const signEl = card.querySelector(".card-sign");
    signEl.textContent = sign.glyph;
    signEl.title = sign.name;

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

    card.querySelector(".card-foot").textContent = sign.name;
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
      status.textContent = `${c.name} — ${window.birthSign(c.birthday).name}`;
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
