import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { AppVersion, Column } from "./ao-vars";
import Arweave from "arweave";
import { AOProfileType as ProfileType } from "./bazar";

type DateType = 'iso' | 'epoch';

export const supportedExtensions = ["lua", "luanb", "md"];

export const ANSI = {
  CLEARLINE: "\x1b[2K",
  BOLD: "\x1b[1m",
  GREEN: "\x1b[32m",
  RED: "\x1b[31m",
  YELLOW: "\x1b[33m",
  BLUE: "\x1b[34m",
  MAGENTA: "\x1b[35m",
  CYAN: "\x1b[36m",
  WHITE: "\x1b[37m",
  LIGHTGREEN: "\x1b[92m",
  LIGHTRED: "\x1b[91m",
  LIGHTYELLOW: "\x1b[93m",
  LIGHTBLUE: "\x1b[94m",
  LIGHTMAGENTA: "\x1b[95m",
  LIGHTCYAN: "\x1b[96m",
  LIGHTWHITE: "\x1b[97m",
  RESET: "\x1b[0m",
}

export function pushToRecents(pname: string) {
  const recents = JSON.parse(localStorage.getItem("recents") || "[]") as string[];
  if (!recents.includes(pname) && recents.length < 5) {
    recents.push(pname);
    localStorage.setItem("recents", JSON.stringify(recents));
  } else if (!recents.includes(pname) && recents.length >= 5) {
    recents.shift();
    recents.push(pname);
    localStorage.setItem("recents", JSON.stringify(recents));
  } else if (recents.includes(pname)) {
    recents.splice(recents.indexOf(pname), 1);
    recents.push(pname);
    localStorage.setItem("recents", JSON.stringify(recents));
  }
}

// export function parseCreateTableQuery(query: string): Column[] {
//   const columns: Column[] = [];
//   const lines = query.split(/\n|,/);

//   for (const line of lines) {
//     if (line.trim().startsWith('CREATE TABLE') || line.trim().startsWith('FOREIGN KEY')) {
//       continue;
//     }

//     const columnMatch = line.match(/^\s*(\w+)\s*(\w*)/);
//     if (columnMatch) {
//       const [, name, dataType] = columnMatch;
//       columns.push({ });
//     }
//   }

//   return columns;
// }


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function tsToDate(ts: number) {
  const d = new Date(ts);
  return `${d.toDateString()} ${d.toTimeString()}`;
}

export function getRelativeTime(timestamp: number) {
  const now = new Date() as any;
  const past = new Date(timestamp) as any;
  const diffInSeconds = Math.floor((now - past) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 }
  ];

  for (let i = 0; i < intervals.length; i++) {
    const interval = intervals[i];
    const count = Math.floor(diffInSeconds / interval.seconds);

    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
}

export const stripAnsiCodes = (str: string): string => str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "");

export const capOutputTo200Lines = (str: string): string => {
  // if str is less than 200 lines, return it
  // else return the first 100 and last 100 lines
  const strString = str.toString();
  const lines = strString.split("\n");
  if (lines.length <= 200) return str;
  return lines.slice(0, 100).join("\n") + "\n\x1b[31m... output has been capped at 200 lines ...\x1b[0m\n" + lines.slice(-100).join("\n");
}

export function createLoaderFunc(name: string, src: string) {

  return `local func, err = load([[
        local function _load()
            ${src}
        end
        _G.package.loaded["${name}"] = _load()
    ]])

    if not func then
        print(err)
        error("Error compiling load function")
    end

    func()
    return "Loaded ${name} module"`
}

export function uploadToArweave(file: File) {
  const ar = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
  });

  const reader = new FileReader();
  reader.readAsArrayBuffer(file);

  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      const buffer = new Uint8Array(await file.arrayBuffer());
      const txn = await ar.createTransaction({ data: buffer }, "use_wallet");
      txn.addTag("App-Name", "BetterIDEa")
      txn.addTag("App-Version", AppVersion)
      txn.addTag("Content-Type", file.type || "application/octet-stream");
      txn.addTag("BetterIDEa-Function", "Create-Profile");
      txn.addTag("File-Name", file.name || "unknown");
      await ar.transactions.sign(txn, "use_wallet");
      try {
        await ar.transactions.post(txn);
        resolve(txn.id);
      } catch (e) {
        throw new Error(e);
      }
    }

    reader.onerror = (err) => reject(err);
  });
}

export function checkValidAddress(address: string | null) {
  if (!address) return false;
  return /^[a-z0-9_-]{43}$/i.test(address);
}

export function getUniqueAddresses(addresses: string[]) {
  return Array.from(new Set(addresses));
}

export function formatAddress(address: string | null, wrap: boolean) {
  if (!address) return '';
  if (!checkValidAddress(address)) return address;
  const formattedAddress = address.substring(0, 5) + '...' + address.substring(36, address.length);
  return wrap ? `(${formattedAddress})` : formattedAddress;
}

export function formatDate(dateArg: string | number | null, dateType: DateType) {
  if (!dateArg) {
    return 'N/A';
  }

  let date: Date | null = null;

  switch (dateType) {
    case 'iso':
      date = new Date(dateArg);
      break;
    case 'epoch':
      date = new Date(Number(dateArg));
      break;
    default:
      date = new Date(dateArg);
      break;
  }

  return `${date.toLocaleString('default', {
    month: 'long',
  })} ${date.getDate()}, ${date.getUTCFullYear()}`;
}

