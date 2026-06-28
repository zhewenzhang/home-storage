import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Item, Location, FloorPlan } from '../types';
import {
  fetchLocations, insertLocation, updateLocationDB, deleteLocationDB,
  fetchItems, insertItem, updateItemDB, deleteItemDB,
  fetchFloorPlan, updateFloorPlanDB,
  batchInsertItemsDB, batchUpdateItemsDB, batchDeleteItemsDB
} from '../services/db';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { fetchJoinedFamilies } from '../services/family';

export interface JoinedFamily {
  ownerId: string;
  displayName: string;
  originalName?: string;
  aliasName?: string;
  role: 'viewer' | 'admin';
}

interface AppState {
  // Data
  items: Item[];
  locations: Location[];
  floorPlan: FloorPlan | null;

  // UI State
  selectedLocationId: string | null;
  searchQuery: string;
  dataLoaded: boolean;
  isRehydrated: boolean;
  isLoadingData: boolean; // 正在加载锁
  displayName: string | null;
  profileLoading: boolean;
  theme: 'light' | 'dark' | 'system'; // Dark mode preference
  themeColor: 'blue' | 'emerald' | 'violet' | 'rose' | 'amber'; // Brand color preference
  lastSyncTimestamp: number; // 最后一次从服务端同步的时间戳

  // App Lock
  appPin: string | null;
  isAppLocked: boolean;
  errorMessage: string | null;

  // Family / Share Status
  activeFamilyId: string | null;
  joinedFamilies: JoinedFamily[];

  // Actions
  loadFromSupabase: (userId?: string) => Promise<void>;
  reloadJoinedFamilies: () => Promise<void>;
  clearLocalData: () => void;
  setErrorMessage: (msg: string | null) => void;

