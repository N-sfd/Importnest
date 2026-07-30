"""
1) Install new Importnest logos (light / dark / header) from the provided sheet.
2) Rebuild round-carousel subtype tiles: remove studio backdrops (white OR gray),
   composite onto a soft navy-tinted square fill, so circles never show a
   floating rectangular plate.
"""

from __future__ import annotations

import collections
import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ASSETS = Path(
    r"C:\Users\nazia\.cursor\projects\e-projects-AI-Projects-Importnest\assets"
)
BRAND = ROOT / "public" / "brand"
OUT = ROOT / "public" / "images" / "subtypes"

# Soft brand-tinted fill (light navy mist) — fills the square edge-to-edge so
# object-fit:cover circles never reveal a plate or letterbox.
CIRCLE_FILL = (238, 242, 247, 255)  # #EEF2F7
NAVY = (0, 33, 71)  # #002147 approx from brand

LOGO_SHEET = (
    ASSETS
    / "c__Users_nazia_AppData_Roaming_Cursor_User_workspaceStorage_c4507f022c3b1d74886588f94ed8f17a_images_n_logo3-964683c8-2622-43d7-9b2f-b13ff3a73a22.png"
)
LOGO_SHEET_ALT = (
    ASSETS
    / "c__Users_nazia_AppData_Roaming_Cursor_User_workspaceStorage_c4507f022c3b1d74886588f94ed8f17a_images_n_logo1-a35376b6-5f3d-415c-bea1-d19b4b25e234.png"
)

# Source JPGs for carousel subtypes (same map as make-subtype-transparent.py)
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


def color_dist(a: tuple[int, ...], b: tuple[int, ...]) -> int:
    return abs(a[0] - b[0]) + abs(a[1] - b[1]) + abs(a[2] - b[2])


def is_backdrop(rgb: tuple[int, int, int], bg: tuple[int, int, int], threshold: int) -> bool:
    """True for near-white OR near-gray studio plates matching the edge backdrop."""
    r, g, b = rgb
    brightness = (r + g + b) / 3
    # Near-white / light-gray studio
    if brightness >= 175 and color_dist(rgb, bg) <= threshold:
        return True
    # Mid-gray plates (common on home/furniture shots)
    if 120 <= brightness <= 210 and abs(r - g) < 18 and abs(g - b) < 18 and color_dist(rgb, bg) <= threshold + 12:
        return True
    return False


