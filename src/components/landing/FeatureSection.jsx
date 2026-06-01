import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Badge from '../ui/Badge';
import { FEATURES, HEADER_OFFSET } from './feature/featureData';

gsap.registerPlugin(ScrollTrigger);

const EASE = [0.22, 1, 0.36, 1];

// 우측 콘텐츠(텍스트 + mockup) — fade-up stagger reveal
const RightContent = ({ feature, shouldAnimate, stacked = false }) => {
    const f = feature;
    const container = {
        hidden: {},
        show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
    };
    const item = {
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
    };

    const Wrapper = shouldAnimate ? motion.div : 'div';
    const wrapperProps = shouldAnimate
        ? {
              variants: container,
              initial: 'hidden',
              whileInView: 'show',
              viewport: { once: true, margin: '-100px' },
          }
        : {};
    const Item = shouldAnimate ? motion.div : 'div';
    const itemProps = shouldAnimate ? { variants: item } : {};

    return (
        <Wrapper
            {...wrapperProps}
            className={
                stacked
                    ? 'grid grid-cols-1 gap-6'
                    : 'w-full grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-12 items-center'
            }
        >
            <div className="flex flex-col justify-center">
                <Item {...itemProps}>
                    <Badge variant={f.badgeVariant} size="md" icon={f.icon} className="mb-4 self-start">
                        {f.badge}
                    </Badge>
                </Item>
                {!stacked && (
                    <Item {...itemProps}>
                        <h3 className="text-[26px] xl:text-[32px] font-semibold text-text-main leading-[1.25] break-keep mb-3 whitespace-pre-line">
                            {f.title}
                        </h3>
                    </Item>
                )}
                <Item {...itemProps}>
                    <p className="text-[14px] xl:text-body-4 text-neutral-600 leading-relaxed break-keep mb-5">
                        {f.description}
                    </p>
                </Item>
                <Item {...itemProps}>
                    <ul className="flex flex-col gap-2">
                        {f.points.map((p) => (
                            <li key={p} className="flex items-center gap-2 text-[13px] xl:text-body-7 text-neutral-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                {p}
                            </li>
                        ))}
                    </ul>
                </Item>
            </div>
            <Item {...itemProps} className="flex items-center justify-center">
                <div className="w-full">
                    <f.MockupComponent />
                </div>
            </Item>
        </Wrapper>
    );
};

