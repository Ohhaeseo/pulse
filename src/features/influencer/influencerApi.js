const SPRING_API_BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL || 'http://localhost:8080/api';

const authHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return token && token !== 'dev-bypass-token'
        ? { Authorization: `Bearer ${token}` }
        : {};
};

const mapInfluencer = (item) => {
    const profile = item.influencer;
    const followers = profile.instagramFollowers || profile.youtubeSubscribers || 0;

    return {
        id: String(profile.id),
        backendProfileId: profile.id,
        name: profile.displayName,
        profileImage: profile.profileImageUrl || `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&sig=${profile.id}`,
        niche: profile.niches?.length ? profile.niches : ['맛집'],
        location: profile.location || '전국',
        activityArea: profile.activityAreas || [],
        keywords: profile.keywords || [],
        audienceKeywords: profile.audienceKeywords || [],
        followers,
        instagramFollowers: profile.instagramFollowers || followers,
        youtubeSubscribers: profile.youtubeSubscribers || 0,
        avgViews: profile.avgViews || 0,
        engagementRate: profile.engagementRate || 0,
        minBudget: profile.minBudget || 0,
        bio: profile.bio || '',
        matchScore: item.score,
        matchBreakdown: item.breakdown,
        matchReasons: item.matchReasons || [],
    };
};

export const fetchInfluencerRecommendations = async () => {
    const response = await fetch(`${SPRING_API_BASE_URL}/influencers/recommendations`, {
        headers: authHeaders(),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '인플루언서 추천 목록을 불러오지 못했습니다.');
    }

    const data = await response.json();
    return {
        storeInsight: {
            storeName: data.storeInsight?.shopName || '',
            category: data.storeInsight?.category || '',
            location: data.storeInsight?.address || '',
            keywords: data.storeInsight?.keywords || [],
        },
        influencers: (data.influencers || []).map(mapInfluencer),
    };
};

export const createInfluencerProposal = async (payload) => {
    const response = await fetch(`${SPRING_API_BASE_URL}/influencer-proposals`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
        },
        body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.message || '제안 저장에 실패했습니다.');
    }
    return data;
};

export const fetchInfluencerInbox = async () => {
    const response = await fetch(`${SPRING_API_BASE_URL}/influencer-proposals/inbox`, {
        headers: authHeaders(),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '받은 제안을 불러오지 못했습니다.');
    }
    return response.json();
};

export const fetchOwnerInfluencerProposals = async () => {
    const response = await fetch(`${SPRING_API_BASE_URL}/influencer-proposals/owner`, {
        headers: authHeaders(),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '보낸 제안을 불러오지 못했습니다.');
    }
    return response.json();
};

export const cancelInfluencerProposal = async (proposalId) => {
    const response = await fetch(`${SPRING_API_BASE_URL}/influencer-proposals/${proposalId}/cancel`, {
        method: 'PATCH',
        headers: authHeaders(),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.message || '제안 취소에 실패했습니다.');
    }
    return data;
};

export const acceptInfluencerProposal = async (proposalId, message = '') => {
    const response = await fetch(`${SPRING_API_BASE_URL}/influencer-proposals/${proposalId}/accept`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
        },
        body: JSON.stringify({ message }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.message || '제안 수락에 실패했습니다.');
    }
    return data;
};

export const rejectInfluencerProposal = async (proposalId, reason = '') => {
    const response = await fetch(`${SPRING_API_BASE_URL}/influencer-proposals/${proposalId}/reject`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
        },
        body: JSON.stringify({ reason }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.message || '제안 거절에 실패했습니다.');
    }
    return data;
};

export const updateInfluencerProposalStatus = async (proposalId, status) => {
    const response = await fetch(`${SPRING_API_BASE_URL}/influencer-proposals/${proposalId}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
        },
        body: JSON.stringify({ status }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.message || '제안 상태 변경에 실패했습니다.');
    }
    return data;
};
