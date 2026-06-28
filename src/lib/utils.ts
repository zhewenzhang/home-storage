import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function decodePin(encoded: string | null): string | null {
  if (!encoded) return null;
  try {
    const decoded = atob(encoded);
    if (/^\d{4}$/.test(decoded)) return decoded;
    return encoded;
  } catch {
    return encoded;
  }
}
