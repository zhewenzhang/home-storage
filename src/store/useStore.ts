import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Item, Location, FloorPlan } from '../types';

interface AppState {
  // Data
  items: Item[];
  locations: Location[];
  floorPlan: FloorPlan | null;
  
  // UI State
  selectedLocationId: string | null;
  searchQuery: string;
  
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
  persist(
    (set, get) => ({
      // Initial Data
      items: [],
      locations: [],
      floorPlan: {
        id: 'default',
        name: '我的家',
        width: 800,
        height: 600
      },
      
      // UI State
      selectedLocationId: null,
      searchQuery: '',
      
      // Items
      addItem: (item) => set((state) => ({
        items: [...state.items, {
          ...item,
          id: generateId(),
          createdAt: Date.now()
        }]
      })),
      
      updateItem: (id, updates) => set((state) => ({
        items: state.items.map(item => 
          item.id === id ? { ...item, ...updates } : item
        )
      })),
      
      deleteItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),
      
      // Locations
      addLocation: (location) => set((state) => ({
        locations: [...state.locations, {
          ...location,
          id: generateId()
        }]
      })),
      
      updateLocation: (id, updates) => set((state) => ({
        locations: state.locations.map(loc => 
          loc.id === id ? { ...loc, ...updates } : loc
        )
      })),
      
      deleteLocation: (id) => set((state) => ({
        locations: state.locations.filter(loc => loc.id !== id),
        items: state.items.map(item => 
          item.locationId === id ? { ...item, locationId: '' } : item
        )
      })),
      
      // Floor Plan
      setFloorPlan: (floorPlan) => set({ floorPlan }),
      
      // UI
      setSelectedLocationId: (id) => set({ selectedLocationId: id }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      // Getters
      getItemsByLocation: (locationId) => 
        get().items.filter(item => item.locationId === locationId),
      
      getLocationById: (id) => 
        get().locations.find(loc => loc.id === id)
    }),
    {
      name: 'home-storage'
    }
  )
);
