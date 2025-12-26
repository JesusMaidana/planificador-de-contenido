import { ContentItem } from '@/types';

export const api = {
    fetchContent: async (): Promise<ContentItem[]> => {
        const res = await fetch('/api/content');
        if (!res.ok) throw new Error('Failed to fetch content');
        return res.json();
    },

    createContent: async (item: Partial<ContentItem>): Promise<ContentItem> => {
        const res = await fetch('/api/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
        });
        if (!res.ok) throw new Error('Failed to create content');
        return res.json();
    },

    updateContent: async (item: ContentItem): Promise<ContentItem> => {
        const res = await fetch('/api/content', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
        });
        if (!res.ok) throw new Error('Failed to update content');
        return res.json();
    },

    deleteContent: async (id: string): Promise<void> => {
        const res = await fetch(`/api/content?id=${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete content');
    },
};
