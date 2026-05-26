import React from 'react';
import { LogOut } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';

export function LogoutModal({ isOpen, onClose, onConfirm, onWithdrawClick }) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            ariaLabelledBy="logout-modal-title"
            panelClassName="w-[340px]"
        >
            {/* Body */}
            <div className="px-6 pt-7 pb-5 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-bg-page flex items-center justify-center">
                    <LogOut size={22} className="text-text-main/50" />
                </div>
                <div>
                    <h2 id="logout-modal-title" className="text-head-5 text-text-main">
                        로그아웃
                    </h2>
                    <p className="text-body-7 text-text-main/60 mt-1">
                        언제든지 다시 돌아오실 수 있어요.
                    </p>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 px-6 pb-6">
                <button
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl text-btn-main
                               text-text-main/50 bg-bg-page
                               hover:bg-gray-100 transition-colors
                               focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20"
                >
                    취소
                </button>
                <button
                    onClick={onConfirm}
                    className="flex-1 py-2.5 rounded-xl text-btn-main
                               bg-primary text-white
                               hover:opacity-90 transition-opacity
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                    로그아웃
                </button>
            </div>

            {/* Withdraw link */}
            <div className="px-6 pb-5 pt-4 border-t border-gray-100 text-center">
                <button
                    onClick={onWithdrawClick}
                    className="py-1.5 px-2 text-caption text-text-main/40
                               hover:text-warning transition-colors rounded
                               focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-warning/20"
                >
                    탈퇴를 원하시나요?
                </button>
            </div>
        </Modal>
    );
}
