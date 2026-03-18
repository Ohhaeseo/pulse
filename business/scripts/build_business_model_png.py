from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent.parent.parent
OUT = ROOT / "images" / "PULSE_비즈니스모델.png"

WIDTH = 1600
HEIGHT = 2000

BG = "#F6F2EA"
TEXT = "#1E2430"
MUTED = "#5B6576"
WHITE = "#FFFFFF"
ARROW = "#CC8A42"
OUTLINE = "#D9D0C3"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    path = Path(r"C:\Windows\Fonts\malgunbd.ttf" if bold else r"C:\Windows\Fonts\malgun.ttf")
    return ImageFont.truetype(str(path), size=size)


def shadowed_box(base: Image.Image, xy, radius, fill, outline=OUTLINE):
    shadow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    x1, y1, x2, y2 = xy
    sdraw.rounded_rectangle((x1 + 8, y1 + 10, x2 + 8, y2 + 10), radius=radius, fill=(24, 30, 40, 28))
    base.alpha_composite(shadow)
    draw = ImageDraw.Draw(base)
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=2)


def center_multiline(draw, text, fnt, box, fill=TEXT, spacing=10):
    x1, y1, x2, y2 = box
    bbox = draw.multiline_textbbox((0, 0), text, font=fnt, spacing=spacing, align="center")
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    x = x1 + (x2 - x1 - w) / 2
    y = y1 + (y2 - y1 - h) / 2
    draw.multiline_text((x, y), text, font=fnt, fill=fill, spacing=spacing, align="center")


def draw_arrow(draw, x, y1, y2):
    draw.line((x, y1, x, y2), fill=ARROW, width=7)
    draw.polygon([(x - 14, y2 - 20), (x + 14, y2 - 20), (x, y2)], fill=ARROW)


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    base = Image.new("RGBA", (WIDTH, HEIGHT), BG)
    draw = ImageDraw.Draw(base)

    # background accents
    draw.ellipse((-160, -120, 520, 420), fill="#EFE2C8")
    draw.ellipse((1080, 1500, 1720, 2140), fill="#E8D9C9")
    draw.rounded_rectangle((1130, 104, 1480, 186), radius=30, fill="#C7783D")

    title_font = font(72, True)
    subtitle_font = font(28, False)
    badge_font = font(24, True)
    node_title_font = font(26, True)
    node_body_font = font(36, False)
    footer_font = font(28, False)

    draw.text((110, 92), "PULSE 비즈니스 모델", font=title_font, fill=TEXT)
    center_multiline(
        draw,
        "외식업 자영업자에게 고객 분석, 콘텐츠 제작, 실행 제안을 통합 제공하고\n"
        "월 구독형 SaaS를 기반으로 Pro 업셀링과 B2B 확장으로 사업화합니다.",
        subtitle_font,
        (110, 182, 1040, 290),
        fill=MUTED,
        spacing=10,
    )
    center_multiline(draw, "AI Marketing SaaS", badge_font, (1130, 104, 1480, 186), fill=WHITE)

    nodes = [
        ("고객", "외식업 자영업자", "#E9E2D8"),
        ("제공가치", "리뷰 기반 고객 분석\n숏폼 홍보 콘텐츠 제작\n실행 제안 대시보드", "#E26E2B"),
        ("이용 방식", "웹 기반 SaaS\n간편 업로드\n반복 사용형 서비스", "#DCEBE8"),
        ("수익 모델", "Free 체험형\nBasic 월 구독형\nPro 고급 기능", "#D8E4F5"),
        ("확장 모델", "PoC 매장 확보\n유료 전환 확대\nB2B 제휴 및\n프랜차이즈 확장", "#F3DEC2"),
    ]

    center_x = WIDTH // 2
    box_w = 760
    box_h = 150
    start_y = 350
    gap = 44

    for idx, (title, body, chip_color) in enumerate(nodes):
        x1 = center_x - box_w // 2
        x2 = center_x + box_w // 2
        y1 = start_y + idx * (box_h + gap)
        y2 = y1 + box_h

        shadowed_box(base, (x1, y1, x2, y2), radius=36, fill=WHITE)
        draw = ImageDraw.Draw(base)

        # title chip centered above node body area
        chip_w = 240
        chip_h = 54
        chip_x1 = center_x - chip_w // 2
        chip_x2 = center_x + chip_w // 2
        chip_y1 = y1 - 18
        chip_y2 = chip_y1 + chip_h
        draw.rounded_rectangle((chip_x1, chip_y1, chip_x2, chip_y2), radius=22, fill=chip_color)
        center_multiline(draw, title, node_title_font, (chip_x1, chip_y1, chip_x2, chip_y2), fill=WHITE if idx == 1 else TEXT, spacing=6)

        center_multiline(draw, body, node_body_font, (x1 + 60, y1 + 42, x2 - 60, y2 - 24), fill=TEXT, spacing=12)

        if idx < len(nodes) - 1:
            draw_arrow(draw, center_x, y2 + 6, y2 + gap - 10)

    footer_y1 = 1760
    footer_y2 = 1896
    shadowed_box(base, (250, footer_y1, 1350, footer_y2), radius=30, fill="#FFFDF8")
    draw = ImageDraw.Draw(base)
    center_multiline(
        draw,
        "PULSE는 고객 이해 → 제작 → 실행을 하나의 흐름으로 통합하고,\n구독형 SaaS와 확장형 수익모델로 성장합니다.",
        footer_font,
        (300, footer_y1 + 18, 1300, footer_y2 - 16),
        fill=TEXT,
        spacing=10,
    )

    base.convert("RGB").save(OUT, quality=95)
    print(OUT)


if __name__ == "__main__":
    build()
