"""Remove near-white studio backdrops from carousel source JPGs → transparent PNGs."""

from __future__ import annotations

import collections
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "images" / "subtypes"

SOURCES: dict[str, list[tuple[str, str]]] = {
    "appliances": [
        ("refrigerator", "public/images/products/appliances/refrigerator.jpg"),
        ("washing-machine", "public/images/products/appliances/washing-machine.jpg"),
        ("air-fryer", "public/images/products/appliances/air-fryer.jpg"),
        ("dishwasher", "public/images/products/appliances/dishwasher.jpg"),
        ("freezer", "public/images/products/appliances/freezer.jpg"),
        ("slow-cooker", "public/images/products/appliances/slow-cooker.jpg"),
        ("vacuum", "public/images/products/appliances/vacuum.jpg"),
        ("air-purifier", "public/images/products/appliances/air-purifier.jpg"),
        ("coffee-maker", "public/images/products/appliances/coffee-maker.jpg"),
        ("microwave", "public/images/products/appliances/microwave.jpg"),
    ],
    "electronics": [
        ("phone", "public/images/products/electronics/phone.jpg"),
        ("laptop", "public/images/products/electronics/laptop.jpg"),
        ("tablet", "public/images/products/electronics/tablet.jpg"),
        ("headphones", "public/images/products/electronics/headphones.jpg"),
        ("earbuds", "public/images/products/electronics/earbuds.jpg"),
        ("monitor", "public/images/products/electronics/monitor.jpg"),
        ("smartwatch", "public/images/products/electronics/smartwatch.jpg"),
        ("speaker", "public/images/products/electronics/speaker.jpg"),
        ("camera", "public/images/products/electronics/camera.jpg"),
        ("gaming", "public/images/products/electronics/gaming.jpg"),
    ],
    "kitchen": [
        ("cookware", "public/images/products/kitchen/cookware.jpg"),
        ("blender", "public/images/products/kitchen/blender.jpg"),
        ("coffee-machine", "public/images/products/kitchen/coffee-machine.jpg"),
        ("knife-set", "public/images/products/kitchen/knife-set.jpg"),
        ("stand-mixer", "public/images/products/kitchen/stand-mixer.jpg"),
        ("cutting-board", "public/images/products/kitchen/cutting-board.jpg"),
        ("kettle", "public/images/products/kitchen/kettle.jpg"),
        ("bakeware", "public/images/products/kitchen/bakeware.jpg"),
        ("food-storage", "public/images/products/kitchen/food-storage.jpg"),
        ("organizer", "public/images/products/kitchen/organizer.jpg"),
    ],
    "footwear": [
        ("running-shoe", "public/images/products/footwear/running-shoe.jpg"),
        ("sneaker", "public/images/products/footwear/canvas-sneaker.jpg"),
        ("trail-runner", "public/images/products/footwear/trail-runner.jpg"),
        ("hiking-boot", "public/images/products/footwear/hiking-boot.jpg"),
        ("sandal", "public/images/products/footwear/sandal.jpg"),
        ("loafer", "public/images/products/footwear/loafer.jpg"),
        ("winter-boot", "public/images/products/footwear/winter-boot.jpg"),
        ("training-shoe", "public/images/products/footwear/training-shoe.jpg"),
        ("casual-shoe", "public/images/products/footwear/casual-shoe.jpg"),
        ("dress-shoe", "public/images/products/footwear/dress-shoe.jpg"),
    ],
    "beauty": [
        ("hair-dryer", "public/images/products/beauty/hair-dryer.jpg"),
        ("facial-cleansing-brush", "public/images/products/beauty/facial-cleansing-brush.jpg"),
        ("electric-shaver", "public/images/products/beauty/electric-shaver.jpg"),
        ("skincare-fridge", "public/images/products/beauty/skincare-fridge.jpg"),
        ("curling-iron", "public/images/products/beauty/curling-iron.jpg"),
        ("hair-straightener", "public/images/products/beauty/hair-straightener.jpg"),
        ("led-mirror", "public/images/products/beauty/led-mirror.jpg"),
        ("massage-tool", "public/images/products/beauty/massage-tool.jpg"),
        ("manicure-kit", "public/images/products/beauty/manicure-kit.jpg"),
        ("grooming-kit", "public/images/products/beauty/grooming-kit.jpg"),
    ],
    "accessories": [
        ("wallet", "public/images/products/accessories/wallet.jpg"),
        ("backpack", "public/images/products/accessories/backpack.jpg"),
        ("phone-case", "public/images/products/accessories/phone-case.jpg"),
        ("sunglasses", "public/images/products/accessories/sunglasses.jpg"),
        ("crossbody-bag", "public/images/products/accessories/crossbody-bag.jpg"),
        ("watch-band", "public/images/products/accessories/watch-band.jpg"),
        ("charging-cable", "public/images/products/accessories/charging-cable.jpg"),
        ("laptop-sleeve", "public/images/products/accessories/laptop-sleeve.jpg"),
        ("wireless-charger", "public/images/products/accessories/wireless-charger.jpg"),
        ("travel-organizer", "public/images/products/accessories/travel-organizer.jpg"),
    ],
    "automotive": [
        ("dash-cam", "public/images/products/automotive/dash-cam.jpg"),
        ("phone-mount", "public/images/products/automotive/phone-mount.jpg"),
        ("floor-mats", "public/images/products/automotive/floor-mats.jpg"),
        ("tire-inflator", "public/images/products/automotive/tire-inflator.jpg"),
        ("car-vacuum", "public/images/products/automotive/car-vacuum.jpg"),
        ("battery-charger", "public/images/products/automotive/battery-charger.jpg"),
        ("seat-cover", "public/images/products/automotive/seat-cover.jpg"),
        ("wipers", "public/images/products/automotive/wipers.jpg"),
        ("tool-kit", "public/images/products/automotive/tool-kit.jpg"),
        ("jump-starter", "public/images/products/automotive/jump-starter.jpg"),
    ],
    "outdoors": [
        ("hiking-backpack", "public/images/products/outdoors/hiking-backpack.jpg"),
        ("tent", "public/images/products/outdoors/tent.jpg"),
        ("sleeping-bag", "public/images/products/outdoors/sleeping-bag.jpg"),
        ("camp-stove", "public/images/products/outdoors/camp-stove.jpg"),
        ("water-bottle", "public/images/products/outdoors/water-bottle.jpg"),
        ("lantern", "public/images/products/outdoors/lantern.jpg"),
        ("outdoor-chair", "public/images/products/outdoors/outdoor-chair.jpg"),
        ("cooler", "public/images/products/outdoors/cooler.jpg"),
        ("picnic-blanket", "public/images/products/outdoors/picnic-blanket.jpg"),
        ("travel-bag", "public/images/products/outdoors/travel-bag.jpg"),
    ],
    "home": [
        ("blanket", "public/images/products/home/blanket.jpg"),
        ("table-lamp", "public/images/products/home/table-lamp.jpg"),
        ("storage-bins", "public/images/products/home/storage-bins.jpg"),
        ("throw-pillow", "public/images/products/home/throw-pillow.jpg"),
        ("air-purifier", "public/images/products/home/air-purifier.jpg"),
        ("wall-clock", "public/images/products/home/wall-clock.jpg"),
        ("diffuser", "public/images/products/home/diffuser.jpg"),
        ("curtains", "public/images/products/home/curtains.jpg"),
        ("rug", "public/images/products/home/rug.jpg"),
        ("organizer", "public/images/products/home/organizer.jpg"),
    ],
}


