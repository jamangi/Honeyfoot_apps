from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/honeyfoot-cards/home-care-character-v1.png"
OUTPUT = ROOT / "public/honeyfoot-cards/home-care-character-cleaned-v5.png"
PREVIEW = ROOT / "public/honeyfoot-cards/home-care-character-cleaned-v5-preview.png"


def rectangle(mask, x0, y0, x1, y1):
    mask[y0:y1, x0:x1] = True


image = Image.open(SOURCE).convert("RGBA")
pixels = np.array(image)
rgb = pixels[:, :, :3].astype(np.int16)
alpha = pixels[:, :, 3]
height, width = alpha.shape

# These deliberately exclude the olive blouse and the rest of the illustration.
hair_region = np.zeros((height, width), dtype=bool)
rectangle(hair_region, 245, 32, 500, 125)   # crown
rectangle(hair_region, 135, 95, 285, 365)   # viewer-left curls
rectangle(hair_region, 385, 75, 535, 350)   # viewer-right curls

heel_region = np.zeros((height, width), dtype=bool)
rectangle(heel_region, 635, 1100, 705, 1150)

target_region = hair_region | heel_region
green_excess = rgb[:, :, 1] - np.maximum(rgb[:, :, 0], rgb[:, :, 2])

# The old matte's opaque green remnants have a characteristic 5-15 point excess.
remove = target_region & (alpha > 0) & (green_excess >= 5)

cleaned = pixels.copy()
cleaned[remove, 3] = 0

# Despill only immediately adjacent surviving edge pixels. Their color is retained,
# except that an impossible green-channel excess is brought back to a neutral edge.
remove_mask = Image.fromarray((remove * 255).astype(np.uint8), "L")
dilated = np.array(remove_mask.filter(ImageFilter.MaxFilter(5))) > 0
despill = target_region & dilated & ~remove & (alpha > 0) & (green_excess >= 1)
neutral_green = np.maximum(cleaned[:, :, 0], cleaned[:, :, 2])
cleaned[:, :, 1][despill] = neutral_green[despill]

Image.fromarray(cleaned, "RGBA").save(OUTPUT)

# A four-background proof sheet makes residual halos and over-trimming apparent.
candidate = Image.fromarray(cleaned, "RGBA")
thumb_size = (384, 576)
thumb = candidate.resize(thumb_size, Image.Resampling.LANCZOS)
backgrounds = [(246, 241, 231, 255), (91, 73, 72, 255), (207, 220, 207, 255), (32, 35, 34, 255)]
proof = Image.new("RGBA", (thumb_size[0] * 2, thumb_size[1] * 2))
for index, color in enumerate(backgrounds):
    panel = Image.new("RGBA", thumb_size, color)
    panel.alpha_composite(thumb)
    proof.alpha_composite(panel, ((index % 2) * thumb_size[0], (index // 2) * thumb_size[1]))
proof.convert("RGB").save(PREVIEW)

print(f"Removed {int(remove.sum())} contaminated pixels; despilled {int(despill.sum())} edge pixels.")
print(OUTPUT)
print(PREVIEW)
