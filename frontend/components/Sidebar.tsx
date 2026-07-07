'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    Home,
    BookOpen,
    Users,
    LogOut,
    LayoutDashboard,
    User,
    Folder,
    Globe,
    Sun,
    Moon,
    ClipboardList,
    Megaphone,
    CreditCard,
    Bookmark,
    Award,
} from 'lucide-react';
import { logout } from '@/lib/auth';
import Logo from '@/components/Logo';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SidebarProps {
    isAdmin?: boolean;
    isOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ isAdmin, isOpen = false, onClose }: SidebarProps) {
    const pathname = usePathname();
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    // Theme effect
    useEffect(() => {
        let storedTheme = null;
        try {
            storedTheme = localStorage.getItem('theme');
        } catch(e) {}
        
        const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = storedTheme || (systemPrefersDark ? 'dark' : 'light');
        
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTheme(initialTheme as 'light' | 'dark');
        if (initialTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
        try {
            localStorage.setItem('theme', nextTheme);
        } catch(e) {}
        if (nextTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const adminLinks = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Overview', href: '/admin', icon: LayoutDashboard },
        { name: 'Brands', href: '/admin/brands', icon: Globe },
        { name: 'Camps', href: '/admin/camps', icon: BookOpen },
        { name: 'Sessions', href: '/admin/sessions', icon: Folder },
        { name: 'Lab Submissions', href: '/admin/labs', icon: ClipboardList },
        { name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
        { name: 'Orders', href: '/admin/orders', icon: CreditCard },
        { name: 'Enrollments', href: '/admin/enrollments', icon: Users },
        { name: 'Certificates', href: '/admin/certificates', icon: Award },
        { name: 'Users', href: '/admin/users', icon: Users },
    ];

    const engineerLinks = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'My Camps', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Bookmarks', href: '/dashboard/bookmarks', icon: Bookmark },
        { name: 'Quiz History', href: '/dashboard/quizzes', icon: ClipboardList },
        { name: 'Profile', href: '/dashboard/profile', icon: User },
    ];

    const links = isAdmin ? adminLinks : engineerLinks;

    return (
        <>
            {/* Mobile backdrop overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={onClose}
                />
            )}
            <div className={cn(
                "w-64 bg-surface border-r border-border flex flex-col h-screen fixed left-0 top-0 z-50 text-foreground transition-transform duration-300",
                isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
            <div className="p-6 flex justify-between items-center border-b border-border">
                <Logo variant="horizontal" className="h-14 w-auto mx-auto" />
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={cn(
                                "flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all group",
                                isActive
                                    ? "bg-violet-600/10 text-violet-400 border border-violet-500/20"
                                    : "text-text-muted hover:bg-surface-hover hover:text-foreground border border-transparent"
                            )}
                        >
                            <Icon className={cn("w-5 h-5", isActive ? "text-violet-400" : "text-text-muted group-hover:text-foreground")} />
                            <span className="font-medium">{link.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border space-y-2">
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-text-muted hover:bg-surface-hover hover:text-foreground transition-all"
                >
                    {theme === 'dark' ? (
                        <>
                            <Sun className="w-5 h-5 text-amber-400" />
                            <span className="font-medium">Light Mode</span>
                        </>
                    ) : (
                        <>
                            <Moon className="w-5 h-5 text-violet-400" />
                            <span className="font-medium">Dark Mode</span>
                        </>
       