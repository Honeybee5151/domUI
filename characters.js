/**
 * Character roster for the character select screen, in the game's order.
 *
 *   name       - shown at the top of the card
 *   birthsign  - id from birthsigns.js; shown as the badge in the top-right
 *   image      - path to the character's sprite (e.g. "art/classes/rogue.png"),
 *                or null for a placeholder silhouette. Pixel art stays crisp at any size.
 *
 * The birthsign for each class is a PLACEHOLDER (cycled through the 8 signs):
 * set the real one per character.
 */
window.CHARACTERS = [
  { name: "Rogue", birthsign: "sign-1", image: null },
  { name: "Archer", birthsign: "sign-2", image: null },
  { name: "Wizard", birthsign: "sign-3", image: null },
  { name: "Priest", birthsign: "sign-4", image: null },
  { name: "Warrior", birthsign: "sign-5", image: null },
  { name: "Knight", birthsign: "sign-6", image: null },
  { name: "Paladin", birthsign: "sign-7", image: null },
  { name: "Assassin", birthsign: "sign-8", image: null },
  { name: "Necromancer", birthsign: "sign-1", image: null },
  { name: "Huntress", birthsign: "sign-2", image: null },
  { name: "Mystic", birthsign: "sign-3", image: null },
  { name: "Trickster", birthsign: "sign-4", image: null },
  { name: "Sorcerer", birthsign: "sign-5", image: null },
  { name: "Ninja", birthsign: "sign-6", image: null },
  { name: "Tribesman", birthsign: "sign-7", image: null }
];
