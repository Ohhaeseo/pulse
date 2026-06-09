# -*- coding: utf-8 -*-
"""E2E: 프로필 사진(Base64) + 해시태그 dedup + 챗봇(/chat) + 제안 자동작성 컨텍스트"""
import json, random, base64
import requests

SPRING = "http://localhost:8080/api"
FAST = "http://127.0.0.1:8000/api"
PW = "Test1234!"
rid = random.randint(10000, 99999)

# 작은 1x1 PNG → data URL (base64 저장/렌더 경로 검증용)
png = bytes.fromhex('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d4944415478da6364f80f00010101005a4d6f5d0000000049454e44ae426082')
data_url = "data:image/png;base64," + base64.b64encode(png).decode()

print("=" * 70)
print("1) 인플루언서 가입: 프로필사진(base64) + 의도적 중복 태그")
print("=" * 70)
inf_email = f"inf_ph2_{rid}@test.com"
# niche=패션, keywords에 패션 중복 포함 → dedup 되어야 함
payload = {
    "email": inf_email, "password": PW, "passwordConfirm": PW,
    "name": "포토인플루언서", "phone": "010-0000-0000", "privacyAgreed": True,
    "profile": {
        "displayName": f"포토인플루언서{rid}", "bio": "사진 잘 찍는 리뷰어", "location": "서울 강남구",
        "profileImageUrl": data_url,
        "instagramUrl": "https://instagram.com/test",
        "niches": ["패션"],
        "keywords": ["패션", "대학생", "맛집"],   # '패션'이 niche와 중복
        "activityAreas": ["서울 강남구"],
        "audienceKeywords": ["대학생", "맛집"],
    },
}
r = requests.post(f"{SPRING}/auth/signup/influencer", json=payload, timeout=15)
print("signup status:", r.status_code)
tok = r.json().get("accessToken")
H = {"Authorization": f"Bearer {tok}"}

me = requests.get(f"{SPRING}/auth/me", headers=H, timeout=15).json()
prof = me.get("influencerProfile") or {}
img = prof.get("profileImageUrl") or ""
print("  profileImageUrl 저장됨?:", img.startswith("data:image/"), f"(len={len(img)})")
print("  niches:", prof.get("niches"))
print("  keywords(백엔드 저장):", prof.get("keywords"))
# FE 렌더 dedup 시뮬레이션: niches + keywords 합치고 # 정규화 후 중복 제거
seen, merged = set(), []
for raw in (prof.get("niches") or []) + (prof.get("keywords") or []):
    t = str(raw).strip()
    if not t:
        continue
    tag = t if t.startswith("#") else f"#{t}"
    k = tag.lower()
    if k in seen:
        continue
    seen.add(k); merged.append(tag)
print("  FE '활동 분야' 렌더 결과(dedup):", merged, f"-> {len(merged)}개 (중복 없어야 정상)")

print()
print("=" * 70)
print("2) 챗봇 /chat - 사장님(가게 컨텍스트 주입) ")
print("=" * 70)
store_ctx = {"storeName": "바람난 얼큰 수제비", "category": "한식", "location": "경기 안양시 동안구 평촌"}
body = {"role": "owner", "context": store_ctx,
        "messages": [{"role": "user", "content": "우리 가게 위치랑 업종이 뭐라고 알고 있어? 한 문장으로 답해줘."}]}
r = requests.post(f"{FAST}/chat", json=body, timeout=90)
print("status:", r.status_code)
reply = r.json().get("reply", "")
print("reply:", reply[:250])
print("  -> '평촌/안양' 포함?:", ("평촌" in reply or "안양" in reply), "| '수제비' 포함?:", ("수제비" in reply), "| 잘못된 '서울'?:", ("서울" in reply))

print()
print("=" * 70)
print("3) 제안 자동작성용 /chat - 실제 매장 정보로 메시지 생성")
print("=" * 70)
instruction = ("다음 정보를 바탕으로 인플루언서에게 보낼 협업 제안 메시지를 한국어로 작성해줘.\n"
               "- 인플루언서 활동명: 노태경\n- 인플루언서 분야: 패션\n- 협업 방식: 제품 협찬\n- 음식 무료 제공: 예\n"
               "반드시 우리 가게(상호/업종/위치) 정보를 정확히 활용하고, 정중하게 250자 내외로. 메시지 본문만 출력해.")
body = {"role": "owner", "context": store_ctx, "messages": [{"role": "user", "content": instruction}]}
r = requests.post(f"{FAST}/chat", json=body, timeout=90)
print("status:", r.status_code)
reply = r.json().get("reply", "")
print("생성 메시지:\n", reply[:400])
print("  -> 실매장(수제비/안양/평촌/한식) 반영?:",
      any(k in reply for k in ["수제비", "안양", "평촌", "한식"]),
      "| 엉뚱한 '패션 전문점'?:", ("패션 전문점" in reply))

print()
print("=" * 70)
print("4) 챗봇 /chat - 인플루언서(프로필 컨텍스트)")
print("=" * 70)
inf_ctx = {"displayName": "포토인플루언서", "bio": "사진 잘 찍는 리뷰어", "location": "서울 강남구",
           "niches": ["패션"], "keywords": ["대학생", "맛집"], "instagramFollowers": 52000, "avgViews": 18000}
body = {"role": "influencer", "context": inf_ctx,
        "messages": [{"role": "user", "content": "내 활동 지역과 분야를 한 문장으로 요약해줘."}]}
r = requests.post(f"{FAST}/chat", json=body, timeout=90)
print("status:", r.status_code)
print("reply:", r.json().get("reply", "")[:200])
print("\n완료")
