'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Logo from '@/components/Logo';
import { getStoredUser } from '@/lib/auth';
import { Loader2, Menu } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [ready, setReady] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const user = getStoredUser();
        if (!user) {
            router.replace('/login');
        } else if (user.role === 'ADMIN') {
            router.replace('/admin');
        } else {
            setReady(true);
        }
    }, [router]);

    if (!ready) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="animate-spin w-8 h-8 text-violet-400" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Mobile top bar */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-background border-b border-border flex items-center px-4 gap-3">
               