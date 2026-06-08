const API_BASE_URL = import.meta.env.VITE_FASTAPI_BASE_URL || 'http://127.0.0.1:8000/api';
const AUTH_TOKEN_KEY = 'accessToken';

const MOCK_RESPONSE = {
    status: 'success',
    data: {
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-coffee-pouring-into-a-cup-in-slow-motion-4288-large.mp4',
        videoTitle: '깊고 진한 라떼의 한 모금',
        hashtags: ['#카페', '#시그니처라떼', '#오늘의한잔', '#감성카페'],
        generationTime: '5.2s'
    }
};

const MOCK_PROGRESS_STEPS = [
    { progress: 10, message: '사진을 분석하고 있어요..' },
    { progress: 30, message: '영상 콘셉트를 구성하고 있어요..' },
    { progress: 55, message: '영상을 생성하고 있어요..' },
    { progress: 75, message: '장면을 다듬고 있어요..' },
    { progress: 90, message: '영상을 렌더링하고 있어요..' },
    { progress: 100, message: '완성되었어요' },
];

const POLL_INTERVAL_MS = 2000;

const VIBE_TO_STYLE = {
    energetic: 'energy',
    luxury: 'premium',
    emotional: 'mood'
};

const QUALITY_TO_MODE = {
    standard: 'standard',
    pro: 'pro'
};

function normalizeVideoUrl(videoUrl) {
    if (!videoUrl || !API_BASE_URL) {
        return videoUrl;
    }

    if (/^https?:\/\//i.test(videoUrl)) {
        return videoUrl;
    }

    try {
        return new URL(videoUrl, `${API_BASE_URL}/`).toString();
    } catch {
        return videoUrl;
    }
}

function normalizePromotionResult(data) {
    if (!data) {
        return data;
    }

    return {
        ...data,
        videoUrl: normalizeVideoUrl(data.videoUrl),
    };
}

async function readResponseText(response) {
    try {
        return await response.text();
    } catch {
        return '';
    }
}

export async function fetchPromotionPromptRecommendation({
    target,
    storeName,
    storeSummary,
    personaLabel,
    personaSummary,
    personaTags,
    actionRecommendation,
    style,
    mode,
    imageFile,
}) {
    if (!API_BASE_URL) {
        throw new Error('Promotion API base URL is missing');
    }

    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const formData = new FormData();
    formData.append('target', target);
    formData.append('store_name', storeName || '');
    formData.append('store_summary', storeSummary || '');
    formData.append('persona_label', personaLabel || '');
    formData.append('persona_summary', personaSummary || '');
    formData.append('persona_tags_json', JSON.stringify(personaTags || []));
    formData.append('action_recommendation', actionRecommendation || '');
    formData.append('style', style);
    formData.append('mode', mode);
    if (imageFile) {
        formData.append('image', imageFile);
    }

    const response = await fetch(`${API_BASE_URL}/info/prompt-recommendation`, {
        method: 'POST',
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
    });

    if (!response.ok) {
        const detail = await readResponseText(response);
        throw new Error(`Prompt recommendation failed (${response.status}) ${detail}`.trim());
    }

    return response.json();
}

export async function generatePromotionVideo({ target, concept, mode, style, imageFile, onProgress }) {
    const notify = onProgress || (() => { });

    if (!API_BASE_URL) {
        console.warn('[promotionApi] VITE_API_BASE_URL is missing. Returning mock response.');
        await _simulateMockProgress(notify);
        return MOCK_RESPONSE.data;
    }

    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const formData = new FormData();
    formData.append('target', target);
    formData.append('concept', concept);
    formData.append('mode', mode);
    formData.append('style', style);
    if (imageFile) {
        formData.append('image', imageFile);
    }

    notify(5, '요청을 전송하고 있어요..');

    const startRes = await fetch(`${API_BASE_URL}/info/generate`, {
        method: 'POST',
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
    });

    if (!startRes.ok) {
        const detail = await readResponseText(startRes);
        throw new Error(`Video generation request failed (${startRes.status}) ${detail}`.trim());
    }

    const startJson = await startRes.json();
    const taskId = startJson?.task_id;

    if (taskId) {
        return _pollStatus(taskId, token, notify);
    }

    if (startJson.status !== 'success' || !startJson.data) {
        throw new Error(startJson.message || 'Unexpected promotion API response');
    }

    notify(100, '완성되었어요');
    return normalizePromotionResult(startJson.data);
}

async function _pollStatus(taskId, token, onProgress) {
    const statusUrl = `${API_BASE_URL}/info/status/${taskId}`;

    while (true) {
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));

        const res = await fetch(statusUrl, {
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });

        if (!res.ok) {
            const detail = await readResponseText(res);
            throw new Error(`Promotion status polling failed (${res.status}) ${detail}`.trim());
        }

        const json = await res.json();
        const { status, progress, message, data } = json;

        onProgress(progress ?? 0, message ?? '처리 중..');

        if (status === 'complete' && data) {
            return normalizePromotionResult(data);
        }

        if (status === 'error') {
            throw new Error(message || 'Promotion generation failed');
        }
    }
}

async function _simulateMockProgress(onProgress) {
    for (const step of MOCK_PROGRESS_STEPS) {
        const delay = step.progress === 100 ? 300 : 700;
        await new Promise(resolve => setTimeout(resolve, delay));
        onProgress(step.progress, step.message);
    }
    await new Promise(resolve => setTimeout(resolve, 300));
}

export function vibeToStyle(vibeId) {
    return VIBE_TO_STYLE[vibeId] || 'energy';
}

export function qualityToMode(qualityMode) {
    return QUALITY_TO_MODE[qualityMode] || 'standard';
}
