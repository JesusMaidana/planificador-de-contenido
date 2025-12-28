import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * API Route Handler for Content management.
 * Migrated from JSON storage to Supabase to support Row Level Security (RLS).
 * All methods (GET, POST, PUT, DELETE) use createServerClient with cookies
 * to pass the user's session to Supabase.
 */

// GET: Fetch all content items accessible to the user
export async function GET() {
    const supabase = await createClient();

    // Check authentication and get user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    // Fetch items - Supabase RLS will handle visibility (User vs Admin)
    const { data, error } = await supabase
        .from('content')
        .select('*')
        .order('targetDate', { ascending: false });

    if (error) {
        console.error('API GET Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

// POST: Create a new content item
export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const newItem = await request.json();

    // Ensure the item is linked to the current user for RLS
    // and cleanup any incoming custom ID to let Supabase handle it (or use provided one)
    const { data, error } = await supabase
        .from('content')
        .insert([{ ...newItem, user_id: user.id }])
        .select()
        .single();

    if (error) {
        console.error('API POST Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

// PUT: Update an existing content item
export async function PUT(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updatedItem = await request.json();
    const { id, user_id, ...updateData } = updatedItem; // Protection: don't allow changing ownership

    if (!id) {
        return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    // Attempt update - RLS will block if the user doesn't have permission for this record
    const { data, error } = await supabase
        .from('content')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('API PUT Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

// DELETE: Remove a specific item or all items
export async function DELETE(request: Request) {
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
        // Deletes everything the user has permission to delete according to RLS
        const { error } = await supabase
            .from('content')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (error) {
            console.error('API DELETE ALL Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true });
    }

    // Single item deletion
    const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('API DELETE Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
