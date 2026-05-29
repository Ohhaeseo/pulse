/**
 * CommercialAnalysisPage Component
 * 주변 상권 분석 페이지 - Kakao Places API 실제 데이터 사용
 *
 * 실시간으로 조회되는 데이터:
 *   - 반경 내 업종별 개수 (음식점, 카페, 편의점, 병원 등)
 *   - 경쟁 업소 목록 (거리 오름차순)
 *   - 앵커 타입 판별 (역세권, 학원가, 의료상권 등)
 *   - 카테고리별 지도 마커
 *
 * 백엔드 필요 데이터 (현재 미표시):
 *   - AI 액션 추천
 *   - 유동인구 분석
 */

import React, { useState, useEffect, useCallback } from 'react';
import KakaoMapContainer from './components/KakaoMapContainer';
import SummaryPanel from './components/SummaryPanel';
import SearchBar from './components/SearchBar';
import { AlertCircle, Loader2, RefreshCw, Search } from 'lucide-react';
import { MOCK_STORE } from '../../data/marketMockData'; // 가게 좌표는 유지 (추후 API로 교체)
import { fetchRealMarketData } from './kakaoPlacesService';
import { fetchMyStoreInfo } from './api/mapInsightApi';

function normalizeMarketError(error) {
    return {
        code: error?.code || 'unknown',
        title: error?.title || '상권 데이터를 불러오지 못했습니다',
        message: error?.message || '잠시 후 다시 시도해 주세요.',
        actionLabel: error?.actionLabel || '다시 시도',
    };
}

function EmptyReportPanel({ emptyState, onRadiusChange }) {
    return (
        <div className="h-full bg-[#F5F7FA] px-6 py-6">
            <div className="h-full bg-white border border-[#E5E8EB] rounded-xl flex flex-col items-center justify-center text-center px-8">
                <div className="w-14 h-14 rounded-full bg-[#002B7A1A] flex items-center justify-center mb-4">
                    <Search size={24} className="text-[#002B7A]" />
                </div>
                <h3 className="text-[18px] font-bold text-[#191F28] mb-2">
                    {emptyState?.title || '조회된 상권 데이터가 없습니다'}
                </h3>
                <p className="text-[14px] text-gray-600 leading-relaxed max-w-sm">
                    {emptyState?.message || '반경을 넓히거나 다른 장소를 검색해 주세요.'}
                </p>
                {emptyState?.suggestedRadius && (
                    <button
                        onClick={() => onRadiusChange(emptyState.suggestedRadius)}
                        className="mt-5 px-4 py-2.5 bg-[#002B7A] text-white rounded-lg text-[14px] font-bold hover:bg-[#001F5C] transition-colors"
                    >
                        {emptyState.actionLabel || '반경 넓히기'}
                    </button>
                )}
            </div>
        </div>
    );
}

