import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function tsToDate(ts: number) {
  const d = new Date(ts);
  return `${d.toDateString()} ${d.toTimeString()}`;
}
