# domUI

Game UI pieces, starting with the **character select screen**.

## Character select cards

Each character is shown as a trading card:

- **Top:** the character's name, with their **birth sign** in a badge at the top right.
- **Middle:** a square window for the character's art.
- **Bottom:** the sign's name.

The card's colours come from the sign's element: fire, earth, air or water.

Pick a card by clicking or tapping it, or with the arrow keys. The page fires a
`characterselected` event (`detail: { index, character }`) when a card is chosen.

## Adding characters

Edit `characters.js`:

```js
{ name: "Character One", birthday: "04-02", image: "art/character-one.png" }
```

- `birthday` is `"MM-DD"`. The birth sign is worked out from it in `zodiac.js`.
- `image` is the character's art. Square works best, and pixel art stays crisp.
  Use `null` to show a placeholder silhouette.

## Running

It's a static page: open `index.html` in a browser, or serve the folder, for
example with `npx serve .`.
