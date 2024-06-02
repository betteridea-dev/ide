import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function tsToDate(ts: number) {
  const d = new Date(ts);
  return `${d.toDateString()} ${d.toTimeString()}`;
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

export function createLoaderFunc(src:string, name:string){
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
    print("Loaded ${name} module")`
}