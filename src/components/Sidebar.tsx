"use strict";
import Link from 'next/link';
import { LayoutDashboard, Kanban, Calendar, Settings, PlusCircle } from 'lucide-react';

const navItems = [
    { name: 'Tabla', href: '/', icon: LayoutDashboard },
    { name: 'Tablero', href: '/kanban', icon: Kanban },
    { name: 'Calendario', href: '/calendar', icon: Calendar },
];

export function Sidebar() {
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
                <button className="flex w-full items-center gap-3 rounded-lg bg-indigo-600 px-3 py-2.5 text-white transition-colors hover:bg-indigo-700">
                    <PlusCircle className="h-5 w-5" />
                    <span className="font-medium">Nuevo Item</span>
                </button>
                <button className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white">
                    <Settings className="h-5 w-5" />
                    <span className="font-medium">Configuración</span>
                </button>
            </div>
        </div>
    );
}
