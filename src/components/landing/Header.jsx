import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';

const Header = () => {
    const navigate = useNavigate();

    return (
        <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm border-b border-neutral-200">
            <div className="flex justify-between items-center px-6 py-3 max-w-[1200px] mx-auto w-full">
                <div className="cursor-pointer" onClick={() => navigate('/')}>
                    <img src={`${import.meta.env.BASE_URL}PULSE_Logo_full.png`} alt="PULSE" className="h-10 w-auto" />
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/login')}
                    >
                        로그인
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate('/signup')}
                    >
                        회원가입
                    </Button>
                </div>
            </div>
        </header>
    );
};

export default Header;
