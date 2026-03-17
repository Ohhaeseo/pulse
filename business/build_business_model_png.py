from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "images" / "PULSE_비즈니스모델.png"

WIDTH = 1600
HEIGHT = 2000

BG = "#F6F2EA"
TEXT = "#1E2430"
MUTED = "#5B6576"
LINE = "#D8D2C6"
WHITE = "#FFFFFF"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    path = Path(r"C:\Windows\Fonts\malgunbd.ttf" if bold else r"C:\Windows\Fonts\malgun.ttf")
    return ImageFont.truetype(str(path), size=size)


def rounded_box(draw, xy, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def shadowed_card(base: Image.Image, xy, radius, fill):
    shadow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    x1, y1, x2, y2 = xy
    sdraw.rounded_rectangle((x1 + 8, y1 + 10, x2 + 8, y2 + 10), radius=radius, fill=(30, 36, 48, 35))
    base.alpha_composite(shadow)
    draw = ImageDraw.Draw(base)
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=(216, 210, 198, 255), width=2)


def center_text(draw, text, fnt, box, fill=TEXT, spacing=6):
    x1, y1, x2, y2 = box
    bbox = draw.multiline_textbbox((0, 0), text, font=fnt, spacing=spacing, align="center")
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = x1 + (x2 - x1 - tw) / 2
    ty = y1 + (y2 - y1 - th) / 2
    draw.multiline_text((tx, ty), text, font=fnt, fill=fill, spacing=spacing, align="center")


def left_text(draw, text, fnt, xy, fill=TEXT, spacing=6):
    draw.multiline_text(xy, text, font=fnt, fill=fill, spacing=spacing)


def draw_arrow(draw, x, y1, y2, color="#C58E48"):
    draw.line((x, y1, x, y2), fill=color, width=6)
    draw.polygon([(x - 12, y2 - 18), (x + 12, y2 - 18), (x, y2)], fill=color)


def wrap_text(draw, text, fnt, max_width):
    lines = []
    for paragraph in text.split("\n"):
        words = paragraph.split()
        if not words:
            lines.append("")
            continue
        current = words[0]
        for word in words[1:]:
            trial = f"{current} {word}"
            bbox = draw.textbbox((0, 0), trial, font=fnt)
            if bbox[2] - bbox[0] <= max_width:
                current = trial
            else:
                lines.append(current)
                current = word
        lines.append(current)
    return "\n".join(lines)


