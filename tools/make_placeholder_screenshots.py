"""
Generates PLACEHOLDER "screenshots" for the character cards: a small pixel-art scene per
character (place + situation), so the cards can be previewed before players take real
in-game screenshots. All art here is original stand-in art.

    python3 tools/make_placeholder_screenshots.py roster.json characters/art/screenshots

roster.json: [{"name": ..., "cls": ...}, ...]  (dump of window.CHARACTERS)
Writes <name>.png (96x64, 3:2 like the card's picture) and captions.js next to them.
"""
import json
import random
import sys
from pathlib import Path

from PIL import Image

W, H = 96, 64


def rgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def shade(c, f):
    return tuple(max(0, min(255, int(v * f))) for v in c)


# ---- Places -------------------------------------------------------------------------
PLACES = {
    "grove": dict(name="the Mossy Grove", sky=["#9fd3e8", "#c6e6ef"], ground=["#5f9e3c", "#558f35", "#6aab44"], props="tree"),
    "dunes": dict(name="the Sunscar Dunes", sky=["#f2c27c", "#f7dca8"], ground=["#d9b36a", "#cfa65c", "#e2bf78"], props="cactus"),
    "snow": dict(name="the Frostpine Reach", sky=["#b9cde0", "#dbe6f0"], ground=["#eef3f7", "#dfe7ee", "#f7fafc"], props="pine"),
    "cave": dict(name="the Glimmer Caves", sky=["#1d1a26", "#28243a"], ground=["#4a4458", "#423d50", "#544e63"], props="crystal"),
    "beach": dict(name="the Saltwind Shore", sky=["#8fd0f0", "#bfe6f7"], ground=["#ecd9a0", "#e3cd8f", "#f2e2b0"], props="water"),
    "dungeon": dict(name="the Sunken Halls", sky=["#2a2230", "#352b3c"], ground=["#6b5f63", "#62575b", "#776a6e"], props="torch"),
    "lava": dict(name="the Ember Wastes", sky=["#3a1c1c", "#5a2620"], ground=["#4a3a36", "#42332f", "#57453f"], props="lava"),
}

# ---- Stand-in class characters (same as the card previews) ------------------------------
BODY = [
    "....HHHH....", "...HHHHHH...", "..HHhhhhHH..", "..HhSSSShH..", "..HhSESEhH..", "..HhSSSShH..",
    "...CCCCCC...", "..CCCBBCCC..", ".SCCCBBCCCS.", "...CCCCCC...", "...CC..CC...", "...DD..DD...",
]
WEAPONS = {
    "sword": [(10, 1), (10, 2), (10, 3), (10, 4), (10, 5), (9, 6), (10, 6), (11, 6), (10, 7)],
    "bow": [(10, 2), (11, 3), (11, 4), (11, 5), (11, 6), (11, 7), (10, 8)],
    "staff": [(10, 1), (10, 2), (10, 3), (10, 4), (10, 5), (10, 6), (10, 7), (10, 8), (10, 9)],
}
WEAPON_COL = {"sword": "#cfd5dc", "bow": "#8a5a2b", "staff": "#7a4e2a"}
CLASSES = {
    "rogue": ("#3e4a3a", "#2a3328", "#556b4a", "#a33a2a", "sword"),
    "archer": ("#4f7a3a", "#36562a", "#6b8f4a", "#7a5a2a", "bow"),
    "wizard": ("#3a4fa3", "#2a3a7a", "#5a6fc4", "#d4b24a", "staff"),
    "priest": ("#e8e4da", "#bdb7a8", "#f2efe6", "#d4a23a", "staff"),
    "warrior": ("#7a7f88", "#55595f", "#a33a2a", "#5a3a1a", "sword"),
    "knight": ("#9aa1ab", "#6c727b", "#5a6372", "#c4a23a", "sword"),
    "paladin": ("#d4b24a", "#a3862a", "#e8d6a0", "#ffffff", "sword"),
    "assassin": ("#2a2f4a", "#1a1e33", "#8a2a3a", "#4a4f6a", "sword"),
    "necromancer": ("#3a2a4a", "#261a33", "#5a3a6b", "#9adf6a", "staff"),
    "huntress": ("#a35a2a", "#7a3e1a", "#8a3a8a", "#d4a23a", "bow"),
    "mystic": ("#6b9a3a", "#4a7028", "#7a6bb3", "#e8e4da", "staff"),
    "trickster": ("#c4c8cf", "#8f949c", "#6b7078", "#3a3e44", "sword"),
    "sorcerer": ("#a32a2a", "#6e1a1a", "#c43a2a", "#2a2a2a", "staff"),
    "ninja": ("#2a3340", "#1a2029", "#38465a", "#c43a2a", "sword"),
    "tribesman": ("#a3622a", "#7a441a", "#8a5a3a", "#e0b04a", "bow"),
}

