from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "assets" / "monsters" / "parallel_three_kingdoms"
HEROES = ("li_ru", "lu_bu", "fan_chou", "zhang_ji")
FRAME_COUNT = 6
ALPHA_THRESHOLD = 8
PADDING = 4


def largest_alpha_component_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    alpha = image.getchannel("A")
    width, height = image.size
    pixels = alpha.load()
    visited = bytearray(width * height)
    best_size = 0
    best_bbox = None

    for y in range(height):
        for x in range(width):
            offset = y * width + x
            if visited[offset] or pixels[x, y] < ALPHA_THRESHOLD:
                continue

            queue = deque([(x, y)])
            visited[offset] = 1
            size = 0
            min_x = max_x = x
            min_y = max_y = y

            while queue:
                cx, cy = queue.popleft()
                size += 1
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

            if size > best_size:
                best_size = size
                best_bbox = (min_x, min_y, max_x + 1, max_y + 1)

    if not best_bbox:
        raise ValueError("找不到人物主體透明區")

    left, top, right, bottom = best_bbox
    return (
        max(0, left - PADDING),
        max(0, top - PADDING),
        min(width, right + PADDING),
        min(height, bottom + PADDING),
    )


def main() -> None:
    for hero in HEROES:
        directory = ROOT / f"{hero}_attack"
        for index in range(1, FRAME_COUNT + 1):
            path = directory / f"frame_{index:02d}.png"
            with Image.open(path) as opened:
                image = opened.convert("RGBA")
                bbox = largest_alpha_component_bbox(image)
                cropped = image.crop(bbox)
            cropped.save(path, format="PNG", optimize=True)
            print(f"{path.relative_to(ROOT)}: {image.size} -> {cropped.size} bbox={bbox}")


if __name__ == "__main__":
    main()
