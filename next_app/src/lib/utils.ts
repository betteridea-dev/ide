import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Column } from "./ao-vars";

export const supportedExtensions = ["lua", "luanb", "md"];

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

export function parseCreateTableQuery(query:string) {
  // Remove newlines and extra spaces
  query = query.replace(/\s+/g, ' ').trim();

  // Extract table name and column definitions
  const match = query.match(/CREATE TABLE (\w+) \((.*)\)/i);
  if (!match) {
    throw new Error('Invalid CREATE TABLE query');
  }

  const [, tableName, columnDefinitions] = match;

  // Split column definitions and parse each one
  const columns = columnDefinitions.split(',').map(col => {
    const [name, dataType] = col.trim().split(/\s+/);
    return { name, dataType: dataType.toLowerCase() } as Column;
  });

  return columns;
}

// export function parseCreateTableQuery(query:string) {
//   // Remove newlines and extra spaces
//   query = query.replace(/\s+/g, ' ').trim();

//   // Extract table name and column definitions
//   const match = query.match(/CREATE TABLE (\w+)\s*\((.*)\)/i);
//   if (!match) {
//     throw new Error('Invalid CREATE TABLE query');
//   }

//   const [, tableName, columnDefinitions] = match;

//   // Split column definitions and parse each one
//   const columns = columnDefinitions.split(',').map(col => {
//     const parts = col.trim().split(/\s+/);
//     console.log(parts);
//     const name = parts[0];
//     let dataType = parts[1].toLowerCase();

//     // Handle cases where data type has a size specification
//     if (dataType.includes('(')) {
//       dataType = parts.slice(1, 3).join(' ').toLowerCase();
//     }

//     // Additional attributes
//     const attributes = parts.slice(2).join(' ');

//     return { name, dataType, attributes };
//   });

//   return columns;
// }

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function tsToDate(ts: number) {
  const d = new Date(ts);
  return `${d.toDateString()} ${d.toTimeString()}`;
}

export function getRelativeTime(timestamp:number) {
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

export function createLoaderFunc(name:string, src:string){

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
