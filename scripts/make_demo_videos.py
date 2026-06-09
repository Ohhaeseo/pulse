# -*- coding: utf-8 -*-
"""
시연용: '연신내 제육볶음' 16초 홍보영상 2개(에너지 무드 / 감성 무드)를 만든다.
- 같은 주제, 상반된 무드. 각 16초 = 8초 클립 2개를 크로스페이드로 연결.
- 앱 코드는 건드리지 않고 기존 PromotionVideoService(Veo)를 그대로 재사용.
- 영상 합성은 imageio-ffmpeg 번들 ffmpeg(xfade)로 처리.

실행: pulse_python 디렉터리에서
  .venv/Scripts/python.exe ../scripts/make_demo_videos.py <analysis_task_id>
"""
import sys
import subprocess
from pathlib import Path

# pulse_python 패키지(app.*)를 import할 수 있도록 경로 추가 (cwd 독립)
PULSE_PYTHON = Path(__file__).resolve().parents[1] / "pulse_python"
sys.path.insert(0, str(PULSE_PYTHON))

import requests
import imageio_ffmpeg
from moviepy import VideoFileClip

from app.services.promotion_video_service import PromotionVideoService

FAST = "http://127.0.0.1:8000/api"
STORE_NAME = "연신내 제육볶음"
STORE_ADDR = "경기 안양시 만안구 냉천로 6-1 1층"

# 첨부 사진(제육볶음) 묘사 — 9:16 Veo는 참조이미지를 직접 안 받으므로 프롬프트에 정밀 반영
DISH = ("검은 무쇠 불판 위에서 지글지글 끓는 새빨간 양념 제육볶음, 그 위에 수북이 올린 신선한 부추와 "
        "붉은 고추, 양파, 김이 모락모락 피어오르는 순간. 옆에는 갓 지은 공기밥과 정갈한 반찬, 상추쌈")

OUT_DIR = PromotionVideoService().output_root / "demo"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# 클립 길이를 8초로 강제 (앱 기본은 720p에서 6초) — 스크립트 한정 오버라이드
PromotionVideoService._duration_for_profile = staticmethod(lambda resolution, reference_images: 8)


def fetch_persona_target(task_id: str) -> str:
    """손님분석 결과에서 대표 페르소나를 타깃 문구로 뽑는다(실패 시 기본값)."""
    try:
        url = f"{FAST}/analysis/result/{task_id}" if task_id else f"{FAST}/analysis/latest"
        r = requests.get(url, timeout=15)
        if r.status_code == 200:
            data = r.json()
            personas = data.get("personas") or []
            if personas:
                p = personas[0]
                tags = ", ".join((p.get("tags") or [])[:3])
                target = f"{p.get('nickname','단골 손님')} ({tags})" if tags else p.get("nickname", "단골 손님")
                summary = data.get("store_summary") or ""
                print(f"  [persona] target={target} | summary={summary[:60]}")
                return target
    except Exception as exc:
        print(f"  [persona] 분석 결과 사용 실패, 기본 타깃 사용: {exc}")
    return "매콤한 음식을 좋아하는 2030 직장인·친구 모임"


def video_path(result: dict) -> Path:
    name = result["videoUrl"].split("/")[-1]
    return PromotionVideoService().videos_dir / name


def generate_clip(svc: PromotionVideoService, target: str, concept: str, style: str, label: str) -> Path:
    print(f"\n▶ 생성 시작: {label}")
    result = svc.generate_video(
        target=target,
        concept=concept,
        style=style,
        mode="standard_fast",
        image_path=None,
        progress_callback=lambda p, m: print(f"    [{label}] {p}% {m[:50]}"),
    )
    path = video_path(result)
    print(f"  ✅ {label} 완료: {path.name} ({path.stat().st_size//1024} KB, {result.get('generationTime')})")
    return path


