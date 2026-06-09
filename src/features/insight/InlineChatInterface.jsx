import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle, Bot, MoreHorizontal, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchCurrentProfile } from '../auth/api/authApi';
import { getLocalStoreProfile } from '../influencer/influencerMatchingUtils';
import { fetchLatestAnalysisData } from './api/analysisApi';

const FASTAPI_URL = import.meta.env.VITE_FASTAPI_BASE_URL || 'http://127.0.0.1:8000/api';
const OWNER_GREETING = '안녕하세요, 사장님! 👋\n매장과 손님 분석에 대해 궁금한 점을 언제든 물어보세요.';
const INFLUENCER_GREETING = '안녕하세요! 👋\n프로필이나 협업 제안에 대해 무엇이든 물어보세요.';

export default function InlineChatInterface() {
    const [isOpen, setIsOpen] = useState(false);
    const [role, setRole] = useState('owner');
    const [context, setContext] = useState({});
    const [messages, setMessages] = useState([{ role: 'assistant', text: OWNER_GREETING }]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    // 로그인 사용자(사장님/인플루언서) 컨텍스트 로드.
    // 로그아웃 시 localStorage가 비워지므로 컨텍스트도 자연히 초기화된다.
    useEffect(() => {
        let ignore = false;
        fetchCurrentProfile()
            .then((profile) => {
                if (ignore || !profile) return;

                if (profile.role === 'INFLUENCER') {
                    const p = profile.influencerProfile || {};
                    setRole('influencer');
                    setContext({
                        displayName: p.displayName || profile.name || '',
                        bio: p.bio || '',
                        location: p.location || '',
                        niches: p.niches || [],
                        keywords: p.keywords || [],
                        audienceKeywords: p.audienceKeywords || [],
                        instagramFollowers: p.instagramFollowers || 0,
                        avgViews: p.avgViews || 0,
                    });
                    setMessages([{ role: 'assistant', text: INFLUENCER_GREETING }]);
                    return;
                }

                // 사장님: 가게 기본 정보 + (가능하면) 손님분석 총평/페르소나 주입
                const store = getLocalStoreProfile();
                setRole('owner');
                setContext({
                    storeName: store.storeName,
                    category: store.category,
                    location: store.location,
                });
                setMessages([{ role: 'assistant', text: OWNER_GREETING }]);

                fetchLatestAnalysisData()
                    .then((data) => {
                        if (ignore || !data) return;
                        setContext((prev) => ({
                            ...prev,
                            storeName: data.store_name || prev.storeName,
                            storeSummary: data.store_summary || '',
                            personas: (data.personas || []).map((item) => ({
                                nickname: item.nickname,
                                summary: item.summary,
                                action_recommendation: item.action_recommendation,
                            })),
                        }));
                    })
                    .catch(() => { /* 분석 결과가 없어도 기본 가게 정보로 동작 */ });
            })
            .catch(() => { /* 비로그인/오류 시 기본 사장님 컨텍스트 유지 */ });
        return () => { ignore = true; };
    }, []);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;
        const userMsg = { role: 'user', text: input };
        const nextMessages = [...messages, userMsg];
        setMessages(nextMessages);
        setInput('');
        setIsTyping(true);

        try {
            const response = await fetch(`${FASTAPI_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role,
                    context,
                    messages: nextMessages.map((message) => ({
                        role: message.role === 'user' ? 'user' : 'assistant',
                        content: message.text,
                    })),
                }),
            });
            if (!response.ok) throw new Error(`status ${response.status}`);
            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', text: data.reply || '응답을 받지 못했습니다.' }]);
        } catch (error) {
            console.error('PULSE AI chat failed:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                text: '죄송해요, 지금 답변을 가져오지 못했어요. 잠시 후 다시 시도해주세요.',
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="relative z-50 font-pretendard flex flex-col items-end">

            {/* 1. Chat Window (Dropdown) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10, transformOrigin: "top right" }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        className="absolute top-12 right-0 w-[360px] h-[600px] bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 flex flex-col overflow-hidden ring-1 ring-black/5"
                    >
                        {/* Header: Minimal Clean */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-50 bg-white/80 backdrop-blur-md sticky top-0 z-10 h-[60px]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#002B7A] to-[#0042BE] flex items-center justify-center text-white shadow-sm">
                                    <Bot size={16} />
                                </div>
                                <div>
                                    <h3 className="text-[14px] font-bold text-[#191F28] leading-tight">PULSE AI</h3>
                                    <div className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                        <span className="text-[11px] text-[#8B95A1] font-medium">답변 대기 중</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                                    <MoreHorizontal size={18} />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 bg-white p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3" ref={scrollRef}>
                            <div className="text-center py-4">
                                <span className="text-[11px] text-[#8B95A1] bg-[#F5F7FA] px-3 py-1.5 rounded-full">
                                    오늘 {new Date().toLocaleDateString()}
                                </span>
                            </div>

                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] px-4 py-3 text-[14px] leading-relaxed shadow-sm whitespace-pre-wrap ${msg.role === 'user'
                                        ? 'bg-[#002B7A] text-white rounded-[20px] rounded-tr-sm'
                                        : 'bg-[#F5F7FA] text-[#333D4B] rounded-[20px] rounded-tl-sm'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-[#F5F7FA] px-4 py-3 rounded-[20px] rounded-tl-sm flex gap-1 items-center">
                                        <div className="w-1.5 h-1.5 bg-[#8B95A1] rounded-full animate-bounce" />
                                        <div className="w-1.5 h-1.5 bg-[#8B95A1] rounded-full animate-bounce [animation-delay:0.1s]" />
                                        <div className="w-1.5 h-1.5 bg-[#8B95A1] rounded-full animate-bounce [animation-delay:0.2s]" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area: Floating Style */}
                        <div className="p-4 bg-white border-t border-gray-50">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="relative flex items-center bg-[#F5F7FA] rounded-full px-2 border border-transparent focus-within:border-[#002B7A] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#002B7A]/20 transition-all duration-200"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="질문을 입력하세요..."
                                    className="flex-1 bg-transparent border-none outline-none font-medium text-[14px] px-3 py-3.5 text-[#191F28] placeholder:text-[#ADB5BD]"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className={`p-2 rounded-full transition-all ${input.trim()
                                        ? 'bg-[#002B7A] text-white shadow-md hover:scale-105'
                                        : 'bg-transparent text-[#D1D6DB]'
                                        }`}
                                >
                                    <Send size={18} className={input.trim() ? "translate-x-0.5" : ""} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 2. Trigger Button (Relative Inline) */}
            <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "#F9FAFB" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2.5 rounded-xl transition-all shadow-sm border ${isOpen
                    ? 'bg-blue-50 border-[#002B7A] text-[#002B7A]'
                    : 'bg-white border-transparent hover:bg-gray-50 text-[#191F28]'
                    }`}
            >
                {isOpen ? (
                    <ChevronUp size={22} className="text-[#002B7A]" />
                ) : (
                    <MessageCircle size={22} className="text-[#002B7A]" />
                )}
                {/* Badge */}
                {!isOpen && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF5A36] ring-2 ring-white"></span>
                )}
            </motion.button>
        </div>
    );
}
