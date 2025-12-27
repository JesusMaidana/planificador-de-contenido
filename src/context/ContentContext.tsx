"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ContentItem } from "@/types";
import { api } from "@/lib/api";
import { ContentModal } from "@/components/ContentModal";

interface ContentContextType {
    items: ContentItem[];
    isLoading: boolean;
    refreshContent: () => Promise<void>;
    openCreationModal: () => void;
    deleteAllContent: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<ContentItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const refreshContent = async () => {
        setIsLoading(true);
        try {
            const data = await api.fetchContent();
            setItems(data);
        } catch (error) {
            console.error("Failed to fetch content", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshContent();
    }, []);

    const openCreationModal = () => setIsModalOpen(true);

    const handleSave = async (item: Partial<ContentItem>) => {
        try {
            if (item.id) {
                await api.updateContent(item as ContentItem);
            } else {
                await api.createContent(item);
            }
            await refreshContent();
            setIsModalOpen(false); // Close modal after successful save
        } catch (error) {
            console.error("Failed to save content", error);
        }
    };

    const deleteAllContent = async () => {
        try {
            await api.deleteAllContent();
            await refreshContent();
        } catch (error) {
            console.error("Failed to delete all content", error);
        }
    };

    return (
        <ContentContext.Provider value={{ items, isLoading, refreshContent, openCreationModal, deleteAllContent }}>
            {children}
            <ContentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
            />
        </ContentContext.Provider>
    );
}

export function useContent() {
    const context = useContext(ContentContext);
    if (context === undefined) {
        throw new Error("useContent must be used within a ContentProvider");
    }
    return context;
}
