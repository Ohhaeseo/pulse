import { fetchAiMarketingActions, fetchMarketInsightReport } from './api/mapInsightApi.js';
/**
 * kakaoPlacesService.js
 * 카카오 지도 Places API를 이용한 상권 데이터 실시간 조회
 *
 * 사용 API: kakao.maps.services.Places.categorySearch()
 * 문서: https://apis.map.kakao.com/web/documentation/#services_Places_categorySearch
 */

// 분석할 카테고리 목록
const CATEGORY_CONFIGS = [
    { code: 'FD6', label: '음식점' },
    { code: 'CE7', label: '카페' },
    { code: 'CS2', label: '편의점' },
    { code: 'HP8', label: '병원' },
    { code: 'PM9', label: '약국' },
    { code: 'SW8', label: '지하철역' },
    { code: 'SC4', label: '학교' },
    { code: 'AC5', label: '학원' },
];

// 앵커 타입 판별 기준
const ANCHOR_WEIGHTS = {
    SW8: { weight: 3, label: '지하철역' },
    SC4: { weight: 2, label: '학교' },
    AC5: { weight: 2, label: '학원' },
    HP8: { weight: 1, label: '병원' },
};

const REPORT_STATE = {
    READY: 'ready',
    EMPTY: 'empty',
};

const isDev = import.meta.env.DEV;

function logMarket(level, event, payload = {}, devOnly = false) {
    if (devOnly && !isDev) return;

    console[level](event, {
        ...payload,
        timestamp: new Date().toISOString(),
    });
}

function getKakaoStatusName(status) {
    const statuses = window.kakao?.maps?.services?.Status || {};
    const match = Object.entries(statuses).find(([, value]) => value === status);
    return match?.[0] || String(status || 'UNKNOWN');
}

function createMarketError({ code, title, message, actionLabel = '다시 시도', details = {} }) {
    const error = new Error(message);
    error.code = code;
    error.title = title;
    error.actionLabel = actionLabel;
    error.details = details;
    return error;
}

function validateCenter(center) {
    const lat = Number(center?.lat);
    const lng = Number(center?.lng);
    const isValidLat = Number.isFinite(lat) && lat >= -90 && lat <= 90;
    const isValidLng = Number.isFinite(lng) && lng >= -180 && lng <= 180;

    if (!isValidLat || !isValidLng) {
        logMarket('error', '[CommercialAnalysis] invalid_center', { rawCenter: center }, false);
        throw createMarketError({
            code: 'invalid_center',
            title: '분석할 위치를 확인할 수 없습니다',
            message: '장소를 다시 검색하거나 저장된 가게 위치를 확인해 주세요.',
            actionLabel: '장소 다시 검색',
            details: { rawCenter: center },
        });
    }

    return { lat, lng };
}

function validateRadius(radiusM) {
    const radius = Number(radiusM);
    const allowed = [300, 500, 1000];

    if (!allowed.includes(radius)) {
        throw createMarketError({
            code: 'invalid_radius',
            title: '분석 반경을 다시 선택해 주세요',
            message: '지원하지 않는 반경입니다. 300m, 500m, 1km 중 하나를 선택해 주세요.',
            actionLabel: '500m로 재설정',
            details: { radiusM },
        });
    }

    return radius;
}

/**
 * 하나의 카테고리 코드로 반경 내 장소를 모두 조회 (페이지네이션 포함)
 * @param {object} ps   - kakao.maps.services.Places 인스턴스
 * @param {{ code: string, label: string }} category
 * @param {{ lat: number, lng: number }} center
 * @param {number} radiusM - 검색 반경 (미터)
 * @returns {Promise<object>} 카테고리 조회 결과
 */
