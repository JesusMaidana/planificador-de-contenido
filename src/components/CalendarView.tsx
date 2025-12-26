"use client";

import { useEffect, useState } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { ContentItem } from "@/types";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { ContentModal } from "@/components/ContentModal";
import { cn } from "@/lib/utils";

export function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [items, setItems] = useState<ContentItem[]>([]);
    const [activeItem, setActiveItem] = useState<Partial<ContentItem> | undefined>(undefined);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        const data = await api.fetchContent();
        setItems(data);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    const handleEdit = (item: ContentItem) => {
        setActiveItem(item);
        setIsModalOpen(true);
    };

    const handleNew = (date?: Date) => {
        setActiveItem(date ? { targetDate: date.toISOString() } : undefined);
        setIsModalOpen(true);
    }

    const handleSave = async (item: Partial<ContentItem>) => {
        if (item.id) {
            await api.updateContent(item as ContentItem);
        } else {
            await api.createContent(item);
        }
        fetchData();
    };

    return (
        <div className="h-full flex flex-col">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Calendario</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-900 p-1">
                        <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1 hover:bg-zinc-800 rounded">
                            <ChevronLeft className="h-5 w-5 text-zinc-400" />
                        </button>
                        <span className="min-w-[120px] text-center font-medium text-white capitalize">{format(currentDate, "MMMM yyyy", { locale: es })}</span>
                        <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1 hover:bg-zinc-800 rounded">
                            <ChevronRight className="h-5 w-5 text-zinc-400" />
                        </button>
                    </div>
                    <button
                        onClick={() => handleNew()}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                        <Plus className="h-4 w-4" />
                        Nuevo Contenido
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-sm flex flex-col">
                {/* Header Days */}
                <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-900/50">
                    {weekDays.map(day => (
                        <div key={day} className="py-2 text-center text-xs font-semibold uppercase text-zinc-500">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                    {calendarDays.map((day, dayIdx) => {
                        const dayItems = items.filter(item => isSameDay(new Date(item.targetDate), day));
                        const isCurrentMonth = isSameMonth(day, monthStart);

                        return (
                            <div
                                key={day.toISOString()}
                                className={cn(
                                    "min-h-[120px] border-b border-r border-zinc-800 p-2 transition-colors hover:bg-zinc-900/30 flex flex-col gap-1 relative group",
                                    !isCurrentMonth && "bg-zinc-950/30 opacity-50"
                                )}
                                onClick={() => handleNew(day)}
                            >
                                <span className={cn(
                                    "text-sm font-medium mb-1 ml-1 w-6 h-6 flex items-center justify-center rounded-full",
                                    isSameDay(day, new Date()) ? "bg-indigo-600 text-white" : "text-zinc-400"
                                )}>
                                    {format(day, "d")}
                                </span>

                                <div className="flex flex-col gap-1 overflow-y-auto max-h-[120px] no-scrollbar">
                                    {dayItems.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                                            className="flex items-center gap-1.5 rounded border border-zinc-800 bg-zinc-900 px-1.5 py-1 text-left hover:border-zinc-600"
                                        >
                                            <PlatformIcon platform={item.platform} className="h-3 w-3 shrink-0 text-zinc-400" />
                                            <span className="truncate text-xs font-medium text-zinc-300">{item.title}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <ContentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={activeItem}
                onSave={handleSave}
            />
        </div>
    );
}
