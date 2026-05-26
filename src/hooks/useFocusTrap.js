import { useEffect, useRef, useCallback } from 'react';

const FOCUSABLE_SELECTORS = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Drawer/Dialog용 focus trap 훅.
 * isActive가 true인 동안 Tab 포커스를 containerRef 내부로 가둠.
 * ESC 키로 onClose 호출. 비활성화 시 이전 포커스 복귀.
 */
export function useFocusTrap(isActive, onClose) {
    const containerRef = useRef(null);
    const previousFocusRef = useRef(null);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    const getFocusable = useCallback(() => {
        if (!containerRef.current) return [];
        return Array.from(containerRef.current.querySelectorAll(FOCUSABLE_SELECTORS));
    }, []);

    useEffect(() => {
        if (!isActive) {
            if (previousFocusRef.current) {
                previousFocusRef.current.focus();
                previousFocusRef.current = null;
            }
            return;
        }

        previousFocusRef.current = document.activeElement;

        // preventScroll: true — 포커스 시 브라우저 자동 스크롤 방지
        // (드로어가 아직 화면 밖에서 애니메이션 중일 때 뷰포트 이동 방지)
        const raf = requestAnimationFrame(() => {
            const els = getFocusable();
            if (els.length > 0) els[0].focus({ preventScroll: true });
        });

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onCloseRef.current?.();
                return;
            }
            if (e.key !== 'Tab') return;

            const focusable = getFocusable();
            if (focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            cancelAnimationFrame(raf);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isActive, getFocusable]);

    return containerRef;
}