function searchCategoryAll(ps, category, center, radiusM) {
    return new Promise((resolve) => {
        const { code, label } = category;
        const allPlaces = [];
        let currentPage = 1;
        let pageCount = 0;

        const fetchPage = () => {
            ps.categorySearch(
                code,
                (data, status, pagination) => {
                    const statusName = getKakaoStatusName(status);

                    if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
                        logMarket('info', '[KakaoPlaces] category:zero_result', {
                            code,
                            label,
                            center,
                            radius: radiusM,
                        }, true);

                        resolve({
                            code,
                            label,
                            status: 'ZERO_RESULT',
                            places: allPlaces,
                            pageCount,
                        });
                        return;
                    }

                    if (status !== window.kakao.maps.services.Status.OK) {
                        const resultStatus = allPlaces.length > 0 ? 'PARTIAL_ERROR' : 'ERROR';
                        logMarket(resultStatus === 'ERROR' ? 'error' : 'warn', '[KakaoPlaces] category:failed', {
                            code,
                            label,
                            status: statusName,
                            center,
                            radius: radiusM,
                            collectedCount: allPlaces.length,
                            page: currentPage,
                        }, resultStatus !== 'ERROR');

                        resolve({
                            code,
                            label,
                            status: resultStatus,
                            rawStatus: statusName,
                            places: allPlaces,
                            pageCount,
                        });
                        return;
                    }

                    pageCount++;
                    allPlaces.push(...data);

                    // 다음 페이지가 있고 최대 3페이지까지만 (과도한 요청 방지)
                    if (pagination.hasNextPage && currentPage < 3) {
                        currentPage++;
                        fetchPage();
                    } else {
                        logMarket('info', '[KakaoPlaces] category:ok', {
                            code,
                            label,
                            count: allPlaces.length,
                            pageCount,
                            radius: radiusM,
                        }, true);

                        resolve({
                            code,
                            label,
                            status: 'OK',
                            places: allPlaces,
                            pageCount,
                        });
                    }
                },
                {
                    location: new window.kakao.maps.LatLng(center.lat, center.lng),
                    radius: radiusM,
                    useMapBounds: false,
                    size: 15,
                    page: currentPage,
                }
            );
        };

        fetchPage();
    });
}

/**
 * 카카오 Places API로 반경 내 상권 데이터 전체 조회
 *
 * @param {{ lat: number, lng: number }} center - 중심 좌표
 * @param {number} radiusM - 검색 반경 (미터)
 * @param {string} primaryCategory - 내 가게 업종 코드 (기본: 'FD6')
 * @returns {Promise<object>} marketData (SummaryPanel에서 소비하는 구조)
 */
