/**
 * Character select screen: builds one trading card per character.
 *   click / tap            select
 *   double-click / -tap    play (enter the world) — fires a "characterplay" event
 *   right-click / hold     flip the card to its back (equipment, inventory, backpack)
 *                          and right-click again to flip it back
 *   On open the cards are a deck, the most recently played on top. To see the others:
 *   search box             in the deck: brings the best match to the top (Enter plays it);
 *                          laid out: narrows the cards down ("/" to focus, Esc to clear)
 *   Layout button          lay out every character, with the back of its card (equipment,
 *                          inventory, backpack) beside it
 *   Vault button           card backs on the left, the vault's chests (8 slots each) on the
 *                          right: drag items between them, or tap an item then tap a slot;
 *                          fires an "itemmoved" event for the game to save
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
    if (character.screenshot) {
      // The player's screenshot fills the whole picture box
      const shot = document.createElement("img");
      shot.src = character.screenshot;
      shot.alt = character.screenshotCaption || `${character.name} in game`;
      shot.className = "art-screenshot";
      shot.loading = "lazy";
      if (character.screenshotCaption) art.dataset.caption = character.screenshotCaption;
      art.appendChild(shot);
    } else if (imageSrc) {
      const img = document.createElement("img");
      img.src = imageSrc;
      img.alt = character.name;
      img.loading = "lazy";
      art.appendChild(img);
    } else {
      art.appendChild(placeholderArt());
    }

    // Layout mode: the back of the card, with every slot
    unit.style.setProperty("--sign-color", sign.color);
    unit.style.setProperty("--sign-shade", sign.shade);
    renderBack(unit, character);

    return unit;
  }

  /**
   * Fills a card back (".back-inner") with a character's equipment, inventory and
   * backpack. With an index, each slot is tagged so items can be moved (Vault mode).
   */
  function fillBack(backInner, character, index) {
    const counts = window.SLOT_COUNTS;
    backInner.querySelector(".back-name").textContent = character.name;
    const sec = (name) => backInner.querySelector(`[data-section="${name}"] .back-grid`);
    const lists = [
      ["equipment", counts.equipment, window.EQUIPMENT_SLOT_NAMES],
      ["inventory", counts.inventory, null],
      ["backpack", counts.backpack, null]
    ];
    for (const [list, size, labels] of lists) {
      const gridEl = sec(list);
      gridEl.classList.remove("is-empty");
      if (list === "backpack" && !Array.isArray(character.backpack)) {
        gridEl.replaceChildren();
        gridEl.classList.add("is-empty");
        gridEl.textContent = "No backpack";
        continue;
      }
      fillSlots(gridEl, character[list], size, labels);
      if (index != null) {
        [...gridEl.children].forEach((slot, pos) => (slot.dataset.ref = `c:${index}:${list}:${pos}`));
      }
    }
  }

  /** (Re)draws both backs of a card: the one beside it in Layout and the flip side. */
  function renderBack(unit, character) {
    const back = unit.querySelector(".card-back .back-inner");
    fillBack(back, character);
    const face = unit.querySelector(".card-face-back");
    face.replaceChildren(back.cloneNode(true));
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
    // Visible cards in on-screen order
    const shownIndexes = () => [...grid.children].map((u) => Number(u.querySelector(".char-card").dataset.index)).filter(isShown);

    function markSelected(index) {
      selected = index;
      cards.forEach((card, i) => {
        card.classList.toggle("is-selected", i === index);
        card.setAttribute("aria-selected", String(i === index));
      });
    }

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
      arrange(deckView);
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
    const layoutBtn = document.getElementById("layout-toggle");

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
     * Two views:
     *   - deck: every card stacked like a deck, the most recently played on top
     *   - laid out (Layout button only): the cards dealt into rows, most
     *     recent first, each with the back of its card beside it; scroll for more
     */
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DECK_LAYERS = 6; // how many cards visibly fan out under the top one
    let deckView = true;

    /** Character indexes sorted by last played, most recent first. */
    function byRecency() {
      return characters
        .map((_, i) => i)
        .sort((a, b) => ((characters[b].lastPlayed || "") > (characters[a].lastPlayed || "") ? 1 : -1));
    }

    /**
     * How well a character matches the search (higher is better, 0 is no match):
     * name starts with it > a word in the name starts with it > name contains it > class
     */
    function matchScore(i, q) {
      if (!q) return 0;
      const name = characters[i].name.toLowerCase();
      const cls = String(characters[i].class).toLowerCase();
      if (name === q) return 5;
      if (name.startsWith(q)) return 4;
      if (name.split(/\s+/).some((w) => w.startsWith(q))) return 3;
      if (name.includes(q)) return 2;
      if (cls.startsWith(q) || cls.includes(q)) return 1;
      return 0;
    }

    /** Deck order: best search match on top, then by last played. */
    function deckOrder() {
      const q = search.value.trim().toLowerCase();
      const recency = byRecency();
      if (!q) return recency;
      const rank = new Map(recency.map((i, r) => [i, r]));
      return [...recency].sort((a, b) => matchScore(b, q) - matchScore(a, q) || rank.get(a) - rank.get(b));
    }

    // A slightly messy but stable fan for each depth in the deck
    function deckTransform(depth) {
      if (depth === 0) return { x: 0, y: 0, r: 0 };
      const d = Math.min(depth, DECK_LAYERS);
      const tilt = [0, -2.5, 2, -1.5, 3, -3, 1.5][d];
      return { x: d * 3 - (d % 2 ? 2 : 0), y: d * 5, r: tilt };
    }
    const tf = ({ x, y, r }) => `translate(${x}px, ${y}px) rotate(${r}deg)`;

    function matchesSearch(i) {
      const q = search.value.trim().toLowerCase();
      const c = characters[i];
      return !q || c.name.toLowerCase().includes(q) || String(c.class).toLowerCase().includes(q);
    }

    /** Put the cards in recency order and mark which are shown, without animating. */
    function arrange(toDeck) {
      const q0 = search.value.trim().toLowerCase();
      const order = toDeck ? deckOrder() : byRecency();
      order.forEach((i) => grid.appendChild(units[i]));
      grid.classList.toggle("is-deck", toDeck);
      grid.classList.toggle("is-layout", !toDeck);
      let shown = 0;
      order.forEach((i, depth) => {
        const u = units[i];
        // The deck always holds every card; laid out, the search narrows them down
        const visible = toDeck || matchesSearch(i);
        u.hidden = !visible;
        if (visible) shown++;
        u.style.zIndex = toDeck ? String(order.length - depth) : "";
        u.style.transform = toDeck ? tf(deckTransform(depth)) : "";
        u.classList.toggle("is-top", toDeck && depth === 0);
        u.querySelector(".card-back").setAttribute("aria-hidden", String(toDeck));
      });
      deckView = toDeck;
      // Laid out, every card shows its front (its back is beside it)
      if (!toDeck) {
        cards.forEach((card) => {
          card.classList.remove("is-flipped");
          card.querySelector(".card-inner").removeAttribute("aria-hidden");
          card.querySelector(".card-face-back").setAttribute("aria-hidden", "true");
        });
      }
      layoutBtn.setAttribute("aria-pressed", String(!toDeck));
      const q = search.value.trim();
      if (toDeck) {
        const top = order[0];
        const hit = q && matchScore(top, q0) > 0;
        countEl.textContent = !q ? "" : hit ? `Best match: ${characters[top].name}` : "No match";
      } else {
        countEl.textContent = q ? `${shown} of ${characters.length}` : "";
      }
      noResults.hidden = toDeck || shown > 0;
      // Keep one visible card in the tab order: the top of the deck, or the selection
      const visibleIdx = order.filter((i) => !units[i].hidden);
      cards.forEach((card) => (card.tabIndex = -1));
      const keep = toDeck ? order[0] : visibleIdx.includes(selected) ? selected : visibleIdx[0];
      if (keep != null) cards[keep].tabIndex = 0;
      return order;
    }

    /** Switch between the deck and the laid-out rows (instantly, like Vault mode). */
    function setView(toDeck) {
      const wasDeck = deckView;
      arrange(toDeck);
      if (wasDeck && !toDeck) window.scrollTo({ top: 0 });
    }

    function applyView() {
      // Only the Layout button deals the cards out; searching never does
      const wantDeck = layoutBtn.dataset.on !== "true";
      if (wantDeck !== deckView) setView(wantDeck);
      else arrange(wantDeck);
    }
    function applySearch() {
      const before = deckView ? grid.querySelector(".card-unit.is-top") : null;
      applyView();
      if (deckView) {
        const top = grid.querySelector(".card-unit.is-top");
        const idx = Number(top.querySelector(".char-card").dataset.index);
        markSelected(idx);
        // The new top card pops up from the deck
        if (top !== before && !reduceMotion) {
          top.animate(
            [{ transform: "translate(0, 14px) scale(0.96)", opacity: 0.6 }, { transform: "none", opacity: 1 }],
            { duration: 220, easing: "ease-out" }
          );
        }
      }
    }

    search.addEventListener("input", applySearch);
    search.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && search.value) {
        e.preventDefault();
        e.stopPropagation();
        search.value = "";
        applySearch();
      } else if (e.key === "Enter" && deckView) {
        // In the deck, Enter plays the best match on top
        e.preventDefault();
        const top = grid.querySelector(".card-unit.is-top .char-card");
        if (top) play(Number(top.dataset.index));
      } else if (e.key === "Enter" || e.key === "ArrowDown") {
        // Jump from the search box to the first matching card
        const visible = shownIndexes();
        if (visible.length) {
          e.preventDefault();
          const order = byRecency().filter((i) => !units[i].hidden);
          select(order.includes(selected) ? selected : order[0]);
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

    // ---- Layout: deal the deck out (and gather it back up) ----
    layoutBtn.addEventListener("click", () => {
      const on = layoutBtn.dataset.on !== "true";
      layoutBtn.dataset.on = String(on);
      applyView();
    });

    // ---- Vault mode: card backs on the left, the vault's chests on the right ----
    const vaultBtn = document.getElementById("vault-toggle");
    const vaultScreen = document.getElementById("vault-screen");
    const vaultChars = document.getElementById("vault-chars");
    const vaultChests = document.getElementById("vault-chests");
    const chests = window.VAULT_CHESTS || [];
    const backTemplate = template.content.querySelector(".card-back .back-inner");
    let vaultOn = false;
    let held = null; // slot ref of the item picked up by tapping, e.g. "v:2:5"

    /** The array and position a slot ref points at. */
    function slotTarget(ref) {
      const parts = ref.split(":");
      if (parts[0] === "v") return { list: chests[Number(parts[1])], pos: Number(parts[2]) };
      const c = characters[Number(parts[1])];
      return { list: c[parts[2]], pos: Number(parts[3]), character: c, index: Number(parts[1]) };
    }

    function renderVaultChar(index) {
      const c = characters[index];
      const sign = findSign(c.birthsign);
      let box = vaultChars.querySelector(`[data-index="${index}"]`);
      if (!box) {
        box = document.createElement("div");
        box.className = "vault-char";
        box.dataset.index = String(index);
        box.appendChild(backTemplate.cloneNode(true));
      }
      box.style.setProperty("--sign-color", sign.color);
      box.style.setProperty("--sign-shade", sign.shade);
      fillBack(box.querySelector(".back-inner"), c, index);
      return box;
    }

    function renderChest(ci) {
      let box = vaultChests.querySelector(`[data-chest="${ci}"]`);
      if (!box) {
        box = document.createElement("div");
        box.className = "vault-chest";
        box.dataset.chest = String(ci);
        const title = document.createElement("span");
        title.className = "chest-title";
        const grid8 = document.createElement("span");
        grid8.className = "back-grid chest-grid";
        box.append(title, grid8);
      }
      const items = chests[ci];
      box.querySelector(".chest-title").textContent = `Chest ${ci + 1}`;
      const grid8 = box.querySelector(".chest-grid");
      fillSlots(grid8, items, window.SLOT_COUNTS.chest);
      [...grid8.children].forEach((slot, pos) => (slot.dataset.ref = `v:${ci}:${pos}`));
      return box;
    }

    function renderVault() {
      const q = search.value.trim().toLowerCase();
      const order = byRecency().filter((i) => !q || matchesSearch(i));
      vaultChars.replaceChildren(...order.map(renderVaultChar));
      if (!order.length) {
        const none = document.createElement("p");
        none.className = "vault-none";
        none.textContent = "No characters match your search.";
        vaultChars.appendChild(none);
      }
      vaultChests.replaceChildren(...chests.map((_, ci) => renderChest(ci)));
      countEl.textContent = "";
      markHeld();
    }

    function markHeld() {
      vaultScreen.querySelectorAll(".slot.is-held").forEach((el) => el.classList.remove("is-held"));
      vaultScreen.classList.toggle("is-holding", !!held);
      if (held) vaultScreen.querySelector(`[data-ref="${held}"]`)?.classList.add("is-held");
    }

    /** Move the item at `from` to `to`; if `to` already has one, the two swap. */
    function moveItem(from, to) {
      if (from === to) return;
      const a = slotTarget(from);
      const b = slotTarget(to);
      if (!a.list || !b.list || !a.list[a.pos]) return;
      const item = a.list[a.pos];
      a.list[a.pos] = b.list[b.pos] || null;
      b.list[b.pos] = item;
      // Redraw just what changed, here and on the cards themselves
      for (const t of [a, b]) {
        if (t.character) {
          renderVaultChar(t.index);
          renderBack(units[t.index], t.character);
        }
      }
      const cs = new Set([from, to].filter((r) => r.startsWith("v:")).map((r) => Number(r.split(":")[1])));
      cs.forEach(renderChest);
      // The game listens for this to save the move
      document.dispatchEvent(new CustomEvent("itemmoved", { detail: { from, to, item, swapped: a.list[a.pos] } }));
    }

    function setVault(on) {
      vaultOn = on;
      held = null;
      vaultBtn.setAttribute("aria-pressed", String(on));
      vaultScreen.hidden = !on;
      grid.hidden = on;
      noResults.hidden = true;
      document.body.classList.toggle("in-vault", on);
      if (on) {
        renderVault();
      } else {
        arrange(deckView);
      }
    }

    vaultBtn.addEventListener("click", () => setVault(!vaultOn));
    // Layout leaves the vault
    layoutBtn.addEventListener("click", () => vaultOn && setVault(false), true);
    search.addEventListener("input", () => vaultOn && renderVault());

    // Tap / click: pick an item up, then tap where it goes (tap it again to put it back)
    vaultScreen.addEventListener("click", (e) => {
      const slot = e.target.closest(".slot[data-ref]");
      if (!slot) return;
      const ref = slot.dataset.ref;
      if (!held) {
        if (slot.classList.contains("has-item")) held = ref;
      } else if (held === ref) {
        held = null;
      } else {
        moveItem(held, ref);
        held = null;
      }
      markHeld();
    });
    document.addEventListener("keydown", (e) => {
      if (vaultOn && held && e.key === "Escape") {
        held = null;
        markHeld();
      }
    });

    // Drag and drop with the mouse
    vaultScreen.addEventListener("dragstart", (e) => {
      const slot = e.target.closest(".slot.has-item[data-ref]");
      if (!slot) return e.preventDefault();
      held = null;
      markHeld();
      e.dataTransfer.setData("text/plain", slot.dataset.ref);
      e.dataTransfer.effectAllowed = "move";
      slot.classList.add("is-dragging");
    });
    vaultScreen.addEventListener("dragend", () => {
      vaultScreen.querySelectorAll(".is-dragging, .is-drop").forEach((el) => el.classList.remove("is-dragging", "is-drop"));
    });
    vaultScreen.addEventListener("dragover", (e) => {
      const slot = e.target.closest(".slot[data-ref]");
      if (!slot) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      vaultScreen.querySelectorAll(".is-drop").forEach((el) => el !== slot && el.classList.remove("is-drop"));
      slot.classList.add("is-drop");
    });
    vaultScreen.addEventListener("drop", (e) => {
      const slot = e.target.closest(".slot[data-ref]");
      if (!slot) return;
      e.preventDefault();
      const from = e.dataTransfer.getData("text/plain");
      if (from) moveItem(from, slot.dataset.ref);
    });
    // Items can be dragged in Vault mode
    new MutationObserver(() => {
      vaultScreen.querySelectorAll(".slot.has-item:not([draggable])").forEach((s) => (s.draggable = true));
      vaultScreen.querySelectorAll(".slot:not(.has-item)[draggable]").forEach((s) => s.removeAttribute("draggable"));
    }).observe(vaultScreen, { childList: true, subtree: true });

    // ---- New character: class slider, name and birthsign ----
    const createBtn = document.getElementById("create-toggle");
    const createScreen = document.getElementById("create-screen");
    const track = document.getElementById("class-track");
    const dots = document.getElementById("class-dots");
    const nameInput = document.getElementById("new-name");
    const signPick = document.getElementById("sign-pick");
    const createError = document.getElementById("create-error");
    const classList = window.CLASS_LIST || [];
    const signs = window.BIRTHSIGNS || [];
    let createOn = false;
    let classPos = 0;
    let signId = signs[0] ? signs[0].id : null;

    const today = () => {
      const d = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    };

    /** A brand-new character of a class: level 1, empty slots, no backpack. */
    function newCharacter(cls, name, birthsign) {
      const counts = window.SLOT_COUNTS;
      return {
        name,
        class: cls,
        birthsign,
        level: 1,
        hp: 800,
        created: today(),
        lastPlayed: "",
        abilities: [{ name: "Ability name", text: "Short description of what this ability does goes here." }],
        equipment: Array(counts.equipment).fill(null),
        inventory: Array(counts.inventory).fill(null),
        backpack: null,
        screenshot: null,
        image: null
      };
    }

    // One preview card per class in the slider
    const previews = classList.map((cls, i) => {
      const slide = document.createElement("div");
      slide.className = "class-slide";
      slide.dataset.pos = String(i);
      slide.setAttribute("role", "option");
      track.appendChild(slide);
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "class-dot";
      dot.setAttribute("aria-label", cls);
      dot.addEventListener("click", () => setClass(i));
      dots.appendChild(dot);
      return slide;
    });

    function drawPreviews() {
      const name = nameInput.value.trim();
      previews.forEach((slide, i) => {
        const cls = classList[i];
        // Your name on the chosen class's card; the others show their class name
        const unit = buildCard(template, newCharacter(cls, i === classPos ? name || cls : cls, signId), -1);
        const card = unit.querySelector(".char-card");
        card.tabIndex = -1;
        card.removeAttribute("role");
        card.setAttribute("aria-hidden", "true");
        slide.replaceChildren(card);
        slide.setAttribute("aria-label", cls);
      });
      placeSlides();
    }

    function placeSlides() {
      const n = previews.length;
      previews.forEach((slide, i) => {
        // The slider wraps around: the last classes sit to the left of the first one
        let off = i - classPos;
        if (off > n / 2) off -= n;
        if (off < -n / 2) off += n;
        const a = Math.abs(off);
        slide.style.setProperty("--off", String(off));
        slide.style.setProperty("--abs", String(a));
        slide.classList.toggle("is-current", off === 0);
        slide.classList.toggle("is-far", a > 2);
        slide.setAttribute("aria-selected", String(off === 0));
      });
      [...dots.children].forEach((d, i) => d.classList.toggle("is-on", i === classPos));
    }

    function setSlideName(i, name) {
      const el = previews[i]?.querySelector(".card-name");
      if (!el) return;
      el.textContent = name;
      el.classList.toggle("is-long", name.length > 9);
    }

    function setClass(i) {
      const before = classPos;
      classPos = (i + classList.length) % classList.length;
      // Only the names change: the old card shows its class again, the new one your name
      setSlideName(before, classList[before]);
      setSlideName(classPos, nameInput.value.trim() || classList[classPos]);
      placeSlides();
    }

    document.getElementById("class-prev").addEventListener("click", () => setClass(classPos - 1));
    document.getElementById("class-next").addEventListener("click", () => setClass(classPos + 1));
    track.addEventListener("click", (e) => {
      const slide = e.target.closest(".class-slide");
      if (slide) setClass(Number(slide.dataset.pos));
    });
    // Drag the slider with a finger or the mouse: the cards follow, and letting go
    // snaps to the nearest class (a long drag skips several)
    let drag = null;
    const slideStep = () => (previews[0]?.offsetWidth || 240) * 0.7;
    track.addEventListener("dragstart", (e) => e.preventDefault()); // no native image dragging
    track.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      drag = { x: e.clientX, dx: 0, moved: false, id: e.pointerId };
    });
    track.addEventListener("pointermove", (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      drag.dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(drag.dx) > 6) {
        drag.moved = true;
        track.classList.add("is-dragging");
        // keep following the pointer even if it leaves the slider
        track.setPointerCapture(e.pointerId);
      }
      track.style.setProperty("--drag", `${drag.dx}px`);
    });
    const endDrag = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const { dx, moved } = drag;
      drag = null;
      track.classList.remove("is-dragging");
      track.style.setProperty("--drag", "0px");
      if (moved) {
        const steps = Math.round(-dx / slideStep()) || (Math.abs(dx) > 40 ? (dx < 0 ? 1 : -1) : 0);
        if (steps) setClass(classPos + steps);
        // swallow the click that follows a drag
        track.addEventListener("click", (ev) => ev.stopPropagation(), { capture: true, once: true });
      }
    };
    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);
    createScreen.addEventListener("keydown", (e) => {
      if (e.target === nameInput) return;
      if (e.key === "ArrowLeft") setClass(classPos - 1);
      if (e.key === "ArrowRight") setClass(classPos + 1);
    });

    // Birthsign picker: the 8 symbols, the name shows on hover
    signs.forEach((sign) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "sign-option";
      b.setAttribute("role", "radio");
      b.setAttribute("aria-label", sign.name);
      b.dataset.name = sign.name;
      b.style.setProperty("--sign-color", sign.color);
      b.style.setProperty("--sign-shade", sign.shade);
      if (sign.icon) {
        const img = document.createElement("img");
        img.src = sign.icon;
        img.alt = "";
        b.appendChild(img);
      } else {
        b.appendChild(placeholderSignIcon());
      }
      b.addEventListener("click", () => {
        signId = sign.id;
        markSign();
        drawPreviews();
      });
      signPick.appendChild(b);
    });
    function markSign() {
      [...signPick.children].forEach((b, i) => b.setAttribute("aria-checked", String(signs[i].id === signId)));
    }

    nameInput.addEventListener("input", () => {
      createError.textContent = "";
      setSlideName(classPos, nameInput.value.trim() || classList[classPos]);
    });

    function nameProblem(name) {
      if (name.length < 2) return "Give your character a name (at least 2 letters).";
      if (!/^[\p{L}][\p{L} '-]*$/u.test(name)) return "Use letters only (spaces, ' and - are fine).";
      if (characters.some((c) => c.name.toLowerCase() === name.toLowerCase())) return `You already have a character called ${name}.`;
      return "";
    }

    document.getElementById("create-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const name = nameInput.value.trim().replace(/\s+/g, " ");
      const problem = nameProblem(name);
      if (problem) {
        createError.textContent = problem;
        nameInput.focus();
        return;
      }
      const c = newCharacter(classList[classPos], name, signId);
      c.lastPlayed = new Date().toISOString().slice(0, 19); // newest goes on top of the deck
      const index = characters.length;
      characters.push(c);
      const unit = buildCard(template, c, index);
      units.push(unit);
      cards.push(unit.querySelector(".char-card"));
      grid.appendChild(unit);
      // The game listens for this to save the new character
      document.dispatchEvent(new CustomEvent("charactercreated", { detail: { index, character: c } }));
      nameInput.value = "";
      setCreate(false);
      select(index, { scroll: false });
    });

    function setCreate(on) {
      createOn = on;
      createBtn.setAttribute("aria-pressed", String(on));
      createScreen.hidden = !on;
      if (on) {
        if (vaultOn) setVault(false);
        grid.hidden = true;
        noResults.hidden = true;
        countEl.textContent = "";
        createError.textContent = "";
        markSign();
        drawPreviews();
        nameInput.focus({ preventScroll: true });
      } else {
        grid.hidden = false;
        layoutBtn.dataset.on = "false";
        arrange(true);
      }
    }

    createBtn.addEventListener("click", () => setCreate(!createOn));
    // Layout or Vault leave the create screen
    layoutBtn.addEventListener("click", () => createOn && setCreate(false), true);
    vaultBtn.addEventListener("click", () => createOn && setCreate(false), true);

    // ---- Right-click / long-press: flip the card to its back, and back again ----
    function flip(index) {
      const card = cards[index];
      const flipped = !card.classList.contains("is-flipped");
      card.classList.toggle("is-flipped", flipped);
      card.querySelector(".card-inner").setAttribute("aria-hidden", String(flipped));
      card.querySelector(".card-face-back").setAttribute("aria-hidden", String(!flipped));
    }
    cards.forEach((card) => card.querySelector(".card-face-back").setAttribute("aria-hidden", "true"));

    grid.addEventListener("contextmenu", (e) => {
      const card = e.target.closest(".char-card");
      if (!card) return;
      e.preventDefault();
      // Laid out, the back is already shown beside every card: no flipping
      if (!deckView) return;
      select(Number(card.dataset.index), { scroll: false });
      flip(Number(card.dataset.index));
    });

    // Phones: hold a finger on a card for half a second
    let pressTimer = null;
    let pressStart = null;
    grid.addEventListener("touchstart", (e) => {
      const card = e.target.closest(".char-card");
      if (!card || e.touches.length !== 1 || !deckView) return;
      pressStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      pressTimer = setTimeout(() => {
        pressTimer = null;
        longPressFired = true;
        select(Number(card.dataset.index), { scroll: false });
        flip(Number(card.dataset.index));
      }, 500);
    }, { passive: true });
    const cancelPress = () => {
      if (pressTimer) clearTimeout(pressTimer);
      pressTimer = null;
    };
    // Lifting the finger after a long-press would also count as a tap: swallow it.
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

    // Start with the deck, the most recently played character on top
    arrange(true);
    if (characters.length) {
      const recent = byRecency()[0];
      cards[recent].classList.add("is-selected");
      cards[recent].setAttribute("aria-selected", "true");
      selected = recent;
      // Ready to play straight away with Enter
      cards[recent].focus({ preventScroll: true, focusVisible: false });
    }
  });
})();
