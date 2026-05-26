import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import InfluencerLayout from './components/layout/InfluencerLayout';
import AuthPage from './features/auth/AuthPage';
import LandingPage from './pages/LandingPage';
import InfluencerRequestPage from './features/influencer/InfluencerRequestPage';
import ProposalAcceptPage from './features/influencer/ProposalAcceptPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import './styles/globals.css';

export default function App() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/signup" element={<AuthPage />} />
            <Route path="/proposal-accept/:token" element={<ProposalAcceptPage />} />

            {/* Protected routes — 로그인 필요 (DEV_MODE=true면 바로 통과) */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>} />
            <Route path="/store/status-v2" element={<Navigate to="/dashboard" replace />} />
            <Route path="/subscription" element={<ProtectedRoute><DashboardLayout initialPage="subscription" /></ProtectedRoute>} />
            <Route path="/influencer-matching" element={<ProtectedRoute><DashboardLayout initialPage="influencer-matching" /></ProtectedRoute>} />
            <Route path="/influencer-matching/request/:id" element={<ProtectedRoute><DashboardLayout initialPage="influencer-matching" content={<InfluencerRequestPage />} /></ProtectedRoute>} />

            {/* Influencer Routes */}
            <Route path="/influencer/dashboard" element={<ProtectedRoute><InfluencerLayout initialPage="inbox" /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>} />
        </Routes>
    );
}