def color_dist(a: tuple[int, int, int], b: tuple[int, int, int]) -> int:
    return abs(a[0] - b[0]) + abs(a[1] - b[1]) + abs(a[2] - b[2])


def remove_backdrop(im: Image.Image, threshold: int = 48) -> Image.Image:
    """Flood-fill near-white / near-gray backdrop from edges → alpha 0."""
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    assert px is not None

    edge_samples: list[tuple[int, int, int]] = []
    step_x = max(1, w // 40)
    step_y = max(1, h // 40)
    for x in range(0, w, step_x):
        edge_samples.append(px[x, 0][:3])
        edge_samples.append(px[x, h - 1][:3])
    for y in range(0, h, step_y):
        edge_samples.append(px[0, y][:3])
        edge_samples.append(px[w - 1, y][:3])

    bright = [c for c in edge_samples if sum(c) / 3 > 200]
    if not bright:
        bright = edge_samples
    bg = tuple(int(sum(c[i] for c in bright) / len(bright)) for i in range(3))

    visited = [[False] * h for _ in range(w)]
    q: collections.deque[tuple[int, int]] = collections.deque()

    def try_push(x: int, y: int) -> None:
        if x < 0 or y < 0 or x >= w or y >= h or visited[x][y]:
            return
        r, g, b, _a = px[x, y]
        if color_dist((r, g, b), bg) <= threshold and sum((r, g, b)) / 3 > 175:
            visited[x][y] = True
            q.append((x, y))

    for x in range(w):
        try_push(x, 0)
        try_push(x, h - 1)
    for y in range(h):
        try_push(0, y)
        try_push(w - 1, y)

    while q:
        x, y = q.popleft()
        r, g, b, _a = px[x, y]
        px[x, y] = (r, g, b, 0)
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            try_push(nx, ny)

    # Soften remaining near-white fringe
    for x in range(w):
        for y in range(h):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            d = color_dist((r, g, b), bg)
            brightness = sum((r, g, b)) / 3
            if d < threshold + 20 and brightness > 210:
                fade = max(0, min(255, int(255 * (d / (threshold + 20)))))
                px[x, y] = (r, g, b, fade)

    return im


def tight_crop(im: Image.Image, pad: int = 12) -> Image.Image:
    """Crop to non-transparent content, pad to square, resize to 512."""
    bbox = im.getbbox()
    if not bbox:
        return im
    l, t, r, b = bbox
    l = max(0, l - pad)
    t = max(0, t - pad)
    r = min(im.width, r + pad)
    b = min(im.height, b + pad)
    cropped = im.crop((l, t, r, b))
    side = max(cropped.width, cropped.height)
    out = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    ox = (side - cropped.width) // 2
    oy = (side - cropped.height) // 2
    out.paste(cropped, (ox, oy), cropped)
    return out.resize((512, 512), Image.Resampling.LANCZOS)


def main() -> None:
    made = 0
    missing: list[str] = []
    for cat, items in SOURCES.items():
        dest_dir = OUT / cat
        dest_dir.mkdir(parents=True, exist_ok=True)
        for slug, src in items:
            src_path = ROOT / src
            if not src_path.exists():
                missing.append(src)
                continue
            cleaned = tight_crop(remove_backdrop(Image.open(src_path)))
            out_path = dest_dir / f"{slug}.png"
            cleaned.save(out_path, "PNG", optimize=True)
            made += 1
            print(f"OK {out_path.relative_to(ROOT)} ({out_path.stat().st_size // 1024}KB)")

    print(f"\nCreated {made} transparent PNGs")
    if missing:
        print("MISSING:", missing)
        raise SystemExit(1)


if __name__ == "__main__":
    main()
