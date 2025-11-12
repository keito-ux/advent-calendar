import { create } from 'zustand';
import type { User3DPlacement } from '../lib/types';

export interface DailyBonusEntry {
  id: string;
  user_id: string;
  day_number: number;
  model_url: string;
  claimed_at: string;
}

interface AppState {
  // 3D Placements
  placements: User3DPlacement[];
  setPlacements: (placements: User3DPlacement[]) => void;
  addPlacement: (placement: User3DPlacement) => void;
  updatePlacement: (id: string, placement: Partial<User3DPlacement>) => void;
  removePlacement: (id: string) => void;

  // Daily Bonuses
  bonuses: DailyBonusEntry[];
  setBonuses: (bonuses: DailyBonusEntry[]) => void;
  addBonus: (bonus: DailyBonusEntry) => void;

  // Selected model for placement
  selectedModelUrl: string | null;
  setSelectedModelUrl: (url: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
  placements: [],
  setPlacements: (placements) => set({ placements }),
  addPlacement: (placement) => set((state) => ({ placements: [...state.placements, placement] })),
  updatePlacement: (id, updates) =>
    set((state) => ({
      placements: state.placements.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  removePlacement: (id) =>
    set((state) => ({
      placements: state.placements.filter((p) => p.id !== id),
    })),

  bonuses: [],
  setBonuses: (bonuses) => set({ bonuses }),
  addBonus: (bonus) => set((state) => ({ bonuses: [...state.bonuses, bonus] })),

  selectedModelUrl: null,
  setSelectedModelUrl: (url) => set({ selectedModelUrl: url }),
}));

