import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function postToOrbit() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r: string = await (window as any).arweaveWallet.getActiveAddress()
  console.log(r)

  const sheet_url = `https://script.google.com/macros/s/AKfycbylqgHUcZ8RVeiQPAPv90ci3y4ind2IbklimMI3wAj38qbaAjwO8scB3fKkv2qjkBbTnQ/exec?path=Sheet1&action=write&Addresses=${r}`

  const sr = await axios.get(sheet_url)
  console.log(sr.data)
}