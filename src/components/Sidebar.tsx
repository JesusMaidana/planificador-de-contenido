"use client";
import Link from 'next/link';
import { LayoutDashboard, Kanban, Calendar, Settings, PlusCircle, Trash2, X } from 'lucide-react';
import { useContent } from '@/context/ContentContext';
import { UserProfile } from './UserProfile';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const navItems = [
    { name: 'Tabla', href: '/', icon: LayoutDashboard },
    { name: 'Tablero', href: '/kanban', icon: Kanban },
    { name: 'Calendario', href: '/calendar', icon: Calendar },
];

export function Sidebar() {
    const { openCreationModal, deleteAllContent, isSidebarOpen, setSidebarOpen } = useContent();
    const pathname = usePathname();

    // Close sidebar on navigation
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname, setSidebarOpen]);

    const handleDeleteAll = async () => {
        if (confirm("⚠️ ¿ESTÁS SEGURO? ⚠️\n\nEsto borrará PERMANENTEMENTE todo el contenido.\nNo se puede deshacer.")) {
            await deleteAllContent();
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-all duration-300"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className={cn(
                "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-800 bg-zinc-950 p-4 transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex items-center justify-between px-2 py-4">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-indigo-500 shadow-lg shadow-indigo-500/20" />
                        <span className="text-xl font-bold tracking-tight text-white">ContentOS</span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-900 hover:text-white md:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mt-8 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200",
                                    isActive
                                        ? "bg-indigo-600/10 text-indigo-400 font-semibold"
                                        : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5", isActive && "text-indigo-400")} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </div>

                <div className="mt-auto space-y-2">
                    <button
                        onClick={openCreationModal}
                        className="flex w-full items-center gap-3 rounded-lg bg-indigo-600 px-3 py-2.5 text-white transition-all hover:bg-indigo-700 active:scale-95 shadow-lg shadow-indigo-600/20"
                    >
                        <PlusCircle className="h-5 w-5" />
                        <span className="font-medium">Nuevo Item</span>
                    </button>
                    <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white">
                        <Settings className="h-5 w-5" />
                        <span className="font-medium">Configuración</span>
                    </button>
                    <button
                        onClick={handleDeleteAll}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-400 transition-all hover:bg-red-950/30 hover:text-red-300 border border-transparent hover:border-red-900/50"
                    >
                        <Trash2 className="h-5 w-5" />
                        <span className="font-medium">Borrar Todo</span>
                    </button>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-900">
                    <UserProfile />
                </div>
            </div>
        </>
    );
}
