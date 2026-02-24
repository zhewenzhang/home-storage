import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Item, Location, FloorPlan } from '../types';
import {
  fetchLocations, insertLocation, updateLocationDB, deleteLocationDB,
  fetchItems, insertItem, updateItemDB, deleteItemDB,
  fetchFloorPlan, updateFloorPlanDB,
  batchInsertItemsDB, batchUpdateItemsDB, batchDeleteItemsDB
} from '../services/db';
import { supabase } from '../lib/supabase';
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

  // Family / Share Status
  activeFamilyId: string | null;
  joinedFamilies: JoinedFamily[];

  // 从 Supabase 加载数据
  loadFromSupabase: () => Promise<void>;
  reloadJoinedFamilies: () => Promise<void>;
  clearLocalData: () => void;

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

  // Getters
  getItemsByLocation: (locationId: string) => Item[];
  getLocationById: (id: string) => Location | undefined;
  canEdit: () => boolean;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

// 获取要查询和操作的真实目标家庭ID
const getCurrentTargetId = async (activeFamilyId: string | null) => {
  if (activeFamilyId) return activeFamilyId;
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id || '';
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
      activeFamilyId: null,
      joinedFamilies: [],

      // 从 Supabase 加载用户所有数据
      loadFromSupabase: async () => {
        // 关键性能优化：如果已经正在抓取或已经抓完，则拒绝第二次重入请求
        if (get().isLoadingData || (get().dataLoaded && get().items.length > 0)) {
          return;
        }

        try {
          const targetId = await getCurrentTargetId(get().activeFamilyId);
          if (!targetId) return;

          set({ isLoadingData: true });

          // 并行抓取所有核心业务数据
          const [locs, itms, fp, joined] = await Promise.all([
            fetchLocations(targetId),
            fetchItems(targetId),
            fetchFloorPlan(targetId),
            fetchJoinedFamilies(),
          ]);

          let currentActive = get().activeFamilyId;
          if (currentActive === null && joined.length > 0 && !localStorage.getItem('homebox_manually_set_myhome')) {
            currentActive = joined[0].ownerId;
            set({ joinedFamilies: joined, activeFamilyId: currentActive, isLoadingData: false });
            // 如果切了家庭，重新走一遍
            return get().loadFromSupabase();
          }

          set({
            locations: locs,
            items: itms,
            floorPlan: fp || { id: 'default', name: '我的家', width: 800, height: 600 },
            joinedFamilies: joined,
            dataLoaded: true,
            isLoadingData: false,
          });
          console.log(`[Store] 性能优化成功：单次加载完成 (${itms.length} 件物品)`);
        } catch (err) {
          console.error('[Store] 聚合加载失败:', err);
          set({ isLoadingData: false, dataLoaded: true });
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
        }).catch(err => console.error('[Store] 物品同步失败:', err));
      },

      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map(item => item.id === id ? { ...item, ...updates } : item),
        }));
        updateItemDB(id, updates).catch(err => console.error('[Store] 更新物品失败:', err));
      },

      deleteItem: (id) => {
        set((state) => ({ items: state.items.filter(item => item.id !== id) }));
        deleteItemDB(id).catch(err => console.error('[Store] 删除物品失败:', err));
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
        }).catch(err => console.error('[Store] 位置同步失败:', err));
      },

      updateLocation: (id, updates) => {
        set((state) => ({
          locations: state.locations.map(loc => loc.id === id ? { ...loc, ...updates } : loc),
        }));
        updateLocationDB(id, updates).catch(err => console.error('[Store] 更新位置失败:', err));
      },

      deleteLocation: (id) => {
        set((state) => ({
          locations: state.locations.filter(loc => loc.id !== id),
          items: state.items.map(item =>
            item.locationId === id ? { ...item, locationId: '' } : item
          ),
        }));
        deleteLocationDB(id).catch(err => console.error('[Store] 删除位置失败:', err));
      },

      setFloorPlan: (floorPlan) => {
        set({ floorPlan });
        updateFloorPlanDB(floorPlan).catch(err => console.error('[Store] 平面图同步失败:', err));
      },

      setSelectedLocationId: (id) => set({ selectedLocationId: id }),
      setSearchQuery: (query) => set({ searchQuery: query }),
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
        }
      },
      // 仅持久化业务数据，不持久化 UI 临时状态（如搜索词、正在加载等）
      partialize: (state) => ({
        items: state.items,
        locations: state.locations,
        floorPlan: state.floorPlan,
        activeFamilyId: state.activeFamilyId,
        joinedFamilies: state.joinedFamilies,
      }),
    }
  )
);
