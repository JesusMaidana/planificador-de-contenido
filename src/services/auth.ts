import { createClient } from '@/lib/supabase/client'

export const authJson = {
    // Sign up with email and password
    async signUp(email: string, password: string) {
        const supabase = createClient()
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })
        return { data, error }
    },

    // Sign in with email and password
    async signIn(email: string, password: string) {
        const supabase = createClient()
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        return { data, error }
    },

    // Sign in with Google
    async signInWithGoogle() {
        const supabase = createClient()
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })
        return { data, error }
    },

    // Sign out
    async signOut() {
        const supabase = createClient()
        const { error } = await supabase.auth.signOut()
        return { error }
    },

    // Get current user (client-side)
    async getCurrentUser() {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return null

        // Fetch profile data including role
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        return { ...user, profile }
    },

}
