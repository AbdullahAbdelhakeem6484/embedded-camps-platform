'use client';

import { useEffect, useRef, useState } from 'react';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
    const [html, setHtml] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!content) {
            setHtml('');
            setLoading(false);
            return;
        }

        const render = () => {
            const w = window as any;
            if (w.marked) {
                // Configure marked options
                w.marked.setOptions({
                    gfm: true,      // GitHub Flavored Markdown
                    breaks: true,   // Convert \n to <br>
                });
                setHtml(w.marked.parse(content));
                setLoading(false);
            }
        };

        const w = window as any;
        if (w.marked) {
            render();
        } else {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
            script.onload = render;
            script.onerror = () => {
                // Fallback: render as plain text with basic formatting
                setHtml(`<pre style="white-space:pre-wrap">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`);
                setLoading(false);
            };
            document.head.appendChild(script);
        }
    }, [content]);

    if (loading) return (
        <div className="animate-pulse space-y-3 py-4">
            <div className="h-4 bg-white/10 rounded w-3/4" />
            <div className="h-4 bg-white/10 rounded w-full" />
            <div className="h-4 bg-white/10 rounded w-5/6" />
            <div className="h-4 bg-white/10 rounded w-2/3" />
        </div>
    );

    return (
        <div
            className={`prose prose-invert prose-violet max-w-none
                prose-headings:text-white prose-headings:font-bold
                prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                prose-p:text-gray-300 prose-p:leading-relaxed
                prose-a:text-violet-400 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-white prose-strong:font-semibold
                prose-code:text-violet-300 prose-code:bg-violet-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
                prose-pre:bg-[#0a0a0c] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl prose-pre:overflow-x-auto
                prose-blockquote:border-l-violet-500 prose-blockquote:text-gray-400 prose-blockquote:bg-violet-500/5 prose-blockquote:py-1 prose-blockquote:rounded-r-xl
                prose-ul:text-gray-300 prose-ol:text-gray-300
                prose-li:text-gray-300
                prose-table:text-sm
                prose-th:text-white prose-th:bg-white/10
                prose-td:text-gray-300 prose-td:border-white/10
                prose-img:rounded-xl prose-img:border prose-img:border-white/10
                prose-hr:border-white/10
                ${className}`}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
