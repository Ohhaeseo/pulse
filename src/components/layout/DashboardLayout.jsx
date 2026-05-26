import React, { useEffect, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import StatusV2Page from '../../features/dashboard-v2/StatusV2Page';
import UnifiedInsightPage from '../../features/insight/UnifiedInsightPage';
import CommercialAnalysisPage from '../../features/insight/CommercialAnalysisPage';
import MyPage from '../../features/mypage/MyPage';
import PromotionPage from '../../features/promotion/PromotionPage';
import ReviewManagementPage from '../../features/reviewManagement/ReviewManagementPage';
import SubscriptionPage from '../../pages/SubscriptionPage';
import InfluencerMatchingPage from '../../features/influencer/InfluencerMatchingPage';
import { fetchCurrentProfile } from '../../features/auth/api/authApi';
import { COLORS } from '../../constants';
import '../../styles/globals.css';

export default function DashboardLayout({ initialPage, content }) {
    const [activeMenu, setActiveMenu] = useState(initialPage || 'status');
    const [isExpanded, setIsExpanded] = useState(false);
    const [userProfile, setUserProfile] = useState(null);

    const [navParams, setNavParams] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const loadCurrentProfile = async () => {
            const profile = await fetchCurrentProfile();
            if (isMounted && profile) {
                setUserProfile(profile);
            }
        };

        loadCurrentProfile();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleNavigate = (menuId, params = null) => {
        setActiveMenu(menuId);
        setNavParams(params);
    };

    const handleSidebarNavigate = (menuId) => {
        setActiveMenu(menuId);
        setNavParams(null);
    };

    return (
        <div className="flex h-dvh font-pretendard overflow-hidden" style={{ backgroundColor: COLORS.bgPage }} data-testid="dashboard-layout">
            <Sidebar
                activeMenu={activeMenu}
                setActiveMenu={handleSidebarNavigate}
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
                profile={userProfile}
            />

            <main
                className={`flex-1 p-6 h-full flex flex-col main-content pt-20 md:pt-6 transition-[margin] duration-300 ${isExpanded ? 'md:ml-[276px] ml-0' : 'md:ml-[96px] ml-0'}`}
            >
                <div className="max-w-[1400px] h-full flex flex-col w-full mx-auto">
                    {activeMenu === 'status' ? (
                        // UNIFIED STORE DASHBOARD
                        <>
                            <StatusV2Page onNavigate={handleNavigate} />
                        </>
                    ) : activeMenu === 'commercial-analysis' ? (
                        // COMMERCIAL ANALYSIS VIEW
                        <>
                            <Header title="우리 가게 주변 상권을 심층 분석합니다." profile={userProfile} />
                            <CommercialAnalysisPage />
                        </>
                    ) : activeMenu === 'insight' ? (
                        // INSIGHT VIEW
                        <>
                            <Header title="단골 손님과 상권 트렌드를 분석해 드려요." profile={userProfile} />
                            <UnifiedInsightPage onNavigate={handleNavigate} />
                        </>
                    ) : activeMenu === 'mypage' ? (
                        // MYPAGE VIEW
                        <>
                            <Header title="가게 정보와 연동 상태를 관리하세요." profile={userProfile} />
                            <MyPage onNavigate={handleNavigate} profile={userProfile} />
                        </>
                    ) : activeMenu === 'promotion' ? (
                        // PROMOTION VIEW
                        <>
                            <Header title="사장님의 사진으로 홍보 영상을 빠르게 제작해 드려요." profile={userProfile} />
                            <PromotionPage initialParams={navParams} onNavigate={handleNavigate} />
                        </>
                    ) : activeMenu === 'review' ? (
                        // REVIEW MANAGEMENT VIEW
                        <div className="flex-1 flex flex-col min-h-0">
                            <Header title="리뷰를 관리하고 AI로 답변을 작성하세요." profile={userProfile} />
                            <ReviewManagementPage />
                        </div>
                    ) : activeMenu === 'subscription' ? (
                        // SUBSCRIPTION VIEW
                        <SubscriptionPage onNavigate={handleNavigate} />
                    ) : activeMenu === 'influencer-matching' ? (
                        // INFLUENCER MATCHING VIEW
                        // content prop이 있으면(RequestPage 등) 그것을 렌더링, 아니면 메인 페이지
                        content || (
                            <>
                                <Header title="우리 가게에 딱 맞는 인플루언서를 찾아보세요." profile={userProfile} />
                                <InfluencerMatchingPage initialParams={navParams} />
                            </>
                        )
                    ) : (
                        // Placeholder for other menus
                        <div className="flex items-center justify-center h-full text-gray-400 flex-col gap-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                <MoreHorizontal size={32} className="text-gray-400" />
                            </div>
                            <p>준비 중인 기능입니다.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
