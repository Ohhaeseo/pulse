const DEFAULT_STORE_INSIGHT = {
    storeName: '테스트 매장',
    category: '한식',
    location: '서울 강남구',
    budget: 100000,
    keywords: ['직장인점심', '가성비', '재방문', '회식', '친절'],
    personas: [
        { name: '직장인 점심형', keywords: ['직장인', '점심', '빠른', '가성비'] },
        { name: '저녁 회식형', keywords: ['회식', '안주', '재방문', '모임'] },
    ],
    reviewTopics: ['맛', '양', '친절', '가격', '분위기'],
    source: 'fallback',
};

const CATEGORY_ALIASES = {
    KOREAN: '한식',
    CHINESE: '중식',
    JAPANESE: '일식',
    WESTERN: '양식',
    CAFE_DESSERT: '카페',
    BAR: '주점',
    ETC: '맛집',
    FD6: '맛집',
    CE7: '카페',
};

export const normalizeKeyword = (value = '') => String(value)
    .replace(/^#/, '')
    .replace(/\s/g, '')
    .toLowerCase();

// 매칭에서 의미가 약한 추상·마케팅 단어 (키워드 점수 계산에서 제외)
const KEYWORD_STOPWORDS = new Set([
    '재방문', '가성비', '친절', '회식', '직장인점심', '단골', '분위기', '서비스',
    '추천', '인기', '매장', '가게', '방문', '후기', '리뷰',
    'food', 'cafe', 'dessert', 'western', 'bar',
].map((word) => normalizeKeyword(word)));

const unique = (values) => Array.from(new Set(values.filter(Boolean)));

const asArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return [value];
};

const extractWords = (text = '') => {
    const source = String(text);
    const known = [
        '감성', '디저트', '카페', '데이트', '사진', '분위기', '조용한', '커피',
        '직장인', '점심', '회식', '가성비', '재방문', '친절', '매운', '혼밥',
        '한식', '중식', '일식', '양식', '주점', '브런치', '하이볼', '안주',
        '가족', '부모님', '학생', '핫플', '인테리어', '배달',
    ];
    return known.filter((word) => source.includes(word));
};

const readJson = (key) => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const normalizeCategory = (category = '') => CATEGORY_ALIASES[category] || category || '맛집';

const extractDistrict = (text = '') => {
    const match = String(text).match(/[가-힣]+구/);
    return match ? match[0] : '';
};

export function getLocalStoreProfile() {
    const cachedProfile = readJson('userProfile');
    const legacyUser = readJson('user');
    const signupDraft = readJson('pulseStoreProfileDraft');
    const profile = cachedProfile || signupDraft || legacyUser || {};
    const shopInfo = profile.shopInfo || {};
    const storeName = profile.shopName || profile.storeName || shopInfo.name || signupDraft?.storeName || DEFAULT_STORE_INSIGHT.storeName;
    const category = normalizeCategory(profile.shopCategory || profile.category || shopInfo.category || signupDraft?.category || DEFAULT_STORE_INSIGHT.category);
    const location = profile.shopAddress || profile.address || shopInfo.address || signupDraft?.address || DEFAULT_STORE_INSIGHT.location;

    return {
        ...DEFAULT_STORE_INSIGHT,
        storeName,
        category,
        location,
        keywords: unique([
            category,
            ...DEFAULT_STORE_INSIGHT.keywords,
            ...extractWords(`${storeName} ${category} ${location}`),
        ]),
        source: profile === DEFAULT_STORE_INSIGHT ? 'fallback' : 'local-profile',
    };
}

export function buildStoreInsightFromAnalysisData(analysisData) {
    if (!analysisData) return getLocalStoreProfile();

    const localProfile = getLocalStoreProfile();
    const personas = asArray(analysisData.personas);
    const personaKeywords = personas.flatMap((persona) => [
        persona.name,
        persona.title,
        persona.type,
        persona.summary,
        ...asArray(persona.keywords),
        ...extractWords(`${persona.name || ''} ${persona.title || ''} ${persona.summary || ''}`),
    ]);
    const reviewTopics = [
        ...asArray(analysisData.review_topics),
        ...asArray(analysisData.reviewTopics),
        ...asArray(analysisData.keywords),
        ...extractWords(analysisData.store_summary),
    ];

    return {
        ...localProfile,
        storeName: analysisData.store_name || localProfile.storeName,
        category: normalizeCategory(analysisData.category || localProfile.category),
        keywords: unique([
            localProfile.category,
            ...personaKeywords,
            ...reviewTopics,
            ...localProfile.keywords,
        ]),
        personas,
        reviewTopics: unique(reviewTopics),
        source: 'analysis',
    };
}

