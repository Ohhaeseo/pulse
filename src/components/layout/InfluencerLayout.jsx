import React, { useEffect, useState } from 'react';
import InfluencerSidebar from './InfluencerSidebar';
import Header from './Header';
import InfluencerInbox from '../../features/influencer/InfluencerInbox';
import InfluencerProfile from '../../features/influencer/InfluencerProfile';
import { COLORS } from '../../constants';
import { fetchCurrentProfile } from '../../features/auth/api/authApi';
import '../../styles/globals.css';

export default function InfluencerLayout({ initialPage }) {
    const [activeMenu, setActiveMenu] = useState(initialPage || 'inbox');
    const [isExpanded, setIsExpanded] = useState(false);
    const [userProfile, setUserProfile] = useState({
        ownerName: '인플루언서',
        profileImage: null,
    });

    useEffect(() => {
        let ignore = false;
        fetchCurrentProfile()
            .then((profile) => {
                if (ignore || profile?.role !== 'INFLUENCER') return;
                setUserProfile({
                    ownerName: profile.influencerProfile?.displayName || profile.name || '인플루언서',
                    profileImage: profile.influencerProfile?.profileImageUrl || null,
                });
            })
            .catch((error) => console.warn('Influencer layout profile load failed:', error));
        return () => {
            ignore = true;
        };
    }, []);

    return (
        <div className="flex h-screen font-pretendard overflow-hidden" style={{ backgroundColor: COLORS.bgPage }}>
            <InfluencerSidebar
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
                profile={userProfile}
            />

            <main
                className={`flex-1 p-6 h-full flex flex-col main-content pt-20 md:pt-6 transition-all duration-300 ${isExpanded ? 'md:ml-[276px] ml-0' : 'md:ml-[96px] ml-0'}`}
            >
                <div className="max-w-[1400px] h-full flex flex-col w-full mx-auto">
                    {activeMenu === 'inbox' ? (
                        <div className="flex-1 flex flex-col min-h-0 fade-in">
                            <Header title="받은 제안을 확인해보세요." profile={userProfile} />
                            <InfluencerInbox />
                        </div>
                    ) : activeMenu === 'profile' ? (
                        <div className="flex-1 flex flex-col min-h-0 fade-in">
                            <Header title="채널 정보와 활동 이력을 관리하세요." profile={userProfile} />
                            <InfluencerProfile />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 flex-col gap-4">
                            <p>준비 중인 기능입니다.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
