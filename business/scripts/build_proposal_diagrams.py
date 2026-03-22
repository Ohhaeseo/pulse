from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent.parent.parent
IMAGES = ROOT / "images"

PROBLEM_OUT = IMAGES / "문제검증자료.png"
BM_OUT = IMAGES / "비즈니스모델.png"
TECH_OUT = IMAGES / "기술차별성설명자료.png"

WIDTH = 1600
HEIGHT = 1200

BG = "#F7F4EE"
NAVY = "#173B7A"
INK = "#1F2937"
MUTED = "#5B6472"
WHITE = "#FFFFFF"
ORANGE = "#F06A3F"
SOFT_ORANGE = "#FDE6DC"
SOFT_BLUE = "#E7EFFB"
SOFT_GREEN = "#E6F4EE"
SOFT_YELLOW = "#FFF2D9"
SOFT_PURPLE = "#EEE7FB"
LINE = "#D6DCE7"
SHADOW = (22, 31, 48, 28)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    path = Path(r"C:\Windows\Fonts\malgunbd.ttf" if bold else r"C:\Windows\Fonts\malgun.ttf")
    return ImageFont.truetype(str(path), size=size)


TITLE_FONT = font(58, True)
SUB_FONT = font(24, False)
CARD_TITLE_FONT = font(28, True)
CARD_BODY_FONT = font(25, False)
CENTER_TITLE_FONT = font(34, True)
CENTER_BODY_FONT = font(28, False)
FOOTER_FONT = font(24, False)
PILL_FONT = font(20, True)


def rounded_box(base: Image.Image, xy, fill, radius=34, outline=LINE, shadow_offset=(8, 10)):
    shadow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    x1, y1, x2, y2 = xy
    sdraw.rounded_rectangle(
        (x1 + shadow_offset[0], y1 + shadow_offset[1], x2 + shadow_offset[0], y2 + shadow_offset[1]),
        radius=radius,
        fill=SHADOW,
    )
    base.alpha_composite(shadow)
    draw = ImageDraw.Draw(base)
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=2)


def center_multiline(draw: ImageDraw.ImageDraw, text: str, fnt, box, fill=INK, spacing=10):
    x1, y1, x2, y2 = box
    bbox = draw.multiline_textbbox((0, 0), text, font=fnt, spacing=spacing, align="center")
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = x1 + (x2 - x1 - tw) / 2
    ty = y1 + (y2 - y1 - th) / 2
    draw.multiline_text((tx, ty), text, font=fnt, fill=fill, spacing=spacing, align="center")


def left_multiline(draw: ImageDraw.ImageDraw, text: str, fnt, box, fill=INK, spacing=8):
    x1, y1, x2, y2 = box
    bbox = draw.multiline_textbbox((0, 0), text, font=fnt, spacing=spacing, align="left")
    th = bbox[3] - bbox[1]
    ty = y1 + (y2 - y1 - th) / 2
    draw.multiline_text((x1, ty), text, font=fnt, fill=fill, spacing=spacing, align="left")


def draw_title(draw: ImageDraw.ImageDraw, title: str, subtitle: str):
    draw.text((90, 70), title, font=TITLE_FONT, fill=INK)
    draw.multiline_text((90, 150), subtitle, font=SUB_FONT, fill=MUTED, spacing=8)


def draw_pill(draw: ImageDraw.ImageDraw, xy, text: str, fill: str, text_fill=INK):
    draw.rounded_rectangle(xy, radius=18, fill=fill)
    center_multiline(draw, text, PILL_FONT, xy, fill=text_fill, spacing=4)


def draw_arrow(draw: ImageDraw.ImageDraw, start, end, fill=NAVY, width=6):
    sx, sy = start
    ex, ey = end
    draw.line((sx, sy, ex, ey), fill=fill, width=width)
    if abs(ex - sx) >= abs(ey - sy):
        direction = 1 if ex > sx else -1
        points = [(ex, ey), (ex - 18 * direction, ey - 10), (ex - 18 * direction, ey + 10)]
    else:
        direction = 1 if ey > sy else -1
        points = [(ex, ey), (ex - 10, ey - 18 * direction), (ex + 10, ey - 18 * direction)]
    draw.polygon(points, fill=fill)