// 추상어를 걸러낸다. 단, 전부 걸러지면 원본을 유지해 0점만 나오는 상황을 막는다.
const dropStopwords = (tokens) => {
    const filtered = tokens.filter((token) => !KEYWORD_STOPWORDS.has(token));
    return filtered.length ? filtered : tokens;
};

export function keywordSimilarity(storeKeywords, influencerKeywords) {
    const store = dropStopwords(unique(asArray(storeKeywords).map(normalizeKeyword)));
    const influencer = dropStopwords(unique(asArray(influencerKeywords).map(normalizeKeyword)));
    if (store.length === 0 || influencer.length === 0) return { ratio: 0, matched: [] };

    // 부분 일치 허용: 한쪽이 다른 쪽을 포함하면 매칭으로 인정 (예: '디저트' ↔ '감성디저트')
    const matched = store.filter((storeKeyword) =>
        influencer.some((influencerKeyword) =>
            influencerKeyword.includes(storeKeyword) || storeKeyword.includes(influencerKeyword)
        )
    );

    return {
        ratio: matched.length / store.length,
        matched,
    };
}

const categoryScore = (storeCategory, niches) => {
    const category = normalizeKeyword(normalizeCategory(storeCategory));
    const normalizedNiches = asArray(niches).map((niche) => normalizeKeyword(normalizeCategory(niche)));
    if (normalizedNiches.includes(category)) return 25;
    if (category.includes('카페') && normalizedNiches.includes('디저트')) return 20;
    if (category.includes('맛집') && normalizedNiches.some((niche) => ['한식', '중식', '일식', '양식', '주점'].includes(niche))) return 18;
    return 0;
};

const locationScore = (storeLocation, activityArea) => {
    const district = extractDistrict(storeLocation);
    if (!district) return 8;
    return asArray(activityArea).includes(district) ? 20 : 0;
};

const performanceScore = (influencer) => {
    const viewScore = Math.min((influencer.avgViews || 0) / 150000, 1) * 8;
    const engagementScore = Math.min((influencer.engagementRate || 0) / 10, 1) * 7;
    return viewScore + engagementScore;
};

const budgetScore = (storeBudget, minBudget) => {
    const budget = Number(storeBudget || DEFAULT_STORE_INSIGHT.budget);
    const minimum = Number(minBudget || 0);
    if (!minimum) return 5;
    if (budget >= minimum) return 10;
    if (budget >= minimum * 0.7) return 6;
    return 2;
};

export function calculateInfluencerMatch(storeInsight, influencer) {
    const influencerKeywords = [
        ...asArray(influencer.keywords),
        ...asArray(influencer.niche),
        ...asArray(influencer.audienceKeywords),
    ];
    const keyword = keywordSimilarity(storeInsight.keywords, influencerKeywords);
    const scores = {
        category: categoryScore(storeInsight.category, influencer.niche),
        location: locationScore(storeInsight.location, influencer.activityArea),
        keyword: keyword.ratio * 30,
        performance: performanceScore(influencer),
        budget: budgetScore(storeInsight.budget, influencer.minBudget),
    };
    const total = Math.round(Object.values(scores).reduce((sum, score) => sum + score, 0));
    const reasons = [];

    if (scores.category >= 20) reasons.push(`${storeInsight.category} 업종과 콘텐츠 분야가 잘 맞습니다.`);
    if (scores.location >= 20) reasons.push(`${extractDistrict(storeInsight.location)} 활동권 인플루언서입니다.`);
    if (keyword.matched.length > 0) reasons.push(`손님분석 키워드 ${keyword.matched.slice(0, 3).join(', ')}와 겹칩니다.`);
    if (scores.performance >= 10) reasons.push(`평균 조회수와 참여율이 협업 검증 기준을 넘습니다.`);
    if (scores.budget >= 10) reasons.push(`예상 단가가 현재 제안 예산 안에 들어옵니다.`);

    return {
        ...influencer,
        matchScore: Math.min(total, 100),
        matchReasons: reasons.slice(0, 3),
        matchedKeywords: keyword.matched,
        matchBreakdown: {
            category: Math.round(scores.category),
            location: Math.round(scores.location),
            keyword: Math.round(scores.keyword),
            performance: Math.round(scores.performance),
            budget: Math.round(scores.budget),
        },
    };
}

export function scoreInfluencers(influencers, storeInsight) {
    return influencers
        .map((influencer) => calculateInfluencerMatch(storeInsight, influencer))
        .sort((a, b) => b.matchScore - a.matchScore);
}