export default function CommercialAnalysisPage() {
    const [radius, setRadius] = useState(500);
    const [map, setMap] = useState(null);
    const [analysisTarget, setAnalysisTarget] = useState(null);
    const [marketData, setMarketData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isKakaoReady, setIsKakaoReady] = useState(false);
    const [isTargetReady, setIsTargetReady] = useState(false);

    // 카카오 SDK 로드 대기
    useEffect(() => {
        const checkKakao = () => {
            if (window.kakao?.maps?.services) {
                setIsKakaoReady(true);
            } else {
                setTimeout(checkKakao, 200);
            }
        };
        checkKakao();
    }, []);

    useEffect(() => {
        if (!isKakaoReady) return;

        let cancelled = false;

        const loadStoreTarget = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const store = await fetchMyStoreInfo();
                let lat = Number(store.lat);
                let lng = Number(store.lng);

                if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                    console.warn('[CommercialAnalysis] backend coordinates missing. Using temporary fallback coordinates.', store);
                    lat = MOCK_STORE.lat;
                    lng = MOCK_STORE.lng;
                }

                if (cancelled) return;

                setAnalysisTarget({
                    storeId: store.storeId || store.id || 'current-store',
                    storeName: store.storeName,
                    address: store.address,
                    lat,
                    lng,
                    primaryCategoryGroupCode: store.primaryCategoryGroupCode || 'FD6',
                });
                setIsTargetReady(true);
            } catch (err) {
                console.warn('[CommercialAnalysis] store target fallback:', err);
                if (cancelled) return;
                setAnalysisTarget(MOCK_STORE);
                setIsTargetReady(true);
            }
        };

        loadStoreTarget();

        return () => {
            cancelled = true;
        };
    }, [isKakaoReady]);

    // 실제 상권 데이터 조회
    const loadMarketData = useCallback(async () => {
        if (!isKakaoReady || !isTargetReady || !analysisTarget) return;

        setIsLoading(true);
        setError(null);

        try {
            console.log(`📊 카카오 Places API 조회 중... 반경 ${radius}m`);
            const data = await fetchRealMarketData(
                { lat: analysisTarget.lat, lng: analysisTarget.lng },
                radius,
                analysisTarget.primaryCategoryGroupCode
            );
            setMarketData(data);
            console.log('✅ 실제 상권 데이터 로드 완료:', data);
        } catch (err) {
            console.error('[CommercialAnalysis] 데이터 조회 실패:', err);
            setMarketData(null);
            setError(normalizeMarketError(err));
        } finally {
            setIsLoading(false);
        }
    }, [radius, isKakaoReady, isTargetReady, analysisTarget]);

    // 반경 변경 또는 카카오 준비 완료 시 재조회
    useEffect(() => {
        loadMarketData();
    }, [loadMarketData]);

    // 반경 변경 핸들러
    const handleRadiusChange = (newRadius) => {
        console.log('🔄 반경 변경:', newRadius);
        setRadius(newRadius);
    };

    // 지도 준비 완료 핸들러
    const handleMapReady = (mapInstance) => {
        console.log('✅ 지도 준비 완료');
        setMap(mapInstance);
    };

    // 경쟁 업소 클릭 시 지도 이동
    const handlePlaceClick = (place) => {
        if (map && window.kakao) {
            const moveLatLon = new window.kakao.maps.LatLng(place.lat, place.lng);
            map.panTo(moveLatLon);
        }
    };

    // 검색 이동
    const handleSearch = (place) => {
        const nextTarget = {
            storeId: place.id || `place-${place.y}-${place.x}`,
            storeName: place.place_name || '선택한 장소',
            address: place.road_address_name || place.address_name || '',
            lat: parseFloat(place.y),
            lng: parseFloat(place.x),
            primaryCategoryGroupCode: analysisTarget?.primaryCategoryGroupCode || 'FD6',
        };

        setAnalysisTarget(nextTarget);

        if (map && window.kakao) {
            map.panTo(new window.kakao.maps.LatLng(nextTarget.lat, nextTarget.lng));
        }
    };

    // 새로고침
    const handleRefresh = () => {
        loadMarketData();
    };

    const handleErrorAction = () => {
        if (error?.code === 'invalid_radius') {
            setRadius(500);
            return;
        }

        loadMarketData();
    };

    const center = analysisTarget
        ? { lat: analysisTarget.lat, lng: analysisTarget.lng }
        : { lat: MOCK_STORE.lat, lng: MOCK_STORE.lng };
    const isEmptyReport = marketData?.reportState === 'empty';

    return (
        <div className="w-full h-full flex flex-col gap-0 bg-white rounded-[24px] overflow-hidden border border-[#E5E8EB] shadow-sm relative">
            {/* 로딩 상태 */}
            {isLoading && (
                <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-50 rounded-[24px]">
                    <div className="text-center">
                        <Loader2 size={40} className="text-[#002B7A] animate-spin mx-auto mb-4" />
                        <p className="text-[#002B7A] font-medium text-[16px]">상권 데이터 분석 중...</p>
                        <p className="text-gray-500 text-[14px] mt-2">반경 {radius}m 내 업소 정보 수집</p>
                    </div>
                </div>
            )}

            {/* 오류 상태 */}
            {!isLoading && error && (
                <div className="absolute top-0 right-0 bottom-0 w-[40%] bg-white flex flex-col items-center justify-center z-50 rounded-r-[24px] p-8 border-l border-[#E5E8EB]">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle size={32} className="text-red-500" />
                    </div>
                    <h3 className="text-[18px] font-bold text-[#191F28] mb-2">{error.title}</h3>
                    <p className="text-[14px] text-gray-600 text-center max-w-md mb-5 leading-relaxed">
                        {error.message}
                    </p>
                    <button
                        onClick={handleErrorAction}
                        className="px-4 py-2 bg-[#002B7A] text-white rounded-lg text-sm font-bold hover:bg-[#001F5C]"
                    >
                        {error.actionLabel}
                    </button>
                </div>
            )}

            {/* 전체 영역: 지도 + 패널 */}
            <div className="flex-1 flex gap-0 min-h-0">
                {/* 좌측: 지도 (60%) */}
                <div className="w-[60%] h-full relative">
                    {/* 검색 바 */}
                    <div className="absolute top-4 left-4 z-20 w-[400px]">
                        <SearchBar
                            center={center}
                            onSearch={handleSearch}
                        />
                    </div>

                    <KakaoMapContainer
                        center={center}
                        radius={radius}
                        onRadiusChange={handleRadiusChange}
                        storeName={analysisTarget?.storeName || MOCK_STORE.storeName}
                        onMapReady={handleMapReady}
                    />
                </div>

                {/* 우측: 요약 패널 (40%) */}
                <div className="w-[40%] h-full flex flex-col">
                    {/* 리포트 헤더 */}
                    <div className="bg-[#F5F7FA] px-6 py-4 border-b border-[#E5E8EB] flex items-center justify-between flex-shrink-0">
                        <div>
                            <h2 className="text-[20px] font-bold text-[#002B7A]">상권 분석 리포트</h2>
                            <p className="text-[14px] text-gray-600 mt-1">
                                {marketData
                                    ? new Date(marketData.generatedAt).toLocaleDateString('ko-KR', {
                                        year: 'numeric', month: 'long', day: 'numeric'
                                    }) + ' 기준 (실시간)'
                                    : '조회 중...'}
                            </p>
                            <p className="text-[12px] text-gray-500 mt-1">
                                {analysisTarget?.storeName || MOCK_STORE.storeName} 기준
                            </p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E5E8EB] rounded-lg hover:bg-gray-50 hover:border-[#002B7A] transition-all group disabled:opacity-50"
                            title="데이터 새로고침"
                        >
                            <RefreshCw size={14} className={`text-gray-600 group-hover:text-[#002B7A] transition-colors ${isLoading ? 'animate-spin' : ''}`} />
                            <span className="text-[13px] font-medium text-gray-700 group-hover:text-[#002B7A]">새로고침</span>
                        </button>
                    </div>

                    {/* 패널 콘텐츠 */}
                    <div className="flex-1 min-h-0">
                        {marketData && !isLoading && isEmptyReport && (
                            <EmptyReportPanel
                                emptyState={marketData.emptyState}
                                onRadiusChange={handleRadiusChange}
                            />
                        )}
                        {marketData && !isLoading && !isEmptyReport && (
                            <SummaryPanel
                                data={marketData}
                                onPlaceClick={handlePlaceClick}
                                showHeader={false}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
