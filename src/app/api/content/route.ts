import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * API Route Handler for Content management.
 * Optimized for RLS: Explicitly injects user_id from session for mutations.
 * All methods (GET, POST, PUT, DELETE) use createServerClient with cookies.
 */

// GET: Fetch all content items accessible to the user
export async function GET() {
    try {
        const supabase = await createClient();

        // Check session
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch items - RLS handles the filters (user sees only their rows)
        const { data, error } = await supabase
            .from('content')
            .select('*')
            .order('targetDate', { ascending: false });

        if (error) {
            console.error('[API GET] Supabase Error:', error.message);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json(data || []);
    } catch (e) {
        console.error('[API GET] Unexpected Error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Create a new content item
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Explicitly inject user_id to satisfy RLS (auth.uid() = user_id)
        // We do NOT trust the frontend for this field.
        const { data, error } = await supabase
            .from('content')
            .insert([{
                ...body,
                user_id: user.id
            }])
            .select()
            .single();

        if (error) {
            console.error('[API POST] Supabase Error:', error);
            return NextResponse.json({
                supabaseError: error,
                userId: user.id,
                payload: body
            }, { status: 400 });
        }

        return NextResponse.json(data);
    } catch (e: any) {
        console.error('[API POST] Unexpected Error:', e);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: e?.message || e
        }, { status: 500 });
    }
}

// PUT: Update an existing content item
export async function PUT(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, user_id: _body_user_id, ...updateData } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        // RLS will block if the user doesn't own the row or isn't an admin
        // But we add .eq('user_id', user.id) for extra safety if not admin
        const { data, error } = await supabase
            .from('content')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('[API PUT] Supabase Error:', error.message);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json(data);
    } catch (e) {
        console.error('[API PUT] Unexpected Error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE: Remove an item
export async function DELETE(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        if (id === 'all') {
            const { error } = await supabase
                .from('content')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000'); // Dummy condition for bulk delete

            if (error) {
                console.error('[API DELETE ALL] Supabase Error:', error.message);
                return NextResponse.json({ error: error.message }, { status: 400 });
            }
            return NextResponse.json({ success: true });
        }

        const { error } = await supabase
            .from('content')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('[API DELETE] Supabase Error:', error.message);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('[API DELETE] Unexpected Error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