def remove_backdrop(im: Image.Image, threshold: int = 55) -> Image.Image:
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    assert px is not None

    edge_samples: list[tuple[int, int, int]] = []
    step_x = max(1, w // 50)
    step_y = max(1, h // 50)
    for x in range(0, w, step_x):
        edge_samples.append(px[x, 0][:3])
        edge_samples.append(px[x, h - 1][:3])
    for y in range(0, h, step_y):
        edge_samples.append(px[0, y][:3])
        edge_samples.append(px[w - 1, y][:3])

    # Prefer bright/gray edge samples as backdrop reference
    candidates = [c for c in edge_samples if (c[0] + c[1] + c[2]) / 3 > 140]
    if not candidates:
        candidates = edge_samples
    bg = tuple(int(sum(c[i] for c in candidates) / len(candidates)) for i in range(3))

    visited = [[False] * h for _ in range(w)]
    q: collections.deque[tuple[int, int]] = collections.deque()

    def try_push(x: int, y: int) -> None:
        if x < 0 or y < 0 or x >= w or y >= h or visited[x][y]:
            return
        r, g, b, _a = px[x, y]
        if is_backdrop((r, g, b), bg, threshold):  # type: ignore[arg-type]
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

    # Soft fringe cleanup
    for x in range(w):
        for y in range(h):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            if is_backdrop((r, g, b), bg, threshold + 18) and (r + g + b) / 3 > 160:  # type: ignore[arg-type]
                d = color_dist((r, g, b), bg)  # type: ignore[arg-type]
                fade = max(0, min(255, int(255 * (d / (threshold + 25)))))
                px[x, y] = (r, g, b, fade)

    return im


def composite_on_fill(cutout: Image.Image, size: int = 512, pad_ratio: float = 0.10) -> Image.Image:
    """Place cutout centered on a solid brand-tinted square — fills the circle when covered."""
    bbox = cutout.getbbox()
    if not bbox:
        base = Image.new("RGBA", (size, size), CIRCLE_FILL)
        return base

    cropped = cutout.crop(bbox)
    max_side = int(size * (1 - pad_ratio * 2))
    scale = min(max_side / cropped.width, max_side / cropped.height)
    nw = max(1, int(cropped.width * scale))
    nh = max(1, int(cropped.height * scale))
    resized = cropped.resize((nw, nh), Image.Resampling.LANCZOS)

    base = Image.new("RGBA", (size, size), CIRCLE_FILL)
    # Soft radial wash of navy at very low alpha for brand depth
    wash = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(wash)
    for i, alpha in enumerate((18, 10, 4)):
        inset = i * 40
        draw.ellipse(
            [inset, inset, size - 1 - inset, size - 1 - inset],
            fill=(NAVY[0], NAVY[1], NAVY[2], alpha),
        )
    wash = wash.filter(ImageFilter.GaussianBlur(radius=12))
    base = Image.alpha_composite(base, wash)

    ox = (size - nw) // 2
    oy = (size - nh) // 2
    base.paste(resized, (ox, oy), resized)
    return base.convert("RGB")  # opaque JPEG-friendly PNG without alpha plate edges


def content_bbox_excluding_bg(im: Image.Image, bg_thresh: int = 245) -> tuple[int, int, int, int] | None:
    """Find non-near-white content bbox (for splitting logo sheets)."""
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    assert px is not None
    min_x, min_y, max_x, max_y = w, h, 0, 0
    found = False
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 10:
                continue
            if r > bg_thresh and g > bg_thresh and b > bg_thresh:
                continue
            # Also skip pure navy plate detection later — keep non-white
            found = True
            min_x = min(min_x, x)
            min_y = min(min_y, y)
            max_x = max(max_x, x)
            max_y = max(max_y, y)
    if not found:
        return None
    return (min_x, min_y, max_x + 1, max_y + 1)


def make_transparent_from_white(im: Image.Image, thresh: int = 248) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    assert px is not None
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r >= thresh and g >= thresh and b >= thresh:
                px[x, y] = (r, g, b, 0)
    return im


def split_logo_sheet(path: Path) -> tuple[Image.Image, Image.Image]:
    """Split stacked light (top) / dark (bottom) logo sheet into two crops."""
    sheet = Image.open(path).convert("RGBA")
    w, h = sheet.size
    mid = h // 2
    top = sheet.crop((0, 0, w, mid))
    bottom = sheet.crop((0, mid, w, h))

    # Trim each to content
    def trim(im: Image.Image) -> Image.Image:
        # For dark version, remove only pure white outer margins if any;
        # for light, make white transparent then getbbox.
        bb = content_bbox_excluding_bg(im, 250)
        if not bb:
            return im
        pad = 8
        l, t, r, b = bb
        l = max(0, l - pad)
        t = max(0, t - pad)
        r = min(im.width, r + pad)
        b = min(im.height, b + pad)
        return im.crop((l, t, r, b))

    light = trim(top)
    dark = trim(bottom)
    return light, dark


def crop_header_no_tagline(full: Image.Image) -> Image.Image:
    """Keep icon + IMPORTNEST wordmark; drop the tagline row underneath."""
    # Tagline sits in the lower ~22% of the lockup on these sheets.
    h = full.height
    cut = int(h * 0.72)
    header = full.crop((0, 0, full.width, cut))
    bb = content_bbox_excluding_bg(header, 250)
    if bb:
        pad = 6
        l, t, r, b = bb
        header = header.crop(
            (max(0, l - pad), max(0, t - pad), min(header.width, r + pad), min(header.height, b + pad))
        )
    return make_transparent_from_white(header, 250)


def install_logos() -> dict[str, float]:
    BRAND.mkdir(parents=True, exist_ok=True)
    sheet = LOGO_SHEET if LOGO_SHEET.exists() else LOGO_SHEET_ALT
    if not sheet.exists():
        raise SystemExit(f"Logo sheet not found: {sheet}")

    light, dark = split_logo_sheet(sheet)

    light_full = make_transparent_from_white(light, 250)
    # Dark version sits on navy — keep as-is but trim; don't wipe navy to transparent.
    dark_full = dark.convert("RGBA")

    header = crop_header_no_tagline(light_full)

    paths = {
        "light": BRAND / "importnest-logo-light.png",
        "dark": BRAND / "importnest-logo-dark.png",
        "header": BRAND / "importnest-header-logo-v3.png",
        "header_legacy": BRAND / "importnest-header-logo-v2.png",
        "transparent": BRAND / "logo9-transparent.png",
        "on_dark": BRAND / "logo9-on-dark.png",
    }

    light_full.save(paths["light"], "PNG", optimize=True)
    dark_full.save(paths["dark"], "PNG", optimize=True)
    header.save(paths["header"], "PNG", optimize=True)
    # Keep BrandMark paths working — overwrite the live header/full assets.
    shutil.copyfile(paths["header"], paths["header_legacy"])
    light_full.save(paths["transparent"], "PNG", optimize=True)
    dark_full.save(paths["on_dark"], "PNG", optimize=True)

    aspects = {
        "header": header.width / max(1, header.height),
        "light": light_full.width / max(1, light_full.height),
        "dark": dark_full.width / max(1, dark_full.height),
    }
    print(f"Logo sheet: {sheet.name}")
    print(f"  header {header.size} aspect={aspects['header']:.2f} -> {paths['header'].name}")
    print(f"  light  {light_full.size} aspect={aspects['light']:.2f}")
    print(f"  dark   {dark_full.size} aspect={aspects['dark']:.2f}")
    return aspects


def rebuild_subtype_tiles() -> None:
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
            cutout = remove_backdrop(Image.open(src_path))
            final = composite_on_fill(cutout, size=512, pad_ratio=0.12)
            out = dest / f"{slug}.png"
            final.save(out, "PNG", optimize=True)
            made += 1
            print(f"OK {out.relative_to(ROOT)} ({out.stat().st_size // 1024}KB)")
    print(f"\nRebuilt {made} circle tiles")
    if missing:
        print("MISSING:", missing)
        raise SystemExit(1)


def main() -> None:
    aspects = install_logos()
    # Write aspect hint for BrandMark update
    hint = ROOT / "scripts" / ".logo-aspects.txt"
    hint.write_text(
        f"headerAspect={aspects['header']:.4f}\n"
        f"horizontalAspect={aspects['light']:.4f}\n"
        f"darkAspect={aspects['dark']:.4f}\n",
        encoding="utf-8",
    )
    rebuild_subtype_tiles()


if __name__ == "__main__":
    main()
