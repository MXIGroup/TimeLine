import type { Macros } from '@/types';

/** Per-serving macro summary shown on recipe detail pages. */
export function MacroCard({ macros }: { macros: Macros }) {
  const items = [
    { label: 'Calories', value: `${macros.calories}`, unit: 'kcal', color: 'bg-rossi-yellow text-yellow-900' },
    { label: 'Protein', value: `${macros.protein}`, unit: 'g', color: 'bg-rossi-blue text-blue-900' },
    { label: 'Carbs', value: `${macros.carbs}`, unit: 'g', color: 'bg-rossi-pink text-pink-900' },
    { label: 'Fat', value: `${macros.fat}`, unit: 'g', color: 'bg-rossi-mint text-emerald-900' },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map((item) => (
        <div key={item.label} className={`rounded-2xl px-2 py-3 text-center ${item.color}`}>
          <div className="text-lg font-extrabold leading-none">{item.value}</div>
          <div className="text-[10px] font-bold opacity-70">{item.unit}</div>
          <div className="mt-1 text-[11px] font-bold">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
