"use client";

import { useState, useEffect } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameDay,
    isSameMonth,
    addMonths,
    subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { api } from "@/lib/api";
import { ContentItem } from "@/types";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { ContentModal } from "./ContentModal";
import { cn, parseSafeDate } from "@/lib/utils";
import { useContent } from "@/context/ContentContext";

/**
 * ARCHITECTURE EXPLANATION:
 * This calendar uses a strict CSS Grid (`grid-cols-7`) where each cell is a flex container (`flex-col`).
 * By setting `overflow-hidden` on the cell and giving the header (day number) a dedicated space,
 * we prevent content from pushing or overlapping. 
 * The `min-h` ensures consistency, and `flex-1` on the event container fills available space.
 * Crucially, the "More" view is handled by a FIXED overlay (acting like a modal), completely 
 * external to the grid layout. This prevents any possibility of the popover clipping 
 * or causing layout reflows/shifts within the grid cells.
 */

export function CalendarView() {
    const { items, refreshContent } = useContent(); // Use global state
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<ContentItem> | undefined>(undefined);

    // State for the "More Events" Overlay
    const [expandedDay, setExpandedDay] = useState<Date | null>(null);

    // Date Logic
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    // Handlers
    const handleCreate = (date?: Date) => {
        setExpandedDay(null);
        setEditingItem(date ? { targetDate: date.toISOString() } : undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (item: ContentItem) => {
        setExpandedDay(null);
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleSave = async (item: Partial<ContentItem>) => {
        if (item.id) {
            await api.updateContent(item as ContentItem);
        } else {
            await api.createContent(item);
        }
        await refreshContent();
    };

    return (
        <div className="flex flex-col h-full bg-black text-white">
            {/* --- Header --- */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 shrink-0 gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold">Calendario</h1>

                <div className="flex flex-col xs:flex-row items-center gap-3 w-full sm:w-auto">
                    <div className="flex flex-1 sm:flex-none items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-full xs:w-auto">
                        <button
                            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-medium capitalize flex-1 xs:min-w-[140px] text-center">
                            {format(currentDate, "MMMM yyyy", { locale: es })}
                        </span>
                        <button
                            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <button
                        onClick={() => handleCreate()}
                        className="flex w-full xs:w-auto items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Nuevo Item</span>
                    </button>
                </div>
            </div>

            {/* --- Mobile List View (< 768px) --- */}
            <div className="md:hidden flex-1 overflow-y-auto space-y-6 pb-20">
                {calendarDays.filter(day => isSameMonth(day, monthStart)).map(day => {
                    const dayItems = items.filter(item => isSameDay(parseSafeDate(item.targetDate), day));
                    if (dayItems.length === 0) return null; // Skip empty days in list view logic (optional)

                    const isToday = isSameDay(day, new Date());

                    return (
                        <div key={day.toISOString()} className="px-1">
                            <div className="flex items-center gap-3 mb-3 sticky top-0 bg-black/95 backdrop-blur py-2 z-10 border-b border-zinc-800">
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                                    isToday ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400"
                                )}>
                                    {format(day, "d")}
                                </div>
                                <span className="text-sm text-zinc-400 font-medium capitalize">
                                    {format(day, "EEEE", { locale: es })}
                                </span>
                            </div>
                            <div className="space-y-2 pl-4 border-l border-zinc-800 ml-4">
                                {dayItems.map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => handleEdit(item)}
                                        className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex items-center gap-3 active:scale-[0.98] transition-transform"
                                    >
                                        <PlatformIcon platform={item.platform} className="w-5 h-5 text-zinc-500" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-zinc-200 truncate">{item.title}</p>
                                            <p className="text-xs text-zinc-500">{item.type}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* --- Desktop Grid View (>= 768px) --- */}
            <div className="hidden md:grid grid-cols-7 grid-rows-[auto_1fr] flex-1 border border-zinc-800 rounded-xl bg-zinc-950 overflow-hidden shadow-sm">

                {/* Grid Header */}
                <div className="col-span-7 grid grid-cols-7 border-b border-zinc-800 bg-zinc-900/50">
                    {weekDays.map(day => (
                        <div key={day} className="py-3 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Grid Body */}
                <div className="col-span-7 grid grid-cols-7 auto-rows-fr bg-zinc-950">
                    {calendarDays.map(day => {
                        const dayItems = items.filter(item => isSameDay(parseSafeDate(item.targetDate), day));
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const isToday = isSameDay(day, new Date());

                        return (
                            <div
                                key={day.toISOString()}
                                className={cn(
                                    "min-h-[140px] border-b border-r border-zinc-800 flex flex-col transition-colors hover:bg-zinc-900/20 group relative overflow-hidden",
                                    !isCurrentMonth && "bg-zinc-950/40"
                                )}
                                onClick={() => handleCreate(day)} // Click cell to create
                            >
                                {/* Cell Header: Day Number */}
                                {/* Explicit height/space prevents overlap with events */}
                                <div className="flex justify-between items-start p-2 shrink-0">
                                    <span className={cn(
                                        "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full transition-colors",
                                        isToday
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                            : "text-zinc-400 group-hover:bg-zinc-800/50",
                                        !isCurrentMonth && "text-zinc-700"
                                    )}>
                                        {format(day, "d")}
                                    </span>
                                </div>

                                {/* Cell Events Container */}
                                <div className="flex-1 flex flex-col gap-1.5 px-2 pb-2 min-h-0">
                                    {dayItems.slice(0, 2).map(item => (
                                        <button
                                            key={item.id}
                                            onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                                            className="w-full text-left bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 rounded px-2 py-1.5 flex items-center gap-2 group/card transition-all"
                                            title={item.title}
                                        >
                                            <PlatformIcon platform={item.platform} className="w-3.5 h-3.5 shrink-0 text-zinc-500 group-hover/card:text-zinc-400" />
                                            <span className="text-xs font-medium text-zinc-300 truncate w-full">
                                                {item.title}
                                            </span>
                                        </button>
                                    ))}

                                    {/* "+ More" Button */}
                                    {dayItems.length > 2 && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setExpandedDay(day); }}
                                            className="text-xs font-medium text-zinc-500 hover:text-indigo-400 px-1 py-0.5 w-fit rounded hover:bg-zinc-800 transition-colors"
                                        >
                                            +{dayItems.length - 2} más
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* --- Fixed Overlay for Expanded Day --- */}
            {expandedDay && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setExpandedDay(null)}
                >
                    <div
                        className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-sm flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Overlay Header */}
                        <div className="flex items-center justify-between p-4 border-b border-zinc-800 shrink-0">
                            <div className="flex items-center gap-3">
                                <span className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                                    isSameDay(expandedDay, new Date()) ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400"
                                )}>
                                    {format(expandedDay, "d")}
                                </span>
                                <span className="text-lg font-semibold text-white capitalize">
                                    {format(expandedDay, "EEEE", { locale: es })}
                                </span>
                            </div>
                            <button
                                onClick={() => setExpandedDay(null)}
                                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Overlay Content (Scrollable) */}
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 custom-scrollbar">
                            {items
                                .filter(item => isSameDay(parseSafeDate(item.targetDate), expandedDay))
                                .map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleEdit(item)}
                                        className="w-full text-left bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80 rounded-lg p-3 flex items-center gap-3 group transition-all"
                                    >
                                        <PlatformIcon platform={item.platform} className="w-4 h-4 text-zinc-500 group-hover:text-zinc-400" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-zinc-200 truncate">{item.title}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-zinc-500 px-1.5 py-0.5 bg-zinc-900 rounded">{item.type}</span>
                                                {item.isSponsored && <span className="text-xs text-emerald-500 font-medium">$ Patroc.</span>}
                                            </div>
                                        </div>
                                    </button>
                                ))
                            }
                            {items.filter(item => isSameDay(parseSafeDate(item.targetDate), expandedDay)).length === 0 && (
                                <p className="text-center text-sm text-zinc-500 py-4">No hay eventos</p>
                            )}

                            <button
                                onClick={() => handleCreate(expandedDay)}
                                className="mt-2 w-full py-2 flex items-center justify-center gap-2 border border-dashed border-zinc-700 text-zinc-400 rounded-lg hover:bg-zinc-800/50 hover:text-white hover:border-zinc-600 transition-all text-sm font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                Añadir evento
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Modals --- */}
            <ContentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={editingItem}
                onSave={handleSave}
            />
        </div>
    );
}