const FeatureSection = ({ lenisRef }) => {
    const shouldAnimate = !useReducedMotion();
    const [activeIndex, setActiveIndex] = useState(0);
    const panelRefs = useRef([]);
    const layerRefs = useRef([]);

    const scrollToFeature = useCallback(
        (index) => {
            const el = panelRefs.current[index];
            if (!el) return;
            if (lenisRef?.current) {
                lenisRef.current.scrollTo(el, { offset: -HEADER_OFFSET });
            } else {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        },
        [lenisRef]
    );

    // lg+ 에서만 sticky 좌측 패널 + 배경 wipe + scrollspy 활성
    useEffect(() => {
        const mm = gsap.matchMedia();

        mm.add('(min-width: 1024px)', () => {
            // 1) active section 추적 — ScrollTrigger onEnter / onEnterBack (wipe와 동일 trigger 기준)
            panelRefs.current.forEach((el, i) => {
                if (!el) return;
                ScrollTrigger.create({
                    trigger: el,
                    start: 'top center',
                    end: 'bottom center',
                    onEnter: () => setActiveIndex(i),
                    onEnterBack: () => setActiveIndex(i),
                });
            });

            // 2) 배경 wipe — 아래에서 위로 차오르는 clip-path scrub (모션 허용 시에만)
            if (shouldAnimate) {
                layerRefs.current.forEach((el, i) => {
                    if (!el || i === 0) return; // layer 0 은 base 색
                    gsap.fromTo(
                        el,
                        { clipPath: 'inset(100% 0% 0% 0%)' },
                        {
                            clipPath: 'inset(0% 0% 0% 0%)',
                            ease: 'none',
                            scrollTrigger: {
                                // wipe 완료 시점(top center)을 active nav 전환과 일치시켜 동기화
                                trigger: panelRefs.current[i],
                                start: 'top 78%',
                                end: 'top center',
                                scrub: true,
                            },
                        }
                    );
                });
            }

            ScrollTrigger.refresh();
        });

        return () => mm.revert();
    }, [shouldAnimate]);

    const activeFeature = FEATURES[activeIndex];

    return (
        <section className="bg-white">
            {/* 섹션 헤드라인 */}
            <div className="bg-neutral-50 py-20 px-6 border-b border-neutral-200">
                <div className="max-w-[1200px] mx-auto">
                    <motion.div
                        initial={shouldAnimate ? { opacity: 0, y: 24 } : false}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.5, ease: EASE }}
                    >
                        <h2 className="text-[40px] md:text-[52px] font-bold text-text-main leading-[1.2] tracking-tight break-keep mb-3">
                            사장님이 직접 하실 필요 없어요.
                        </h2>
                        <p className="text-[18px] text-neutral-600 break-keep">
                            분석부터 영상 제작·성과 관리까지 — PULSE가 다 해드립니다.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* ===== lg+ : 좌측 sticky 패널 + 배경 wipe ===== */}
            <div className="hidden lg:flex lg:items-start relative">
                {/* 좌측 sticky 패널 (Header 65px 아래 정렬) */}
                <aside className="sticky top-[65px] h-[calc(100dvh-65px)] w-[42%] max-w-[520px] flex flex-col justify-center relative overflow-hidden">
                    {/* 배경 wipe 레이어 스택 */}
                    <div className="absolute inset-0 z-0" aria-hidden="true">
                        {shouldAnimate ? (
                            FEATURES.map((f, i) => (
                                <div
                                    key={f.id}
                                    ref={(el) => (layerRefs.current[i] = el)}
                                    className={`absolute inset-0 ${f.bgClass}`}
                                    style={i > 0 ? { clipPath: 'inset(100% 0% 0% 0%)' } : undefined}
                                />
                            ))
                        ) : (
                            <div className={`absolute inset-0 ${activeFeature.bgClass}`} />
                        )}
                    </div>

                    {/* 패널 콘텐츠 */}
                    <div className="relative z-10 px-12 xl:px-16 w-full">
                        <p className="text-caption font-bold text-white/40 tracking-[0.25em] uppercase mb-6">
                            PULSE 기능
                        </p>

                        {/* 대형 타이틀 swap */}
                        <div className="relative min-h-[140px] mb-8">
                            {shouldAnimate ? (
                                <AnimatePresence>
                                    <motion.h3
                                        key={activeIndex}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -16 }}
                                        transition={{ duration: 0.4, ease: EASE }}
                                        className="absolute inset-0 text-[32px] xl:text-[40px] font-bold text-white leading-[1.25] break-keep whitespace-pre-line"
                                    >
                                        {activeFeature.title}
                                    </motion.h3>
                                </AnimatePresence>
                            ) : (
                                <h3 className="absolute inset-0 text-[32px] xl:text-[40px] font-bold text-white leading-[1.25] break-keep whitespace-pre-line">
                                    {activeFeature.title}
                                </h3>
                            )}
                        </div>

                        {/* scrollspy nav */}
                        <nav className="flex flex-col gap-1">
                            {FEATURES.map((f, i) => {
                                const isActive = activeIndex === i;
                                return (
                                    <button
                                        key={f.id}
                                        type="button"
                                        onClick={() => scrollToFeature(i)}
                                        aria-current={isActive ? 'true' : undefined}
                                        className={[
                                            'flex items-center gap-2 text-left py-2.5 w-full',
                                            'transition-opacity duration-200',
                                            isActive ? 'opacity-100' : 'opacity-45 hover:opacity-70',
                                        ].join(' ')}
                                    >
                                        <span className="w-4 flex-shrink-0 flex justify-center">
                                            {isActive && <ChevronRight size={16} className="text-white" />}
                                        </span>
                                        <span
                                            className={[
                                                'break-keep',
                                                isActive ? 'text-body-1 text-white font-bold' : 'text-body-2 text-white/90',
                                            ].join(' ')}
                                        >
                                            {f.badge}
                                            {f.isPro && (
                                                <span className="ml-2 text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full align-middle">
                                                    Pro
                                                </span>
                                            )}
                                        </span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                {/* 우측 스크롤 컬럼 */}
                <div className="flex-1 min-w-0">
                    {FEATURES.map((f, i) => (
                        <div
                            key={f.id}
                            ref={(el) => (panelRefs.current[i] = el)}
                            className="min-h-[calc(100dvh-65px)] scroll-mt-[65px] flex items-center bg-white px-10 xl:px-16"
                        >
                            <RightContent feature={f} shouldAnimate={shouldAnimate} />
                        </div>
                    ))}
                </div>
            </div>

            {/* ===== < lg : stacked 카드 레이아웃 (sticky·wipe 없음) ===== */}
            <div className="lg:hidden">
                {FEATURES.map((f, i) => (
                    <article key={f.id} className="border-b border-neutral-200">
                        {/* 컬러 헤더 스트립 */}
                        <div className={`${f.bgClass} px-5 py-7 md:px-8 md:py-9`}>
                            <p className="text-caption font-bold text-white/50 tracking-[0.2em] uppercase mb-2">
                                기능 0{i + 1}
                            </p>
                            <h3 className="text-[24px] md:text-[30px] font-bold text-white leading-[1.25] break-keep whitespace-pre-line">
                                {f.title}
                            </h3>
                        </div>
                        {/* 콘텐츠 */}
                        <div className="bg-white px-5 py-7 md:px-8 md:py-9">
                            <RightContent feature={f} shouldAnimate={shouldAnimate} stacked />
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
};

export default FeatureSection;
