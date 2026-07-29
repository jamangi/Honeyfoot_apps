from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
ORIGINAL = ROOT / "public/honeyfoot-cards/home-care-character-v1.png"
EDITED = ROOT / "public/honeyfoot-cards/home-care-character-v1-edit.png"
OUTPUT = ROOT / "public/honeyfoot-cards/home-care-character-v1-comparison.png"

BACKGROUNDS = [
    ("Garden Room", "#dce8d8"),
    ("Velvet Dusk", "#3b3444"),
    ("Quiet Linen", "#e9e2d6"),
    ("Deep Charcoal", "#202322"),
]

PANEL_WIDTH, PANEL_HEIGHT = 800, 650
HEADER_HEIGHT = 64
ART_SIZE = (330, 495)


def font(size, bold=False):
    candidates = ["arialbd.ttf" if bold else "arial.ttf", "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"]
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            pass
    return ImageFont.load_default()


title_font = font(24, bold=True)
label_font = font(17, bold=True)
small_font = font(13)
original = Image.open(ORIGINAL).convert("RGBA").resize(ART_SIZE, Image.Resampling.LANCZOS)
edited = Image.open(EDITED).convert("RGBA").resize(ART_SIZE, Image.Resampling.LANCZOS)
sheet = Image.new("RGB", (PANEL_WIDTH * 2, PANEL_HEIGHT * 2), "white")

for index, (background_name, background_color) in enumerate(BACKGROUNDS):
    panel = Image.new("RGBA", (PANEL_WIDTH, PANEL_HEIGHT), background_color)
    draw = ImageDraw.Draw(panel)
    light_text = background_name in {"Velvet Dusk", "Deep Charcoal"}
    primary = "#f8f1eb" if light_text else "#26342d"
    secondary = "#d9ccd3" if light_text else "#65736b"
    draw.text((24, 17), background_name, fill=primary, font=title_font)
    draw.text((72, 63), "ORIGINAL · v1", fill=secondary, font=label_font)
    draw.text((469, 63), "EDITED · v1-edit", fill=secondary, font=label_font)
    panel.alpha_composite(original, (34, 102))
    panel.alpha_composite(edited, (431, 102))
    draw.line((400, 56, 400, PANEL_HEIGHT - 24), fill=(255, 255, 255, 70) if light_text else (38, 52, 45, 45), width=1)
    draw.text((24, PANEL_HEIGHT - 31), "Identical scale and placement · transparency shown against live theme color", fill=secondary, font=small_font)
    sheet.paste(panel.convert("RGB"), ((index % 2) * PANEL_WIDTH, (index // 2) * PANEL_HEIGHT))

sheet.save(OUTPUT, quality=95)
print(OUTPUT)
