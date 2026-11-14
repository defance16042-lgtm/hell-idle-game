from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "assets" / "monsters" / "parallel_three_kingdoms"
SIZE = (768, 512)
# Six restrained scale pulses; the runtime separately moves the wave leftward across the stage.
FRAME_SCALES = (0.72, 0.84, 0.94, 1.00, 0.90, 0.72)
SOURCES = {
    "lu_bu": "lu_bu.png",
    "li_ru": "li_ru.png",
    "fan_chou": "fan_chou.png",
    "zhang_ji": "zhang_ji.png",
}


def make_frame(source: Image.Image, scale: float) -> Image.Image:
    width, height = round(SIZE[0] * scale), round(SIZE[1] * scale)
    frame = source.resize((width, height), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    canvas.alpha_composite(frame, ((SIZE[0] - width) // 2, (SIZE[1] - height) // 2))
    return canvas


def main() -> None:
    for hero, filename in SOURCES.items():
        source_path = ROOT / "attack_vfx_sources" / filename
        target_dir = ROOT / f"{hero}_attack_wave"
        if not source_path.is_file():
            raise FileNotFoundError(source_path)
        with Image.open(source_path) as opened:
            source = opened.convert("RGBA").resize(SIZE, Image.Resampling.LANCZOS)
        target_dir.mkdir(parents=True, exist_ok=True)
        for index, scale in enumerate(FRAME_SCALES, start=1):
            out = target_dir / f"frame_{index:02d}.png"
            make_frame(source, scale).save(out, format="PNG", optimize=True)
            print(out.relative_to(ROOT), out.stat().st_size)


if __name__ == "__main__":
    main()
