/**
 * Character roster for the character select screen, in the game's order.
 *
 *   name       - shown at the top of the card
 *   birthsign  - id from birthsigns.js; shown as the badge in the top-right
 *   hp         - hit points, shown just left of the birthsign badge
 *   created    - date the character was made, "YYYY-MM-DD"; shown small on the bottom row
 *   abilities  - list of { name, text } shown in the ability section under the picture
 *   image      - path to the character's sprite (e.g. "art/classes/rogue.png"),
 *                or null for a placeholder silhouette. Pixel art stays crisp at any size.
 *
 * The birthsign for each class (cycled through the 8 signs), the HP (800 for everyone),
 * the created date and the abilities are PLACEHOLDERS: set the real values per character.
 */
// Placeholder until each class has its real abilities
const PLACEHOLDER_ABILITIES = [
  { name: "Ability name", text: "Short description of what this ability does goes here." }
];

window.CHARACTERS = [
  { name: "Rogue", birthsign: "sign-1", hp: 800, created: "2026-11-06", abilities: PLACEHOLDER_ABILITIES, image: null },
  { name: "Archer", birthsign: "sign-2", hp: 800, created: "2026-11-06", abilities: PLACEHOLDER_ABILITIES, image: null },
  { name: "Wizard", birthsign: "sign-3", hp: 800, created: "2026-11-06", abilities: PLACEHOLDER_ABILITIES, image: null },
  { name: "Priest", birthsign: "sign-4", hp: 800, created: "2026-11-06", abilities: PLACEHOLDER_ABILITIES, image: null },
  { name: "Warrior", birthsign: "sign-5", hp: 800, created: "2026-11-06", abilities: PLACEHOLDER_ABILITIES, image: null },
  { name: "Knight", birthsign: "sign-6", hp: 800, created: "2026-11-06", abilities: PLACEHOLDER_ABILITIES, image: null },
  { name: "Paladin", birthsign: "sign-7", hp: 800, created: "2026-11-06", abilities: PLACEHOLDER_ABILITIES, image: null },
  { name: "Assassin", birthsign: "sign-8", hp: 800, created: "2026-11-06", abilities: PLACEHOLDER_ABILITIES, image: null },
  { name: "Necromancer", birthsign: "sign-1", hp: 800, created: "2026-11-06", abilities: PLACEHOLDER_ABILITIES, image: null },
  { name: "Huntress", birthsign: "sign-2", hp: 800, created: "2026-11-06", abilities: PLACEHOLDER_ABILITIES, image: null },
  { name: "Mystic", birthsign: "sign-3", hp: 800, created: "2026-11-06", abilities: PLACEHOLDER_ABILITIES, image: null },
  { name: "Trickster", birthsign: "sign-4", hp: 800, created: "2026-11-06", abilities: PLACEHOLDER_ABILITIES, image: null },
  { name: "Sorcerer", birthsign: "sign-5", hp: 800, created: "2026-11-06", abilities: PLACEHOLDER_ABILITIES, image: null },
  { name: "Ninja", birthsign: "sign-6", hp: 800, created: "2026-11-06", abilities: PLACEHOLDER_ABILITIES, image: null },
  { name: "Tribesman", birthsign: "sign-7", hp: 800, created: "2026-11-06", abilities: PLACEHOLDER_ABILITIES, image: null }
];
