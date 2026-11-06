/**
 * The game's 8 birthsigns. The card badge (top right) shows only the sign's symbol;
 * its name appears when you hover over it. The card's colours come from the sign's colour.
 *
 *   id     - key used in characters.js
 *   name   - shown only when hovering the badge
 *   color  - the sign's main colour (taken from its icon)
 *   shade  - a darker tone of it, used for the badge background
 *   icon   - path to the sign's icon (e.g. "art/birthsigns/sign-1.png"), or null to
 *            show a simple placeholder gem in the sign's colour
 *
 * Names and icons are PLACEHOLDERS: swap in the real ones. They are listed clockwise
 * from the top of the "Choose a birthsign" ring.
 */
window.BIRTHSIGNS = [
  { id: "sign-1", name: "Sign I", color: "#5fb33a", shade: "#2f7d1d", icon: null },   // green, top
  { id: "sign-2", name: "Sign II", color: "#c9302c", shade: "#8e1428", icon: null },  // red
  { id: "sign-3", name: "Sign III", color: "#c09a48", shade: "#7a5420", icon: null }, // gold
  { id: "sign-4", name: "Sign IV", color: "#2f6fc4", shade: "#1f3a8f", icon: null },  // blue
  { id: "sign-5", name: "Sign V", color: "#7a3a8c", shade: "#3a0a52", icon: null },   // purple, bottom
  { id: "sign-6", name: "Sign VI", color: "#b0403a", shade: "#6e1a2e", icon: null },  // crimson & gold
  { id: "sign-7", name: "Sign VII", color: "#b9c8da", shade: "#6f8299", icon: null }, // white / silver
  { id: "sign-8", name: "Sign VIII", color: "#e2742a", shade: "#a8301a", icon: null } // orange
];
