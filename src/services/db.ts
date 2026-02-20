// Supabase 数据库 CRUD 操作
import { supabase } from '../lib/supabase';
import type { Item, Location, FloorPlan } from '../types';

// ====== Locations ======

export async function fetchLocations(): Promise<Location[]> {
    const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []).map(row => ({
        id: row.id,
        name: row.name,
        type: row.type,
        parentId: row.parent_id,
        roomType: row.room_type,
        bounds: row.bounds || { x: 0, y: 0, width: 160, height: 120 },
    }));
}

export async function insertLocation(loc: Omit<Location, 'id'>) {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('未登录');
    const { data, error } = await supabase.from('locations').insert({
        user_id: user.id,
        name: loc.name,
        type: loc.type,
        parent_id: loc.parentId || null,
        room_type: loc.roomType || null,
        bounds: loc.bounds,
    }).select().single();
    if (error) throw error;
    return data.id as string;
}

export async function updateLocationDB(id: string, updates: Partial<Location>) {
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.type !== undefined) payload.type = updates.type;
    if (updates.parentId !== undefined) payload.parent_id = updates.parentId;
    if (updates.roomType !== undefined) payload.room_type = updates.roomType;
    if (updates.bounds !== undefined) payload.bounds = updates.bounds;
    const { error } = await supabase.from('locations').update(payload).eq('id', id);
    if (error) throw error;
}

export async function deleteLocationDB(id: string) {
    const { error } = await supabase.from('locations').delete().eq('id', id);
    if (error) throw error;
}

// ====== Items ======

export async function fetchItems(): Promise<Item[]> {
    const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []).map(row => ({
        id: row.id,
        name: row.name,
        category: row.category,
        quantity: row.quantity,
        description: row.description || '',
        locationId: row.location_id || '',
        createdAt: new Date(row.created_at).getTime(),
    }));
}

export async function insertItem(item: Omit<Item, 'id' | 'createdAt'>) {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('未登录');
    const { data, error } = await supabase.from('items').insert({
        user_id: user.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        description: item.description || '',
        location_id: item.locationId || null,
    }).select().single();
    if (error) throw error;
    return data.id as string;
}

export async function updateItemDB(id: string, updates: Partial<Item>) {
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.quantity !== undefined) payload.quantity = updates.quantity;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.locationId !== undefined) payload.location_id = updates.locationId;
    const { error } = await supabase.from('items').update(payload).eq('id', id);
    if (error) throw error;
}

export async function deleteItemDB(id: string) {
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (error) throw error;
}

// ====== Floor Plans ======

export async function fetchFloorPlan(): Promise<FloorPlan | null> {
    const { data, error } = await supabase
        .from('floor_plans')
        .select('*')
        .limit(1)
        .single();
    if (error) {
        if (error.code === 'PGRST116') return null; // 没有数据
        throw error;
    }
    return {
        id: data.id,
        name: data.name,
        width: data.width,
        height: data.height,
    };
}

export async function updateFloorPlanDB(fp: FloorPlan) {
    const { error } = await supabase.from('floor_plans').update({
        name: fp.name,
        width: fp.width,
        height: fp.height,
    }).eq('id', fp.id);
    if (error) throw error;
}