# ---- Original stand-in creatures and props (strings of pixels, '.' = empty) -------------
SLIME = ["..####..", ".######.", "##o##o##", "########", ".######."]
BAT = ["#......#", "##.##.##", ".######.", "..#oo#..", "...##..."]
SHROOM = [".######.", "##o##o##", "########", "..#oo#..", "..####.."]
GHOST = [".####.", "######", "#o##o#", "######", "#.##.#"]
BOSS = [
    "....######....", "..##########..", ".############.", "###oo####oo###", "###oo####oo###",
    "##############", "###.######.###", ".###########..", "..##.####.##..", "...#..##..#...",
]
CHEST = ["######", "#oooo#", "######", "#o##o#", "######"]
BAG = ["..##..", ".#oo#.", "######", "######", ".####."]
FIRE = ["..o...", ".ooo..", ".oyo.o", "oyyyoo", "#####."]
TREE = ["..###..", ".#####.", "#######", ".#####.", "...#...", "...#..."]
PINE = ["...#...", "..###..", ".#####.", "..###..", ".#####.", "#######", "...#..."]
CACTUS = ["..#..", "#.#..", "#.#.#", "###.#", "..###", "..#.."]
CRYSTAL = ["..#..", ".###.", ".#o#.", "#####", ".###."]
TORCH = [".o.", "ooo", ".#.", ".#.", ".#."]

ENEMY_COLORS = {
    "grove": ["#7cc74a", "#9a6bc4"], "dunes": ["#c48a3a", "#d4603a"], "snow": ["#7ab8e0", "#a8c8e8"],
    "cave": ["#7f5fc4", "#4ac8b0"], "beach": ["#4aa8d8", "#e07a5a"], "dungeon": ["#b8b0a8", "#8fd06a"],
    "lava": ["#e0602a", "#f0a030"],
}


def stamp(img, pattern, x, y, colors, scale=1):
    """colors: {'#': main, 'o': accent, 'y': highlight}"""
    for ry, row in enumerate(pattern):
        for rx, ch in enumerate(row):
            if ch == "." or ch not in colors:
                continue
            for sy in range(scale):
                for sx in range(scale):
                    px, py = x + rx * scale + sx, y + ry * scale + sy
                    if 0 <= px < W and 0 <= py < H:
                        img.putpixel((px, py), colors[ch])


def character(img, cls, x, y):
    hood, shade_h, cloak, belt, weapon = CLASSES[cls]
    pal = {"H": hood, "h": shade_h, "C": cloak, "B": belt, "S": "#f0c8a0", "E": "#1a1a1a", "D": "#3a2a1e"}
    # soft shadow
    for dx in range(2, 10):
        img.putpixel((x + dx, y + 12), shade(img.getpixel((x + dx, y + 12)), 0.7))
    for ry, row in enumerate(BODY):
        for rx, ch in enumerate(row):
            if ch in pal:
                img.putpixel((x + rx, y + ry), rgb(pal[ch]))
    for i, (wx, wy) in enumerate(WEAPONS[weapon]):
        col = "#7fd4ff" if weapon == "staff" and i == 0 else WEAPON_COL[weapon]
        img.putpixel((x + wx, y + wy), rgb(col))
    return weapon


