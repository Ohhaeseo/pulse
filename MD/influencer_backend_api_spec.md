# 인플루언서 백엔드 구현 및 API 명세서

## 1. 결론: DB는 MongoDB가 아니라 MySQL이다

이번에 구현한 인플루언서 회원가입, 프로필, 추천, 제안 로직은 Spring Boot JPA 기반이다.

- 사용 DB: MySQL
- 기본 데이터베이스 이름: `pulse_db`
- 설정 위치: `pulse_spring/src/main/resources/application.yml`
- 기본 JDBC URL: `jdbc:mysql://localhost:3306/pulse_db`
- MongoDB 사용 여부: 이번 인플루언서 백엔드 로직에서는 사용하지 않는다.

즉, 인플루언서용으로 MongoDB 컬렉션을 만든 것이 아니라 `pulse_db` 안에 인플루언서 관련 MySQL 테이블이 추가되는 구조다.

## 2. 중요한 주의점: 데이터베이스와 테이블은 다르다

Spring JPA는 `pulse_db`라는 데이터베이스 자체를 새로 생성하지 않는다.

MySQL에 아래 데이터베이스가 이미 있어야 한다.

```sql
CREATE DATABASE IF NOT EXISTS pulse_db
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

그 다음 Spring Boot가 실행되면 JPA가 엔티티 기준으로 테이블을 만든다.

현재 설정은 다음과 같다.

```yaml
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL:jdbc:mysql://localhost:3306/pulse_db?useSSL=false&serverTimezone=Asia/Seoul&characterEncoding=UTF-8&allowPublicKeyRetrieval=true}
  jpa:
    hibernate:
      ddl-auto: ${SPRING_JPA_DDL_AUTO:create}
