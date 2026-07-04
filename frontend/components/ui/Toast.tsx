'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    title?: string;
    message: string;
    duration?: number;
}

interface ToastContextValue {
    toast: {
        success: (message: string, title?: string) => void;
        error: (message: string, title?: string) => void;
        warning: (message: string, title?: string) => void;
        info: (message: string, title?: string) => void;
    };
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Icons & styles per type ─────────────────────────────────────────────────

const CONFIG: Record<ToastType, { icon: React.ReactNode; bg: string; border: string; iconColor: string }> = {
    success: {
        icon: <CheckCircle2 className="w-5 h-5 shrink-0" />,
        bg: 'bg-[#0f0b1a]',
        border: 'border-emerald-500/30',
        iconColor: 'text-emerald-400',
    },
    error: {
        icon: <XCircle className="w-5 h-5 shrink-0" />,
        bg: 'bg-[#0f0b1a]',
        border: 'border-red-500/30',
        iconColor: 'text-red-400',
    },
    warning: {
        icon: <AlertTriangle className="w-5 h-5 shrink-0" />,
        bg: 'bg-[#0f0b1a]',
        border: 'border-amber-500/30',
        iconColor: 'text-amber-400',
    },
    info: {
        icon: <Info className="w-5 h-5 shrink-0" />,
        bg: 'bg-[#0f0b1a]',
        border: 'border-violet-500/30',
        iconColor: 'text-violet-400',
    },
};

// ─── Individual Toast ─────────────────────────────────────────────────────────

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
    const [visible, setVisible] = useState(false);
    const cfg = CONFIG[toast.type];

    useEffect(() => {
        // Trigger enter animation
        const t = setTimeout(() => setVisible(true), 10);
        // Auto-dismiss
        const d = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onDismiss(toast.id), 300);
        }, toast.duration ?? 4000);
        return () => { clearTimeout(t); clearTimeout(d); };
    }, [toast.id, toast.duration, onDismiss]);

    return (
        <div
            className={`
                flex items-start gap-3 px-4 py-3 rounded-xl border shadow-xl
                transition-all duration-300
                ${cfg.bg} ${cfg.border}
                ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
                max-w-sm w-full pointer-events-auto
            `}
        >
            <span className={cfg.iconColor}>{cfg.icon}</span>
            <div className="flex-1 min-w-0">
                {toast.title && (
                    <p className="text-sm font-semibold text-white mb-0.5">{toast.title}</p>
                )}
                <p className="text-sm text-gray-300 leading-snug">{toast.message}</p>
            </div>
            <button
                onClick={() => { setVisible(false); setTimeout(() => onDismiss(toast.id), 300); }}
                className="text-gray-500 hover:text-gray-300 transition-colors shrink-0 mt-0.5"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const add = useCallback((type: ToastType, message: string, title?: string, duration?: number) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        setToasts((prev) => [...prev.slice(-4), { id, type, message, title, duration }]);
    }, []);

    const toast = {
        success: (m: string, t?: string) => add('success', m, t),
        error:   (m: string, t?: string) => add('error', m, t),
        warning: (m: string, t?: string) => add('warning', m, t),
        info:    (m: string, t?: string) => add('info', m, t),
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            {/* Portal */}
            <div
                className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 items-end pointer-events-none"
                aria-live="polite"
                aria-atomic="false"
            >
                {toasts.map((t) => (
                    <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx.toast;
}
