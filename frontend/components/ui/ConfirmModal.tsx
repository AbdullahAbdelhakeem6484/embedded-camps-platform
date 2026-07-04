'use client';

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ConfirmOptions {
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

// ─── Context ─────────────────────────────────────────────────────────────────

const ConfirmContext = createContext<{ confirm: ConfirmFn } | null>(null);

// ─── Dialog Component ─────────────────────────────────────────────────────────

interface DialogState extends ConfirmOptions {
    resolve: (value: boolean) => void;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
    const [dialog, setDialog] = useState<DialogState | null>(null);

    const confirm: ConfirmFn = useCallback((options) => {
        return new Promise((resolve) => {
            setDialog({ ...options, resolve });
        });
    }, []);

    const handleResult = (result: boolean) => {
        dialog?.resolve(result);
        setDialog(null);
    };

    const variantConfig = {
        danger:  { icon: <Trash2 className="w-6 h-6" />, iconBg: 'bg-red-500/10 text-red-400', btnColor: 'bg-red-600 hover:bg-red-500' },
        warning: { icon: <AlertTriangle className="w-6 h-6" />, iconBg: 'bg-amber-500/10 text-amber-400', btnColor: 'bg-amber-600 hover:bg-amber-500' },
        info:    { icon: <AlertTriangle className="w-6 h-6" />, iconBg: 'bg-violet-500/10 text-violet-400', btnColor: 'bg-violet-600 hover:bg-violet-500' },
    };

    const cfg = variantConfig[dialog?.variant ?? 'danger'];

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}

            {dialog && (
                <div
                    className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                    onClick={() => handleResult(false)}
                >
                    <div
                        className="w-full max-w-md bg-[#0f0b1a] rounded-2xl border border-white/10 shadow-2xl p-6 space-y-5 animate-fade-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-start gap-4">
                            <div className={`p-2.5 rounded-xl shrink-0 ${cfg.iconBg}`}>
                                {cfg.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white">
                                    {dialog.title ?? 'Are you sure?'}
                                </h3>
                                <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                                    {dialog.message}
                                </p>
                            </div>
                            <button
                                onClick={() => handleResult(false)}
                                className="text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-1">
                            <button
                                onClick={() => handleResult(false)}
                                className="flex-1 py-2.5 px-4 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-semibold transition-all"
                            >
                                {dialog.cancelLabel ?? 'Cancel'}
                            </button>
                            <button
                                onClick={() => handleResult(true)}
                                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition-all ${cfg.btnColor}`}
                            >
                                {dialog.confirmLabel ?? 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useConfirm() {
    const ctx = useContext(ConfirmContext);
    if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
    return ctx.confirm;
}

// ─── Component Export ────────────────────────────────────────────────────────

interface ConfirmModalProps {
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmModal({
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    danger = false,
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    return (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onCancel}>
            <div className="w-full max-w-md bg-[#0f0b1a] rounded-2xl border border-white/10 shadow-2xl p-6 space-y-5 animate-fade-up" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-xl shrink-0 ${danger ? 'bg-red-500/10 text-red-400' : 'bg-violet-500/10 text-violet-400'}`}>
                        {danger ? <Trash2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-white">{title ?? 'Are you sure?'}</h3>
                        <p className="text-sm text-gray-400 mt-1 leading-relaxed">{message}</p>
                    </div>
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-300 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex gap-3 pt-1">
                    <button onClick={onCancel} className="flex-1 py-2.5 px-4 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-semibold transition-all">
                        {cancelLabel}
                    </button>
                    <button onClick={onConfirm} className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition-all ${danger ? 'bg-red-600 hover:bg-red-500' : 'bg-violet-600 hover:bg-violet-500'}`}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
