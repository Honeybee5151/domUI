# domUI

Game UI, published as a website on Vercel.

| Page | Path | What it is |
|---|---|---|
| Front page | `/` | Placeholder ("Coming soon") until the real front page is made |
| Character select | `/characters/` | The character cards (this README) |

Everything for the character select lives in `characters/`.

## Character select cards

Each character is shown as a trading card:

- **Top:** the character's name and **level**, their **HP**, and their **birthsign** symbol in a badge
  at the top right. The sign's name only appears when you hover over the badge.
- **Picture:** a wide 3:2 picture box taking about 43% of the card's height, the same
  proportions as a standard 63 × 88 mm trading card.
- **Abilities:** each ability with a small "Ability" tag, its name and a short
  description, under the picture.
- **Bottom:** small info lines: the character's class and the date it was created.
  More lines can be added later.

The card's colours all come from the birthsign's colour.

Pick a card by clicking or tapping it, or with the arrow keys.

**Right-click** a card, or hold a finger on it for half a second on a phone, to see the
character's items: **Equipment** (4 slots), **Inventory** (8 slots) and **Backpack**
(8 slots, only if the character has one), 20 slots in total. Hover a slot to see the
item's name. Esc, the close button or a click outside closes it. The page fires a
`characterselected` event (`detail: { index, character }`) when a card is chosen.

## Characters and birthsigns

- `characters/characters.js` lists the player's characters:

  ```js
  { name: "Ashwyn", class: "Rogue", birthsign: "sign-1", level: 20, hp: 720,
    created: "2026-01-14", abilities: [{ name: "Ability name", text: "What it does." }],
    equipment: [...], inventory: [...], backpack: [...] }
  ```

  `name` is the name the player gave the character, and `class` is shown at the bottom
  of the card. Each class's sprite is set once in `CLASS_IMAGES`, for example
  `rogue: "art/classes/rogue.png"`, with files under `characters/art/`. Pixel art stays
  crisp at any size. `null` shows a placeholder silhouette.

- `characters/items.js` sets the slot counts and the equipment slot names (Weapon, Ability, Armor,
  Ring), and holds the placeholder items. Each character has
  `equipment`, `inventory` and `backpack` lists, where `null` is an empty slot and
  `backpack: null` means no backpack.

- `characters/birthsigns.js` holds the 8 birthsigns: `id`, `name`, `color`, `shade` and an optional
  `icon` image. Without an icon, the badge shows a small gem in the sign's colour.

The birthsign names, the sign given to each class, the levels, the HP values, the created
dates, the abilities and the items are placeholders for now.

## Using the screen

- **Click or tap** a card to select it, or use the arrow keys.
- **Double-click** a card (double-tap on a phone, or Enter) to play. This enters the world
  with that character and fires a `characterplay` event (`detail: { index, character }`)
  that the game can listen for. Until the world is hooked up, it shows an
  "Entering the world" screen with a button to go back.
- **Right-click** a card (hold on a phone) to see its equipment, inventory and backpack.
- **Search** filters the cards by character name or class as you type. Press `/` to jump to
  the search box, and Esc to clear it.
- **Layout** shows each character's backpack to the right of its card.

## Running locally

It's a static site with no build step. Serve the repo folder, for example with
`npx serve .`, and open `http://localhost:3000/characters/`.

## Deploying on Vercel

1. In Vercel, **Add New → Project** and import this repository.
2. Framework preset: **Other**. Leave the build command and output directory empty.
3. Add your domain under **Settings → Domains**.

The character select is then at `https://your-domain/characters/`. `vercel.json` turns on
clean URLs, adds the trailing slash so the page's relative paths work, and makes browsers
always fetch the latest HTML, JS and CSS. Art under `characters/art/` is cached for a day.
