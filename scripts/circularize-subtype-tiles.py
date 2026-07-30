"""Rebuild round-carousel tiles as true circular PNGs (transparent outside the circle).

Uses center-cover crop of the product photo into a circle so studio white/gray
plates never appear as a square-in-circle. No reliance on imperfect cutouts.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "images" / "subtypes"
SIZE = 512

# Soft brand mist behind the product inside the circle (shows only if the
# cover crop leaves tiny edge gaps — usually fully covered).
FILL = (238, 242, 247, 255)

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


def cover_square(im: Image.Image, size: int) -> Image.Image:
    """Center-crop to square then resize — product fills the frame (cover)."""
    im = im.convert("RGBA")
    w, h = im.size
    side = min(w, h)
    # Slight zoom (1.08x) to push studio borders out of the circle edge
    zoom_side = int(side / 1.08)
    left = (w - zoom_side) // 2
    top = (h - zoom_side) // 2
    cropped = im.crop((left, top, left + zoom_side, top + zoom_side))
    return cropped.resize((size, size), Image.Resampling.LANCZOS)


def circularize(im: Image.Image, size: int = SIZE) -> Image.Image:
    covered = cover_square(im, size)
    # Soft brand fill under the photo (hidden when cover is opaque)
    base = Image.new("RGBA", (size, size), FILL)
    base.paste(covered, (0, 0), covered if covered.mode == "RGBA" else None)

    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    # Inset by 1px so antialiased edge doesn't clip against CSS circle
    draw.ellipse([1, 1, size - 2, size - 2], fill=255)

    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(base, (0, 0))
    out.putalpha(mask)
    return out


def main() -> None:
    made = 0
    missing: list[str] = []
    for cat, items in SOURCES.items():
        dest = OUT / cat
        dest.mkdir(parents=True, exist_ok=True)
        for slug, src in items:
            src_path = ROOT / src
            if not src_path.exists():
                missing.append(src)
                continue
            out = dest / f"{slug}.png"
            circularize(Image.open(src_path)).save(out, "PNG", optimize=True)
            made += 1
            print(f"OK {out.relative_to(ROOT)}")
    print(f"\nCircularized {made} tiles")
    if missing:
        print("MISSING:", missing)
        raise SystemExit(1)


if __name__ == "__main__":
    main()
