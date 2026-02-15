import {type ClassValue, clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';

/**
 * Utility to merge Tailwind CSS classes with proper conflict resolution.
 * Combines clsx for conditional classes with tailwind-merge for deduplication.
 *
 * @example
 * cn('text-red-500', isActive && 'text-blue-500', className)
 * cn('px-4 py-2', 'px-6') // => 'py-2 px-6'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
