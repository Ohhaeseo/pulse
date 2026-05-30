/**
 * playwright-commercial.mjs
 * 상권분석(MapInsight) 기능 E2E 스모크 테스트.
 *
 * 검증 흐름:
 *   1) 회원가입(API) → 로그인(UI) → 상권분석 페이지 진입
 *   2) [Phase 1] 상권 리포트가 빠르게 렌더되는지 (지도 + 주변 가게 현황 + 같은 업종 분석)
 *   3) [Phase 2] AI 실행 액션이 백그라운드로 채워지는지 ("이번 주 실행 액션")
 *
 * 설계 메모: 리포트는 Kakao 데이터만으로 즉시 반환되고(수백 ms),
 * AI 액션(LLM, 수십 초)은 프론트가 /map-insight/actions 를 별도로 호출해 점진적으로 표시한다.
 * 따라서 리포트 렌더와 액션 표시를 분리해서 단언한다.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright-core';

const rootDir = path.resolve(process.cwd(), '..');
const defaultArtifactsDir = path.join(rootDir, 'output', 'playwright');

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const nextValue = argv[index + 1];
    if (!nextValue || nextValue.startsWith('--')) {
      parsed[key] = 'true';
      continue;
    }
    parsed[key] = nextValue;
    index += 1;
  }
  return parsed;
}

function detectBrowserExecutable() {
  const candidates = [
    process.env.PULSE_PLAYWRIGHT_BROWSER_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(candidate));
}

async function waitForHttp(url, timeoutMs = 180000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status >= 400) return;
    } catch (_) {
      // retry until timeout
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function ensureTestUser({ springBaseUrl, email, password }) {
  const response = await fetch(`${springBaseUrl}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      passwordConfirm: password,
      name: 'PULSE Commercial E2E',
      phone: '01012345678',
      isPrivacyAgreed: true,
      shopInfo: {
        // 실주소 → Spring 이 Kakao 로 지오코딩하여 좌표를 만든다.
        name: '운산국밥 범계점',
        address: '경기 안양시 동안구 평촌대로223번길 48',
        category: 'KOREAN',
        customCategory: null,
      },
    }),
  });
  if (response.status === 201) return;
  const body = await response.text();
  throw new Error(`Test user signup failed (${response.status}): ${body}`);
}

// 안양 평촌(운산국밥) 인근을 모사한 상권 리포트. SummaryPanel 이 소비하는 구조와 동일.
function buildMockReport() {
  const counts = {
    FD6: { label: '음식점', total: 45, status: 'OK', unavailable: false },
    CE7: { label: '카페', total: 38, status: 'OK', unavailable: false },
    CS2: { label: '편의점', total: 27, status: 'OK', unavailable: false },
    HP8: { label: '병원', total: 22, status: 'OK', unavailable: false },
    PM9: { label: '약국', total: 12, status: 'OK', unavailable: false },
    SW8: { label: '지하철역', total: 1, status: 'OK', unavailable: false },
    SC4: { label: '학교', total: 3, status: 'OK', unavailable: false },
    AC5: { label: '학원', total: 9, status: 'OK', unavailable: false },
  };
  const nearest = [
    { id: '1', name: '호랑이굴 범계본점', lat: 37.391, lng: 126.953, distanceM: 120, address: '경기 안양시 동안구', phone: '', url: '' },
    { id: '2', name: '평촌 순대국', lat: 37.392, lng: 126.954, distanceM: 210, address: '경기 안양시 동안구', phone: '', url: '' },
    { id: '3', name: '범계 소머리국밥', lat: 37.389, lng: 126.951, distanceM: 280, address: '경기 안양시 동안구', phone: '', url: '' },
  ];
  return {
    reportState: 'ready',
    center: { lat: 37.3907712532961, lng: 126.95294333709 },
    radius: 500,
    generatedAt: new Date().toISOString(),
    counts,
    competition: { categoryGroupCode: 'FD6', label: '동일 업종(음식점)', total: 45, densityPerKm2: 57.3, nearest },
    anchors: {
      score: 7,
      typeLabel: '역세권형',
      breakdown: [
        { categoryGroupCode: 'SW8', label: '지하철역', count: 1, weight: 3 },
        { categoryGroupCode: 'AC5', label: '학원', count: 9, weight: 2 },
        { categoryGroupCode: 'HP8', label: '병원', count: 22, weight: 1 },
      ],
    },
    actions: [],
    warnings: [],
    note: null,
    _categoryPlaces: {},
    diagnostics: { statusesByCategory: {}, failedCategories: [] },
  };
}

const MOCK_ACTIONS_RESPONSE = {
  status: 'SUCCESS',
  data: {
    aiMarketingActions: [
      {
        title: '출퇴근 직장인 점심 특선 & 타임 할인',
        why: '역세권 상권이라 주변 오피스 직장인의 점심 수요가 높고, 45개 경쟁 업소 속에서 속도·가격으로 차별화하면 유입을 늘릴 수 있습니다.',
        todo: ['점심 피크(11:30~13:00) 10% 할인 쿠폰 배포', '입구·간판에 점심 특선 POP 게시'],
        cta: { label: '우리 가게 USP 문구 만들기', action: 'OPEN_COPY_GENERATOR', payload: { type: 'usp' } },
      },
      {
        title: '퇴근길 포장 수요 겨냥 SNS 홍보',
        why: '퇴근 시간 간편 저녁을 찾는 이동 인구가 많아 포장 혜택을 강조하면 경쟁 대비 노출을 높일 수 있습니다.',
        todo: ['포장 주문 5% 추가 할인 운영', '인스타에 퇴근길 포장 메뉴 릴스 업로드'],
        cta: { label: '홍보 콘텐츠 템플릿 열기', action: 'OPEN_CONTENT_BUILDER', payload: { theme: 'commute' } },
      },
    ],
  },
};

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const frontendUrl = args['frontend-url'] || process.env.PULSE_FRONTEND_URL || 'http://localhost:5173';
  const springBaseUrl = args['spring-url'] || process.env.PULSE_SPRING_URL || 'http://127.0.0.1:8080';
  const fastApiUrl = args['fastapi-url'] || process.env.PULSE_FASTAPI_URL || 'http://127.0.0.1:8000';
  const artifactsDir = args['artifacts-dir'] || process.env.PULSE_PLAYWRIGHT_ARTIFACTS_DIR || defaultArtifactsDir;
  // 리포트는 즉시(<10s), AI 액션은 LLM 지연(~40s+)을 감안.
  const reportTimeoutMs = Number(args['report-timeout'] || 20000);
  const actionsTimeoutMs = Number(args['actions-timeout'] || 90000);
  // 기본은 외부 의존성(Kakao Local API 일일 한도, LLM 비용/지연)을 mock 해서 결정적으로 검증한다.
  // 실제 백엔드/카카오/LLM 전 구간을 보려면 --live 로 실행한다(쿼터가 남아 있어야 함).
  const live = args.live === 'true';
  const browserExecutable = detectBrowserExecutable();

  if (!browserExecutable) {
    throw new Error('No supported Chrome or Edge executable was found for Playwright.');
  }

  fs.mkdirSync(artifactsDir, { recursive: true });

  await waitForHttp(`${frontendUrl}/`);
  await waitForHttp(`${springBaseUrl}/api/auth/login`);
  await waitForHttp(`${fastApiUrl}/`);

  const email = `commercial-e2e-${Date.now()}@example.com`;
  const password = 'Pulse!2026a';
  await ensureTestUser({ springBaseUrl, email, password });

  const browser = await chromium.launch({ executablePath: browserExecutable, headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1024 } });
  const page = await context.newPage();

  if (!live) {
    // 상권 리포트는 즉시 반환(actions 비어 있음) — 디커플링된 백엔드 동작을 모사.
    await page.route('**/api/v1/map-insight/report', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(buildMockReport()) }),
    );
    // AI 액션은 LLM 지연을 짧게(1.5s) 모사한 뒤 실제 형태의 액션을 반환 → 점진적 로딩 검증.
    await page.route('**/api/v1/map-insight/actions', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_ACTIONS_RESPONSE) });
    });
    console.log('[mode] MOCK (map-insight 엔드포인트 mock). 실제 전 구간 검증은 --live 사용.');
  } else {
    console.log('[mode] LIVE (실제 Spring/Kakao/LLM 호출 — Kakao 일일 한도가 남아 있어야 함).');
  }

  // 상권 리포트 응답 시간 측정 (디커플링 검증용).
  const timings = {};
  let navStartedAt = 0;
  page.on('response', (response) => {
    const url = response.url();
    if (url.includes('/api/v1/map-insight/report') && !timings.report) {
      timings.report = Date.now() - navStartedAt;
    }
    if (url.includes('/api/v1/map-insight/actions') && !timings.actions) {
      timings.actions = Date.now() - navStartedAt;
    }
  });

  try {
    await page.goto(`${frontendUrl}/login`, { waitUntil: 'networkidle' });
    await page.getByTestId('login-email').fill(email);
    await page.getByTestId('login-password').fill(password);
    await page.getByTestId('login-submit').click();

    await page.waitForURL(/\/dashboard/, { timeout: 120000 });
    await page.getByTestId('dashboard-layout').waitFor({ timeout: 120000 });

    const desktopSidebar = page.getByTestId('sidebar-desktop');
    await desktopSidebar.hover();
    navStartedAt = Date.now();
    await page.getByTestId('sidebar-desktop-menu-commercial-analysis').click();

    // Phase 1: 리포트가 빠르게 렌더되는지 (지도 + 상권 데이터)
    await page.getByText('상권 분석 리포트').first().waitFor({ timeout: reportTimeoutMs });
    await page.getByText('주변 가게 현황').first().waitFor({ timeout: reportTimeoutMs });
    await page.getByText('같은 업종 분석').first().waitFor({ timeout: reportTimeoutMs });
    const reportRenderedMs = Date.now() - navStartedAt;
    console.log(`[Phase 1] 리포트 렌더 완료: ${reportRenderedMs}ms (report 응답 ${timings.report ?? 'n/a'}ms)`);

    await page.screenshot({
      path: path.join(artifactsDir, 'playwright-commercial-report.png'),
      fullPage: true,
    });

    // Phase 2: AI 실행 액션이 백그라운드로 실제로 채워지는지
    // (로딩 힌트 문구가 "이번 주 실행 액션"을 포함하므로 텍스트가 아닌 실제 액션 카드로 단언한다)
    const actionCard = page.getByTestId('map-insight-action-card').first();
    await actionCard.waitFor({ timeout: actionsTimeoutMs });
    const actionTitle = (await actionCard.locator('h4').first().innerText()).trim();
    const actionsRenderedMs = Date.now() - navStartedAt;
    if (actionTitle.startsWith('[AI 대기]')) {
      throw new Error(`AI 액션이 폴백으로 표시됨 (백엔드 연동 실패): "${actionTitle}"`);
    }
    console.log(`[Phase 2] AI 액션 표시 완료: ${actionsRenderedMs}ms (actions 응답 ${timings.actions ?? 'n/a'}ms) / 첫 액션: "${actionTitle}"`);

    await page.screenshot({
      path: path.join(artifactsDir, 'playwright-commercial-success.png'),
      fullPage: true,
    });

    console.log('✅ 상권분석 E2E 통과');
  } catch (error) {
    await page.screenshot({
      path: path.join(artifactsDir, 'playwright-commercial-failure.png'),
      fullPage: true,
    }).catch(() => {});
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
