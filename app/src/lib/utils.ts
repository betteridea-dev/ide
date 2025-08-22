import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import React from "react"
import {
  Code,
  FileText,
  FileJson,
  Database,
  Package,
  FileQuestion,
  Image,
  Settings
} from "lucide-react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the appropriate file icon component and color classes based on filename
 * @param filename - The name of the file
 * @param size - The size of the icon (default: 16)
 * @returns Object with icon component and className
 */
export function getFileIcon(filename: string, size: number = 16) {
  const extension = filename.split(".").pop()?.toLowerCase()
  const type = filename.split(":")[0]

  switch (extension) {
    case "lua":
    case "luanb":
      return {
        icon: Code,
        className: "text-blue-500 dark:text-blue-400",
        size
      }
    case "js":
    case "jsx":
      return {
        icon: Code,
        className: "text-yellow-600 dark:text-yellow-400",
        size
      }
    case "ts":
    case "tsx":
      return {
        icon: Code,
        className: "text-blue-600 dark:text-blue-400",
        size
      }
    case "json":
      return {
        icon: FileJson,
        className: "text-orange-600 dark:text-orange-400",
        size
      }
    case "md":
    case "txt":
      return {
        icon: FileText,
        className: "text-slate-500 dark:text-slate-400",
        size
      }
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "svg":
    case "webp":
      return {
        icon: Image,
        className: "text-purple-500 dark:text-purple-400",
        size
      }
    case "css":
    case "scss":
    case "sass":
      return {
        icon: Code,
        className: "text-pink-500 dark:text-pink-400",
        size
      }
    case "html":
    case "htm":
      return {
        icon: Code,
        className: "text-red-500 dark:text-red-400",
        size
      }
    case "xml":
    case "yaml":
    case "yml":
      return {
        icon: Settings,
        className: "text-gray-600 dark:text-gray-400",
        size
      }
    default:
      switch (type) {
        case "PKG":
          return {
            icon: Package,
            className: "text-green-600 dark:text-green-400",
            size
          }
        case "TBL":
          return {
            icon: Database,
            className: "text-purple-600 dark:text-purple-400",
            size
          }
        default:
          return {
            icon: FileQuestion,
            className: "text-slate-500 dark:text-slate-400",
            size
          }
      }
  }
}

/**
 * Get a rendered file icon component based on filename
 * @param filename - The name of the file
 * @param size - The size of the icon (default: 16)
 * @returns JSX element with the appropriate icon
 */
export function getFileIconElement(filename: string, size: number = 16) {
  const { icon: Icon, className } = getFileIcon(filename, size)
  return React.createElement(Icon, { size, className })
}
