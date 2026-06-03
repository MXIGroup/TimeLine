import type { Vibe, Dietary, Equipment } from '@/types';

export interface OptionMeta<T> {
  value: T;
  emoji: string;
  /** Tailwind background colour used when selected. */
  color: string;
}

export const VIBES: OptionMeta<Vibe>[] = [
  { value: 'Quick & Easy', emoji: '⚡', color: 'bg-rossi-yellow' },
  { value: 'High Protein', emoji: '💪', color: 'bg-rossi-blue' },
  { value: 'Healthy Comfort', emoji: '🤍', color: 'bg-rossi-mint' },
  { value: 'Family Favourites', emoji: '🏠', color: 'bg-rossi-orange' },
  { value: 'British Classics', emoji: '🇬🇧', color: 'bg-rossi-pink' },
  { value: 'Low Calorie', emoji: '🥗', color: 'bg-rossi-mint' },
  { value: 'Gut Friendly', emoji: '🌱', color: 'bg-rossi-mint' },
  { value: 'Fakeaway', emoji: '🥡', color: 'bg-rossi-orange' },
  { value: 'Batch Cook', emoji: '🍲', color: 'bg-rossi-lavender' },
  { value: 'One Pot', emoji: '🍳', color: 'bg-rossi-blue' },
  { value: 'Spicy', emoji: '🌶️', color: 'bg-rossi-pink' },
  { value: 'Budget Hero', emoji: '💷', color: 'bg-rossi-yellow' },
];

export const DIETARY: OptionMeta<Dietary>[] = [
  { value: 'None', emoji: '🍽️', color: 'bg-lime-100' },
  { value: 'Veggie', emoji: '🥦', color: 'bg-rossi-mint' },
  { value: 'Vegan', emoji: '🌿', color: 'bg-rossi-mint' },
  { value: 'Pescatarian', emoji: '🐟', color: 'bg-rossi-blue' },
  { value: 'Gluten free', emoji: '🌾', color: 'bg-rossi-yellow' },
  { value: 'Dairy free', emoji: '🥛', color: 'bg-rossi-blue' },
  { value: 'Nut free', emoji: '🥜', color: 'bg-rossi-orange' },
  { value: 'High protein', emoji: '💪', color: 'bg-rossi-pink' },
  { value: 'Low calorie', emoji: '🥗', color: 'bg-rossi-mint' },
];

export const EQUIPMENT: OptionMeta<Equipment>[] = [
  { value: 'Hob', emoji: '🔥', color: 'bg-rossi-orange' },
  { value: 'Oven', emoji: '🔲', color: 'bg-rossi-yellow' },
  { value: 'Air fryer', emoji: '🌀', color: 'bg-rossi-blue' },
  { value: 'Microwave', emoji: '📦', color: 'bg-rossi-lavender' },
  { value: 'Slow cooker', emoji: '🍲', color: 'bg-rossi-pink' },
  { value: 'Blender', emoji: '🥤', color: 'bg-rossi-mint' },
  { value: 'Grill', emoji: '♨️', color: 'bg-rossi-orange' },
  { value: 'Rice cooker', emoji: '🍚', color: 'bg-rossi-yellow' },
  { value: 'Toaster', emoji: '🍞', color: 'bg-rossi-blue' },
  { value: 'No special equipment', emoji: '✋', color: 'bg-lime-100' },
];

/** Equipment treated as "always available" so plans never block on basics. */
export const BASIC_EQUIPMENT: Equipment[] = ['No special equipment'];

export const DEFAULT_BUDGET = 60;
export const MIN_BUDGET = 20;
export const MAX_BUDGET = 100;
export const MAX_VIBES = 3;
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
