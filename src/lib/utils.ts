import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Safely parses a date string, returning a valid Date object or current date as fallback.
 * Prevents "Invalid time value" crashes.
 */
export function parseSafeDate(dateStr: string | null | undefined): Date {
    if (!dateStr) return new Date();
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? new Date() : date;
}
