interface TagBadgeProps {
  label: string;
  /** Optional explicit colour class; otherwise derived from the label. */
  color?: string;
  emoji?: string;
}

// Map common tags to soft pastel colours for visual variety.
const TAG_COLORS: Record<string, string> = {
  'High Protein': 'bg-rossi-blue text-blue-900',
  'Quick & Easy': 'bg-rossi-yellow text-yellow-900',
  'Healthy Comfort': 'bg-rossi-mint text-emerald-900',
  'Family Favourites': 'bg-rossi-orange text-orange-900',
  'British Classics': 'bg-rossi-pink text-pink-900',
  'Low Calorie': 'bg-rossi-mint text-emerald-900',
  'Gut Friendly': 'bg-rossi-mint text-emerald-900',
  Fakeaway: 'bg-rossi-orange text-orange-900',
  'Batch Cook': 'bg-rossi-lavender text-violet-900',
  'One Pot': 'bg-rossi-blue text-blue-900',
  Spicy: 'bg-rossi-pink text-pink-900',
  'Budget Hero': 'bg-rossi-yellow text-yellow-900',
  Veggie: 'bg-lime-100 text-lime-700',
  Vegan: 'bg-lime-100 text-lime-700',
  Pescatarian: 'bg-rossi-blue text-blue-900',
  'Gluten free': 'bg-rossi-yellow text-yellow-900',
  'Dairy free': 'bg-rossi-blue text-blue-900',
};

export function TagBadge({ label, color, emoji }: TagBadgeProps) {
  const cls = color ?? TAG_COLORS[label] ?? 'bg-gray-100 text-gray-700';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${cls}`}
    >
      {emoji && <span>{emoji}</span>}
      {label}
    </span>
  );
}
