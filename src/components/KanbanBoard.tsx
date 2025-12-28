"use client";

import { useEffect, useState } from "react";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { api } from "@/lib/api";
import { ContentItem, Status } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PlatformIcon } from "@/components/ui/PlatformIcon";
import { ContentModal } from "@/components/ContentModal";
import { Plus } from "lucide-react";
import { cn, parseSafeDate } from "@/lib/utils";

const STATUSES: Status[] = ["Idea", "Scripting", "Recording", "Editing", "Scheduled", "Published"];

// --- Board Card Component ---
function KanbanCard({ item, onClick }: { item: ContentItem; onClick: () => void }) {
    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
        id: item.id,
        data: { item },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className={cn(
                "cursor-grab rounded-lg border border-zinc-800 bg-zinc-900 p-3 shadow-sm hover:border-zinc-700 hover:shadow-md active:cursor-grabbing",
                isDragging && "opacity-50"
            )}
        >
            <div className="flex justify-between items-start mb-2">
                <PlatformIcon platform={item.platform} className="h-4 w-4 text-zinc-400" />
                {item.isSponsored && <span className="text-[10px] text-emerald-400 font-medium">$</span>}
            </div>
            <h4 className="font-medium text-white line-clamp-2 mb-2">{item.title}</h4>
            <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>{item.type}</span>
                <span>{parseSafeDate(item.targetDate).toLocaleDateString()}</span>
            </div>
        </div>
    );
}

// --- Droppable Column Component ---
import { useDroppable } from "@dnd-kit/core";

function KanbanColumn({ status, items, onAdd, onEdit }: { status: Status; items: ContentItem[]; onAdd: () => void; onEdit: (item: ContentItem) => void }) {
    const { setNodeRef } = useDroppable({
        id: status,
    });

    return (
        <div
            ref={setNodeRef}
            className="flex h-full min-w-[280px] w-[280px] flex-col rounded-xl bg-zinc-950/50 border border-zinc-900"
        >
            <div className="flex items-center justify-between border-b border-zinc-900 p-4">
                <StatusBadge status={status} />
                <div className="flex gap-1">
                    <span className="text-xs text-zinc-500 font-medium bg-zinc-900 px-2 py-0.5 rounded-full">
                        {items.length}
                    </span>
                    <button onClick={onAdd} className="text-zinc-500 hover:text-white">
                        <Plus className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
                <SortableContext
                    id={status}
                    items={items.map((i) => i.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-3 min-h-[50px]">
                        {items.map((item) => (
                            <KanbanCard key={item.id} item={item} onClick={() => onEdit(item)} />
                        ))}
                    </div>
                </SortableContext>
            </div>
        </div>
    );
}

export function KanbanBoard() {
    const [items, setItems] = useState<ContentItem[]>([]);
    const [activeItem, setActiveItem] = useState<ContentItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<ContentItem> | undefined>(undefined);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );
    // ... fetchData and useEffect (same as before)

    const fetchData = async () => {
        const data = await api.fetchContent();
        setItems(data);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.item) {
            setActiveItem(event.active.data.current.item as ContentItem);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveItem(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Check if dropping on a column (status) or another item
        let newStatus: Status | undefined;

        if (STATUSES.includes(overId as Status)) {
            newStatus = overId as Status;
        } else {
            // Dropped on another item, find its status
            const overItem = items.find(i => i.id === overId);
            if (overItem) {
                newStatus = overItem.status;
            }
        }

        if (newStatus) {
            const item = items.find(i => i.id === activeId);
            if (item && item.status !== newStatus) {
                const updatedItem = { ...item, status: newStatus };
                // Optimistic update
                setItems(items.map(i => i.id === activeId ? updatedItem : i));
                // Persist
                await api.updateContent(updatedItem);
            }
        }
    };

    const handleEdit = (item: ContentItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleNew = (status?: Status) => {
        setEditingItem(status ? { status } : undefined);
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
                <h1 className="text-3xl font-bold text-white">Tablero Kanban</h1>
                <button
                    onClick={() => handleNew()}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                    <Plus className="h-4 w-4" />
                    Nuevo Contenido
                </button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex h-full gap-4 overflow-x-auto pb-4">
                    {STATUSES.map((status) => (
                        <KanbanColumn
                            key={status}
                            status={status}
                            items={items.filter(i => i.status === status)}
                            onAdd={() => handleNew(status)}
                            onEdit={handleEdit}
                        />
                    ))}
                </div>
                <DragOverlay>
                    {activeItem ? <KanbanCard item={activeItem} onClick={() => { }} /> : null}
                </DragOverlay>
            </DndContext>

            <ContentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={editingItem}
                onSave={handleSave}
            />
        </div>
    );
}
