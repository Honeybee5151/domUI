# domUI

Game UI pieces, starting with the **character select screen**.

## Character select cards

Each character is shown as a trading card:

- **Top:** the character's name and **level**, their **HP**, and their **birthsign** symbol in a badge
  at the top right. The sign's name only appears when you hover over the badge.
- **Picture:** a wide 3:2 picture box taking about 43% of the card's height, the same
  proportions as a standard 63 × 88 mm trading card.
- **Abilities:** each ability with a small "Ability" tag, its name and a short
  description, under the picture.
- **Bottom:** a small info row, starting with the date the character was created.
  More info lines can be added later.

The card's colours all come from the birthsign's colour.

Pick a card by clicking or tapping it, or with the arrow keys.

**Right-click** a card, or hold a finger on it for half a second on a phone, to see the
character's items: **Equipment** (4 slots), **Inventory** (8 slots) and **Backpack**
(8 slots, only if the character has one), 20 slots in total. Hover a slot to see the
item's name. Esc, the close button or a click outside closes it. The page fires a
`characterselected` event (`detail: { index, character }`) when a card is chosen.

## Characters and birthsigns

- `characters.js` lists the classes in the game's order:

  ```js
  { name: "Rogue", birthsign: "sign-1", level: 1, hp: 800, created: "2026-11-06",
    abilities: [{ name: "Ability name", text: "What it does." }],
    image: "art/classes/rogue.png" }
  ```

  `image` is the class sprite. Pixel art stays crisp at any size. Use `null` to show a
  placeholder silhouette.

- `items.js` sets the slot counts and the equipment slot names (Weapon, Ability, Armor,
  Ring), and holds the placeholder items. Each character in `characters.js` has
  `equipment`, `inventory` and `backpack` lists, where `null` is an empty slot and
  `backpack: null` means no backpack.

- `birthsigns.js` holds the 8 birthsigns: `id`, `name`, `color`, `shade` and an optional
  `icon` image. Without an icon, the badge shows a small gem in the sign's colour.

The birthsign names, the sign given to each class, the levels, the HP values, the created
dates, the abilities and the items are placeholders for now.

## Running

It's a static page: open `index.html` in a browser, or serve the folder, for
example with `npx serve .`.