export async function fetchRealMarketData(center, radiusM, primaryCategory = 'FD6') {
    const validCenter = validateCenter(center);
    const validRadius = validateRadius(radiusM);

    try {
        return await fetchMarketInsightReport({
            latitude: validCenter.lat,
            longitude: validCenter.lng,
            radius: validRadius,
            category: primaryCategory,
        });
    } catch (backendError) {
        if (backendError.status === 400) {
            throw createMarketError({
                code: 'market_lookup_failed',
                title: '상권 데이터를 불러오지 못했습니다',
                message: '지도는 정상으로 열렸지만 현재 상권 데이터 조회 한도 또는 지도 서비스 설정 문제로 리포트를 만들 수 없습니다.',
                details: { center: validCenter, radius: validRadius, source: 'spring-report' },
            });
        }

        logMarket('warn', '[CommercialAnalysis] backend report:failed, falling back to Kakao JS Places', {
            error: backendError.message,
        }, false);
    }

    if (!window.kakao?.maps?.services) {
        logMarket('error', '[KakaoMap] sdk:failed', {
            hasKakao: Boolean(window.kakao),
            hasMaps: Boolean(window.kakao?.maps),
            hasServices: Boolean(window.kakao?.maps?.services),
        }, false);

        throw createMarketError({
            code: 'sdk_unavailable',
            title: '지도 서비스를 불러오지 못했습니다',
            message: '지도 서비스가 준비되지 않아 상권 분석을 시작할 수 없습니다.',
            details: {
                hasKakao: Boolean(window.kakao),
                hasMaps: Boolean(window.kakao?.maps),
                hasServices: Boolean(window.kakao?.maps?.services),
            },
        });
    }

    const ps = new window.kakao.maps.services.Places();

    logMarket('info', '[CommercialAnalysis] market lookup:start', {
        center: validCenter,
        radius: validRadius,
        primaryCategory,
        categoryCodes: CATEGORY_CONFIGS.map(({ code }) => code),
    }, true);

    // 모든 카테고리 병렬 조회
    const results = await Promise.all(
        CATEGORY_CONFIGS.map((category) => searchCategoryAll(ps, category, validCenter, validRadius))
    );

    const failedResults = results.filter(({ status }) => status === 'ERROR' || status === 'PARTIAL_ERROR');
    const failedCategories = failedResults.map(({ code }) => code);
    const primaryResult = results.find(({ code }) => code === primaryCategory);
    const primaryFailed = primaryResult?.status === 'ERROR' || primaryResult?.status === 'PARTIAL_ERROR';
    const allFailed = failedResults.length === results.length;
    const allEmpty = results.every(({ status, places }) =>
        (status === 'OK' || status === 'ZERO_RESULT') && places.length === 0
    );
    const statusesByCategory = Object.fromEntries(
        results.map(({ code, status, rawStatus }) => [code, rawStatus || status])
    );

    if (allFailed) {
        logMarket('error', '[KakaoPlaces] lookup:failed', {
            statusesByCategory,
            center: validCenter,
            radius: validRadius,
            sdkReady: true,
        }, false);

        if (failedResults.every(({ rawStatus }) => rawStatus === 'ERROR')) {
            logMarket('warn', '[KakaoPlaces] quota: suspected', {
                status: 'ERROR',
                message: '모든 카테고리 조회가 ERROR로 실패했습니다. 앱 키, 도메인 등록, 사용량 제한을 함께 확인해 주세요.',
                failedCategories,
            }, false);
        }

        throw createMarketError({
            code: 'market_lookup_failed',
            title: '상권 데이터를 불러오지 못했습니다',
            message: '잠시 후 다시 시도해 주세요. 문제가 계속되면 지도 서비스 설정이나 사용량 제한을 확인해야 합니다.',
            details: { statusesByCategory, failedCategories, center: validCenter, radius: validRadius },
        });
    }

    if (primaryFailed) {
        logMarket('error', '[KakaoPlaces] primary_category:failed', {
            primaryCategory,
            status: primaryResult?.rawStatus || primaryResult?.status,
            center: validCenter,
            radius: validRadius,
        }, false);

        throw createMarketError({
            code: 'primary_category_failed',
            title: '같은 업종 분석을 불러오지 못했습니다',
            message: '경쟁 업소 데이터를 확인할 수 없어 리포트를 완성하지 못했습니다.',
            details: { primaryCategory, statusesByCategory, center: validCenter, radius: validRadius },
        });
    }

    if (failedResults.length > 0) {
        logMarket('warn', '[KakaoPlaces] category:partial_failure', {
            failedCategories,
            successfulCategories: results.filter(({ status }) => status === 'OK' || status === 'ZERO_RESULT').map(({ code }) => code),
            center: validCenter,
            radius: validRadius,
        }, false);
    }

    // 카테고리별 결과 매핑
    const categoryPlaces = {};
    const counts = {};

    results.forEach(({ code, label, places, status, rawStatus }) => {
        counts[code] = {
            label,
            total: places.length,
            status,
            unavailable: status === 'ERROR' || status === 'PARTIAL_ERROR',
        };

        // 지도 마커용 장소 목록 (상위 10개)
        categoryPlaces[code] = places.slice(0, 10).map(p => ({
            id: p.id,
            name: p.place_name,
            lat: parseFloat(p.y),
            lng: parseFloat(p.x),
            distanceM: parseInt(p.distance, 10) || 0,
            address: p.road_address_name || p.address_name,
            phone: p.phone,
            url: p.place_url,
        }));

        if (status === 'PARTIAL_ERROR') {
            counts[code].note = rawStatus || 'PARTIAL_ERROR';
        }
    });

    if (allEmpty) {
        return {
            reportState: REPORT_STATE.EMPTY,
            emptyState: {
                title: '조회된 상권 데이터가 없습니다',
                message: '선택한 위치와 반경에서 장소 정보가 발견되지 않았습니다. 반경을 넓히거나 다른 장소를 검색해 주세요.',
                actionLabel: validRadius === 1000 ? '장소 다시 검색' : '반경 1km로 보기',
                suggestedRadius: validRadius === 1000 ? null : 1000,
            },
            center: validCenter,
            radius: validRadius,
            generatedAt: new Date().toISOString(),
            counts,
            competition: {
                categoryGroupCode: primaryCategory,
                label: `내 업종(${counts[primaryCategory]?.label || '음식점'})`,
                total: 0,
                densityPerKm2: 0,
                nearest: [],
            },
            anchors: {
                score: 0,
                typeLabel: '데이터 없음',
                breakdown: [],
            },
            actions: [],
            warnings: [],
            note: '선택한 위치와 반경에서 조회된 장소가 없습니다.',
            _categoryPlaces: categoryPlaces,
            diagnostics: { statusesByCategory, failedCategories },
        };
    }

    // 경쟁 업소 (내 업종 상위 5개, 거리 오름차순)
    const competitorPlaces = categoryPlaces[primaryCategory] || [];
    const sortedCompetitors = [...competitorPlaces]
        .sort((a, b) => a.distanceM - b.distanceM)
        .slice(0, 5);

    // 앵커 점수 계산
    const anchorBreakdown = Object.entries(ANCHOR_WEIGHTS).map(([code, { weight, label }]) => ({
        categoryGroupCode: code,
        label,
        count: counts[code]?.total || 0,
        weight,
    })).filter(a => a.count > 0);

    const anchorScore = anchorBreakdown.reduce(
        (sum, a) => sum + Math.min(a.count, 3) * a.weight, // 카테고리당 최대 3 스택
        0
    );

    const anchorType =
        (counts['SW8']?.total || 0) >= 1 ? '역세권형' :
        (counts['SC4']?.total || 0) + (counts['AC5']?.total || 0) >= 5 ? '학원가형' :
        (counts['HP8']?.total || 0) >= 5 ? '의료상권형' :
        anchorScore >= 5 ? '복합상권형' :
        '일반상권형';

    // km² 밀도 계산 (원 면적 = π * r²)
    const areKm2 = Math.PI * Math.pow(validRadius / 1000, 2);
    const densityPerKm2 = Math.round((counts[primaryCategory]?.total || 0) / areKm2 * 10) / 10;
    const warnings = failedResults.length > 0
        ? [{
            type: 'partial_failure',
            title: '일부 데이터가 반영되지 않았습니다',
            message: '주요 경쟁 분석은 표시되지만, 주변 시설 일부는 조회되지 않았습니다.',
            failedCategories: failedResults.map(({ code, label }) => ({ code, label })),
        }]
        : [];

    // --- 동적 액션 생성 로직 (AI 백엔드 연동) ---
    const marketSummary = {
        competitionTotal: counts[primaryCategory]?.total || 0,
        densityPerKm2,
        anchorScore,
        anchorType
    };

    let fetchedActions = [];
    try {
        fetchedActions = await fetchAiMarketingActions({
            latitude: validCenter.lat,
            longitude: validCenter.lng,
            radius: validRadius,
            category: primaryCategory,
            marketSummary
        });
    } catch (e) {
        logMarket('error', '[KakaoPlaces] ai_actions:failed', { error: e.message }, false);
    }

    return {
        reportState: REPORT_STATE.READY,
        center: validCenter,
        radius: validRadius,
        generatedAt: new Date().toISOString(),
        counts,
        competition: {
            categoryGroupCode: primaryCategory,
            label: `내 업종(${counts[primaryCategory]?.label || '음식점'})`,
            total: counts[primaryCategory]?.total || 0,
            densityPerKm2,
            nearest: sortedCompetitors,
        },
        anchors: {
            score: anchorScore,
            typeLabel: anchorType,
            breakdown: anchorBreakdown,
        },
        actions: fetchedActions,
        warnings,
        note: warnings.length > 0 ? '일부 주변 시설 데이터는 조회 실패로 집계에서 제외되었습니다.' : null,
        _categoryPlaces: categoryPlaces, // 지도 마커용
        diagnostics: { statusesByCategory, failedCategories },
    };
}