def scene(rnd, place_key, cls):
    p = PLACES[place_key]
    img = Image.new("RGB", (W, H))
    horizon = rnd.randint(14, 20)
    sky_a, sky_b = rgb(p["sky"][0]), rgb(p["sky"][1])
    for y in range(horizon):
        t = y / max(1, horizon - 1)
        c = tuple(int(sky_a[i] + (sky_b[i] - sky_a[i]) * t) for i in range(3))
        for x in range(W):
            img.putpixel((x, y), c)
    g = [rgb(c) for c in p["ground"]]
    for y in range(horizon, H):
        for x in range(W):
            img.putpixel((x, y), g[0] if rnd.random() < 0.8 else rnd.choice(g[1:]))
    # horizon line + far details
    for x in range(W):
        img.putpixel((x, horizon), shade(g[0], 0.8))
    if place_key in ("grove", "snow", "dunes", "beach"):
        cloud = rgb("#ffffff") if place_key != "dunes" else rgb("#fff3d6")
        for _ in range(rnd.randint(1, 3)):
            cx, cy = rnd.randint(0, W - 14), rnd.randint(1, max(2, horizon - 8))
            stamp(img, [".####...", "########", ".######."], cx, cy, {"#": cloud})
    if place_key == "beach":
        for y in range(horizon + 1, horizon + 10):
            for x in range(W):
                img.putpixel((x, y), rgb("#3a9ad0") if (x + y) % 9 else rgb("#9fd8f0"))
    if place_key == "lava":
        for _ in range(4):
            lx, ly = rnd.randint(0, W - 16), rnd.randint(horizon + 4, H - 6)
            for dx in range(rnd.randint(8, 16)):
                for dy in range(2):
                    if lx + dx < W:
                        img.putpixel((lx + dx, ly + dy), rgb("#f07a2a") if (dx + dy) % 3 else rgb("#ffd04a"))
    if place_key == "dungeon":
        for y in range(horizon + 1, H, 6):
            for x in range(W):
                img.putpixel((x, y), shade(g[0], 0.75))
        for y in range(horizon + 1, H):
            for x in range((y // 6 % 2) * 6, W, 12):
                img.putpixel((x, y), shade(g[0], 0.75))
    # props
    prop = {"tree": (TREE, "#3f7a2a", "#5a3a1e"), "pine": (PINE, "#3f6a4a", "#5a3a1e"),
            "cactus": (CACTUS, "#4a8a3a", "#4a8a3a"), "crystal": (CRYSTAL, "#8f7ae0", "#d0c4ff"),
            "torch": (TORCH, "#5a4030", "#ffb030"), "water": (None, None, None), "lava": (CRYSTAL, "#3a2a26", "#f07a2a")}[p["props"]]
    if prop[0]:
        for _ in range(rnd.randint(3, 6)):
            px = rnd.randint(0, W - 8)
            py = rnd.choice([rnd.randint(horizon - 5, horizon + 2), rnd.randint(H - 10, H - 6)])
            stamp(img, prop[0], px, py, {"#": rgb(prop[1]), "o": rgb(prop[2])})
    return img, horizon


SITUATIONS = ["battle", "battle", "swarm", "boss", "loot", "camp", "explore"]


def make(name, cls, seed):
    rnd = random.Random(seed)
    # even mix of places: cycle through them, shuffled per run of 7
    order = list(PLACES)
    random.Random(seed // 7919 // 7).shuffle(order)
    place_key = order[(seed // 7919) % len(order)]
    situation = rnd.choice(SITUATIONS)
    img, horizon = scene(rnd, place_key, cls)
    cx, cy = rnd.randint(18, 34), rnd.randint(horizon + 12, H - 16)
    ecol = [rgb(c) for c in ENEMY_COLORS[place_key]]
    shot_col = rgb({"staff": "#8fe0ff", "bow": "#e8d6a0", "sword": "#ffffff"}[CLASSES[cls][4]])
    caption = ""

    def shots_to(tx, ty, n=3):
        for k in range(1, n + 1):
            sx = cx + 12 + (tx - cx - 12) * k // (n + 1)
            sy = cy + 6 + (ty - cy - 6) * k // (n + 1)
            for d in (0, 1):
                if 0 <= sx + d < W and 0 <= sy < H:
                    img.putpixel((sx + d, sy), shot_col)

    if situation in ("battle", "swarm"):
        kinds = [(SLIME, "slimes"), (BAT, "bats"), (SHROOM, "mushrooms"), (GHOST, "ghosts")]
        pattern, label = rnd.choice(kinds)
        n = rnd.randint(2, 3) if situation == "battle" else rnd.randint(4, 6)
        targets = []
        for _ in range(n):
            ex, ey = rnd.randint(52, W - 10), rnd.randint(horizon + 4, H - 8)
            stamp(img, pattern, ex, ey, {"#": ecol[0], "o": rgb("#1a1a1a")})
            targets.append((ex + 3, ey + 2))
        shots_to(*rnd.choice(targets))
        caption = (f"Fighting {label} in {PLACES[place_key]['name']}" if situation == "battle"
                   else f"Surrounded by {label} in {PLACES[place_key]['name']}")
    elif situation == "boss":
        bx, by = rnd.randint(56, 70), rnd.randint(horizon + 2, H - 26)
        stamp(img, BOSS, bx, by, {"#": ecol[1], "o": rgb("#fff1a0")}, scale=2)
        # boss health bar
        for x in range(30, 66):
            img.putpixel((x, 3), rgb("#3a1010"))
            if x < 52:
                img.putpixel((x, 3), rgb("#e03a3a"))
        shots_to(bx + 10, by + 10, 4)
        caption = f"Boss fight in {PLACES[place_key]['name']}"
    elif situation == "loot":
        lx, ly = cx + rnd.randint(16, 30), cy + rnd.randint(-2, 4)
        if rnd.random() < 0.5:
            stamp(img, CHEST, lx, ly, {"#": rgb("#8a5a2b"), "o": rgb("#e0b04a")})
            caption = f"Found a chest in {PLACES[place_key]['name']}"
        else:
            stamp(img, BAG, lx, ly, {"#": rgb("#9a6bc4"), "o": rgb("#3a2a4a")})
            caption = f"Loot drop in {PLACES[place_key]['name']}"
        for dx, dy in ((-2, -3), (7, -2), (3, -5)):  # sparkle
            if 0 <= lx + dx < W and 0 <= ly + dy < H:
                img.putpixel((lx + dx, ly + dy), rgb("#fff6a0"))
    elif situation == "camp":
        fx, fy = cx + 16, cy + 6
        stamp(img, FIRE, fx, fy, {"#": rgb("#5a3a1e"), "o": rgb("#f07a2a"), "y": rgb("#ffd04a")})
        caption = f"Resting by the fire in {PLACES[place_key]['name']}"
    else:
        caption = f"Exploring {PLACES[place_key]['name']}"

    character(img, cls, cx, cy)
    # little HUD: player health bar top-left
    for x in range(3, 23):
        for y in (3, 4):
            img.putpixel((x, y), rgb("#3a1010"))
    hp = rnd.randint(9, 20)
    for x in range(3, 3 + hp):
        for y in (3, 4):
            img.putpixel((x, y), rgb("#e03a3a"))
    return img, caption


def main():
    roster = json.loads(Path(sys.argv[1]).read_text())
    out = Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)
    captions = {}
    for i, c in enumerate(roster):
        img, caption = make(c["name"], c["cls"].lower(), seed=1000 + i * 7919)
        img.save(out / f"{c['name'].lower()}.png", optimize=True)
        captions[c["name"]] = caption
    (out / "captions.js").write_text(
        "// PLACEHOLDER captions for the generated placeholder screenshots\n"
        "window.SCREENSHOT_CAPTIONS = " + json.dumps(captions, indent=2) + ";\n"
    )
    print(f"wrote {len(roster)} screenshots to {out}")


if __name__ == "__main__":
    main()
