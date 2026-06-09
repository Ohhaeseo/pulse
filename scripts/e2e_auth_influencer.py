# -*- coding: utf-8 -*-
"""E2E: 사장님/인플루언서 인증 + 인플루언서 매칭(제안->받은제안->수락->상태반영)"""
import sys, json, time, random
import requests

SPRING = "http://localhost:8080/api"
S = requests.Session()
S.headers.update({"Content-Type": "application/json"})

def log(title, resp):
    ok = 200 <= resp.status_code < 300
    mark = "OK " if ok else "ERR"
    body = None
    try:
        body = resp.json()
    except Exception:
        body = resp.text[:300]
    print(f"[{mark}] {resp.request.method} {resp.url.split('8080')[-1]} -> {resp.status_code}")
    if isinstance(body, (dict, list)):
        print("     " + json.dumps(body, ensure_ascii=False)[:600])
    else:
        print("     " + str(body)[:300])
    return ok, body

rid = random.randint(10000, 99999)
owner_email = f"owner_e2e_{rid}@test.com"
inf_email = f"inf_e2e_{rid}@test.com"
inf_display = f"테스트인플루언서{rid}"
PW = "Test1234!"

print("=" * 70)
print("PART A. 사장님 인증 + 가게")
print("=" * 70)

# 1. owner signup
owner_signup = {
    "email": owner_email, "password": PW, "passwordConfirm": PW,
    "name": "테스트사장님", "phone": "010-1111-2222", "isPrivacyAgreed": True,
    "shopInfo": {"name": "스타벅스 강남R점", "address": "서울 강남구 강남대로 390",
                  "category": "카페", "customCategory": ""},
}
ok, body = log("owner signup", S.post(f"{SPRING}/auth/signup", json=owner_signup))
owner_token = (body or {}).get("accessToken") if isinstance(body, dict) else None
analysis_task = (body or {}).get("analysisTaskId") if isinstance(body, dict) else None
print(f"     >> analysisTaskId from signup: {analysis_task}")

# 2. owner login
ok, body = log("owner login", S.post(f"{SPRING}/auth/login", json={"email": owner_email, "password": PW}))
if isinstance(body, dict) and body.get("accessToken"):
    owner_token = body["accessToken"]
assert owner_token, "owner token 없음 -> 중단"
OWNER = {"Authorization": f"Bearer {owner_token}", "Content-Type": "application/json"}

# 3. me
log("owner /auth/me", S.get(f"{SPRING}/auth/me", headers=OWNER))
# 4. store
log("owner /v1/users/me/store", S.get(f"{SPRING}/v1/users/me/store", headers=OWNER))

print()
print("=" * 70)
print("PART B. 인플루언서 인증")
print("=" * 70)
inf_signup = {
    "email": inf_email, "password": PW, "passwordConfirm": PW,
    "name": "테스트인플루언서", "phone": "010-3333-4444", "privacyAgreed": True,
    "profile": {
        "displayName": inf_display, "bio": "맛집/카페 전문 리뷰어", "location": "서울 강남구",
        "instagramUrl": "https://instagram.com/test", "instagramFollowers": 52000,
        "avgViews": 18000, "engagementRate": 4.7, "minBudget": 300000,
        "niches": ["맛집", "카페"], "keywords": ["강남", "디저트", "감성카페"],
        "activityAreas": ["강남구", "서초구"], "audienceKeywords": ["20대", "데이트", "카페투어"],
    },
}
ok, body = log("influencer signup", S.post(f"{SPRING}/auth/signup/influencer", json=inf_signup))
inf_token = (body or {}).get("accessToken") if isinstance(body, dict) else None
ok, body = log("influencer login", S.post(f"{SPRING}/auth/login", json={"email": inf_email, "password": PW}))
if isinstance(body, dict) and body.get("accessToken"):
    inf_token = body["accessToken"]
assert inf_token, "influencer token 없음 -> 중단"
INF = {"Authorization": f"Bearer {inf_token}", "Content-Type": "application/json"}

