import { createClient } from '@/lib/supabase/server'

export async function isAdmin() {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) return false

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (error) {
            console.error('[isAdmin] Profiles Error:', error.message);
            return false;
        }

        return profile?.role === 'admin'
    } catch (e) {
        console.error('[isAdmin] Unexpected Error:', e);
        return false;
    }
}
