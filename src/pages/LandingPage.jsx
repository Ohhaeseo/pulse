import React, { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import ScrollProgress from '../components/landing/ScrollProgress';
import Header from '../components/landing/Header';
import HeroSection from '../components/landing/HeroSection';
import ProblemSection from '../components/landing/ProblemSection';
import ShowcaseSection from '../components/landing/ShowcaseSection';
import FeatureSection from '../components/landing/FeatureSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import ComparisonSection from '../components/landing/ComparisonSection';
import SocialProofSection from '../components/landing/SocialProofSection';
import FAQSection from '../components/landing/FAQSection';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
    const lenisRef = useRef(null);

    useEffect(() => {
        const originalHtmlHeight = document.documentElement.style.height;
        const originalHtmlOverflow = document.documentElement.style.overflow;
        const originalBodyHeight = document.body.style.height;
        const originalBodyOverflow = document.body.style.overflow;

        document.documentElement.style.height = 'auto';
        document.documentElement.style.overflow = 'auto';
        document.body.style.height = 'auto';
        // body는 visible 유지 — overflow:auto면 sticky 좌측 패널의 스크롤 컨테이너가
        // body로 잡혀 position:sticky가 동작하지 않음 (FeatureSection lg sticky 패널)
        document.body.style.overflow = 'visible';

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
        });

        lenisRef.current = lenis;

        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);

        return () => {
            lenis.destroy();
            lenisRef.current = null;
            gsap.ticker.remove(lenis.raf);

            document.documentElement.style.height = originalHtmlHeight;
            document.documentElement.style.overflow = originalHtmlOverflow;
            document.body.style.height = originalBodyHeight;
            document.body.style.overflow = originalBodyOverflow;
        };
    }, []);

    return (
        <div className="font-pretendard bg-bg-page">
            <ScrollProgress />
            <Header />
            {/* fixed 헤더 높이 보정 spacer */}
            <div className="h-[65px]" />
            <main>
                <HeroSection />
                <ProblemSection />
                <ShowcaseSection />
                <FeatureSection lenisRef={lenisRef} />
                <HowItWorksSection />
                <ComparisonSection />
                <SocialProofSection />
                <FAQSection />
                <CTASection />
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;