def card(base: Image.Image, xy, title: str, body: str, fill: str = WHITE, accent: str = NAVY):
    rounded_box(base, xy, fill=fill)
    draw = ImageDraw.Draw(base)
    x1, y1, x2, y2 = xy
    draw.rounded_rectangle((x1 + 18, y1 + 18, x1 + 170, y1 + 58), radius=16, fill=accent)
    center_multiline(draw, title, PILL_FONT, (x1 + 18, y1 + 18, x1 + 170, y1 + 58), fill=WHITE)
    left_multiline(draw, body, CARD_BODY_FONT, (x1 + 28, y1 + 75, x2 - 28, y2 - 22), fill=INK, spacing=10)


def build_problem_validation() -> Path:
    base = Image.new("RGBA", (WIDTH, HEIGHT), BG)
    draw = ImageDraw.Draw(base)

    draw_title(
        draw,
        "문제 검증 자료",
        "외식업 사장님은 마케팅의 필요를 알고 있어도, 분석·제작·실행이 끊겨 실제 운영으로 이어지지 않습니다.",
    )

    center_xy = (520, 370, 1080, 760)
    rounded_box(base, center_xy, fill=WHITE, radius=42, outline="#D6DCE7")
    draw = ImageDraw.Draw(base)
    draw.rounded_rectangle((650, 395, 950, 455), radius=20, fill=ORANGE)
    center_multiline(draw, "핵심 문제", PILL_FONT, (650, 395, 950, 455), fill=WHITE)
    center_multiline(
        draw,
        "사장님은 마케팅을 해야 한다는\n필요성은 분명히 느끼지만,\n직접 실행하는 순간\n시간·역량·비용 장벽에 막힙니다.",
        CENTER_TITLE_FONT,
        (590, 485, 1010, 700),
        fill=INK,
        spacing=14,
    )

    cards = [
        ((110, 300, 470, 500), "고객 이해 부족", "어떤 손님이 자주 오는지,\n어떤 키워드에 반응하는지\n감으로만 판단하게 됩니다.", SOFT_BLUE, NAVY),
        ((1130, 300, 1490, 500), "콘텐츠 제작 부담", "매장 운영 중 사진 고르고,\n문구를 쓰고, 영상까지 만드는\n시간을 따로 내기 어렵습니다.", SOFT_ORANGE, ORANGE),
        ((100, 650, 470, 850), "외부 대행 불신", "대행 비용은 부담되는데,\n우리 가게에 맞는 결과가 나올지\n확신하기 어렵습니다.", SOFT_YELLOW, "#C98719"),
        ((1130, 650, 1500, 850), "실행 이후 판단 어려움", "홍보를 해도 어떤 행동이\n실제 효과가 있었는지 다시\n읽어내기 어렵습니다.", SOFT_GREEN, "#2D8C63"),
        ((490, 830, 1110, 1020), "결과", "분석은 미뤄지고, 콘텐츠는 늦어지고,\n결국 ‘오늘은 바빠서 다음에’가 반복됩니다.", SOFT_PURPLE, "#7A57C2"),
    ]

    for xy, title, body, fill, accent in cards:
        card(base, xy, title, body, fill=fill, accent=accent)

    draw = ImageDraw.Draw(base)
    draw_arrow(draw, (470, 400), (520, 480))
    draw_arrow(draw, (1130, 400), (1080, 480))
    draw_arrow(draw, (470, 760), (520, 650))
    draw_arrow(draw, (1130, 760), (1080, 650))
    draw_arrow(draw, (800, 830), (800, 760))

    footer = (160, 1070, 1440, 1140)
    rounded_box(base, footer, fill="#FFFDF8", radius=28)
    draw = ImageDraw.Draw(base)
    center_multiline(
        draw,
        "문제 검증 포인트: 자영업자의 진짜 어려움은 ‘마케팅 필요성 부족’이 아니라 ‘실행 가능한 구조의 부재’입니다.",
        FOOTER_FONT,
        footer,
        fill=INK,
        spacing=8,
    )

    base.convert("RGB").save(PROBLEM_OUT, quality=95)
    return PROBLEM_OUT


