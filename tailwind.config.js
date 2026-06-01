/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#002B7A',       // Primary Main
                    hover: '#002B7AE6',       // Primary Hover
                    sub: '#002B7ACC',         // Primary Sub (80%)
                    inactive: '#002B7A99',    // Primary Inactive (60%)
                    border: '#002B7A66',      // Primary Border (40%)
                    tint: '#002B7A1A',        // Primary Tint
                    stripe: '#002B7A0D',      // Table Stripe
                },
                point: {
                    DEFAULT: '#FF5A36CC',     // Action Main
                    bg: '#FF5A361A',          // Action Bg
                    hover: '#FF5A3633',       // Action Hover
                },
                bg: {
                    page: '#F5F7FA',          // Bg Page
                    card: '#FFFFFF',          // Bg Card
                },
                text: {
                    main: '#191F28',          // Text Main
                },
                // Feature Section 전용 배경 wipe 단계 (primary #002B7A 파생 불투명 blue)
                feature: {
                    1: '#002B7A',
                    2: '#123F8F',
                    3: '#21539C',
                    4: '#3466A9',
                    5: '#4577B5',
                },
                neutral: {
                    50:  '#F8FAFC',  // 섹션 배경, 아주 연한 구분 (slate-50)
                    100: '#F1F5F9',  // 태그 배경 (slate-100)
                    200: '#E2E8F0',  // 구분선, 카드 테두리 (slate-200)
                    300: '#CBD5E1',  // 비활성 요소 배경 (slate-300)
                    400: '#94A3B8',  // placeholder, 힌트 텍스트 (slate-400)
                    600: '#475569',  // 보조 본문 텍스트 (slate-600)
                    900: '#0F172A',  // 진한 텍스트 (slate-900)
                },
                success: '#059669',
                warning: '#D97706',
                error: '#DC2626',
            },
            fontFamily: {
                pretendard: ['"Pretendard Variable"', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif'],
            },
            fontSize: {
                // Headings (Bold/SemiBold, -2% tracking, 140% leading)
                'head-1': ['34px', { lineHeight: '1.4', letterSpacing: '-0.02em', fontWeight: '700' }],
                'head-2': ['32px', { lineHeight: '1.4', letterSpacing: '-0.02em', fontWeight: '600' }],
                'head-3': ['26px', { lineHeight: '1.4', letterSpacing: '-0.02em', fontWeight: '600' }],
                'head-4': ['22px', { lineHeight: '1.4', letterSpacing: '-0.02em', fontWeight: '600' }],
                'head-5': ['20px', { lineHeight: '1.4', letterSpacing: '-0.02em', fontWeight: '600' }],

                // Body (Various weights, -2% tracking)
                'body-1': ['18px', { letterSpacing: '-0.02em', fontWeight: '700' }],
                'body-2': ['18px', { letterSpacing: '-0.02em', fontWeight: '500' }],
                'body-3': ['18px', { letterSpacing: '-0.02em', fontWeight: '400' }],
                'body-4': ['16px', { letterSpacing: '-0.02em', fontWeight: '400' }],
                'body-5': ['14px', { letterSpacing: '-0.02em', fontWeight: '700' }],
                'body-6': ['14px', { letterSpacing: '-0.02em', fontWeight: '600' }],
                'body-7': ['14px', { letterSpacing: '-0.02em', fontWeight: '400' }],

                // Caption
                'caption': ['12px', { letterSpacing: '-0.02em', fontWeight: '400' }],

                // Buttons
                'btn-main': ['16px', { letterSpacing: '-0.02em', fontWeight: '600' }],
                'btn-sub': ['15px', { letterSpacing: '-0.02em', fontWeight: '500' }],

                // Error
                'error': ['13px', { letterSpacing: '-0.02em', fontWeight: '500' }],
            },
            boxShadow: {
                'soft': '0 4px 20px rgba(0, 43, 122, 0.15)',
            }
        },
    },
    safelist: [
        'bg-primary/85',
        'bg-primary/70',
        'bg-primary/55',
        'bg-primary/40',
        'bg-feature-1',
        'bg-feature-2',
        'bg-feature-3',
        'bg-feature-4',
        'bg-feature-5',
    ],
    plugins: [],
}
