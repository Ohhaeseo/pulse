const SPRING_API_BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL || 'http://localhost:8080/api';
const USER_PROFILE_STORAGE_KEY = 'userProfile';

const readCachedProfile = () => {
  try {
    const cachedProfile = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    if (cachedProfile) return JSON.parse(cachedProfile);

    const legacyUser = localStorage.getItem('user');
    if (!legacyUser) return null;

    const parsedLegacyUser = JSON.parse(legacyUser);
    const role = (parsedLegacyUser.role || 'owner').toUpperCase();
    return {
      email: parsedLegacyUser.email || '',
      name: parsedLegacyUser.name || '',
      role,
      ownerName: role === 'OWNER' ? parsedLegacyUser.name || '' : '',
      shopName: parsedLegacyUser.storeName || '',
      shopAddress: '',
    };
  } catch (error) {
    console.warn('프로필 캐시를 읽지 못했습니다.', error);
    return null;
  }
};

const persistAuth = (data) => {
  if (data.accessToken) {
    localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
    localStorage.removeItem('user');
    localStorage.setItem('accessToken', data.accessToken);
  }

  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  if (data.analysisTaskId) {
    localStorage.setItem('analysisTaskId', data.analysisTaskId);
  }
};

const postJson = async (path, body) => {
  const url = `${SPRING_API_BASE_URL}${path}`;
  const shouldLogAuth = path.startsWith('/auth/');

  if (shouldLogAuth) {
    console.groupCollapsed(`[PULSE auth] POST ${path}`);
    console.log('url:', url);
    console.log('payload:', body);
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (shouldLogAuth) {
    console.log('status:', response.status, response.statusText);
    console.log('response:', data);
    console.groupEnd();
  }

  if (!response.ok) {
    throw new Error(data.message || '요청 처리에 실패했습니다.');
  }

  persistAuth(data);
  return data;
};

export const signup = async (signupData) => postJson('/auth/signup', signupData);

export const signupInfluencer = async (formData) => {
  const keywords = [formData.niche, ...(formData.tags || [])].filter(Boolean);
  const payload = {
    email: formData.email,
    password: formData.password,
    passwordConfirm: formData.password,
    name: formData.name,
    phone: formData.phone || '',
    privacyAgreed: !!formData.agreedToTerms,
    profile: {
      displayName: formData.name,
      bio: formData.bio,
      location: formData.location,
      profileImageUrl: formData.profileImageUrl || '',
      instagramUrl: formData.instagramUrl,
      youtubeUrl: formData.youtubeUrl,
      niches: formData.niche ? [formData.niche] : [],
      keywords,
      activityAreas: formData.location ? [formData.location] : [],
      audienceKeywords: formData.tags || [],
    },
  };

  return postJson('/auth/signup/influencer', payload);
};

export const login = async (loginData) => postJson('/auth/login', loginData);

export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('analysisTaskId');
  localStorage.removeItem('user');
  localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
};

export const getToken = () => localStorage.getItem('accessToken');

export const isAuthenticated = () => !!getToken();

export const fetchCurrentProfile = async () => {
  const token = getToken();
  if (!token || token === 'dev-bypass-token') {
    return readCachedProfile();
  }

  try {
    const response = await fetch(`${SPRING_API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '프로필 정보를 불러오지 못했습니다.');
    }

    const data = await response.json();
    localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(data));
    return data;
  } catch (error) {
    console.error('프로필 조회 오류:', error);
    return readCachedProfile();
  }
};