def stitch(clip_a: Path, clip_b: Path, out_path: Path) -> None:
    """A → B 를 1초 크로스페이드로 연결(오디오도 acrossfade). 실패 시 단순 연결로 폴백."""
    ff = imageio_ffmpeg.get_ffmpeg_exe()
    dur_a = VideoFileClip(str(clip_a)).duration
    offset = max(0.1, dur_a - 1.0)

    # 1) 영상+오디오 크로스페이드
    cmd_av = [
        ff, "-y", "-i", str(clip_a), "-i", str(clip_b),
        "-filter_complex",
        f"[0:v][1:v]xfade=transition=fade:duration=1:offset={offset:.2f}[v];"
        f"[0:a][1:a]acrossfade=d=1[a]",
        "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-pix_fmt", "yuv420p", str(out_path),
    ]
    # 2) 오디오 없을 때 폴백: 영상만 크로스페이드
    cmd_v = [
        ff, "-y", "-i", str(clip_a), "-i", str(clip_b),
        "-filter_complex",
        f"[0:v][1:v]xfade=transition=fade:duration=1:offset={offset:.2f}[v]",
        "-map", "[v]", "-c:v", "libx264", "-pix_fmt", "yuv420p", str(out_path),
    ]
    for cmd in (cmd_av, cmd_v):
        proc = subprocess.run(cmd, capture_output=True, text=True)
        if proc.returncode == 0 and out_path.exists():
            print(f"  ✅ 합성 완료: {out_path}")
            return
        print(f"  ⚠️ 합성 재시도(폴백)... ({proc.stderr.strip().splitlines()[-1] if proc.stderr.strip() else ''})")
    raise RuntimeError(f"크로스페이드 합성 실패: {out_path}")


def main():
    task_id = sys.argv[1] if len(sys.argv) > 1 else ""
    fetch_persona_target(task_id)  # 손님분석 결과를 기록용으로 출력
    # 크롤링이 동명의 다른 가게를 매칭할 수 있어, 데모 영상 타깃은 제육볶음 맛집에 맞춰 고정한다.
    target = "매콤한 제육볶음을 즐기는 2030 직장인과 친구 모임, 맛집 탐방을 좋아하는 손님"
    svc = PromotionVideoService()

    common = (f"명학역 맛집 '{STORE_NAME}'의 시그니처 제육볶음. {DISH}. "
              f"세로 9:16 숏폼, 한국 음식점 현장감, 군침 도는 식욕 자극 비주얼.")

    # 에너지 무드(2클립): 빠른 템포·강한 클로즈업·역동적
    energetic = [
        (f"{common} 빠른 템포의 역동적인 클로즈업으로 지글지글 끓는 불판과 새빨간 양념을 강렬하게. "
         f"김이 확 피어오르고 고명이 흔들리는 식욕 폭발 장면, 활기차고 에너지 넘치는 분위기.",
         "energetic-1"),
        (f"{common} 제육을 빠르게 비벼 한 입 크게 먹는 역동적인 장면, 윤기와 불맛을 강조. "
         f"경쾌하고 강렬한 컷 전환, 활기찬 매장 분위기.",
         "energetic-2"),
    ]
    # 감성 무드(2클립): 잔잔·따뜻·스토리
    emotional = [
        (f"{common} 은은하고 따뜻한 조명 아래 정성껏 차려진 제육볶음 한 상, 공기밥과 반찬, 상추쌈. "
         f"천천히 흐르는 카메라, 집밥 같은 푸근함과 정겨운 감성.",
         "emotional-1"),
        (f"{common} 상추에 제육을 정성껏 싸서 천천히 맛보는 따뜻한 순간, 소중한 사람과 나누는 식사의 여운. "
         f"잔잔하고 감성적인 분위기, 부드러운 빛.",
         "emotional-2"),
    ]

    print("\n=== 1) 에너지 무드 클립 2개 ===")
    e1 = generate_clip(svc, target, energetic[0][0], "energetic", energetic[0][1])
    e2 = generate_clip(svc, target, energetic[1][0], "energetic", energetic[1][1])

    print("\n=== 2) 감성 무드 클립 2개 ===")
    m1 = generate_clip(svc, target, emotional[0][0], "emotional", emotional[0][1])
    m2 = generate_clip(svc, target, emotional[1][0], "emotional", emotional[1][1])

    print("\n=== 3) 16초 합성 ===")
    out_e = OUT_DIR / "연신내제육볶음_에너지_16s.mp4"
    out_m = OUT_DIR / "연신내제육볶음_감성_16s.mp4"
    stitch(e1, e2, out_e)
    stitch(m1, m2, out_m)

    print("\n================ 완료 ================")
    for label, path in [("에너지 무드 16초", out_e), ("감성 무드 16초", out_m)]:
        if path.exists():
            dur = VideoFileClip(str(path)).duration
            print(f"{label}: {path}  ({dur:.1f}s, {path.stat().st_size//1024} KB)")


if __name__ == "__main__":
    main()
