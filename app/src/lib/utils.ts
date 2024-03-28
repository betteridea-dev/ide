import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function postToOrbit(usedOrbit = false) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r: string = await (window as any).arweaveWallet.getActiveAddress()
  const sheet_url = `https://script.google.com/macros/s/AKfycbylqgHUcZ8RVeiQPAPv90ci3y4ind2IbklimMI3wAj38qbaAjwO8scB3fKkv2qjkBbTnQ/exec?path=Sheet1&action=write&Addresses=${usedOrbit ? "1" : "0"},${r}`

  const addr = sessionStorage.getItem('activeAddressFor0rbit')
  if (addr && addr != r) {
    sessionStorage.setItem('activeAddressFor0rbit', r)
    const sr = await axios.get(sheet_url)
    console.log(sr.data)
  } else if (!addr) {
    sessionStorage.setItem('activeAddressFor0rbit', r)
    const sr = await axios.get(sheet_url)
    console.log(sr.data)
  }
}

// eslint-disable-next-line no-control-regex
export const stripAnsiCodes = (str: string): string => str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')

export function tsToDate(ts: number) {
  const d = new Date(ts);
  return `${d.toDateString()} ${d.toTimeString()}`;
}