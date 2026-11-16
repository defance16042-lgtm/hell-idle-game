from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "assets" / "monsters" / "parallel_three_kingdoms"
OTHER_HEROES = ("li_ru", "lu_bu", "fan_chou", "zhang_ji")
FRAME_COUNT = 6
ALPHA_THRESHOLD = 8
PADDING = 4


def find_largest_alpha_component(image: Image.Image) -> tuple[list[int], tuple[int, int, int, int]]:
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
                min_x, max_x = min(min_x, cx), max(max_x, cx)
                min_y, max_y = min(min_y, cy), max(max_y, cy)
                for nx, ny in (
                    (cx - 1, cy - 1), (cx, cy - 1), (cx + 1, cy - 1),
                    (cx - 1, cy),                         (cx + 1, cy),
                    (cx - 1, cy + 1), (cx, cy + 1), (cx + 1, cy + 1),
                ):
                    if 0 <= nx < width and 0 <= ny < height:
                        neighbor = ny * width + nx
                        if not visited[neighbor] and pixels[nx, ny] >= ALPHA_THRESHOLD:
                            visited[neighbor] = 1
                            queue.append((nx, ny))
            if len(component) > len(best_pixels):
                best_pixels = component
                best_bbox = (min_x, min_y, max_x + 1, max_y + 1)

    if not best_bbox:
        raise ValueError("找不到人物主體透明區")
    left, top, right, bottom = best_bbox
    bbox = (max(0, left - PADDING), max(0, top - PADDING),
            min(width, right + PADDING), min(height, bottom + PADDING))
    return best_pixels, bbox


def trim_file(path: Path, isolate_subject: bool = False) -> None:
    with Image.open(path) as opened:
        image = opened.convert("RGBA")
        component, bbox = find_largest_alpha_component(image)
        if isolate_subject:
            # 高順：保留人物連通的主體輪廓，清除同張圖內分離的鄰近物件。
            isolated = Image.new("RGBA", image.size, (0, 0, 0, 0))
            source_pixels, target_pixels = image.load(), isolated.load()
            width = image.width
            for offset in component:
                target_pixels[offset % width, offset // width] = source_pixels[offset % width, offset // width]
            cropped = isolated.crop(bbox)
        else:
            # 其他武將維持原本只縮緊透明留白的處理，不改變既有圖像內容。
            cropped = image.crop(bbox)
    cropped.save(path, format="PNG", optimize=True)
    print(f"{path.relative_to(ROOT)}: {image.size} -> {cropped.size} bbox={bbox}")


def trim_if_present(path: Path, isolate_subject: bool = False) -> None:
    # 已改用原創 SVG 的武將不再保留舊 PNG；打包時略過不存在的舊素材。
    if not path.is_file():
        print(f"skip missing legacy asset: {path.relative_to(ROOT)}")
        return
    trim_file(path, isolate_subject=isolate_subject)


def main() -> None:
    # 舊版高順 PNG 已由原創 SVG 立繪與攻擊刀氣取代；僅在舊素材仍存在時才整理。
    trim_if_present(ROOT / "gao_shun-general.png", isolate_subject=True)
    for index in range(1, FRAME_COUNT + 1):
        trim_if_present(ROOT / "gao_shun_attack" / f"frame_{index:02d}.png", isolate_subject=True)

    for hero in OTHER_HEROES:
        directory = ROOT / f"{hero}_attack"
        for index in range(1, FRAME_COUNT + 1):
            trim_if_present(directory / f"frame_{index:02d}.png")


if __name__ == "__main__":
    main()
