import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Send, Info } from 'lucide-react';
import { INFLUENCER_DATA } from '../../data/mockInfluencers';
import { createInfluencerProposal } from './influencerApi';
import { getLocalStoreProfile } from './influencerMatchingUtils';

const FASTAPI_URL = import.meta.env.VITE_FASTAPI_BASE_URL || 'http://127.0.0.1:8000/api';

/**
 * InfluencerRequestPage (v2.0)
 * 인플루언서에게 이메일로 발송되는 프리미엄 제안 폼
 */
export default function InfluencerRequestPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const cachedInfluencer = (() => {
        try {
            const cached = JSON.parse(localStorage.getItem('selectedInfluencerForProposal') || 'null');
            return String(cached?.id) === String(id) ? cached : null;
        } catch {
            return null;
        }
    })();
    // 매칭 화면에서 선택한 실제(백엔드) 인플루언서를 우선 사용하고, 없을 때만 목 데이터로 폴백한다.
    const influencer = cachedInfluencer || INFLUENCER_DATA.find(inf => inf.id === id);

    const [formData, setFormData] = useState({
        type: '제품 협찬',
        budget: '', // 제안 금액 (원)
        provideFood: false, // 음식 제공 여부
        date: '',
        contact: '',
        message: ''
    });

    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // AI 제안서 작성 핸들러
    // 과거에는 인플루언서의 활동지/분야를 '우리 매장' 정보로 잘못 사용해
    // (예: 범계 한식집인데 "서울 성동구 패션 전문점"으로) 표시되는 버그가 있었다.
    // 이제 로그인 사장님의 실제 매장 정보를 컨텍스트로 DeepSeek에 주입해 생성한다.
    const handleAiGenerate = async () => {
        setIsAiGenerating(true);
        const store = getLocalStoreProfile();
        const foodText = formData.provideFood ? "방문 시 정성껏 준비한 음식도 함께 제공해 드릴 예정입니다." : "";
        const budgetText = formData.budget ? `제안 금액은 ${Number(formData.budget).toLocaleString()}원입니다.` : "";

        try {
            const instruction =
                `다음 정보를 바탕으로 인플루언서에게 보낼 협업 제안 메시지를 한국어로 작성해줘.\n` +
                `- 인플루언서 활동명: ${influencer.name}\n` +
                `- 인플루언서 분야: ${(influencer.niche && influencer.niche[0]) || ''}\n` +
                `- 협업 방식: ${formData.type}\n` +
                (formData.budget ? `- 제안 금액: ${Number(formData.budget).toLocaleString()}원\n` : '') +
                `- 음식 무료 제공: ${formData.provideFood ? '예' : '아니오'}\n` +
                `반드시 우리 가게(상호/업종/위치) 정보를 정확히 활용하고, 정중하고 매력적으로, ` +
                `인사말과 끝맺음을 포함해 250자 내외로 작성해줘. 메시지 본문만 출력해.`;

            const response = await fetch(`${FASTAPI_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role: 'owner',
                    context: {
                        storeName: store.storeName,
                        category: store.category,
                        location: store.location,
                    },
                    messages: [{ role: 'user', content: instruction }],
                }),
            });
            const data = await response.json().catch(() => ({}));
            if (response.ok && data.reply) {
                setFormData(prev => ({ ...prev, message: data.reply.trim() }));
                return;
            }
            throw new Error(data.detail || 'AI 응답을 받지 못했습니다.');
        } catch (error) {
            console.warn('AI 자동 작성 실패, 매장 정보 기반 기본 문구로 대체:', error);
            const fallback =
                `안녕하세요, ${influencer.name}님!\n\n` +
                `${store.location}에서 ${store.category} 매장 「${store.storeName}」을 운영하고 있습니다. ` +
                `${influencer.name}님의 콘텐츠 스타일이 저희 매장과 잘 어울릴 것 같아 ${formData.type}을 제안드립니다. ` +
                `${foodText} ${budgetText}`.trim() + `\n\n` +
                `긍정적으로 검토해 주시면 감사하겠습니다. 감사합니다.`;
            setFormData(prev => ({ ...prev, message: fallback }));
        } finally {
            setIsAiGenerating(false);
        }
    };

    const handleBudgetChange = (e) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        setFormData({ ...formData, budget: rawValue });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (!influencer?.backendProfileId) {
                throw new Error('실제 DB 인플루언서 프로필 ID를 찾을 수 없습니다. 매칭 페이지에서 다시 선택해주세요.');
            }

            await createInfluencerProposal({
                influencerProfileId: influencer.backendProfileId,
                campaignType: formData.type,
                budget: Number(formData.budget || 0),
                provideFood: formData.provideFood,
                desiredDate: formData.date || null,
                contact: formData.contact,
                message: formData.message,
            });

            alert(`${influencer.name}님에게 제안을 보냈습니다.`);
            navigate('/influencer-matching');
            return;
        } catch (error) {
            console.error('Proposal submit failed:', error);
            alert(error.message || '제안 전송에 실패했습니다.');
            setIsSubmitting(false);
        }
    };

    if (!influencer) return <div>인플루언서를 찾을 수 없습니다.</div>;

    const isSubmitDisabled = isSubmitting || !formData.message || !formData.contact || !formData.budget;

    return (
        <div className="flex bg-[#F5F7FA] h-full gap-4 p-4 font-sans overflow-hidden">
            {/* [Left] Request Form */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-[0.65] bg-white rounded-2xl p-8 shadow-sm border border-[#E5E8EB] flex flex-col h-full relative overflow-y-auto custom-scrollbar"
            >
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                >
                    <ArrowLeft size={20} className="text-[#8B95A1]" />
                </button>

                <h2 className="text-[24px] font-bold text-[#191F28] mb-6 pt-2 text-center">
                    협업 제안서 작성
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* 1. Collaboration Type */}
                    <div>
                        <label className="block text-[15px] font-bold text-[#333D4B] mb-2">협업 방식 <span className="text-[#FF5A36]">*</span></label>
                        <div className="flex gap-2">
                            {['제품 협찬', '방문 리뷰', '영상 제작', '기타'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type })}
                                    className={`
                                        flex-1 py-3 rounded-xl border font-bold transition-all text-[14px]
                                        ${formData.type === type
                                            ? 'border-[#002B7A] bg-[#E8F3FF] text-[#002B7A] shadow-sm'
                                            : 'border-transparent bg-[#F9FAFB] text-[#8B95A1] hover:bg-[#F2F4F6]'
                                        }
                                    `}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 2. Budget & Food (NEW) */}
                    <div className="flex flex-col gap-4 border-t border-b border-[#F2F4F6] py-5">
                        {/* Budget */}
                        <div>
                            <label className="block text-[15px] font-bold text-[#333D4B] mb-2">제안 금액 <span className="text-[#FF5A36]">*</span></label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={formData.budget ? Number(formData.budget).toLocaleString() : ''}
                                    onChange={handleBudgetChange}
                                    placeholder="금액을 입력해주세요"
                                    className="w-full px-4 py-3.5 bg-white border border-[#E5E8EB] rounded-xl focus:border-[#002B7A] focus:ring-1 focus:ring-[#002B7A] transition-all text-[16px] font-bold text-right pr-10"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4E5968] font-bold">원</span>
                            </div>
                            <div className="flex gap-2 mt-2">
                                {[50000, 100000, 300000, 500000].map(amount => (
                                    <button
                                        key={amount}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, budget: amount.toString() })}
                                        className="px-3 py-1.5 bg-[#F5F7FA] text-[#505967] rounded-lg text-[13px] font-bold hover:bg-[#E8F3FF] hover:text-[#002B7A] transition-colors"
                                    >
                                        +{(amount/10000)}만
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Food Toggle */}
                        <div className="flex items-center justify-between bg-[#F9FAFB] p-4 rounded-xl">
                            <div>
                                <h4 className="text-[15px] font-bold text-[#333D4B] mb-0.5">음식 무료 제공 (방문 시)</h4>
                                <p className="text-[13px] text-[#8B95A1]">인플루언서의 식사 경험을 위해 무료로 제공할지 선택합니다.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, provideFood: !formData.provideFood })}
                                className={`w-12 h-7 rounded-full relative transition-colors duration-300 ${formData.provideFood ? 'bg-[#002B7A]' : 'bg-[#D1D6DB]'}`}
                            >
                                <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-sm transition-transform duration-300 ${formData.provideFood ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                    </div>

                    {/* 3. Schedule & Contact */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[15px] font-bold text-[#333D4B] mb-2">희망 일정</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-4 py-3.5 bg-white border border-[#E5E8EB] rounded-xl focus:border-[#002B7A] focus:ring-1 focus:ring-[#002B7A] transition-all text-[14px]"
                            />
                        </div>
                        <div>
                            <label className="block text-[15px] font-bold text-[#333D4B] mb-2">연락처 <span className="text-[#FF5A36]">*</span></label>
                            <input
                                type="text"
                                placeholder="010-0000-0000"
                                value={formData.contact}
                                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                className="w-full px-4 py-3.5 bg-white border border-[#E5E8EB] rounded-xl focus:border-[#002B7A] focus:ring-1 focus:ring-[#002B7A] transition-all text-[15px]"
                            />
                        </div>
                    </div>

                    {/* 4. Message */}
                    <div className="flex flex-col flex-grow">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-[15px] font-bold text-[#333D4B]">제안 메시지 <span className="text-[#FF5A36]">*</span></label>
                            <button
                                type="button"
                                onClick={handleAiGenerate}
                                disabled={isAiGenerating}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-[12px] font-bold rounded-lg shadow-sm hover:opacity-90 transition-all"
                            >
                                <Sparkles size={12} />
                                {isAiGenerating ? 'AI 분석 작성 중...' : '매칭 AI로 자동 작성'}
                            </button>
                        </div>
                        <div className="relative">
                            <textarea
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                placeholder="인플루언서에게 보낼 제안 내용을 작성해주세요."
                                maxLength={500}
                                className="w-full h-[180px] p-4 bg-white border border-[#E5E8EB] rounded-xl text-[15px] leading-relaxed resize-none focus:border-[#002B7A] focus:ring-1 focus:ring-[#002B7A] transition-all"
                            />
                            <div className="absolute bottom-3 right-3 text-[12px] text-[#8B95A1] bg-white/80 px-2 py-0.5 rounded-md backdrop-blur-sm shadow-sm font-medium">
                                {formData.message.length} / 500
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitDisabled}
                        className={`
                            py-4 rounded-xl font-bold text-[16px] text-white shadow-md transition-all flex items-center justify-center gap-2 mt-2
                            ${isSubmitDisabled
                                ? 'bg-[#E5E8EB] text-[#B0B8C1] cursor-not-allowed shadow-none'
                                : 'bg-[#002B7A] hover:bg-[#002B7AE6] hover:shadow-lg hover:-translate-y-0.5 active:scale-95'
                            }
                        `}
                    >
                        {isSubmitting ? '안전하게 전송 중...' : '이메일로 제안서 발송하기'}
                        <Send size={18} />
                    </button>
                </form>
            </motion.div>

            {/* [Right] Influencer Summary (Flex 0.35) */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-[0.35] flex flex-col gap-4 h-full overflow-y-auto custom-scrollbar pb-4 pr-1"
            >
                {/* Simplified Card to match V2 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E8EB] flex flex-col items-center text-center shrink-0">
                    <div className="w-[100px] h-[100px] rounded-full p-[2px] bg-gradient-to-tr from-[#002B7A] to-[#4070F4] mb-3 shrink-0">
                        <img src={influencer.profileImage} alt={influencer.name} className="w-full h-full rounded-full object-cover border-[3px] border-white" />
                    </div>
                
                    <h2 className="text-[22px] font-bold text-[#191F28] mb-1">{influencer.name}</h2>
                    <span className="px-3 py-1 bg-[#FFF4E6] text-[#FF5A36] text-[12px] font-bold rounded-full mb-3 border border-[#FF5A361A]">
                        현재 상점과 {influencer.matchScore}% 일치
                    </span>
                    
                    <div className="w-full bg-[#F5F7FA] rounded-xl p-4 flex justify-around border border-[#E5E8EB]">
                        <div className="flex flex-col items-center">
                            <span className="text-[12px] text-[#8B95A1] font-medium mb-0.5">인스타 팔로워</span>
                            <span className="text-[15px] font-bold text-[#191F28]">{(influencer.instagramFollowers / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="w-[1px] bg-[#D1D6DB]"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-[12px] text-[#8B95A1] font-medium mb-0.5">평균 조회수</span>
                            <span className="text-[15px] font-bold text-[#191F28]">{(influencer.avgViews / 1000).toFixed(0)}K</span>
                        </div>
                    </div>
                </div>

                {/* Process Guide */}
                <div className="bg-[#F9FAFB] rounded-[24px] p-7 flex-grow flex flex-col justify-center text-left relative border border-[#E5E8EB] shrink-0 min-h-[300px]">
                    <h3 className="text-[16px] font-bold text-[#191F28] mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#002B7A]"></span>
                        제안 이후 절차
                    </h3>
                    <div className="flex flex-col gap-6 relative z-10">
                        {/* Connecting Line */}
                        <div className="absolute left-[13px] top-3 bottom-3 w-[2px] bg-[#F2F4F6] -z-10"></div>

                        <div className="flex gap-4 items-start">
                            <div className="w-7 h-7 rounded-full bg-[#E8F3FF] text-[#002B7A] flex items-center justify-center font-bold text-[13px] shrink-0 border-2 border-white shadow-sm">1</div>
                            <div>
                                <strong className="block text-[14px] text-[#333D4B] mb-1">이메일 발송</strong>
                                <p className="text-[13px] text-[#8B95A1] leading-snug">제안서가 인플루언서의<br />전문 이메일로 즉시 발송됩니다.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="w-7 h-7 rounded-full bg-[#FFF4E6] text-[#FF5A36] flex items-center justify-center font-bold text-[13px] shrink-0 border-2 border-white shadow-sm">2</div>
                            <div>
                                <strong className="block text-[14px] text-[#333D4B] mb-1">인플루언서 수락</strong>
                                <p className="text-[13px] text-[#8B95A1] leading-snug">이메일 내 링크를 통해<br />제안을 검토하고 수락합니다.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="w-7 h-7 rounded-full bg-[#F2F4F6] text-[#505967] flex items-center justify-center font-bold text-[13px] shrink-0 border-2 border-white shadow-sm">3</div>
                            <div>
                                <strong className="block text-[14px] text-[#333D4B] mb-1">협업 시작</strong>
                                <p className="text-[13px] text-[#8B95A1] leading-snug">연락처를 통해 세부 일정을<br />조율하고 마케팅을 시작합니다.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