print()
print("=" * 70)
print("PART C. 인플루언서 매칭 / 추천 / 제안 흐름")
print("=" * 70)
# 5. owner recommendations
ok, recs = log("owner /influencers/recommendations", S.get(f"{SPRING}/influencers/recommendations", headers=OWNER))
rec_list = None
if isinstance(recs, dict):
    rec_list = recs.get("influencers") or recs.get("data")
elif isinstance(recs, list):
    rec_list = recs
if isinstance(rec_list, list):
    print(f"     >> 추천 인플루언서 수: {len(rec_list)}")
    for item in rec_list[:5]:
        prof = (item.get("influencer") or {}) if isinstance(item, dict) else {}
        print(f"        - id={prof.get('id')} name={prof.get('displayName')} score={item.get('score')} reasons={item.get('matchReasons')}")

# 5b. 새 인플루언서 본인 profileId 확보 (가장 확실한 경로: 인플루언서 /auth/me)
ok, inf_me = log("influencer /auth/me", S.get(f"{SPRING}/auth/me", headers=INF))
target_pid = None
if isinstance(inf_me, dict):
    prof = inf_me.get("influencerProfile") or {}
    target_pid = prof.get("id")
    print(f"     >> 내 인플루언서 profileId={target_pid}")

# 새 인플루언서가 추천 목록에도 등장하는지 확인
if isinstance(rec_list, list):
    found = any((it.get("influencer") or {}).get("id") == target_pid for it in rec_list)
    print(f"     >> 새 인플루언서가 추천 목록에 포함? {found}")

if target_pid is None and isinstance(rec_list, list) and rec_list:
    target_pid = (rec_list[0].get("influencer") or {}).get("id")
    print(f"     >> (fallback) 첫 추천 profileId={target_pid}")

if target_pid is None:
    print("!! profileId를 못 찾음. 제안 생성 단계 스킵.")
    sys.exit(0)

# 6. owner creates proposal
proposal_req = {
    "influencerProfileId": target_pid, "campaignType": "방문 리뷰", "budget": 400000,
    "provideFood": True, "desiredDate": "2026-07-01", "contact": owner_email,
    "message": "안녕하세요! 강남R점 신메뉴 리뷰 협업 제안드립니다.",
}
ok, prop = log("owner create proposal", S.post(f"{SPRING}/influencer-proposals", headers=OWNER, json=proposal_req))
proposal_id = (prop or {}).get("id") if isinstance(prop, dict) else None
print(f"     >> 생성된 proposalId={proposal_id}")

# 7. influencer inbox
ok, inbox = log("influencer inbox", S.get(f"{SPRING}/influencer-proposals/inbox", headers=INF))
inbox_list = inbox if isinstance(inbox, list) else (inbox.get("data") if isinstance(inbox, dict) else [])
print(f"     >> inbox 제안 수: {len(inbox_list) if isinstance(inbox_list, list) else 'N/A'}")
if proposal_id is None and isinstance(inbox_list, list) and inbox_list:
    proposal_id = inbox_list[0].get("id")
    print(f"     >> inbox에서 proposalId 확보={proposal_id}")

if proposal_id is None:
    print("!! proposalId 없음 -> 수락 단계 스킵")
    sys.exit(0)

# 8. influencer accept
log("influencer accept", S.patch(f"{SPRING}/influencer-proposals/{proposal_id}/accept", headers=INF, json={}))

# 9. owner verifies status
ok, owner_props = log("owner proposals (status check)", S.get(f"{SPRING}/influencer-proposals/owner", headers=OWNER))
op_list = owner_props if isinstance(owner_props, list) else (owner_props.get("data") if isinstance(owner_props, dict) else [])
if isinstance(op_list, list):
    for p in op_list:
        if p.get("id") == proposal_id:
            print(f"     >> [검증] proposalId={proposal_id} 최종 status = {p.get('status')}")

print()
print("E2E (auth+influencer) 완료")
print(f"analysisTaskId(참고)={analysis_task}")
