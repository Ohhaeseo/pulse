import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../features/auth/api/authApi';
import {
    Home,
    BarChart2,
    MessageCircle,
    PlayCircle,
    Users,
    User,
    LayoutDashboard,
    LogOut,
    ChevronUp,
    Map,
    Menu,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OWNER_FALLBACK = '\uC0AC\uC7A5\uB2D8';
const GROWTH_PLAN_LABEL = 'Growth \uD50C\uB79C';

const Sidebar = ({ activeMenu, setActiveMenu, isExpanded, setIsExpanded, profile }) => {
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
    const ownerName = profile?.ownerName || OWNER_FALLBACK;

    const menus = [
        { id: 'status', icon: <LayoutDashboard size={24} />, label: '\uAC00\uAC8C \uD604\uD669' },
        { id: 'commercial-analysis', icon: <Map size={24} />, label: '\uC8FC\uBCC0 \uC0C1\uAD8C \uBD84\uC11D' },
        { id: 'insight', icon: <BarChart2 size={24} />, label: '\uC190\uB2D8 \uBD84\uC11D' },
        { id: 'promotion', icon: <PlayCircle size={24} />, label: '\uD64D\uBCF4 \uC601\uC0C1 \uB9CC\uB4E4\uAE30' },
        { id: 'review', icon: <MessageCircle size={24} />, label: '\uB9AC\uBDF0 \uAD00\uB9AC & \uB2F5\uBCC0' },
        { id: 'influencer-matching', icon: <Users size={24} />, label: '\uC778\uD50C\uB8E8\uC5B8\uC11C \uB9E4\uCE6D', badge: 'Pro' },
        { id: 'mypage', icon: <Home size={24} />, label: '\uB9C8\uC774\uD398\uC774\uC9C0' },
    ];

    const handleLogout = (event) => {
        event.stopPropagation();
        logout();
        navigate('/login');
    };

    return (
        <>
        <div
            className="hidden md:flex fixed top-4 bottom-4 left-4 z-50 flex-col gap-3"
            data-testid="sidebar-desktop"
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => {
                setIsExpanded(false);
                setShowProfileMenu(false);
            }}
        >
            <div
                className={`h-20 flex items-center pl-4 shrink-0 overflow-hidden transition-[width] duration-400 ease-[cubic-bezier(0.25,0.8,0.25,1)] ${isExpanded ? 'w-[260px]' : 'w-[68px]'} cursor-pointer`}
                onClick={() => setActiveMenu('status')}
            >
                <img
                    src={`${import.meta.env.BASE_URL}PULSE_LOGO.png`}
                    alt="PULSE"
                    className="h-12 w-auto max-w-none object-contain object-left"
                />
            </div>

            <div
                className={`flex-1 rounded-[30px] flex flex-col py-6 sidebar-container ${isExpanded ? 'w-[260px] sidebar-expanded' : 'w-[68px]'}`}
            >
                <div className="flex-1 flex flex-col gap-2 overflow-y-auto scrollbar-hide py-8">
                    {menus.map((menu) => (
                        <button
                            key={menu.id}
                            onClick={() => setActiveMenu(menu.id)}
                            data-testid={`sidebar-desktop-menu-${menu.id}`}
                            className={`menu-item w-full ${activeMenu === menu.id ? 'active' : ''}`}
                        >
                            <div className="menu-icon">
                                {menu.icon}
                            </div>
                            <span className="menu-label text-[17px] font-medium flex items-center gap-2">
                                {menu.label}
                                {menu.badge && (
                                    <span className="px-2 py-0.5 bg-gradient-to-r from-[#FF5A36] to-[#FF8A36] text-white text-[10px] font-bold rounded-full">
                                        {menu.badge}
                                    </span>
                                )}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="mb-2 shrink-0 relative px-2">
                    <div
                        className={`relative flex items-center h-16 transition-colors duration-200 rounded-2xl ${isExpanded ? 'bg-white/10 px-3 justify-between' : 'justify-center hover:bg-white/5'}`}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                                <User size={18} className="text-white" />
                            </div>

                            <div
                                className={`flex flex-col justify-center transition-opacity duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'} cursor-pointer hover:opacity-80`}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setActiveMenu('subscription');
                                }}
                            >
                                <p className="text-white text-[15px] font-bold leading-tight mb-0.5">{ownerName}</p>
                                <div className="flex items-center gap-1">
                                    <p className="text-blue-200 text-[11px] font-medium leading-tight">{GROWTH_PLAN_LABEL}</p>
                                    <ChevronUp size={12} className="text-blue-200" />
                                </div>
                            </div>
                        </div>

                        {isExpanded && (
                            <button
                                onClick={handleLogout}
                                data-testid="sidebar-desktop-logout"
                                className="group flex items-center justify-center w-8 h-8 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <LogOut size={15} strokeWidth={2} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* --- Mobile View --- */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white shadow-sm z-40 flex items-center justify-between px-4 border-b border-gray-100">
            <img src={`${import.meta.env.BASE_URL}PULSE_LOGO.png`} alt="PULSE" className="h-5 w-auto object-contain cursor-pointer" onClick={() => setActiveMenu('status')} />
            <div className="flex items-center gap-3">
                <div onClick={() => setActiveMenu('mypage')} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 cursor-pointer">
                    <User size={16} className="text-gray-600" />
                </div>
                <button onClick={() => setIsMobileDrawerOpen(true)} className="p-2 -mr-2 text-gray-800">
                    <Menu size={24} />
                </button>
            </div>
        </div>

        <AnimatePresence>
            {isMobileDrawerOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="md:hidden fixed inset-0 bg-black/50 z-[60]"
                        onClick={() => setIsMobileDrawerOpen(false)}
                    />
                    <motion.div
                        initial={{ x: '100%' }} 
                        animate={{ x: 0 }} 
                        exit={{ x: '100%' }} 
                        transition={{ type: 'tween', duration: 0.3 }}
                        className="md:hidden fixed top-0 right-0 bottom-0 w-[70vw] max-w-[300px] bg-white z-[70] flex flex-col shadow-2xl"
                    >
                        <div className="h-14 flex items-center justify-end px-4 border-b border-gray-100 shrink-0">
                            <button onClick={() => setIsMobileDrawerOpen(false)} className="p-2 -mr-2 text-gray-800">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto py-4 px-6 flex flex-col">
                            {menus.map((menu) => (
                                <button 
                                    key={menu.id} 
                                    onClick={() => { setActiveMenu(menu.id); setIsMobileDrawerOpen(false); }}
                                    data-testid={`sidebar-mobile-menu-${menu.id}`}
                                    className={`text-left py-4 border-b border-gray-100 flex items-center justify-between ${activeMenu === menu.id ? 'text-[#002B7A] font-bold' : 'text-[#191F28] font-medium text-[17px]'}`}
                                >
                                    {menu.label}
                                    {menu.badge && (
                                        <span className="px-2 py-0.5 bg-gradient-to-r from-[#FF5A36] to-[#FF8A36] text-white text-[10px] font-bold rounded-full">
                                            {menu.badge}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="p-6 shrink-0 border-t border-gray-100">
                            <button onClick={(e) => { handleLogout(e); setIsMobileDrawerOpen(false); }} data-testid="sidebar-mobile-logout" className="flex items-center gap-2 text-gray-500 font-medium py-2">
                                <LogOut size={18} /> 로그아웃
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
        </>
    );
};

export default Sidebar;
