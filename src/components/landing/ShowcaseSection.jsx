import React, { useRef, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const SUB_IMAGES = [
    {
        src: 'landing_4.png',
        alt: '실제 PULSE 대시보드 AI 분석 화면',
        label: '손님 분석 AI',
    },
    {
        src: 'landing_2.png',
        alt: '음식을 스마트폰으로 촬영해 홍보 영상을 만드는 장면',
        label: '홍보 영상 제작',
    },
    {
        src: 'landing_3.png',
        alt: '손님들이 카페로 들어오는 장면',
        label: '가게 성과',
    },
];

const ShowcaseSection = () => {
    const shouldAnimate = !useReducedMotion();
    const showcaseRef = useRef(null);
    const text1Ref = useRef(null);
    const text2Ref = useRef(null);
    const [mainImgError, setMainImgError] = React.useState(false);

    useEffect(() => {
        if (!showcaseRef.current || !shouldAnimate) return;

        const isMobile = window.innerWidth < 768;
        if (isMobile) return;

        const anim = gsap.fromTo(
            showcaseRef.current,
            { clipPath: 'inset(0 22% round 36px)' },
            {
                clipPath: 'inset(0 0% round 0px)',
                ease: 'none',
                scrollTrigger: {
                    trigger: showcaseRef.current,
                    start: 'top 85%',
                    end: 'center 30%',
                    scrub: 1.5,
                },
            }
        );

        return () => {
            anim.scrollTrigger?.kill();
            anim.kill();
        };
    }, [shouldAnimate]);

    useEffect(() => {
        if (!text1Ref.current || !text2Ref.current || !shouldAnimate) return;

        const anims = [text1Ref, text2Ref].map((ref) =>
            gsap.fromTo(
                ref.current,
                { opacity: 0.08, y: 28 },
                {
                    opacity: 1,
                    y: 0,
                    scrollTrigger: {
                        trigger: ref.current,
                        start: 'top 92%',
                        end: 'top 48%',
                        scrub: 1,
                    },
                }
            )
        );

        return () => {
            anims.forEach((a) => {
                a.scrollTrigger?.kill();
                a.kill();
            });
        };
    }, [shouldAnimate]);

    return (
        <section className="bg-white">
            {/* 헤드라인 */}
            <div className="max-w-[1200px] mx-auto px-6 pt-24 pb-16">
                <motion.h2
                    initial={shouldAnimate ? { opacity: 0, y: 24 } : false}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="text-[40px] md:text-[56px] font-bold text-text-main leading-[1.2] tracking-tight break-keep text-left"
                >
                    사장님의 하루가<br />달라집니다.
                </motion.h2>
            </div>

            {/* 메인 이미지 — 토스 스크롤 확장 */}
            <div
                ref={showcaseRef}
                className="relative w-full overflow-hidden"
                style={shouldAnimate ? { clipPath: 'inset(0 22% round 36px)' } : {}}
            >
                {mainImgError ? (
                    <div
                        className="w-full bg-gradient-to-br from-primary-tint to-neutral-100 flex items-center justify-center"
                        style={{ aspectRatio: '16/9' }}
                    >
                        <p className="text-neutral-400 text-body-6">showcase-main.webp를 public/에 추가하세요</p>
                    </div>
                ) : (
                    <img
                        src={`${import.meta.env.BASE_URL}landing_1.png`}
                        alt="카페에서 PULSE 대시보드를 확인하는 사장님"
                        className="w-full object-cover"
                        style={{ aspectRatio: '16/9' }}
                        onError={() => setMainImgError(true)}
                    />
                )}

                {/* 하단 그라데이션 — 텍스트 가독성 보조 */}
                <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/65 to-transparent pointer-events-none" />

                {/* 후킹 멘트 오버레이 */}
                <div className="absolute bottom-[14%] left-0 right-0 flex justify-center px-6">
                    <motion.p
                        initial={shouldAnimate ? { opacity: 0, y: 16 } : false}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="text-[26px] md:text-[40px] font-bold text-white text-center break-keep leading-snug drop-shadow-lg"
                    >
                        손님 분석부터 홍보 영상까지<br />AI가 이어드립니다
                    </motion.p>
                </div>
            </div>

            {/* 서브 이미지 3개 */}
            <div className="max-w-[1200px] mx-auto px-6 mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {SUB_IMAGES.map((img, index) => (
                    <SubImage key={img.src} img={img} index={index} shouldAnimate={shouldAnimate} />
                ))}
            </div>

            {/* 하단 스크롤 페이드 텍스트 */}
            <div className="max-w-[760px] mx-auto px-6 mt-16 pb-24 text-center">
                <p
                    ref={text1Ref}
                    className="text-[28px] md:text-[40px] font-bold text-text-main break-keep leading-[1.3]"
                    style={shouldAnimate ? { opacity: 0.08 } : {}}
                >
                    손님이 늘고, 영상이 퍼지고,<br />성과가 쌓입니다.
                </p>
                <p
                    ref={text2Ref}
                    className="text-[16px] md:text-[18px] text-neutral-600 leading-relaxed break-keep mt-4"
                    style={shouldAnimate ? { opacity: 0.08 } : {}}
                >
                    잘하지 않아도 됩니다.<br />PULSE가 돌아가면 홍보는 알아서 됩니다.
                </p>
            </div>
        </section>
    );
};

const SubImage = ({ img, index, shouldAnimate }) => {
    const [error, setError] = React.useState(false);

    return (
        <motion.div
            initial={shouldAnimate ? { opacity: 0, y: 40 } : false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[24px] overflow-hidden"
            style={{ aspectRatio: '4/3' }}
        >
            {error ? (
                <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                    <p className="text-neutral-400 text-caption">{img.label}</p>
                </div>
            ) : (
                <img
                    src={`${import.meta.env.BASE_URL}${img.src}`}
                    alt={img.alt}
                    className="w-full h-full object-cover"
                    onError={() => setError(true)}
                />
            )}
        </motion.div>
    );
};

export default ShowcaseSection;
