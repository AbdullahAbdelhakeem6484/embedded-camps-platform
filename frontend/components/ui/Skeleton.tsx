'use client';

import React from 'react';

// Base skeleton block
export function Skeleton({ className = '' }: { className?: string }) {
    return <div className={`skeleton rounded-xl ${className}`} />;
}

// ─── Page-level skeletons ─────────────────────────────────────────────────────

export function CampCardSkeleton() {
    return (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            <div className="p-6 space-y-4">
                <div className="flex justify-between">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-5 w-16 rounded-lg" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                </div>
            </div>
            <div className="p-4 border-t border-border">
                <Skeleton className="h-4 w-32" />
            </div>
        </div>
    );
}

export function SessionCardSkeleton() {
    return (
        <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center space-x-3">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
                <Skeleton className="h-10 rounded-xl" />
                <Skeleton className="h-10 rounded-xl" />
                <Skeleton className="h-10 rounded-xl" />
                <Skeleton className="h-10 rounded-xl" />
            </div>
            <Skeleton className="h-9 w-full rounded-xl" />
        </div>
    );
}

export function UserRowSkeleton() {
    return (
        <tr className="border-b border-border">
            <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
            <td className="px-6 py-4"><Skeleton className="h-4 w-44" /></td>
            <td className="px-6 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
            <td className="px-6 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
            <td className="px-6 py-4"><Skeleton className="h-8 w-24 rounded-lg" /></td>
        </tr>
    );
}

export function StatCardSkeleton() {
    return (
        <div className="bg-surface border border-border rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="w-9 h-9 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-28" />
        </div>
    );
}

export function DashboardCampSkeleton() {
    return (
        <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-start">
                <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-9 w-full rounded-xl" />
        </div>
    );
}

export function SubmissionSkeleton() {
    return (
        <div className="bg-surface border border-border rounded-3xl p-8 space-y-6">
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                </div>
                <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-24 w-full rounded-2xl" />
            <div className="space-y-3">
                <Skeleton className="h-20 w-full rounded-xl" />
            </div>
        </div>
    );
}

export function BookmarkRowSkeleton() {
    return (
        <div className="flex items-center gap-4 bg-surface border border-border rounded-xl px-5 py-4">
            <Skeleton className="w-4 h-4 rounded" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-3 w-20 hidden sm:block" />
        </div>
    );
}

export function CampViewSkeleton() {
    return (
        <div className="space-y-8 pb-20">
            <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-72" />
                <Skeleton className="h-4 w-48" />
            </div>
            <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
                <div className="flex justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
            </div>
            {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-surface border border-border rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    {[...Array(3)].map((_, j) => (
                        <div key={j} className="flex items-center gap-3 pl-4">
                            <Skeleton className="w-5 h-5 rounded-full shrink-0" />
                            <Skeleton className="h-4 flex-1" />
                            <Skeleton className="h-4 w-12" />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
    return (
        <tr className="border-b border-border">
            {[...Array(cols)].map((_, i) => (
                <td key={i} className="px-6 py-4">
                    <Skeleton className={`h-4 ${i === 0 ? 'w-36' : i === cols - 1 ? 'w-20' : 'w-28'}`} />
                </td>
            ))}
        </tr>
    );
}
