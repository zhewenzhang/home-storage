export interface Item {
  id: string;
  name: string;
  category: string;
  quantity: number;
  description: string;
  locationId: string;
  createdAt: number;
}

export interface Location {
  id: string;
  name: string;
  type: 'room' | 'cabinet' | 'drawer' | 'shelf' | 'box';
  parentId: string | null;
  roomType?: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface FloorPlan {
  id: string;
  name: string;
  width: number;
  height: number;
}

export type Category = 
  | '电子产品'
  | '工具'
  | '衣物'
  | '书籍'
  | '厨房用品'
  | '药品'
  | '纪念品'
  | '其他';

export const DEFAULT_CATEGORIES: Category[] = [
  '电子产品',
  '工具',
  '衣物',
  '书籍',
  '厨房用品',
  '药品',
  '纪念品',
  '其他'
];
