/**
 * The player's vault: a list of chests, 8 slots each (see SLOT_COUNTS.chest in items.js).
 * Items use the same { name, color, icon? } shape as character slots; null is empty.
 *
 * PLACEHOLDER contents: some chests partly filled so the Vault screen has something in it.
 */
(function () {
  const I = window.PLACEHOLDER_ITEMS;
  const fill = (...items) => [...items, ...Array(8 - items.length).fill(null)];
  window.VAULT_CHESTS = [
    fill(I.hp, I.hp, I.hp, I.mp, I.mp),
    fill(I.sword, I.bow, I.staff),
    fill(I.gem, I.gem, I.key),
    fill(I.armor, I.robe, I.cloak, I.ring),
    fill(I.tome),
    fill(),
    fill(I.hp, I.gem),
    fill(),
    fill(I.ring, I.ring),
    fill(),
    fill(I.key),
    fill()
  ];
})();
