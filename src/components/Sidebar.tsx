"use client";
import Link from 'next/link';
import { LayoutDashboard, Kanban, Calendar, Settings, PlusCircle, Trash2 } from 'lucide-react';
import { useContent } from '@/context/ContentContext';
import { UserProfile } from './UserProfile';

const navItems = [
    { name: 'Tabla', href: '/', icon: LayoutDashboard },
    { name: 'Tablero', href: '/kanban', icon: Kanban },
    { name: 'Calendario', href: '/calendar', icon: Calendar },
];

export function Sidebar() {
    const { openCreationModal, deleteAllContent } = useContent();

    const handleDeleteAll = async () => {
        if (confirm("⚠️ ¿ESTÁS SEGURO? ⚠️\n\nEsto borrará PERMANENTEMENTE todo el contenido.\nNo se puede deshacer.")) {
            await deleteAllContent();
        }
    };

    return (
        <div className="flex h-screen w-64 flex-col border-r border-zinc-800 bg-zinc-950 p-4">
            <div className="flex items-center gap-2 px-2 py-4">
                <div className="h-8 w-8 rounded-lg bg-indigo-500" />
                <span className="text-xl font-bold tracking-tight text-white">ContentOS</span>
            </div>

            <div className="mt-8 space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white"
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.name}</span>
                    </Link>
                ))}
            </div>

            <div className="mt-auto">
                <button
                    onClick={openCreationModal}
                    className="flex w-full items-center gap-3 rounded-lg bg-indigo-600 px-3 py-2.5 text-white transition-colors hover:bg-indigo-700"
                >
                    <PlusCircle className="h-5 w-5" />
                    <span className="font-medium">Nuevo Item</span>
                </button>
                <button className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white">
                    <Settings className="h-5 w-5" />
                    <span className="font-medium">Configuración</span>
                </button>
                <button
                    onClick={handleDeleteAll}
                    className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-400 transition-colors hover:bg-red-950/30 hover:text-red-300 border border-transparent hover:border-red-900/50"
                >
                    <Trash2 className="h-5 w-5" />
                    <span className="font-medium">Borrar Todo</span>
                </button>
            </div>

            <UserProfile />

        </div>
    );
}