def fit_multiline_text(draw, text, box, start_size, min_size=18, bold=False, spacing=10):
    x1, y1, x2, y2 = box
    max_width = x2 - x1
    max_height = y2 - y1
    for size in range(start_size, min_size - 1, -1):
        fnt = font(size, bold)
        wrapped = wrap_text(draw, text, fnt, max_width)
        bbox = draw.multiline_textbbox((0, 0), wrapped, font=fnt, spacing=spacing)
        width = bbox[2] - bbox[0]
        height = bbox[3] - bbox[1]
        if width <= max_width and height <= max_height:
            return wrapped, fnt, height
    fnt = font(min_size, bold)
    wrapped = wrap_text(draw, text, fnt, max_width)
    bbox = draw.multiline_textbbox((0, 0), wrapped, font=fnt, spacing=spacing)
    height = bbox[3] - bbox[1]
    return wrapped, fnt, height


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    base = Image.new("RGBA", (WIDTH, HEIGHT), BG)
    draw = ImageDraw.Draw(base)

    # subtle background accents
    draw.ellipse((-180, -120, 460, 360), fill="#EFE2C8")
    draw.ellipse((1150, 1500, 1700, 2150), fill="#E9DDD1")
    draw.rounded_rectangle((1080, 120, 1460, 260), radius=40, fill="#F0E7D8")
    draw.rounded_rectangle((120, 1750, 520, 1870), radius=36, fill="#EFE7DA")

    title_font = font(70, True)
    subtitle_font = font(28, False)
    section_font = font(24, True)
    card_title_font = font(30, True)
    card_body_font = font(24, False)
    small_font = font(22, False)

    draw.text((110, 92), "PULSE 비즈니스 모델", font=title_font, fill=TEXT)
    left_text(
        draw,
        "외식업 자영업자에게 고객 분석, 콘텐츠 제작, 실행 제안을 통합 제공하고\n"
        "월 구독형 SaaS를 기반으로 Pro 업셀링과 B2B 확장으로 사업화합니다.",
        subtitle_font,
        (112, 188),
        fill=MUTED,
        spacing=10,
    )

    # top badge
    rounded_box(draw, (1120, 98, 1470, 182), radius=28, fill="#B96F3D")
    center_text(draw, "AI Marketing SaaS", section_font, (1120, 98, 1470, 182), fill=WHITE)

    # right insight panel
    shadowed_card(base, (1040, 330, 1480, 930), radius=34, fill="#FFF9F1")
    draw = ImageDraw.Draw(base)
    draw.text((1090, 380), "핵심 포인트", font=card_title_font, fill=TEXT)
    insights = [
        "1. 고객은 외식업 자영업자",
        "2. 가치는 고객 이해부터\n실행까지 통합 제공",
        "3. 수익화는\nFree-Basic-Pro 구독 구조",
        "4. 확장은\nPoC, 유료화, B2B 제휴 순서",
    ]
    y = 455
    for item in insights:
        item_box = (1090, y, 1430, y + 92)
        draw.rounded_rectangle(item_box, radius=18, fill="#F2E7D6")
        wrapped, fitted_font, text_h = fit_multiline_text(draw, item, (1112, y + 12, 1408, y + 80), 21, min_size=17, spacing=8)
        text_y = y + 16 + max(0, (64 - text_h) / 2)
        left_text(draw, wrapped, fitted_font, (1112, text_y), fill=TEXT, spacing=8)
        y += 112

    # cards
    cards = [
        ("고객", "외식업 자영업자", "#ECE8E1"),
        ("제공가치", "리뷰 기반 고객 분석\n숏폼 홍보 콘텐츠 제작\n실행 제안 대시보드", "#DA6B2D"),
        ("이용 방식", "웹 기반 SaaS\n간편 업로드\n반복 사용형 서비스", "#E3F0EC"),
        ("수익 모델", "Free 체험형\nBasic 월 구독형\nPro 고급 기능", "#DCE8F7"),
        ("확장 모델", "PoC 매장 확보\n유료 전환 확대\nB2B 제휴 및\n프랜차이즈 확장", "#F4DFC6"),
    ]

    left = 120
    right = 950
    card_h = 228
    gap = 32
    start_y = 340

    for idx, (title, body, color) in enumerate(cards):
        y1 = start_y + idx * (card_h + gap)
        y2 = y1 + card_h
        shadowed_card(base, (left, y1, right, y2), radius=34, fill=WHITE)
        draw = ImageDraw.Draw(base)

        # color band
        rounded_box(draw, (left + 24, y1 + 24, left + 250, y1 + 78), radius=20, fill=color)
        draw.text((left + 48, y1 + 34), title, font=card_title_font, fill=WHITE if idx == 1 else TEXT)

        body_box = (left + 48, y1 + 102, right - 48, y2 - 34)
        wrapped, fitted_font, text_h = fit_multiline_text(draw, body, body_box, 24, min_size=20, spacing=10)
        text_y = body_box[1] + max(0, ((body_box[3] - body_box[1]) - text_h) / 2)
        left_text(draw, wrapped, fitted_font, (body_box[0], text_y), fill=TEXT, spacing=10)

        if idx < len(cards) - 1:
            draw_arrow(draw, (left + right) // 2, y2 + 6, y2 + gap - 8)

    # footer note
    shadowed_card(base, (110, 1770, 1470, 1910), radius=30, fill="#FFFDF8")
    draw = ImageDraw.Draw(base)
    footer_box = (150, 1796, 1430, 1882)
    footer_text = "PULSE는 고객 이해 → 제작 → 실행을 하나의 흐름으로 통합하고, 구독형 SaaS와 확장형 수익모델로 성장합니다."
    wrapped, fitted_font, _ = fit_multiline_text(draw, footer_text, footer_box, 28, min_size=22, spacing=8)
    left_text(draw, wrapped, fitted_font, (150, 1810), fill=TEXT, spacing=8)

    base.convert("RGB").save(OUT, quality=95)
    print(OUT)


if __name__ == "__main__":
    build()