  // Items
  addItem: (item: Omit<Item, 'id' | 'createdAt'>) => void;
  updateItem: (id: string, updates: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  processBatch: (
    adds: Omit<Item, 'id' | 'createdAt'>[],
    updates: { id: string, changes: Partial<Item> }[],
    deletes: string[]
  ) => Promise<void>;

  // Locations
  addLocation: (location: Omit<Location, 'id'>) => void;
  updateLocation: (id: string, updates: Partial<Location>) => void;
  deleteLocation: (id: string) => void;

  // Floor Plan
  setFloorPlan: (floorPlan: FloorPlan) => void;

  // UI / Family Status
  setSelectedLocationId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setActiveFamilyId: (id: string | null) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setThemeColor: (color: 'blue' | 'emerald' | 'violet' | 'rose' | 'amber') => void;

  // App Lock Actions
  setAppPin: (pin: string | null) => void;
  unlockApp: () => void;
  lockApp: () => void;

  // Getters
  getItemsByLocation: (locationId: string) => Item[];
  getLocationById: (id: string) => Location | undefined;
  canEdit: () => boolean;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

// 获取要查询和操作的真实目标家庭ID
const getCurrentTargetId = async (activeFamilyId: string | null) => {
  if (activeFamilyId) return activeFamilyId;
  return auth.currentUser?.uid || '';
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      items: [],
      locations: [],
      floorPlan: { id: 'default', name: '我的家', width: 800, height: 600 },
      selectedLocationId: null,
      searchQuery: '',
      dataLoaded: false,
      isRehydrated: false,
      isLoadingData: false,
      displayName: null,
      profileLoading: false,
      theme: 'system',
      themeColor: 'blue',
      lastSyncTimestamp: 0,
      appPin: null,
      isAppLocked: false, // start unlocked; gets locked on rehydrate if pin exists
      errorMessage: null,
      activeFamilyId: null,
      joinedFamilies: [],

      // 从 Supabase 加载用户所有数据
      loadFromSupabase: async (userId?: string) => {
        // 关键性能优化：如果已经正在抓取，则拒绝第二次重入请求
        if (get().isLoadingData) return;
        
        // 检查缓存是否有效（5分钟内）
        const now = Date.now();
        const cacheAge = now - get().lastSyncTimestamp;
        const hasCache = get().items.length > 0 && get().locations.length > 0;
        
        // 如果有有效缓存，不阻塞，但允许后台刷新
        if (hasCache && cacheAge < 5 * 60 * 1000 && get().dataLoaded) {
          console.log(`[Store] 使用缓存数据 (${cacheAge / 1000}s 前同步)`);
          return;
        }

        set({ isLoadingData: true });

        try {
          const targetId = userId || await getCurrentTargetId(get().activeFamilyId);
          if (!targetId) {
            set({ isLoadingData: false });
            return;
          }

          // 1. 获取当前用户已同步的数据
          let locs = await fetchLocations(targetId);
          let itms = await fetchItems(targetId);

          // 2. 静默资产认领：若当前用户名下无物品，但存在历史迁移的 Supabase 资产数据 (OLD_SUPABASE_ID)
          const OLD_SUPABASE_ID = '0420fa03-512a-406c-aa91-ea5bbc00987b';
          if (itms.length === 0 && targetId !== OLD_SUPABASE_ID) {
            const oldItms = await fetchItems(OLD_SUPABASE_ID);
            if (oldItms.length > 0) {
              console.log(`[Store] 发现属于 ${OLD_SUPABASE_ID} 的未认领资产，正在后台为您同步绑定至您的 Firebase 账户...`);
              const oldLocs = await fetchLocations(OLD_SUPABASE_ID);
              
              const batch = writeBatch(db);
              oldLocs.forEach(l => {
                batch.update(doc(db, 'locations', l.id), { user_id: targetId });
              });
              oldItms.forEach(i => {
                batch.update(doc(db, 'items', i.id), { user_id: targetId });
              });
              
              // 顺手也把平面图认领过来 (如果存在)
              const oldFp = await fetchFloorPlan(OLD_SUPABASE_ID);
              if (oldFp) {
                batch.set(doc(db, 'floor_plans', oldFp.id), { user_id: targetId }, { merge: true });
              }
              
              await batch.commit();
              console.log('[Store] 云端资产一键认领同步完成！');
              
              // 重新读取新账号下的数据
              locs = await fetchLocations(targetId);
              itms = await fetchItems(targetId);
            }
          }

          // 3. 并行抓取其他辅助信息
          const [fp, joined, profileRes] = await Promise.all([
            fetchFloorPlan(targetId),
            fetchJoinedFamilies(),
            getDoc(doc(db, 'profiles', targetId))
          ]);

          let currentActive = get().activeFamilyId;
          const hasManualSet = localStorage.getItem('homebox_manually_set_myhome');

          // 只有在从未手动设置过且有加入家庭时，才自动切换
          if (currentActive === null && joined.length > 0 && !hasManualSet) {
            const firstFamilyId = joined[0].ownerId;
            // 注意：这里不直接递归，而是更新 ID 后继续获取该家庭的数据
            const [newLocs, newItms, newFp] = await Promise.all([
              fetchLocations(firstFamilyId),
              fetchItems(firstFamilyId),
              fetchFloorPlan(firstFamilyId),
            ]);

            set({
              locations: newLocs,
              items: newItms,
              floorPlan: newFp || { id: 'default', name: '我的家', width: 800, height: 600 },
              activeFamilyId: firstFamilyId,
              joinedFamilies: joined,
              displayName: (profileRes.exists() ? profileRes.data()?.display_name : null) || null,
              dataLoaded: true,
              isLoadingData: false,
              lastSyncTimestamp: Date.now(),
            });
            return;
          }

          set({
            locations: locs,
            items: itms,
            floorPlan: fp || { id: 'default', name: '我的家', width: 800, height: 600 },
            joinedFamilies: joined,
            displayName: (profileRes.exists() ? profileRes.data()?.display_name : null) || null,
            dataLoaded: true,
            isLoadingData: false,
            lastSyncTimestamp: Date.now(),
          });
          console.log(`[Store] 性能优化成功：单次加载完成 (${itms.length} 件物品)`);
        } catch (err) {
          console.error('[Store] 聚合加载失败:', err);
          set({ isLoadingData: false, dataLoaded: true, errorMessage: '数据加载失败，请刷新重试' });
        }
      },

      reloadJoinedFamilies: async () => {
        const joined = await fetchJoinedFamilies();
        set({ joinedFamilies: joined });
      },

      clearLocalData: () => {
        localStorage.removeItem('homebox_manually_set_myhome');
        set({
          items: [], locations: [],
          floorPlan: { id: 'default', name: '我的家', width: 800, height: 600 },
          dataLoaded: false,
          activeFamilyId: null,
          joinedFamilies: [],
        });
      },

      addItem: async (item) => {
        const tempId = generateId();
        const newItem = { ...item, id: tempId, createdAt: Date.now() };
        set((state) => ({ items: [...state.items, newItem] }));

        const targetId = await getCurrentTargetId(get().activeFamilyId);
        insertItem(item, targetId).then(realId => {
          set((state) => ({
            items: state.items.map(i => i.id === tempId ? { ...i, id: realId } : i),
          }));
        }).catch(err => { console.error('[Store] 物品同步失败:', err); set({ errorMessage: '添加物品失败，请重试' }); });
      },

      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map(item => item.id === id ? { ...item, ...updates } : item),
        }));
        updateItemDB(id, updates).catch(err => { console.error('[Store] 更新物品失败:', err); set({ errorMessage: '更新物品失败，请重试' }); });
      },

      deleteItem: (id) => {
        set((state) => ({ items: state.items.filter(item => item.id !== id) }));
        deleteItemDB(id).catch(err => { console.error('[Store] 删除物品失败:', err); set({ errorMessage: '删除物品失败，请重试' }); });
      },

      processBatch: async (adds, updates, deletes) => {
        try {
          const targetId = await getCurrentTargetId(get().activeFamilyId);
          if (adds.length > 0) await batchInsertItemsDB(adds, targetId);
          if (updates.length > 0) await batchUpdateItemsDB(updates);
          if (deletes.length > 0) await batchDeleteItemsDB(deletes);
          await get().loadFromSupabase();
        } catch (err) {
          console.error('[Store] 批量操作失败:', err);
          set({ errorMessage: '批量操作失败，请重试' });
          throw err;
        }
      },

      addLocation: async (location) => {
        const tempId = generateId();
        set((state) => ({
          locations: [...state.locations, { ...location, id: tempId }],
        }));

        const targetId = await getCurrentTargetId(get().activeFamilyId);
        insertLocation(location, targetId).then(realId => {
          set((state) => ({
            locations: state.locations.map(l => l.id === tempId ? { ...l, id: realId } : l),
            items: state.items.map(i => i.locationId === tempId ? { ...i, locationId: realId } : i),
          }));
        }).catch(err => { console.error('[Store] 位置同步失败:', err); set({ errorMessage: '添加位置失败，请重试' }); });
      },

      updateLocation: (id, updates) => {
        set((state) => ({
          locations: state.locations.map(loc => loc.id === id ? { ...loc, ...updates } : loc),
        }));
        updateLocationDB(id, updates).catch(err => { console.error('[Store] 更新位置失败:', err); set({ errorMessage: '更新位置失败，请重试' }); });
      },

      deleteLocation: (id) => {
        set((state) => ({
          locations: state.locations.filter(loc => loc.id !== id),
          items: state.items.map(item =>
            item.locationId === id ? { ...item, locationId: '' } : item
          ),
        }));
        deleteLocationDB(id).catch(err => { console.error('[Store] 删除位置失败:', err); set({ errorMessage: '删除位置失败，请重试' }); });
      },

      setFloorPlan: (floorPlan) => {
        set({ floorPlan });
        updateFloorPlanDB(floorPlan).catch(err => { console.error('[Store] 平面图同步失败:', err); set({ errorMessage: '平面图同步失败，请重试' }); });
      },

      setSelectedLocationId: (id) => set({ selectedLocationId: id }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setTheme: (theme) => set({ theme }),
      setThemeColor: (color) => set({ themeColor: color }),
      setAppPin: (pin) => set({ appPin: pin ? btoa(pin) : null, isAppLocked: false }),
      setErrorMessage: (msg) => set({ errorMessage: msg }),
      unlockApp: () => set({ isAppLocked: false }),
      lockApp: () => set({ isAppLocked: true }),
      setActiveFamilyId: (id) => {
        if (id === null) {
          localStorage.setItem('homebox_manually_set_myhome', 'true');
        } else {
          localStorage.removeItem('homebox_manually_set_myhome');
        }
        set({ activeFamilyId: id, dataLoaded: false });
        get().loadFromSupabase();
      },

      getItemsByLocation: (locationId) =>
        get().items.filter(item => item.locationId === locationId),
      getLocationById: (id) =>
        get().locations.find(loc => loc.id === id),
      canEdit: () => {
        const activeFam = get().activeFamilyId;
        if (!activeFam) return true;
        const joined = get().joinedFamilies.find(f => f.ownerId === activeFam);
        return joined?.role === 'admin';
      },
    }),
    {
      name: 'homebox-app-state',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isRehydrated = true;
          // If the user had a PIN set, lock the app on restore
          if (state.appPin) {
            state.isAppLocked = true;
          }
          // 如果有缓存数据，立即标记为已加载，让 UI 立即显示
          if (state.items.length > 0 || state.locations.length > 0) {
            state.dataLoaded = true;
          }
        }
      },
      // 持久化业务数据和加载状态，不持久化 UI 临时状态
      partialize: (state) => ({
        items: state.items,
        locations: state.locations,
        floorPlan: state.floorPlan,
        errorMessage: state.errorMessage,
        activeFamilyId: state.activeFamilyId,
        joinedFamilies: state.joinedFamilies,
        displayName: state.displayName,
        theme: state.theme,
        themeColor: state.themeColor,
        appPin: state.appPin,
        dataLoaded: state.dataLoaded,
        lastSyncTimestamp: state.lastSyncTimestamp,
      }),
    }
  )
);
