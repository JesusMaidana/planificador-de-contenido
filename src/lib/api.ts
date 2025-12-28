import { ContentItem } from '@/types';

// Helper to map backend snake_case to frontend camelCase
const normalizeItem = (item: any): ContentItem => ({
    ...item,
    targetDate: item.target_date || item.targetdate || item.targetDate,
    isSponsored: item.is_sponsored !== undefined ? item.is_sponsored : item.isSponsored,
});

// Helper to map frontend camelCase to backend snake_case for mutations
// Note: Backend also handles mapping, but we do it here for extra safety 
// and to keep types clean.
const denormalizeItem = (item: Partial<ContentItem>): any => {
    const { targetDate, isSponsored, ...others } = item;
    return {
        ...others,
        ...(targetDate !== undefined && { target_date: targetDate }),
        ...(isSponsored !== undefined && { is_sponsored: isSponsored }),
    };
};

export const api = {
    fetchContent: async (): Promise<ContentItem[]> => {
        const res = await fetch('/api/content', {
            credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to fetch content');
        const data = await res.json();
        return (data || []).map(normalizeItem);
    },

    createContent: async (item: Partial<ContentItem>): Promise<ContentItem> => {
        const res = await fetch('/api/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(denormalizeItem(item)),
            credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to create content');
        const data = await res.json();
        return normalizeItem(data);
    },

    updateContent: async (item: ContentItem): Promise<ContentItem> => {
        const res = await fetch('/api/content', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(denormalizeItem(item)),
            credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to update content');
        const data = await res.json();
        return normalizeItem(data);
    },

    deleteContent: async (id: string): Promise<void> => {
        const res = await fetch(`/api/content?id=${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to delete content');
    },

    deleteAllContent: async (): Promise<void> => {
        const res = await fetch('/api/content?id=all', {
            method: 'DELETE',
            credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to delete all content');
    },
};
