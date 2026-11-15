from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "assets" / "monsters" / "parallel_three_kingdoms"
HEROES = ("li_ru", "lu_bu", "fan_chou", "zhang_ji", "gao_shun")
STANDING_IMAGES = ("gao_shun-general.png",)
FRAME_COUNT = 6
ALPHA_THRESHOLD = 8
PADDING = 4


def isolate_largest_alpha_component(image: Image.Image) -> tuple[Image.Image, tuple[int, int, int, int]]:
    """Keep only the main connected opaque subject, then crop to its tight bounds."""
    alpha = image.getchannel("A")
    width, height = image.size
    pixels = alpha.load()
    visited = bytearray(width * height)
    best_pixels: list[int] = []
    best_bbox = None

    for y in range(height):
        for x in range(width):
            offset = y * width + x
            if visited[offset] or pixels[x, y] < ALPHA_THRESHOLD:
                continue

            queue = deque([(x, y)])
            visited[offset] = 1
            component: list[int] = []
            min_x = max_x = x
            min_y = max_y = y

            while queue:
                cx, cy = queue.popleft()
                component.append(cy * width + cx)
                min_x = min(min_x, cx)
                max_x = max(max_x, cx)
                min_y = min(min_y, cy)
                max_y = max(max_y, cy)

                for nx, ny in (
                    (cx - 1, cy - 1), (cx, cy - 1), (cx + 1, cy - 1),
                    (cx - 1, cy),                         (cx + 1, cy),
                    (cx - 1, cy + 1), (cx, cy + 1), (cx + 1, cy + 1),
                ):
                    if nx < 0 or nx >= width or ny < 0 or ny >= height:
                        continue
                    neighbor = ny * width + nx
                    if visited[neighbor] or pixels[nx, ny] < ALPHA_THRESHOLD:
                        continue
                    visited[neighbor] = 1
                    queue.append((nx, ny))

            if len(component) > len(best_pixels):
                best_pixels = component
                best_bbox = (min_x, min_y, max_x + 1, max_y + 1)

    if not best_bbox:
        raise ValueError("找不到人物主體透明區")

    # Remove detached neighboring objects/effects instead of merely cropping around them.
    isolated = Image.new("RGBA", image.size, (0, 0, 0, 0))
    source_pixels = image.load()
    target_pixels = isolated.load()
    for offset in best_pixels:
        target_pixels[offset % width, offset // width] = source_pixels[offset % width, offset // width]

    left, top, right, bottom = best_bbox
    bbox = (
        max(0, left - PADDING),
        max(0, top - PADDING),
        min(width, right + PADDING),
        min(height, bottom + PADDING),
    )
    return isolated.crop(bbox), bbox


def trim_file(path: Path) -> None:
    with Image.open(path) as opened:
        image = opened.convert("RGBA")
        cropped, bbox = isolate_largest_alpha_component(image)
    cropped.save(path, format="PNG", optimize=True)
    print(f"{path.relative_to(ROOT)}: {image.size} -> {cropped.size} bbox={bbox}")


def main() -> None:
    # 高順站立圖與六張攻擊影格使用相同的主體輪廓隔離及緊密裁切。
    for filename in STANDING_IMAGES:
        trim_file(ROOT / filename)

    for hero in HEROES:
        directory = ROOT / f"{hero}_attack"
        for index in range(1, FRAME_COUNT + 1):
            trim_file(directory / f"frame_{index:02d}.png")


if __name__ == "__main__":
    main()
