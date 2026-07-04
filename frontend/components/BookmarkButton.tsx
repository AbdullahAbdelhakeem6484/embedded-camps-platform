'use client';

import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

interface Props {
    materialId: string;
    initialBookmarked?: boolean;
}

export default function BookmarkButton({ materialId, initialBookmarked = false }: Props) {
    const toast = useToast();
    const [bookmarked, setBookmarked] = useState(initialBookmarked);
    const [loading, setLoading] = useState(false);

    const toggle = async () => {
        if (loading) return;
        setLoading(true);
        // Optimistic update
        setBookmarked(prev => !prev);
        try {
            const res = await api.post('/bookmarks/toggle', { materialId });
            setBookmarked(res.data.bookmarked);
            if (res.data.bookmarked) {
                toast.success('Bookmarked');
            }
        } catch {
            // Revert on error
            setBookmarked(prev => !prev);
            toast.error('Failed to update bookmark');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggle}
            disabled={loading}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark this material'}
            className={`p-1.5 rounded-lg transition-all ${
                bookmarked
                    ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20'
                    : 'text-gray-600 hover:text-amber-400 hover:bg-amber-500/10 border border-transparent'
            }`}
        >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-amber-400' : ''}`} />
        </button>
    );
}
