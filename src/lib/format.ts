/** Format a number as GBP, e.g. 24 -> "£24.00", 24.5 -> "£24.50". */
export function gbp(amount: number): string {
  return `£${amount.toFixed(2)}`;
}

/** Round GBP, no decimals when whole — handy for headline figures. */
export function gbpShort(amount: number): string {
  const rounded = Math.round(amount);
  return `£${rounded}`;
}

/** Format minutes as a friendly duration, e.g. 25 -> "25 min". */
export function minutes(mins: number): string {
  return `${mins} min`;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
