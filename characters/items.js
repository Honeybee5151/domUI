/**
 * Item slots shown when right-clicking a card (or long-pressing on a phone).
 *
 * Every character has 20 slots in total:
 *   equipment - 4 slots (weapon, ability item, armor, ring)
 *   inventory - 8 slots
 *   backpack  - 8 slots, only for characters that have a backpack
 *
 * An item is { name, color, icon? }:
 *   name  - shown when hovering the slot
 *   color - used for the placeholder item icon
 *   icon  - optional path to the item's image (e.g. "art/items/iron-sword.png")
 * An empty slot is null.
 */
window.SLOT_COUNTS = { equipment: 4, inventory: 8, backpack: 8, chest: 8 };
window.EQUIPMENT_SLOT_NAMES = ["Weapon", "Ability", "Armor", "Ring"];

// Generic PLACEHOLDER items until the real ones are hooked up
window.PLACEHOLDER_ITEMS = {
  sword: { name: "Iron Sword", color: "#c9d1db" },
  bow: { name: "Short Bow", color: "#a8743c" },
  staff: { name: "Oak Staff", color: "#8a5a2b" },
  tome: { name: "Old Tome", color: "#6a4bb3" },
  cloak: { name: "Traveller's Cloak", color: "#5a7a4a" },
  robe: { name: "Cloth Robe", color: "#5a6fc4" },
  armor: { name: "Leather Armor", color: "#8a5a3a" },
  ring: { name: "Copper Ring", color: "#d08a3a" },
  hp: { name: "Health Potion", color: "#d8343a" },
  mp: { name: "Mana Potion", color: "#3a6fd8" },
  key: { name: "Rusty Key", color: "#b8a04a" },
  gem: { name: "Small Gem", color: "#4ac8b0" }
};
