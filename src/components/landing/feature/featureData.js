import { Users, PlayCircle, LayoutDashboard, MessageSquare, Star } from 'lucide-react';
import {
    InsightMockup,
    ReelsMockup,
    DashboardMockup,
    ReviewMockup,
    InfluencerMockup,
} from '../mockups/index';

// Feature Section 데이터.
// bgClass: lg+ 좌측 sticky 패널의 배경 wipe 레이어 색 (tailwind feature-1~5 토큰)
export const FEATURES = [
    {
        id: 'insight',
        badge: '손님 분석',
        badgeVariant: 'primary',
        icon: Users,
        title: '손님이 뭘 좋아하는지\nAI가 파악합니다.',
        description: '주변 상권 데이터와 리뷰를 분석해 손님 페르소나와 마케팅 포인트를 도출합니다.',
        points: ['주변 상권·유동인구·키워드 분석', '리뷰 기반 페르소나·니즈 도출', '마케팅 포인트 자동 추출'],
        bgClass: 'bg-feature-1',
        MockupComponent: InsightMockup,
        isPro: false,
    },
    {
        id: 'reels',
        badge: '홍보 영상 만들기',
        badgeVariant: 'primary',
        icon: PlayCircle,
        title: '사진을 업로드하면\n숏폼 영상 완성.',
        description: '분석된 인사이트를 반영해 AI가 음악·자막·장면 구성까지 자동으로 만들어드립니다.',
        points: ['페르소나 기반 영상 스타일 자동 설정', '음악·자막·장면 구성 AI 제안', '9:16 숏폼 영상 원스톱 생성'],
        bgClass: 'bg-feature-2',
        MockupComponent: ReelsMockup,
        isPro: false,
    },
    {
        id: 'dashboard',
        badge: '가게 현황',
        badgeVariant: 'primary',
        icon: LayoutDashboard,
        title: '성과 확인 후\n다음 행동을 알려드립니다.',
        description: '검색량·방문·영상 성과를 한눈에 보고, AI가 지금 당장 해야 할 미션을 제안합니다.',
        points: ['검색량·방문·영상 성과 통합 확인', 'AI 추천 미션 (다음 행동) 제시', '홍보 루프 지속 유지'],
        bgClass: 'bg-feature-3',
        MockupComponent: DashboardMockup,
        isPro: false,
    },
    {
        id: 'review',
        badge: '리뷰 관리 & 답변',
        badgeVariant: 'neutral',
        icon: MessageSquare,
        title: '리뷰 모니터링부터\nAI 답변 제안까지.',
        description: '고객 리뷰를 감정 분석하고, 맥락에 맞는 AI 답변을 제안해 고객 소통을 효율화합니다.',
        points: ['리뷰 실시간 모니터링', '감정 분석 및 핵심 키워드 추출', 'AI 맞춤 답변 제안'],
        bgClass: 'bg-feature-4',
        MockupComponent: ReviewMockup,
        isPro: false,
    },
    {
        id: 'influencer',
        badge: '인플루언서 매칭',
        badgeVariant: 'point',
        icon: Star,
        title: '가게에 딱 맞는\n인플루언서를 연결합니다.',
        description: '가게 특성과 손님 페르소나에 맞는 인플루언서를 추천하고, 협찬 매칭까지 도와드립니다.',
        points: ['가게 특성 기반 인플루언서 추천', '협찬 조건 조율 및 매칭 지원', '홍보 효과 사후 분석'],
        bgClass: 'bg-feature-5',
        MockupComponent: InfluencerMockup,
        isPro: true,
    },
];

// Header 높이 보정 (px). LandingPage의 fixed Header와 동일.
export const HEADER_OFFSET = 65;
