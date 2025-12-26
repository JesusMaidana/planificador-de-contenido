"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ContentItem } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { ContentModal } from "@/components/ContentModal";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Edit2, Trash2, Plus, ExternalLink } from "lucide-react";

export function ContentTable() {
    const [items, setItems] = useState<ContentItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<ContentItem> | undefined>(undefined);

    const fetchData = async () => {
        try {
            const data = await api.fetchContent();
            setItems(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Todo el Contenido</h1>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                    <Plus className="h-4 w-4" />
                    Nuevo Contenido
                </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-sm">
                <table className="w-full text-left text-sm text-zinc-400">
                    <thead className="bg-zinc-900/50 text-xs uppercase text-zinc-500">
                        <tr>
                            <th className="px-6 py-4 font-medium">Título</th>
                            <th className="px-6 py-4 font-medium">Plataforma</th>
                            <th className="px-6 py-4 font-medium">Estado</th>
                            <th className="px-6 py-4 font-medium">Tipo</th>
                            <th className="px-6 py-4 font-medium">Fecha</th>
                            <th className="px-6 py-4 font-medium">Patroc.</th>
                            <th className="px-6 py-4 font-medium text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {items.map((item) => (
                            <tr key={item.id} className="group hover:bg-zinc-900/30">
                                <td className="px-6 py-4 font-medium text-white">
                                    <div className="flex flex-col">
                                        <span>{item.title}</span>
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
                        ))}
                        {items.length === 0 && (
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