export function getRelativeDate(timestamp: number) {
  const currentDate = new Date();
  const inputDate = new Date(timestamp);

  const timeDifference: number = currentDate.getTime() - inputDate.getTime();
  const secondsDifference = Math.floor(timeDifference / 1000);
  const minutesDifference = Math.floor(secondsDifference / 60);
  const hoursDifference = Math.floor(minutesDifference / 60);
  const daysDifference = Math.floor(hoursDifference / 24);
  const monthsDifference = Math.floor(daysDifference / 30.44); // Average days in a month
  const yearsDifference = Math.floor(monthsDifference / 12);

  if (yearsDifference > 0) {
    return `${yearsDifference} year${yearsDifference > 1 ? 's' : ''} ago`;
  } else if (monthsDifference > 0) {
    return `${monthsDifference} month${monthsDifference > 1 ? 's' : ''} ago`;
  } else if (daysDifference > 0) {
    return `${daysDifference} day${daysDifference > 1 ? 's' : ''} ago`;
  } else if (hoursDifference > 0) {
    return `${hoursDifference} hour${hoursDifference > 1 ? 's' : ''} ago`;
  } else if (minutesDifference > 0) {
    return `${minutesDifference} minute${minutesDifference > 1 ? 's' : ''} ago`;
  } else {
    return `${secondsDifference} second${secondsDifference !== 1 ? 's' : ''} ago`;
  }
}

export function getTagValue(list: { [key: string]: any }[], name: string): string {
  for (let i = 0; i < list.length; i++) {
    if (list[i]) {
      if (list[i]!.name === name) {
        return list[i]!.value as string;
      }
    }
  }
  return "N/A";
}

export function log(message: any, _status: 0 | 1 | null): void {
  const now = new Date();
  const formattedDate = now.toISOString().slice(0, 19).replace('T', ' ');
  console.log(`${formattedDate} - ${message}`);
}

export function logValue(message: any, value: any, _status: 0 | 1 | null): void {
  const now = new Date();
  const formattedDate = now.toISOString().slice(0, 19).replace('T', ' ');
  console.log(`${formattedDate} - ${message} - ['${value}']`);
}

export function getByteSize(input: string | Buffer): number {
  let sizeInBytes: number;
  if (Buffer.isBuffer(input)) {
    sizeInBytes = input.length;
  } else if (typeof input === 'string') {
    sizeInBytes = Buffer.byteLength(input, 'utf-8');
  } else {
    throw new Error('Input must be a string or a Buffer');
  }

  return sizeInBytes;
}

export function getByteSizeDisplay(bytes: number) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1000));
  return bytes / Math.pow(1000, i) + ' ' + sizes[i];
}

export function formatTime(time: number) {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = Math.floor(time % 60);

  const formattedHours = hours < 10 ? `${hours}` : hours.toString();
  const formattedMinutes = minutes < 10 ? `${hours > 0 ? '0' : ''}${minutes}` : minutes.toString();
  const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds.toString();

  return hours > 0
    ? `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
    : `${formattedMinutes}:${formattedSeconds}`;
}

export function formatARAmount(amount: number) {
  return `${amount.toFixed(4)} AR`;
}

export function getTurboBalance(amount: number | string | null) {
  return amount !== null ? (typeof amount === 'string' ? amount : formatTurboAmount(amount)) : '**** Credits';
}

export function getARAmountFromWinc(amount: number) {
  const arweave = Arweave.init({
    host: "arweave.net",
    protocol: "https",
    port: 443
  });
  return Math.floor(+arweave.ar.winstonToAr(amount.toString()) * 1e6) / 1e6;
}

export function formatTurboAmount(amount: number) {
  return `${amount.toFixed(4)} Credits`;
}

export function formatUSDAmount(amount: number) {
  return `$ ${!amount || isNaN(amount) ? 0 : Number(amount).toFixed(2)}`;
}

export function formatRequiredField(field: string) {
  return `${field} *`;
}

export function getDataURLContentType(dataURL: string) {
  const result = dataURL.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
  return result ? result[1] : null;
}

export async function fileToBuffer(file: any) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e: any) {
      const buffer = new Buffer(e.target.result);
      resolve(buffer);
    };
    reader.onerror = function (e: any) {
      reject(e);
    };
    reader.readAsArrayBuffer(file);
  });
}

export function getBase64Data(dataURL: string) {
  return dataURL.split(',')[1];
}

export function base64ToUint8Array(base64: any) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function concatLicenseTag(tag: string) {
  return tag.split(' ').join('-');
}

export function splitLicenseTag(tag: string) {
  return tag.split('-').join(' ');
}

export function getDisplayValue(value: string) {
  let result = value.replace(/([A-Z])/g, ' $1').trim();
  result = result.charAt(0).toUpperCase() + result.slice(1);
  return result;
}

export function stripFileExtension(fileName) {
  // Split the file name by dot
  const parts = fileName.split('.');

  // If there's no dot, return the original file name
  if (parts.length === 1) {
    return fileName;
  }

  // Remove the last part (extension) and join the remaining parts back together
  return parts.slice(0, -1).join('.');
}

export function cleanProcessField(value: string) {
  let updatedValue: string;
  updatedValue = value.replace(/\[|\]/g, '');
  return `[[${updatedValue}]]`;
}

export function cleanTagValue(value: string) {
  let updatedValue: string;
  updatedValue = value.replace(/\[|\]/g, '');
  return updatedValue;
}

export function extractHandlerNames(luaCode: string) {
  luaCode = luaCode.replaceAll(/--.*\n/g, "").replaceAll(/--.*$/gm, "").replaceAll("'", '"').replaceAll("[[", '"').replaceAll("]]", '"');
  const handlerPattern = /Handlers\.add\(\s*"([^"]+)"/g;
  const handlers = [];
  let match;

  while ((match = handlerPattern.exec(luaCode)) !== null) {
    handlers.push(match[1]);
  }

  return handlers;
}