```

`ddl-auto:create`는 서버 시작 시 기존 테이블을 다시 만들 수 있으므로 로컬 개발에서는 편하지만, 운영/실데이터 환경에서는 `update` 또는 migration 방식으로 바꿔야 한다.

## 3. 이번 구현으로 생기는 주요 테이블

JPA가 MySQL `pulse_db` 안에 생성하는 핵심 테이블은 다음과 같다.

| 테이블 | 용도 |
| --- | --- |
| `users` | 사장님과 인플루언서 공통 계정 |
| `shops` | 사장님 가게 정보 |
| `influencer_profiles` | 인플루언서 프로필 본문 |
| `influencer_niches` | 인플루언서 분야 목록 |
| `influencer_keywords` | 인플루언서 키워드 목록 |
| `influencer_activity_areas` | 인플루언서 활동 지역 목록 |
| `influencer_audience_keywords` | 인플루언서 팔로워/타깃 키워드 |
| `influencer_proposals` | 사장님이 인플루언서에게 보낸 제안 |

## 4. 역할 구조

`users` 테이블에 `role` 컬럼을 추가했다.

역할 값은 두 가지다.

```java
OWNER
INFLUENCER
```

사장님 회원가입은 `OWNER`, 인플루언서 회원가입은 `INFLUENCER`로 저장된다.

## 5. 인증 구조

JWT에 `role` 클레임을 추가했다.

예시 개념:

```json
{
  "sub": "creator01@pulse.test",
  "role": "INFLUENCER"
}
```

Spring Security를 과하게 막지 않기 위해 URL별 강한 권한 차단은 넣지 않았다. 대신 서비스 로직에서 필요한 경우에만 역할을 확인한다.

예를 들어:

- 사장님만 추천 목록 조회 가능
- 사장님만 제안 생성 가능
- 인플루언서만 받은 제안함 조회 가능
- 인플루언서만 제안 수락/거절 가능

## 6. 개발용 인플루언서 50명 seed

`DevInfluencerSeedDataLoader`가 추가됐다.

서버 시작 시 다음 조건을 확인한다.

- 이미 인플루언서 프로필이 50명 이상이면 아무것도 하지 않음
- 50명 미만이면 `creator01@pulse.test`부터 `creator50@pulse.test`까지 생성
- 기본 비밀번호는 `Password123!`

이 seed 데이터는 실제 인플루언서가 가입한 것처럼 `users`와 `influencer_profiles`에 함께 저장된다.

## 7. 사장님 회원가입 흐름

기존 흐름은 유지했다.

1. 사장님이 회원가입한다.
2. `users`에 `OWNER` 역할로 저장된다.
3. `shops`에 가게 정보가 저장된다.
4. FastAPI 분석 요청을 보낸다.
5. JWT를 발급한다.
6. 응답에 `user.role = OWNER`가 포함된다.

## 8. 인플루언서 회원가입 흐름

새로 추가된 흐름이다.

1. 인플루언서가 회원가입한다.
2. `users`에 `INFLUENCER` 역할로 저장된다.
3. `influencer_profiles`에 프로필이 저장된다.
4. 분야, 키워드, 활동 지역은 별도 element collection 테이블에 저장된다.
5. JWT를 발급한다.
6. 응답에 `user.role = INFLUENCER`가 포함된다.

## 9. 매칭 추천 흐름

사장님이 인플루언서 매칭 페이지에 들어가면 다음 순서로 동작한다.

1. 프론트가 `GET /api/influencers/recommendations`를 호출한다.
2. Spring이 로그인한 사장님 이메일을 JWT에서 읽는다.
3. `shops`에서 해당 사장님의 가게 정보를 찾는다.
4. 가게 업종, 주소, 커스텀 업종, 기본 키워드로 매칭 기준을 만든다.
5. `influencer_profiles`의 모든 인플루언서를 가져온다.
6. 각 인플루언서에 대해 점수를 계산한다.
7. 점수가 높은 순서대로 반환한다.
8. 프론트는 반환된 인플루언서 목록을 카드로 보여준다.

## 10. 매칭 점수 계산 기준

총점은 100점이다.

| 항목 | 배점 | 설명 |
| --- | ---: | --- |
| 카테고리 | 25 | 가게 업종과 인플루언서 분야/키워드 일치 |
| 지역 | 20 | 가게 주소와 인플루언서 활동 지역 일치 |
| 키워드 | 30 | 가게 키워드와 인플루언서 키워드/타깃 키워드 일치 |
| 성과 | 15 | 팔로워, 평균 조회수, 참여율 |
| 예산 | 10 | 최소 제안 금액이 로컬 테스트 예산에 적합한지 |

응답에는 총점뿐 아니라 항목별 점수와 추천 사유도 포함된다.

## 11. 제안 흐름

사장님이 인플루언서에게 제안하면 다음처럼 저장된다.

1. 사장님이 매칭 카드에서 제안하기를 누른다.
2. 제안 폼을 작성한다.
3. 프론트가 `POST /api/influencer-proposals`를 호출한다.
4. Spring이 사장님 계정인지 확인한다.
5. 사장님의 `Shop`을 찾는다.
6. 대상 `InfluencerProfile`을 찾는다.
7. `influencer_proposals`에 `PENDING` 상태로 저장한다.
8. 인플루언서는 받은 제안함에서 이 제안을 볼 수 있다.

## 12. API 공통 규칙

인증이 필요한 API는 Authorization 헤더를 사용한다.

```http
Authorization: Bearer {accessToken}
```

기본 응답은 JSON이다.

오류 응답 예시:

```json
{
  "message": "로그인이 필요합니다."
}
```

## 13. API 명세: 사장님 회원가입

```http
POST /api/auth/signup
POST /api/auth/signup/owner
```

두 경로는 같은 로직을 사용한다.

요청 예시:

```json
{
  "email": "owner@test.com",
  "password": "Password123!",
  "passwordConfirm": "Password123!",
  "name": "김사장",
  "phone": "010-1111-2222",
  "privacyAgreed": true,
  "shopInfo": {
    "name": "펄스식당",
    "category": "KOREAN",
    "customCategory": null,
    "address": "서울 마포구 연남동"
  }
}
```

응답 예시:

```json
{
  "message": "가입이 완료되었습니다.",
  "accessToken": "jwt-token",
  "analysisTaskId": "analysis-task-id",
  "tokenType": "Bearer",
  "user": {
    "id": 1,
    "email": "owner@test.com",
    "name": "김사장",
    "role": "OWNER"
  }
}
```

## 14. API 명세: 인플루언서 회원가입

```http
POST /api/auth/signup/influencer
```

요청 예시:

```json
{
  "email": "creator@test.com",
  "password": "Password123!",
  "passwordConfirm": "Password123!",
  "name": "민지테이블",
  "phone": "010-3333-4444",
  "privacyAgreed": true,
  "profile": {
    "displayName": "민지테이블",
    "bio": "연남동과 망원동 맛집을 소개합니다.",
    "location": "서울 마포",
    "profileImageUrl": "https://images.unsplash.com/photo-example",
    "instagramUrl": "https://instagram.com/minji_table",
    "youtubeUrl": "https://youtube.com/@minji_table",
    "instagramFollowers": 84000,
    "youtubeSubscribers": 12000,
    "avgViews": 32000,
    "engagementRate": 4.8,
    "minBudget": 450000,
    "niches": ["food", "cafe"],
    "keywords": ["감성맛집", "연남동", "디저트"],
    "activityAreas": ["마포", "홍대", "연남"],
    "audienceKeywords": ["20대여성", "데이트"]
  }
}
```

응답 예시:

```json
{
  "message": "인플루언서 가입이 완료되었습니다.",
  "accessToken": "jwt-token",
  "analysisTaskId": null,
  "tokenType": "Bearer",
  "user": {
    "id": 51,
    "email": "creator@test.com",
    "name": "민지테이블",
    "role": "INFLUENCER"
  }
}
```

## 15. API 명세: 로그인

```http
POST /api/auth/login
```

요청 예시:

```json
{
  "email": "creator01@pulse.test",
  "password": "Password123!"
}
```

응답 예시:

```json
{
  "accessToken": "jwt-token",
  "tokenType": "Bearer",
  "user": {
    "id": 2,
    "email": "creator01@pulse.test",
    "name": "민지테이블",
    "role": "INFLUENCER"
  }
}
```

## 16. API 명세: 현재 사용자 조회

```http
GET /api/auth/me
```

사장님 응답 예시:

```json
{
  "email": "owner@test.com",
  "name": "김사장",
  "role": "OWNER",
  "ownerName": "김사장",
  "shopName": "펄스식당",
  "shopAddress": "서울 마포구 연남동",
  "shopCategory": "KOREAN",
  "influencerProfile": null
}
```

인플루언서 응답 예시:

```json
{
  "email": "creator01@pulse.test",
  "name": "민지테이블",
  "role": "INFLUENCER",
  "ownerName": null,
  "shopName": null,
  "shopAddress": null,
  "shopCategory": null,
  "influencerProfile": {
    "id": 1,
    "displayName": "민지테이블",
    "location": "서울 마포",
    "keywords": ["감성맛집", "연남동", "디저트"]
  }
}
```

## 17. API 명세: 인플루언서 추천 목록

```http
GET /api/influencers/recommendations
```

권한:

- 로그인 필요
- 사장님 계정만 가능

응답 예시:

```json
{
  "storeInsight": {
    "shopId": 1,
    "shopName": "펄스식당",
    "category": "KOREAN",
    "address": "서울 마포구 연남동",
    "keywords": ["korean", "food", "한식", "국밥", "노포", "회식", "서울", "마포구", "연남동"]
  },
  "influencers": [
    {
      "influencer": {
        "id": 1,
        "email": "creator01@pulse.test",
        "displayName": "민지테이블",
        "location": "서울 마포",
        "instagramFollowers": 84500,
        "avgViews": 32000,
        "engagementRate": 4.8,
        "minBudget": 450000,
        "niches": ["food", "cafe"],
        "keywords": ["감성맛집", "연남동", "디저트"]
      },
      "score": 83,
      "breakdown": {
        "category": 25,
        "location": 20,
        "keyword": 20,
        "performance": 10,
        "budget": 8
      },
      "matchReasons": [
        "가게 업종과 콘텐츠 분야가 잘 맞습니다.",
        "활동 지역이 가게 위치와 가깝습니다."
      ]
    }
  ]
}
```

## 18. API 명세: 제안 생성

```http
POST /api/influencer-proposals
```

권한:

- 로그인 필요
- 사장님 계정만 가능

요청 예시:

```json
{
  "influencerProfileId": 1,
  "campaignType": "방문 리뷰",
  "budget": 300000,
  "provideFood": true,
  "desiredDate": "2026-06-10",
  "contact": "010-1111-2222",
  "message": "매장 분위기와 신메뉴를 릴스로 소개해주셨으면 합니다."
}
```

응답 예시:

```json
{
  "id": 1,
  "shopId": 1,
  "shopName": "펄스식당",
  "influencerProfileId": 1,
  "influencerName": "민지테이블",
  "campaignType": "방문 리뷰",
  "budget": 300000,
  "provideFood": true,
  "desiredDate": "2026-06-10",
  "contact": "010-1111-2222",
  "message": "매장 분위기와 신메뉴를 릴스로 소개해주셨으면 합니다.",
  "status": "PENDING",
  "createdAt": "2026-05-31T01:30:00",
  "respondedAt": null
}
```

## 19. API 명세: 사장님이 보낸 제안 목록

```http
GET /api/influencer-proposals/owner
```

권한:

- 로그인 필요
- 사장님 계정 기준으로 조회

응답 예시:

```json
[
  {
    "id": 1,
    "shopName": "펄스식당",
    "influencerName": "민지테이블",
    "status": "PENDING",
    "budget": 300000
  }
]
```

## 20. API 명세: 인플루언서 받은 제안함

```http
GET /api/influencer-proposals/inbox
```

권한:

- 로그인 필요
- 인플루언서 계정만 가능

응답 예시:

```json
[
  {
    "id": 1,
    "shopId": 1,
    "shopName": "펄스식당",
    "influencerProfileId": 1,
    "influencerName": "민지테이블",
    "campaignType": "방문 리뷰",
    "budget": 300000,
    "provideFood": true,
    "desiredDate": "2026-06-10",
    "contact": "010-1111-2222",
    "message": "매장 분위기와 신메뉴를 릴스로 소개해주셨으면 합니다.",
    "status": "PENDING",
    "createdAt": "2026-05-31T01:30:00",
    "respondedAt": null
  }
]
```

## 21. API 명세: 인플루언서 제안 수락/거절

```http
PATCH /api/influencer-proposals/{proposalId}/status
```

권한:

- 로그인 필요
- 해당 제안을 받은 인플루언서만 가능

요청 예시:

```json
{
  "status": "ACCEPTED"
}
```

거절 예시:

```json
{
  "status": "REJECTED"
}
```

응답 예시:

```json
{
  "id": 1,
  "shopName": "펄스식당",
  "influencerName": "민지테이블",
  "status": "ACCEPTED",
  "respondedAt": "2026-05-31T01:40:00"
}
```

## 22. 프론트 연결 상태

프론트에서는 다음처럼 연결했다.

- 로그인 성공 시 `data.user.role` 확인
- `OWNER`면 `/dashboard`
- `INFLUENCER`면 `/influencer/dashboard`
- 인플루언서 회원가입은 `/api/auth/signup/influencer` 호출
- 매칭 페이지는 `/api/influencers/recommendations` 호출
- 추천 API 실패 시 기존 목데이터로 fallback

## 23. 아직 남은 연결 포인트

현재 핵심 백엔드와 일부 프론트 연결은 완료됐다.

다만 제안 작성 페이지는 목데이터 기반 화면이 많이 남아 있어서, 실제 DB 인플루언서 카드에서 넘어온 경우에 `backendProfileId`를 이용해 제안을 저장하도록 더 단단히 연결할 수 있다.

받은 제안함도 백엔드 API는 준비됐지만, 화면의 기존 목데이터 카드 구조를 유지한 채 API 데이터를 매핑하는 작업을 추가로 하면 실제 인플루언서 로그인 후 받은 제안 확인까지 완전히 이어진다.

## 24. 로컬에서 확인하는 순서

1. MySQL 실행
2. `pulse_db` 데이터베이스 존재 확인
3. Spring Boot 실행
4. 서버 시작 시 인플루언서 50명 seed 확인
5. 사장님 회원가입 또는 로그인
6. 인플루언서 매칭 페이지 진입
7. `/api/influencers/recommendations` 응답 확인
8. 인플루언서 회원가입
9. `users.role = INFLUENCER` 확인
10. `influencer_profiles`에 신규 프로필 저장 확인

## 25. 검증 완료 내역

다음 명령은 성공했다.

```bash
./gradlew.bat clean build -x test --console=plain
./gradlew.bat test --console=plain
npm.cmd run build
```

## 26. 운영 전 반드시 바꿔야 하는 부분

로컬 개발이 끝나고 실제 운영/테스트 서버로 갈 때는 다음을 바꿔야 한다.

- `SPRING_JPA_DDL_AUTO=create` 사용 금지
- `update` 또는 Flyway/Liquibase migration 도입
- seed loader를 dev profile에서만 실행되도록 제한
- JWT secret을 충분히 긴 실제 값으로 설정
- refresh token 정책 추가
- URL 단위 role 권한 설정 추가
- 제안 수락 후 알림/메일/카카오톡 등 후속 액션 추가