def build_business_model() -> Path:
    if BM_OUT.exists():
        BM_OUT.unlink()

    base = Image.new("RGBA", (WIDTH, HEIGHT), BG)
    draw = ImageDraw.Draw(base)

    draw_title(
        draw,
        "PULSE 비즈니스모델 구체화",
        "‘무료 진입 → 유료 전환 → 업셀 → 제휴 확장’ 흐름이 한 장에서 보이도록 BM을 재구성했습니다.",
    )

    center_xy = (565, 380, 1035, 760)
    rounded_box(base, center_xy, fill=WHITE, radius=44)
    draw = ImageDraw.Draw(base)
    draw.rounded_rectangle((670, 405, 930, 465), radius=20, fill=NAVY)
    center_multiline(draw, "PULSE 플랫폼", PILL_FONT, (670, 405, 930, 465), fill=WHITE)
    center_multiline(
        draw,
        "리뷰 분석과 콘텐츠 제작,\n실행 제안을 한 화면에서 제공하는\n외식업 전용 실행형 AI SaaS",
        CENTER_TITLE_FONT,
        (620, 500, 980, 690),
        fill=INK,
        spacing=14,
    )

    nodes = [
        ((130, 250, 500, 470), "1. 고객 획득", "대학가·상권 외식업 사장님\nPoC 점포와 초기 관심 고객\n직접 영업과 추천 기반 유입", SOFT_BLUE, NAVY),
        ((1110, 250, 1470, 470), "2. 무료 진입", "회원가입 후 리뷰 분석 시작\n가게 인사이트와 대시보드 제공\n가치 체험으로 초기 장벽 제거", SOFT_GREEN, "#2D8C63"),
        ((1100, 560, 1470, 780), "3. Basic 전환", "무제한 분석, AI 답변,\n홍보 콘텐츠 제작을 월 구독으로\n반복 사용하게 만드는 핵심 구간", SOFT_ORANGE, ORANGE),
        ((1130, 860, 1470, 1080), "4. Pro 업셀", "인플루언서 매칭, 다점포 관리,\n고급 추천 기능으로 ARPU 확대", SOFT_PURPLE, "#7A57C2"),
        ((120, 830, 540, 1080), "5. 확장 수익", "지역 제휴, B2B 공급,\n운영 파트너 연계로 매출원 다각화", SOFT_YELLOW, "#C98719"),
    ]

    for xy, title, body, fill, accent in nodes:
        card(base, xy, title, body, fill=fill, accent=accent)

    draw = ImageDraw.Draw(base)
    draw_arrow(draw, (500, 380), (565, 470), fill="#5E7DB7")
    draw_arrow(draw, (1110, 380), (1035, 470), fill="#5E7DB7")
    draw_arrow(draw, (1100, 670), (1035, 650), fill=ORANGE)
    draw_arrow(draw, (1200, 860), (1165, 780), fill="#7A57C2")
    draw_arrow(draw, (540, 900), (565, 760), fill="#C98719")

    draw_pill(draw, (575, 820, 1015, 890), "핵심 전환 구조: Free → Basic → Pro → B2B", fill="#FFF1E8", text_fill=ORANGE)

    footer = (170, 1090, 1430, 1160)
    rounded_box(base, footer, fill="#FFFDF8", radius=28)
    draw = ImageDraw.Draw(base)
    center_multiline(
        draw,
        "BM 핵심: 무료 체험으로 가치 체감을 만들고, 반복 사용 구간을 구독으로 묶은 뒤, Pro와 제휴 확장으로 수익성을 키웁니다.",
        FOOTER_FONT,
        footer,
        fill=INK,
        spacing=8,
    )

    base.convert("RGB").save(BM_OUT, quality=95)
    return BM_OUT


