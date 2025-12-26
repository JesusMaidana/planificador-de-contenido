"use client";

import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import { ContentItem } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { ContentModal } from "@/components/ContentModal";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Edit2, Trash2, Plus, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

// Types for Sorting
type SortKey = "title" | "status" | "platform" | "targetDate";
type SortDirection = "asc" | "desc";

interface SortConfig {
    key: SortKey;
    direction: SortDirection;
}

export function ContentTable() {
    const searchParams = useSearchParams();
    const [items, setItems] = useState<ContentItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<ContentItem> | undefined>(undefined);
    const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);

    // Sorting State
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

    const fetchData = async () => {
        try {
            const data = await api.fetchContent();
            // Default sort by date (ascending) from API/Load
            setItems(data.sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Memoized Sorting Logic (Pure & Deterministic)
    const sortedItems = useMemo(() => {
        // Create a copy to avoid mutating original 'items'
        const sortableItems = [...items];

        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aValue: string | number = "";
                let bValue: string | number = "";

                // Extraction logic based on key
                switch (sortConfig.key) {
                    case "title":
                        aValue = a.title?.toLowerCase() || "";
                        bValue = b.title?.toLowerCase() || "";
                        break;
                    case "status":
                        // Grouping by status string
                        aValue = a.status || "";
                        bValue = b.status || "";
                        break;
                    case "platform":
                        // Grouping by platform string
                        aValue = a.platform || "";
                        bValue = b.platform || "";
                        break;
                    default:
                        // Fallback
                        return 0;
                }

                if (aValue < bValue) {
                    return sortConfig.direction === "asc" ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === "asc" ? 1 : -1;
                }
                return 0;
            });
        }

        return sortableItems;
    }, [items, sortConfig]);

    // Scroll and Highlight Logic (Search)
    useEffect(() => {
        const search = searchParams.get("q")?.toLowerCase();
        if (!search || sortedItems.length === 0) {
            setHighlightedItemId(null);
            return;
        }

        const firstMatch = sortedItems.find(item =>
            (item.title?.toLowerCase() || "").includes(search) ||
            (item.platform?.toLowerCase() || "").includes(search) ||
            (item.type?.toLowerCase() || "").includes(search)
        );

        if (firstMatch) {
            setHighlightedItemId(firstMatch.id);
            const element = document.getElementById(`row-${firstMatch.id}`);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        } else {
            setHighlightedItemId(null);
        }
    }, [searchParams, sortedItems]);

    // Sort Handler
    const handleSort = (key: SortKey) => {
        setSortConfig((current) => {
            if (current && current.key === key) {
                // Toggle direction
                return {
                    key,
                    direction: current.direction === "asc" ? "desc" : "asc",
                };
            }
            // New key, default to asc
            return { key, direction: "asc" };
        });
    };

    // Helper to render sort icon
    const getSortIcon = (key: SortKey) => {
        if (sortConfig?.key === key) {
            return sortConfig.direction === "asc" ? (
                <ArrowUp className="h-4 w-4 text-indigo-400" />
            ) : (
                <ArrowDown className="h-4 w-4 text-indigo-400" />
            );
        }
        return <ArrowUpDown className="h-4 w-4 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />;
    };

    const handleCreate = () => {
        setEditingItem(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (item: ContentItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("¿Estás seguro de que quieres eliminar este item?")) {
            await api.deleteContent(id);
            fetchData();
        }
    };

    const handleSave = async (item: Partial<ContentItem>) => {
        if (item.id) {
            await api.updateContent(item as ContentItem);
        } else {
            await api.createContent(item);
        }
        fetchData();
    };

    if (isLoading) {
        return <div className="text-zinc-400">Cargando contenido...</div>;
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="mb-6 flex items-center justify-between shrink-0">
                <h1 className="text-3xl font-bold text-white">Todo el Contenido</h1>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                    <Plus className="h-4 w-4" />
                    Nuevo Contenido
                </button>
            </div>

            <div className="flex-1 overflow-auto rounded-xl border border-zinc-800 bg-zinc-950 shadow-sm relative">
                <table className="w-full text-left text-sm text-zinc-400">
                    <thead className="bg-zinc-900/50 text-xs uppercase text-zinc-500 sticky top-0 z-10 backdrop-blur-sm">
                        <tr>
                            <th
                                className="px-6 py-4 font-medium cursor-pointer hover:text-white transition-colors group select-none"
                                onClick={() => handleSort("title")}
                            >
                                <div className="flex items-center gap-2">
                                    Título
                                    {getSortIcon("title")}
                                </div>
                            </th>
                            <th
                                className="px-6 py-4 font-medium cursor-pointer hover:text-white transition-colors group select-none"
                                onClick={() => handleSort("platform")}
                            >
                                <div className="flex items-center gap-2">
                                    Plataforma
                                    {getSortIcon("platform")}
                                </div>
                            </th>
                            <th
                                className="px-6 py-4 font-medium cursor-pointer hover:text-white transition-colors group select-none"
                                onClick={() => handleSort("status")}
                            >
                                <div className="flex items-center gap-2">
                                    Estado
                                    {getSortIcon("status")}
                                </div>
                            </th>
                            <th className="px-6 py-4 font-medium">Tipo</th>
                            <th className="px-6 py-4 font-medium">Fecha</th>
                            <th className="px-6 py-4 font-medium">Patroc.</th>
                            <th className="px-6 py-4 font-medium text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {sortedItems.map((item) => {
                            const search = searchParams.get("q")?.toLowerCase();
                            const isMatch = search && (
                                (item.title?.toLowerCase() || "").includes(search) ||
                                (item.platform?.toLowerCase() || "").includes(search) ||
                                (item.type?.toLowerCase() || "").includes(search)
                            );

                            return (
                                <tr
                                    key={item.id}
                                    id={`row-${item.id}`}
                                    className={cn(
                                        "group transition-colors duration-500",
                                        isMatch ? "bg-indigo-950/40" : "hover:bg-zinc-900/30"
                                    )}
                                >
                                    <td className="px-6 py-4 font-medium text-white">
                                        <div className="flex flex-col">
                                            <span className={isMatch ? "text-indigo-200" : ""}>{item.title}</span>
                                            {item.notes && <span className="text-xs text-zinc-500 truncate max-w-[200px]">{item.notes}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <PlatformIcon platform={item.platform} className="h-4 w-4" />
                                            <span>{item.platform}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={item.status} />
                                    </td>
                                    <td className="px-6 py-4">{item.type}</td>
                                    <td className="px-6 py-4 capitalize">{format(new Date(item.targetDate), 'MMM d, yyyy', { locale: es })}</td>
                                    <td className="px-6 py-4">
                                        {item.isSponsored ? (
                                            <span className="inline-flex rounded-full bg-emerald-950/30 px-2 py-1 text-xs font-medium text-emerald-400 border border-emerald-900/50">
                                                $ Patroc.
                                            </span>
                                        ) : (
                                            <span className="text-zinc-600">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-red-400"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {sortedItems.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                                    No se encontró contenido. Crea uno para empezar.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ContentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={editingItem}
                onSave={handleSave}
            />
        </div>
    );
}
