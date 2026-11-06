/**
 * The player's characters, shown as cards on the character select screen.
 *
 *   name       - the name the player gave the character; shown at the top of the card
 *   class      - the character's class (Rogue, Archer, ...); shown small at the bottom
 *   birthsign  - id from birthsigns.js; shown as the badge in the top-right
 *   level      - shown right after the name, in the top bar
 *   hp         - hit points, shown just left of the birthsign badge
 *   created    - date the character was made, "YYYY-MM-DD"; shown small on the bottom row
 *   lastPlayed - when the character was last played; the most recent one is the card
 *                shown when the screen opens
 *   abilities  - list of { name, text } shown in the ability section under the picture
 *   equipment, inventory, backpack - item slots shown on right-click (see items.js);
 *                backpack: null means the character has no backpack
 *   screenshot - path to the in-game screenshot the player took for this card; shown in
 *                the picture box (screenshotCaption shows when hovering it)
 *   image      - used when there is no screenshot: the character's sprite, or null for the class's sprite from
 *                CLASS_IMAGES below (or a placeholder silhouette if that is null too)
 *
 * Everything below is PLACEHOLDER data (names, birthsigns, levels, HP, dates, abilities
 * and items) so the screen has a full roster to search through.
 */
// Placeholder until each class has its real abilities
const PLACEHOLDER_ABILITIES = [
  { name: "Ability name", text: "Short description of what this ability does goes here." }
];

// Placeholder loadouts until each character has real items
const I = window.PLACEHOLDER_ITEMS;
const LOADOUTS = {
  melee: { equipment: [I.sword, null, I.armor, I.ring], inventory: [I.hp, I.hp, I.key, null, null, null, null, null] },
  ranged: { equipment: [I.bow, null, I.cloak, null], inventory: [I.hp, I.mp, null, null, null, null, null, null] },
  magic: { equipment: [I.staff, I.tome, I.robe, I.ring], inventory: [I.mp, I.mp, I.hp, I.gem, null, null, null, null] }
};
const BACKPACK = [I.gem, I.hp, I.key, null, null, null, null, null];

// One sprite per class, e.g. rogue: "art/classes/rogue.png"; null shows a silhouette
window.CLASS_IMAGES = {
  rogue: null, archer: null, wizard: null, priest: null, warrior: null,
  knight: null, paladin: null, assassin: null, necromancer: null, huntress: null,
  mystic: null, trickster: null, sorcerer: null, ninja: null, tribesman: null
};

const KIT = {
  Rogue: "melee", Archer: "ranged", Wizard: "magic", Priest: "magic", Warrior: "melee",
  Knight: "melee", Paladin: "melee", Assassin: "melee", Necromancer: "magic", Huntress: "ranged",
  Mystic: "magic", Trickster: "melee", Sorcerer: "magic", Ninja: "melee", Tribesman: "ranged"
};

// [name, class, birthsign, level, hp, created, has backpack]
const ROSTER = [
  ["Ashwyn", "Rogue", "sign-1", 20, 720, "2026-01-14", true],
  ["Brakka", "Warrior", "sign-5", 18, 900, "2026-02-03", false],
  ["Corvin", "Wizard", "sign-3", 20, 670, "2026-02-21", true],
  ["Della", "Priest", "sign-4", 12, 610, "2026-03-09", false],
  ["Eskil", "Archer", "sign-2", 9, 640, "2026-03-30", false],
  ["Fenna", "Huntress", "sign-8", 15, 700, "2026-04-18", true],
  ["Gorrik", "Knight", "sign-6", 20, 950, "2026-05-02", true],
  ["Hollis", "Paladin", "sign-7", 7, 820, "2026-05-27", false],
  ["Isolde", "Necromancer", "sign-5", 16, 650, "2026-06-11", true],
  ["Jory", "Trickster", "sign-1", 11, 690, "2026-07-04", false],
  ["Kestrel", "Assassin", "sign-8", 19, 710, "2026-07-22", false],
  ["Lumi", "Mystic", "sign-3", 4, 600, "2026-08-15", false],
  ["Morwen", "Sorcerer", "sign-2", 13, 680, "2026-09-01", true],
  ["Nyx", "Ninja", "sign-6", 20, 740, "2026-09-19", true],
  ["Orrin", "Tribesman", "sign-7", 6, 760, "2026-10-08", false],
  ["Pell", "Rogue", "sign-4", 2, 600, "2026-10-21", false],
  ["Quill", "Archer", "sign-3", 17, 690, "2026-10-30", true],
  ["Rook", "Knight", "sign-2", 1, 800, "2026-11-06", false]
];

// When each character was last played (the most recent one is shown by default)
const LAST_PLAYED = {
  Corvin: "2026-11-06T18:40", Nyx: "2026-11-05T21:10", Ashwyn: "2026-11-04T19:05",
  Gorrik: "2026-11-02T16:30", Quill: "2026-11-01T12:00", Isolde: "2026-10-29T20:15",
  Kestrel: "2026-10-27T22:45", Brakka: "2026-10-25T14:20", Morwen: "2026-10-22T17:50",
  Fenna: "2026-10-18T11:05", Rook: "2026-11-06T09:00"
};

// 30 more generated characters so the deck is full (same every load: seeded random)
(function addGeneratedCharacters() {
  let seed = 20261106;
  const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  const pick = (list) => list[Math.floor(rand() * list.length)];
  const START = ["Al", "Bel", "Cor", "Da", "El", "Fa", "Gil", "Ha", "Ir", "Ka", "Lo", "Mi", "Nor", "Os", "Pa", "Ra", "Sel", "Ta", "Ul", "Va", "Wen", "Yr", "Za"];
  const END = ["ric", "wyn", "dra", "mir", "ven", "nor", "lis", "thas", "rin", "dor", "ka", "sha", "len", "vik", "mund", "ra", "zel", "bek", "nia", "tor"];
  const classes = Object.keys(KIT);
  const used = new Set(ROSTER.map((r) => r[0]));
  const pad = (n) => String(n).padStart(2, "0");
  for (let i = 0; i < 30; i++) {
    let name;
    do {
      name = pick(START) + pick(END);
    } while (used.has(name));
    used.add(name);
    const cls = classes[i % classes.length];
    const month = 1 + Math.floor(rand() * 10);
    const created = `2026-${pad(month)}-${pad(1 + Math.floor(rand() * 28))}`;
    ROSTER.push([name, cls, `sign-${1 + Math.floor(rand() * 8)}`, 1 + Math.floor(rand() * 20),
      600 + Math.floor(rand() * 36) * 10, created, rand() < 0.45]);
    // Played some time between its creation and today
    const day = 1 + Math.floor(rand() * 27);
    const pm = Math.min(10, month + Math.floor(rand() * 3));
    LAST_PLAYED[name] = `2026-${pad(pm)}-${pad(day)}T${pad(8 + Math.floor(rand() * 14))}:${pad(Math.floor(rand() * 60))}`;
  }
})();

window.CHARACTERS = ROSTER.map(([name, cls, birthsign, level, hp, created, hasBackpack]) => ({
  name,
  class: cls,
  birthsign,
  level,
  hp,
  created,
  lastPlayed: LAST_PLAYED[name] || created,
  // The player's in-game screenshot for this character's card (placeholder scenes for now)
  screenshot: `art/screenshots/${name.toLowerCase()}.png`,
  screenshotCaption: (window.SCREENSHOT_CAPTIONS || {})[name] || "",
  abilities: PLACEHOLDER_ABILITIES,
  ...LOADOUTS[KIT[cls]],
  backpack: hasBackpack ? BACKPACK : null,
  image: null
}));
