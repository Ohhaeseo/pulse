import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap } from 'lucide-react';
import { login, logout } from '../api/authApi';
import '../AuthPage.css';

const DEV_MODE = import.meta.env.DEV;

const LoginForm = ({ onSwitch }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const data = await login(formData);
            const role = data?.user?.role;
            navigate(role === 'INFLUENCER' ? '/influencer/dashboard' : '/dashboard');
        } catch (error) {
            logout();
            console.error('Login Error:', error);
            alert(error.message || '로그인 처리 중 오류가 발생했습니다.');
        }
    };

    // 개발자 빠른 진입: mock 유저로 즉시 로그인
    const handleDevBypassLogin = (role = 'owner') => {
        if (role === 'owner') {
            const mockUser = {
                id: 'owner_999',
                role: 'owner',
                name: '김사장 (Dev)',
                storeName: '펄스 식당'
            };
            localStorage.setItem('user', JSON.stringify(mockUser));
            localStorage.setItem('accessToken', 'dev-bypass-token');
            navigate('/dashboard');
        } else {
            const mockInfluencer = {
                id: 'influencer_999',
                role: 'influencer',
                name: '테스트 인플루언서'
            };
            localStorage.setItem('user', JSON.stringify(mockInfluencer));
            localStorage.setItem('accessToken', 'dev-bypass-token');
            navigate('/influencer/dashboard');
        }
    };

    return (
        <div className="form-wrapper fade-in">
            <h2 className="form-title">환영합니다!</h2>
            <p className="form-subtitle">
                복잡한 마케팅은 펄스에게 맡기고<br />
                오늘도 맛있는 요리에만 집중하세요.
            </p>

            <form onSubmit={handleSubmit}>
                {DEV_MODE && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                        <button
                            type="button"
                            onClick={() => handleDevBypassLogin('owner')}
                            style={{ padding: '10px', background: '#f97316', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            🚀 [DEV] 사장님 자동 로그인
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDevBypassLogin('influencer')}
                            style={{ padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            ✨ [DEV] 인플루언서 자동 로그인
                        </button>
                    </div>
                )}
                <div className="input-group">
                    <input
                        type="email"
                        name="email"
                        data-testid="login-email"
                        placeholder="이메일"
                        className="minimal-input"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <PasswordInput
                        name="password"
                        testId="login-password"
                        placeholder="비밀번호"
                        value={formData.password}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit" className="submit-btn" data-testid="login-submit">
                    로그인
                </button>
            </form>

            <div className="form-switch-container">
                <p className="switch-text">아직 PULSE 계정이 없으신가요?</p>
                <button className="switch-btn" onClick={onSwitch}>회원가입 하러가기</button>
            </div>

        </div>
    );
};


const PasswordInput = ({ name, placeholder, value, onChange, testId }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="password-wrapper-minimal">
            <input
                type={show ? "text" : "password"}
                name={name}
                data-testid={testId}
                placeholder={placeholder}
                className="minimal-input"
                value={value}
                onChange={onChange}
                required
            />
            <div className="toggle-icon" onClick={() => setShow(!show)}>
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
        </div>
    );
};

export default LoginForm;


