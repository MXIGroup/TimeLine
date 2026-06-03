'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'yellow';
}

/**
 * Rounded full-width CTA button.
 * Disabled state is pale green; active is bright lime green.
 */
export function PrimaryButton({
  children,
  variant = 'primary',
  className = '',
  disabled,
  ...rest
}: PrimaryButtonProps) {
  const base =
    'w-full rounded-2xl px-6 py-4 text-center text-base font-extrabold transition active:scale-[0.98] disabled:active:scale-100';

  const styles: Record<string, string> = {
    primary: disabled
      ? 'bg-lime-200 text-white cursor-not-allowed'
      : 'bg-lime-500 text-white shadow-lg shadow-lime-500/30 hover:bg-lime-600',
    secondary: 'bg-gray-100 text-rossi-ink hover:bg-gray-200',
    yellow: 'bg-rossi-yellow text-yellow-900 shadow-lg shadow-yellow-300/40 hover:brightness-95',
  };

  return (
    <button className={`${base} ${styles[variant]} ${className}`} disabled={disabled} {...rest}>
      {children}
    </button>
  );
}
