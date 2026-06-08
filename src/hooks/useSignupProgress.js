import { useState, useEffect, useRef } from 'react';
import { signup } from '../features/auth/api/authApi';

const FASTAPI_BASE_URL = import.meta.env.VITE_FASTAPI_BASE_URL || 'http://127.0.0.1:8000/api';

/**
 * Hook to manage signup progress state with real API integration.
 * Returns status: 'idle' | 'loading' | 'success' | 'error'
 */
export const useSignupProgress = () => {
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState("초기화 중...");
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const pollingRef = useRef(null);
    const taskIdRef = useRef(null);
    const signupDataRef = useRef(null);

    const startPolling = async (signupData) => {
        setProgress(0);
        setStatus('loading');
        setMessage("사장님의 가게 정보를 안전하게 암호화하고 있어요... 🔒");

        try {
            let taskId = taskIdRef.current;
            const payload = signupData || (!taskId ? signupDataRef.current : null);

            if (signupData) {
                signupDataRef.current = signupData;
            }

            if (!taskId) {
                if (!payload) {
                    throw new Error("다시 시도할 회원가입 정보가 없습니다.");
                }

                setProgress(10);
                const response = await signup(payload);
                taskId = response.analysisTaskId;
                taskIdRef.current = taskId;

                if (!taskId) {
                    throw new Error("분석 작업 ID를 받지 못했습니다.");
                }
            }

            setProgress(30);
            setMessage("AI 분석을 시작하고 있어요... 🔍");

            if (pollingRef.current) clearInterval(pollingRef.current);

            pollingRef.current = setInterval(async () => {
                try {
                    const response = await fetch(`${FASTAPI_BASE_URL}/analysis/status/${taskId}`);

                    if (!response.ok) {
                        throw new Error('분석 상태를 불러오지 못했습니다.');
                    }

                    const data = await response.json();
                    setProgress(Math.max(30, data.progress ?? 30));
                    setMessage(data.message || "AI가 분석 중입니다...");

                    if (data.status === 'completed') {
                        clearInterval(pollingRef.current);
                        pollingRef.current = null;
                        setProgress(100);
                        setStatus('success');
                        setMessage("고객 분석이 완료되었습니다!");
                    }

                    if (data.status === 'failed') {
                        clearInterval(pollingRef.current);
                        pollingRef.current = null;
                        setProgress(100);
                        setStatus('success');
                        setMessage(data.message || "리뷰 분석 중 문제가 발생했습니다.");
                    }
                } catch (error) {
                    clearInterval(pollingRef.current);
                    pollingRef.current = null;
                    setStatus('error');
                    setMessage(error.message || "분석 상태 확인 중 문제가 발생했습니다.");
                }
            }, 1500);

        } catch (error) {
            if (pollingRef.current) clearInterval(pollingRef.current);
            pollingRef.current = null;
            setStatus('error');
            setProgress(0);
            setMessage(error.message || "회원가입 중 문제가 발생했습니다.");
        }
    };

    const stopPolling = () => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
        }
    };

    const reset = () => {
        stopPolling();
        setStatus('idle');
        setProgress(0);
        setMessage("");
        taskIdRef.current = null;
        signupDataRef.current = null;
    };

    useEffect(() => {
        return () => stopPolling();
    }, []);

    return { progress, message, status, startPolling, reset };
};