def build_technical_diff() -> Path:
    base = Image.new("RGBA", (WIDTH, HEIGHT), BG)
    draw = ImageDraw.Draw(base)

    draw_title(
        draw,
        "기술 차별성 설명 자료",
        "기존 툴은 분석·제작·실행이 분절되지만, PULSE는 데이터를 수집한 뒤 행동 제안까지 하나의 루프로 연결합니다.",
    )

    center_xy = (560, 375, 1040, 770)
    rounded_box(base, center_xy, fill=WHITE, radius=44)
    draw = ImageDraw.Draw(base)
    draw.rounded_rectangle((675, 400, 925, 460), radius=20, fill=ORANGE)
    center_multiline(draw, "PULSE 실행 루프", PILL_FONT, (675, 400, 925, 460), fill=WHITE)
    center_multiline(
        draw,
        "수집 → 이해 → 생성 → 실행 →\n다음 행동 제안까지 이어지는\n외식업 맞춤형 AI 운영 파이프라인",
        CENTER_TITLE_FONT,
        (620, 495, 980, 700),
        fill=INK,
        spacing=14,
    )

    nodes = [
        ((110, 255, 450, 465), "수집", "네이버·카카오 리뷰를 모아\n가게 단위 원문 스냅샷으로 저장", SOFT_BLUE, NAVY),
        ((1110, 255, 1490, 465), "이해", "BERTopic과 LLM으로\n토픽, 페르소나, 고객 여정을 생성", SOFT_GREEN, "#2D8C63"),
        ((1090, 655, 1490, 865), "생성", "AI 답변, 릴스 콘티,\n홍보 문구를 타깃 손님 기준으로 제작", SOFT_ORANGE, ORANGE),
        ((100, 655, 430, 865), "실행", "대시보드에서 사장님이\n오늘 해야 할 행동을 바로 선택", SOFT_PURPLE, "#7A57C2"),
        ((520, 850, 1080, 1070), "차별성", "단순 분석 리포트에서 끝나지 않고,\n다음 실행 버튼까지 이어지는 운영형 구조", SOFT_YELLOW, "#C98719"),
    ]

    for xy, title, body, fill, accent in nodes:
        card(base, xy, title, body, fill=fill, accent=accent)

    draw = ImageDraw.Draw(base)
    draw_arrow(draw, (450, 360), (560, 470), fill="#5E7DB7")
    draw_arrow(draw, (1110, 360), (1040, 470), fill="#2D8C63")
    draw_arrow(draw, (1090, 760), (1040, 660), fill=ORANGE)
    draw_arrow(draw, (430, 760), (560, 660), fill="#7A57C2")
    draw_arrow(draw, (800, 850), (800, 770), fill="#C98719")

    draw_pill(draw, (108, 920, 450, 985), "기존 툴은 여기서 끊김", fill="#ECEFF4", text_fill=MUTED)
    draw_pill(draw, (1115, 920, 1495, 985), "PULSE는 실행까지 연결", fill="#FFF1E8", text_fill=ORANGE)

    footer = (160, 1090, 1440, 1160)
    rounded_box(base, footer, fill="#FFFDF8", radius=28)
    draw = ImageDraw.Draw(base)
    center_multiline(
        draw,
        "기술 차별성 포인트: 리뷰 데이터가 ‘보고서’로만 끝나는 것이 아니라, 사장님의 실제 행동 선택으로 이어집니다.",
        FOOTER_FONT,
        footer,
        fill=INK,
        spacing=8,
    )

    base.convert("RGB").save(TECH_OUT, quality=95)
    return TECH_OUT


def main():
    IMAGES.mkdir(parents=True, exist_ok=True)
    outputs = [build_problem_validation(), build_business_model(), build_technical_diff()]
    for output in outputs:
        print(output)


if __name__ == "__main__":
    main()
