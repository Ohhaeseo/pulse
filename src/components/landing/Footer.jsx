import React from 'react';
import { Instagram, Youtube, MessageCircle } from 'lucide-react';

const LINK_GROUPS = [
    {
        title: '서비스',
        links: ['기능 소개', '사용 방법', '자주 묻는 질문'],
    },
    {
        title: '회사',
        links: ['회사 소개', '블로그', '채용'],
    },
    {
        title: '약관·지원',
        links: ['서비스 이용약관', '개인정보처리방침', '고객센터'],
    },
];

const SOCIAL = [
    { icon: Instagram, label: 'Instagram' },
    { icon: Youtube, label: 'YouTube' },
    { icon: MessageCircle, label: '문의하기' },
];

const Footer = () => {
    return (
        <footer className="relative overflow-hidden bg-neutral-50 border-t border-neutral-200">
            <div className="max-w-[1200px] mx-auto px-6 pt-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8">
                    {/* 브랜드 */}
                    <div className="lg:col-span-5">
                        <img
                            src={`${import.meta.env.BASE_URL}PULSE_Logo_full.png`}
                            alt="PULSE"
                            className="h-7 w-auto mb-5"
                        />
                        <p className="text-body-7 text-neutral-500 leading-relaxed break-keep max-w-[320px] mb-6">
                            외식업 사장님을 위한 통합 마케팅 자동화 플랫폼.
                            <br />
                            분석부터 홍보, 성과 관리까지 PULSE 하나로.
                        </p>
                        <div className="flex gap-2.5">
                            {SOCIAL.map(({ icon: Icon, label }) => (
                                <a
                                    key={label}
                                    href="#"
                                    aria-label={label}
                                    className="w-9 h-9 rounded-full bg-white border border-neutral-200 grid place-items-center text-neutral-400 hover:text-primary hover:border-primary-border transition-colors duration-200"
                                >
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* 링크 컬럼 */}
                    <nav className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
                        {LINK_GROUPS.map((group) => (
                            <div key={group.title} className="flex flex-col gap-3">
                                <p className="text-body-6 text-text-main">{group.title}</p>
                                {group.links.map((link) => (
                                    <a
                                        key={link}
                                        href="#"
                                        className="text-caption text-neutral-500 hover:text-primary transition-colors duration-200"
                                    >
                                        {link}
                                    </a>
                                ))}
                            </div>
                        ))}
                    </nav>
                </div>

                {/* 하단 legal 바 */}
                <div className="border-t border-neutral-200 mt-14 pt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-caption text-neutral-400">Copyright © 2025 PULSE. All rights reserved.</p>
                    <p className="text-caption text-neutral-400 leading-relaxed break-keep">
                        상호 (주)펄스 · 대표 홍길동 · 사업자등록번호 000-00-00000 · 통신판매업신고 0000-서울-0000
                    </p>
                </div>

                {/* 대형 워드마크 — 브랜드 클로징 */}
                <p
                    aria-hidden="true"
                    className="select-none pointer-events-none mt-10 -mb-[0.16em] text-[56px] sm:text-[96px] lg:text-[128px] font-bold tracking-tighter leading-none text-neutral-200"
                >
                    PULSE
                </p>
            </div>
        </footer>
    );
};

export default Footer;
