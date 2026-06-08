import React, { useEffect, useState } from 'react';
import { Calendar, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { cancelInfluencerProposal, fetchOwnerInfluencerProposals } from './influencerApi';

const STATUS_LABEL = {
    PENDING: '대기중',
    ACCEPTED: '수락됨',
    REJECTED: '거절됨',
    CANCELED: '취소됨',
};

const STATUS_STYLE = {
    PENDING: 'bg-[#FFF4E6] text-[#FF5A36] border-[#FFE5DF]',
    ACCEPTED: 'bg-[#E8F3FF] text-[#002B7A] border-[#CFE5FF]',
    REJECTED: 'bg-[#F2F4F6] text-[#6B7684] border-[#E5E8EB]',
    CANCELED: 'bg-[#F2F4F6] text-[#6B7684] border-[#E5E8EB]',
};

const STATUS_ICON = {
    PENDING: <Clock size={14} />,
    ACCEPTED: <CheckCircle2 size={14} />,
    REJECTED: <XCircle size={14} />,
    CANCELED: <XCircle size={14} />,
};

export default function OwnerSentProposals() {
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadProposals = async () => {
        setLoading(true);
        try {
            const data = await fetchOwnerInfluencerProposals();
            setProposals(data || []);
        } catch (error) {
            console.warn('Owner proposals load failed:', error);
            setProposals([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProposals();
    }, []);

    const handleCancel = async (proposalId) => {
        if (!window.confirm('대기중인 제안을 취소할까요?')) return;
        try {
            await cancelInfluencerProposal(proposalId);
            await loadProposals();
        } catch (error) {
            alert(error.message || '제안 취소에 실패했습니다.');
        }
    };

    if (loading) {
        return (
            <div className="bg-white border border-[#E5E8EB] rounded-xl p-4 text-[14px] text-[#8B95A1]">
                보낸 제안을 불러오는 중입니다.
            </div>
        );
    }

    if (proposals.length === 0) {
        return (
            <div className="bg-white border border-[#E5E8EB] rounded-xl p-4 text-[14px] text-[#8B95A1]">
                아직 보낸 제안이 없습니다.
            </div>
        );
    }

    return (
        <div className="bg-white border border-[#E5E8EB] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-[16px] font-bold text-[#191F28]">보낸 제안</h3>
                <button
                    type="button"
                    onClick={loadProposals}
                    className="text-[12px] font-bold text-[#002B7A]"
                >
                    새로고침
                </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
                {proposals.slice(0, 6).map((proposal) => (
                    <div key={proposal.id} className="min-w-[260px] border border-[#F2F4F6] rounded-xl p-4 bg-[#FAFAFB]">
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <strong className="text-[15px] text-[#191F28] truncate">{proposal.influencerName}</strong>
                            <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[11px] font-bold ${STATUS_STYLE[proposal.status] || STATUS_STYLE.PENDING}`}>
                                {STATUS_ICON[proposal.status] || STATUS_ICON.PENDING}
                                {STATUS_LABEL[proposal.status] || proposal.status}
                            </span>
                        </div>
                        <p className="text-[13px] text-[#4E5968] line-clamp-2 mb-3">{proposal.message || '메시지 없음'}</p>
                        <div className="flex items-center gap-2 text-[12px] text-[#8B95A1] mb-3">
                            <Calendar size={13} />
                            <span>{proposal.desiredDate || '일정 협의'}</span>
                            <span>·</span>
                            <span>{Number(proposal.budget || 0).toLocaleString()}원</span>
                        </div>
                        {proposal.status === 'PENDING' && (
                            <button
                                type="button"
                                onClick={() => handleCancel(proposal.id)}
                                className="w-full h-9 rounded-lg border border-[#D1D6DB] bg-white text-[#4E5968] text-[13px] font-bold hover:bg-[#F2F4F6]"
                            >
                                제안 취소
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
