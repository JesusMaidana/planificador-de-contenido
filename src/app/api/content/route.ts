import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { ContentItem } from '@/types';
import { createClient } from '@/lib/supabase/server';

const DB_PATH = path.join(process.cwd(), 'content-db.json');
export const dynamic = 'force-dynamic';

async function getDB(): Promise<ContentItem[]> {
    try {
        const data = await fs.readFile(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function saveDB(data: ContentItem[]) {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

// Helper to check authentication
async function checkAuth() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return { authenticated: false, user: null };
    }

    return { authenticated: true, user };
}

export async function GET() {
    const { authenticated } = await checkAuth();

    if (!authenticated) {
        return NextResponse.json(
            { error: 'Unauthorized. Please log in.' },
            { status: 401 }
        );
    }

    const data = await getDB();
    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const { authenticated } = await checkAuth();

    if (!authenticated) {
        return NextResponse.json(
            { error: 'Unauthorized. Please log in to create content.' },
            { status: 401 }
        );
    }

    const newItem = await request.json();
    const db = await getDB();
    // Simple ID generation if not provided
    if (!newItem.id) {
        newItem.id = Math.random().toString(36).substring(7);
    }
    db.push(newItem);
    await saveDB(db);
    return NextResponse.json(newItem);
}

// PUT for updating an item
export async function PUT(request: Request) {
    const { authenticated } = await checkAuth();

    if (!authenticated) {
        return NextResponse.json(
            { error: 'Unauthorized. Please log in to update content.' },
            { status: 401 }
        );
    }

    const updatedItem = await request.json();
    const db = await getDB();
    const index = db.findIndex((item) => item.id === updatedItem.id);

    if (index !== -1) {
        db[index] = { ...db[index], ...updatedItem };
        await saveDB(db);
        return NextResponse.json(db[index]);
    }

    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
}

// DELETE for removing an item (using search params)
export async function DELETE(request: Request) {
    const { authenticated } = await checkAuth();

    if (!authenticated) {
        return NextResponse.json(
            { error: 'Unauthorized. Please log in to delete content.' },
            { status: 401 }
        );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    if (id === 'all') {
        await saveDB([]);
        return NextResponse.json({ success: true });
    }

    const db = await getDB();
    const newDb = db.filter((item) => item.id !== id);
    await saveDB(newDb);

    return NextResponse.json({ success: true });
}
