// Firebase Firestore 数据库 CRUD 操作
import { db } from '../lib/firebase';
import { 
    collection, doc, getDocs, setDoc, updateDoc, deleteDoc, 
    query, where, orderBy, writeBatch, limit, getDoc
} from 'firebase/firestore';
import type { Item, Location, FloorPlan } from '../types';

const LOCATIONS_COLL = 'locations';
const ITEMS_COLL = 'items';
const FLOOR_PLANS_COLL = 'floor_plans';

// ====== Locations ======

export async function fetchLocations(familyId: string): Promise<Location[]> {
    const q = query(
        collection(db, LOCATIONS_COLL),
        where('user_id', '==', familyId),
        orderBy('created_at', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            name: data.name,
            type: data.type,
            parentId: data.parent_id,
            roomType: data.room_type,
            bounds: data.bounds || { x: 0, y: 0, width: 160, height: 120 },
        };
    });
}

export async function insertLocation(loc: Omit<Location, 'id'>, familyId: string): Promise<string> {
    const newDocRef = doc(collection(db, LOCATIONS_COLL)); // 自动生成 UUID
    await setDoc(newDocRef, {
        user_id: familyId,
        name: loc.name,
        type: loc.type,
        parent_id: loc.parentId || null,
        room_type: loc.roomType || null,
        bounds: loc.bounds,
        created_at: Date.now() // 便于按照创建时间排序
    });
    return newDocRef.id;
}

export async function updateLocationDB(id: string, updates: Partial<Location>) {
    const docRef = doc(db, LOCATIONS_COLL, id);
    const payload: Record<string, any> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.type !== undefined) payload.type = updates.type;
    if (updates.parentId !== undefined) payload.parent_id = updates.parentId;
    if (updates.roomType !== undefined) payload.room_type = updates.roomType;
    if (updates.bounds !== undefined) payload.bounds = updates.bounds;
    
    await updateDoc(docRef, payload);
}

export async function deleteLocationDB(id: string) {
    // 1. 删除位置本身
    await deleteDoc(doc(db, LOCATIONS_COLL, id));
    
    // 2. 模拟 Supabase 外键置空约束：将原本关联此 locationId 的物品位置重置为 null
    const q = query(collection(db, ITEMS_COLL), where('location_id', '==', id));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
        const batch = writeBatch(db);
        snapshot.docs.forEach(docSnap => {
            batch.update(docSnap.ref, { location_id: null });
        });
        await batch.commit();
    }
}

// ====== Items ======

export async function fetchItems(familyId: string): Promise<Item[]> {
    const q = query(
        collection(db, ITEMS_COLL),
        where('user_id', '==', familyId),
        orderBy('created_at', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            name: data.name,
            category: data.category,
            quantity: data.quantity,
            description: data.description || '',
            locationId: data.location_id || '',
            createdAt: data.created_at || Date.now(),
            expiryDate: data.expiry_date || undefined,
            imageUrl: data.image_url || undefined,
        };
    });
}

export async function insertItem(item: Omit<Item, 'id' | 'createdAt'>, familyId: string): Promise<string> {
    const newDocRef = doc(collection(db, ITEMS_COLL));
    await setDoc(newDocRef, {
        user_id: familyId,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        description: item.description || '',
        location_id: item.locationId || null,
        expiry_date: item.expiryDate || null,
        image_url: item.imageUrl || null,
        created_at: Date.now()
    });
    return newDocRef.id;
}

export async function updateItemDB(id: string, updates: Partial<Item>) {
    const docRef = doc(db, ITEMS_COLL, id);
    const payload: Record<string, any> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.quantity !== undefined) payload.quantity = updates.quantity;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.locationId !== undefined) payload.location_id = updates.locationId;
    if (updates.expiryDate !== undefined) payload.expiry_date = updates.expiryDate;
    if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;
    
    await updateDoc(docRef, payload);
}

export async function deleteItemDB(id: string) {
    await deleteDoc(doc(db, ITEMS_COLL, id));
}

// ====== Floor Plans ======

export async function fetchFloorPlan(familyId: string): Promise<FloorPlan | null> {
    const q = query(
        collection(db, FLOOR_PLANS_COLL),
        where('user_id', '==', familyId),
        limit(1)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    const docSnap = snapshot.docs[0];
    const data = docSnap.data();
    return {
        id: docSnap.id,
        name: data.name,
        width: data.width,
        height: data.height,
    };
}

export async function updateFloorPlanDB(fp: FloorPlan) {
    const docRef = doc(db, FLOOR_PLANS_COLL, fp.id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        await updateDoc(docRef, {
            name: fp.name,
            width: fp.width,
            height: fp.height,
        });
    } else {
        // 如果文档不存在则直接以 fp.id 创建 (可能首次配置)
        // 在 Store 中传入的 fp 可能有默认的 id 等信息，需要包含 user_id
        // 通常在 loadFromSupabase 时如果为空会初始化默认的，保存时再写入
        // 在 store 侧：setFloorPlan 会调此方法，我们需要确保它有相应的 user_id
        // 这里提供 upsert 兼容
        // 我们从 db 侧先查，如果找不到，先暂时写进去。
        // 为稳妥起见，更新时可以用 setDoc 并合并
        await setDoc(docRef, {
            name: fp.name,
            width: fp.width,
            height: fp.height,
        }, { merge: true });
    }
}

// ====== Batch Operations ======

export async function batchInsertItemsDB(items: Array<Omit<Item, 'id' | 'createdAt'>>, familyId: string) {
    if (items.length === 0) return;
    const batch = writeBatch(db);
    items.forEach(item => {
        const docRef = doc(collection(db, ITEMS_COLL));
        batch.set(docRef, {
            user_id: familyId,
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            description: item.description || '',
            location_id: item.locationId || null,
            expiry_date: item.expiryDate || null,
            created_at: Date.now()
        });
    });
    await batch.commit();
}

export async function batchUpdateItemsDB(updates: Array<{ id: string, changes: Partial<Item> }>) {
    if (updates.length === 0) return;
    const batch = writeBatch(db);
    updates.forEach(u => {
        const docRef = doc(db, ITEMS_COLL, u.id);
        const payload: Record<string, any> = {};
        if (u.changes.name !== undefined) payload.name = u.changes.name;
        if (u.changes.category !== undefined) payload.category = u.changes.category;
        if (u.changes.quantity !== undefined) payload.quantity = u.changes.quantity;
        if (u.changes.description !== undefined) payload.description = u.changes.description;
        if (u.changes.locationId !== undefined) payload.location_id = u.changes.locationId;
        if (u.changes.expiryDate !== undefined) payload.expiry_date = u.changes.expiryDate;
        if (u.changes.imageUrl !== undefined) payload.image_url = u.changes.imageUrl;
        batch.update(docRef, payload);
    });
    await batch.commit();
}

export async function batchDeleteItemsDB(ids: string[]) {
    if (ids.length === 0) return;
    const batch = writeBatch(db);
    ids.forEach(id => {
        const docRef = doc(db, ITEMS_COLL, id);
        batch.delete(docRef);
    });
    await batch.commit();
}
