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
- **Picture:** the player's in-game **screenshot** of that character, in a wide 3:2 picture box taking about 43% of the card's height, the same
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

- **Screenshots:** each character's `screenshot` is the in-game screenshot the player
  took for that card, shown edge to edge in the picture box. Its `screenshotCaption`
  appears when you hover the picture. Until players take real ones, every character
  has a generated placeholder scene in `characters/art/screenshots/`. These are made
  by `tools/make_placeholder_screenshots.py` and show the character fighting, finding
  loot, resting or exploring somewhere. If a character has no screenshot, the card
  shows its class sprite instead.

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
- **Layout** deals the deck out, with the back of each card (equipment, inventory,
  backpack) to its right.

## New character

The **New character** button opens the create screen:

- **Class slider:** one card per class, with the chosen one large in the middle and its
  neighbours to each side. It wraps around. Change class with the arrow buttons, the
  arrow keys, a swipe on phones, a tap on a side card or the dots underneath.
- **Name:** 2 to 16 letters (spaces, `'` and `-` are allowed), and it can't be a name you
  already use.
- **Birthsign:** pick one of the 8 symbols. The name shows on hover.
- The chosen card previews your name, class and sign. **Create character** adds the new
  character at level 1 with empty slots, on top of the deck. It fires a
  `charactercreated` event (`detail: { index, character }`) for the game to save it.

## Vault mode

The **Vault** button switches to an easy way to move items between characters and the
vault:

- **Left:** the back of every character's card (equipment, inventory, backpack). The
  search box filters them.
- **Right:** the vault's chests, 8 slots each, staying in view while you scroll.
- **Drag** an item to any slot, on a character or in a chest. Dropping it on a slot that
  already has an item swaps the two. On phones, or by clicking, **tap** an item to pick
  it up, then tap where it goes. Tap it again, or press Esc, to cancel.
- Every move fires an `itemmoved` event (`detail: { from, to, item, swapped }`) for the
  game to save. Slots are named like `c:<character index>:inventory:3` or
  `v:<chest index>:5`.

The chests and their contents are in `characters/vault.js` (placeholders for now). Moves
only last until the page reloads, until the game saves them.

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
