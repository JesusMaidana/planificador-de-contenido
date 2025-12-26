"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { ContentItem, Platform, Status } from "@/types";
import { STATUS_LABELS } from "@/lib/constants";

interface ContentModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Partial<ContentItem>;
    onSave: (item: Partial<ContentItem>) => void;
}

const PLATFORMS: Platform[] = ["YouTube", "Short", "Reel", "Podcast", "Email"];
const STATUSES: Status[] = ["Idea", "Scripting", "Recording", "Editing", "Scheduled", "Published"];

export function ContentModal({ isOpen, onClose, initialData, onSave }: ContentModalProps) {
    const [formData, setFormData] = useState<Partial<ContentItem>>({
        title: "",
        type: "",
        platform: "YouTube",
        status: "Idea",
        isSponsored: false,
        notes: "",
        targetDate: new Date().toISOString().split("T")[0],
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || "",
                type: initialData.type || "",
                platform: initialData.platform || "YouTube",
                status: initialData.status || "Idea",
                isSponsored: initialData.isSponsored || false,
                notes: initialData.notes || "",
                targetDate: initialData.targetDate ? initialData.targetDate.split("T")[0] : new Date().toISOString().split("T")[0]
            });
        } else {
            setFormData({
                title: "",
                type: "",
                platform: "YouTube",
                status: "Idea",
                isSponsored: false,
                notes: "",
                targetDate: new Date().toISOString().split("T")[0],
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const [year, month, day] = formData.targetDate!.split('-').map(Number);
        const localDate = new Date(year, month - 1, day);

        onSave({
            ...formData,
            targetDate: localDate.toISOString(),
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">
                        {initialData?.id ? "Editar Contenido" : "Nuevo Contenido"}
                    </h2>
                    <button onClick={onClose} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-zinc-400">Título</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="Ej: Cómo crear un SaaS"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-zinc-400">Plataforma</label>
                            <select
                                value={formData.platform}
                                onChange={(e) => setFormData({ ...formData, platform: e.target.value as Platform })}
                                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                {PLATFORMS.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-zinc-400">Estado</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}
                                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                                {STATUSES.map((s) => (
                                    <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-zinc-400">Tipo</label>
                            <input
                                type="text"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="Ej: Tutorial"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-zinc-400">Fecha</label>
                            <input
                                type="date"
                                value={formData.targetDate}
                                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isSponsored"
                            checked={formData.isSponsored}
                            onChange={(e) => setFormData({ ...formData, isSponsored: e.target.checked })}
                            className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-zinc-950"
                        />
                        <label htmlFor="isSponsored" className="text-sm font-medium text-zinc-300">
                            Contenido Patrocinado
                        </label>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-zinc-400">Notas</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="h-24 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="Enlaces, ideas, guiones..."
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                        >
                            Guardar Contenido
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
