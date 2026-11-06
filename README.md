# domUI

Game UI pieces, starting with the **character select screen**.

## Character select cards

Each character is shown as a trading card:

- **Top:** the character's name, their **HP**, and their **birthsign** symbol in a badge
  at the top right. The sign's name only appears when you hover over the badge.
- **Picture:** a wide picture box in trading-card proportions, about 55 × 40 mm on a
  63 × 88 mm card.
- **Abilities:** each ability's name and a short description, under the picture.
- **Bottom:** a small info row, starting with the date the character was created.
  More info lines can be added later.

The card's colours all come from the birthsign's colour.

Pick a card by clicking or tapping it, or with the arrow keys. The page fires a
`characterselected` event (`detail: { index, character }`) when a card is chosen.

## Characters and birthsigns

- `characters.js` lists the classes in the game's order:

  ```js
  { name: "Rogue", birthsign: "sign-1", hp: 800, created: "2026-11-06",
    abilities: [{ name: "Ability name", text: "What it does." }],
    image: "art/classes/rogue.png" }
  ```

  `image` is the class sprite. Pixel art stays crisp at any size. Use `null` to show a
  placeholder silhouette.

- `birthsigns.js` holds the 8 birthsigns: `id`, `name`, `color`, `shade` and an optional
  `icon` image. Without an icon, the badge shows a small gem in the sign's colour.

The birthsign names, the sign given to each class, the HP values, the created
dates and the abilities are placeholders for now.

## Running

It's a static page: open `index.html` in a browser, or serve the folder, for
example with `npx serve .`.
