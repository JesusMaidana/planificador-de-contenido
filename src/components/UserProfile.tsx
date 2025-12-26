'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, User } from 'lucide-react'
import { authJson } from '@/services/auth'

export function UserProfile() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadUser() {
            try {
                const user = await authJson.getCurrentUser()
                setUser(user)
            } catch (error) {
                console.error('Error loading user:', error)
            } finally {
                setLoading(false)
            }
        }
        loadUser()
    }, [])

    const handleSignOut = async () => {
        await authJson.signOut()
        setUser(null) // Clear local state
        router.push('/auth/login')
        router.refresh()
    }

    if (loading) return <div className="h-12 w-full animate-pulse bg-zinc-900 rounded-lg"></div>

    if (!user) {
        return (
            <div className="mt-auto pt-4 border-t border-zinc-900">
                <a
                    href="/auth/login"
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white"
                >
                    <User className="h-5 w-5" />
                    <span className="font-medium">Iniciar Sesión</span>
                </a>
            </div>
        )
    }

    return (
        <div className="mt-auto pt-4 border-t border-zinc-900 space-y-2">
            <div className="px-3 py-2">
                <p className="text-xs text-zinc-500 uppercase font-semibold">Usuario</p>
                <p className="text-sm text-zinc-300 truncate" title={user.email}>{user.email}</p>
                {user.profile?.role === 'admin' && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold bg-purple-600/20 text-purple-400 rounded">
                        Admin
                    </span>
                )}
            </div>

            <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white"
            >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Cerrar Sesión</span>
            </button>
        </div>
    )
}
