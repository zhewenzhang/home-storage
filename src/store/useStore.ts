import { create } from 'zustand';
import { Item, Location, FloorPlan } from '../types';
import {
  fetchLocations, insertLocation, updateLocationDB, deleteLocationDB,
  fetchItems, insertItem, updateItemDB, deleteItemDB,
  fetchFloorPlan, updateFloorPlanDB,
} from '../services/db';

interface AppState {
  // Data
  items: Item[];
  locations: Location[];
  floorPlan: FloorPlan | null;

  // UI State
  selectedLocationId: string | null;
  searchQuery: string;
  dataLoaded: boolean;

  // 从 Supabase 加载数据
  loadFromSupabase: () => Promise<void>;
  clearLocalData: () => void;

  // Items
  addItem: (item: Omit<Item, 'id' | 'createdAt'>) => void;
  updateItem: (id: string, updates: Partial<Item>) => void;
  deleteItem: (id: string) => void;

  // Locations
  addLocation: (location: Omit<Location, 'id'>) => void;
  updateLocation: (id: string, updates: Partial<Location>) => void;
  deleteLocation: (id: string) => void;

  // Floor Plan
  setFloorPlan: (floorPlan: FloorPlan) => void;

  // UI
  setSelectedLocationId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;

  // Getters
  getItemsByLocation: (locationId: string) => Item[];
  getLocationById: (id: string) => Location | undefined;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useStore = create<AppState>()(
  (set, get) => ({
    items: [],
    locations: [],
    floorPlan: { id: 'default', name: '我的家', width: 800, height: 600 },
    selectedLocationId: null,
    searchQuery: '',
    dataLoaded: false,

    // 从 Supabase 加载用户所有数据
    loadFromSupabase: async () => {
      try {
        const [locs, itms, fp] = await Promise.all([
          fetchLocations(),
          fetchItems(),
          fetchFloorPlan(),
        ]);
        set({
          locations: locs,
          items: itms,
          floorPlan: fp || { id: 'default', name: '我的家', width: 800, height: 600 },
          dataLoaded: true,
        });
        console.log(`[Store] 从 Supabase 加载: ${locs.length} 位置, ${itms.length} 物品`);
      } catch (err) {
        console.error('[Store] Supabase 加载失败:', err);
        set({ dataLoaded: true }); // 标记已尝试加载
      }
    },

    clearLocalData: () => set({
      items: [], locations: [],
      floorPlan: { id: 'default', name: '我的家', width: 800, height: 600 },
      dataLoaded: false,
    }),

    // Items — 先更新本地再同步 Supabase
    addItem: (item) => {
      const tempId = generateId();
      const newItem = { ...item, id: tempId, createdAt: Date.now() };
      set((state) => ({ items: [...state.items, newItem] }));

      // 异步同步到 Supabase
      insertItem(item).then(realId => {
        // 用 Supabase 返回的真实 ID 替换临时 ID
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

    // Locations
    addLocation: (location) => {
      const tempId = generateId();
      set((state) => ({
        locations: [...state.locations, { ...location, id: tempId }],
      }));

      insertLocation(location).then(realId => {
        set((state) => ({
          locations: state.locations.map(l => l.id === tempId ? { ...l, id: realId } : l),
          // 同步更新引用此位置的 items
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

    // Floor Plan
    setFloorPlan: (floorPlan) => {
      set({ floorPlan });
      updateFloorPlanDB(floorPlan).catch(err => console.error('[Store] 平面图同步失败:', err));
    },

    // UI
    setSelectedLocationId: (id) => set({ selectedLocationId: id }),
    setSearchQuery: (query) => set({ searchQuery: query }),

    // Getters
    getItemsByLocation: (locationId) =>
      get().items.filter(item => item.locationId === locationId),
    getLocationById: (id) =>
      get().locations.find(loc => loc.id === id),
  })
);
