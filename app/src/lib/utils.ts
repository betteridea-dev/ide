import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import React from "react"
import { createDataItemSigner } from "@permaweb/aoconnect"
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
import type { Project } from "@/hooks/use-projects"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortenAddress(address: string) {
  return address.slice(0, 6) + "..." + address.slice(-6)
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

/**
 * Validates if a string is a valid Arweave transaction ID
 * @param id - The ID string to validate
 * @returns boolean - true if valid Arweave ID, false otherwise
 */
export function isValidArweaveId(id: string): boolean {
  if (!id || typeof id !== 'string') {
    return false
  }

  // Arweave transaction IDs are 43 characters long and use base64url encoding
  // Valid characters: A-Z, a-z, 0-9, -, _
  const arweaveIdRegex = /^[A-Za-z0-9_-]{43}$/
  return arweaveIdRegex.test(id.trim())
}

/**
 * Validates if a string is a valid Arweave transaction ID with detailed error message
 * @param id - The ID string to validate
 * @param fieldName - The name of the field being validated (for error messages)
 * @returns object with isValid boolean and error message if invalid
 */
export function validateArweaveId(id: string, fieldName: string = "ID"): { isValid: boolean; error?: string } {
  if (!id || typeof id !== 'string') {
    return {
      isValid: false,
      error: `${fieldName} is required`
    }
  }

  const trimmedId = id.trim()

  if (!trimmedId) {
    return {
      isValid: false,
      error: `${fieldName} is required`
    }
  }

  if (trimmedId.length !== 43) {
    return {
      isValid: false,
      error: `${fieldName} must be exactly 43 characters long`
    }
  }

  // Check for valid base64url characters
  if (!/^[A-Za-z0-9_-]+$/.test(trimmedId)) {
    return {
      isValid: false,
      error: `${fieldName} contains invalid characters. Only letters, numbers, hyphens, and underscores are allowed`
    }
  }

  return { isValid: true }
}

/**
 * Create a signer from ArweaveWalletKit for AO operations
 * @returns A signer function for AO operations
 */
export function createAOSigner() {
  if (typeof window === 'undefined' || !window.arweaveWallet) {
    throw new Error('Arweave wallet not available')
  }

  return createDataItemSigner(window.arweaveWallet)
}

/**
 * Check if a string is valid JSON
 * @param str - The string to check
 * @returns boolean indicating if the string is valid JSON
 */
export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

/**
 * Detect the type of a simple value for syntax highlighting
 * @param value - The string value to analyze
 * @returns Object with type and the original value
 */
export function detectValueType(value: string): { type: 'number' | 'boolean' | 'string' | 'unknown', value: string } {
  const trimmed = value.trim()

  // Check if it's a number
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return { type: 'number', value: trimmed }
  }

  // Check if it's a boolean
  if (trimmed === 'true' || trimmed === 'false') {
    return { type: 'boolean', value: trimmed }
  }

  // Everything else is treated as string
  return { type: 'string', value }
}

/**
 * Parse AO process execution output to extract meaningful data or errors
 * @param result - The raw result object from AO process execution
 * @returns Formatted output string showing data or error information
 */
export function parseOutput(result: any): string {
  try {
    // Handle null or undefined results
    if (!result) {
      return "No output received"
    }

    // Check for error status
    if (result.status === "error" || result.error) {
      return `Error: ${result.error || result.message || "Unknown error occurred"}`
    }

    // Extract output data if available
    if (result.output && result.output.data) {
      // Clean up the data by removing trailing "nil" if present
      let outputData = result.output.data
      if (typeof outputData === 'string') {
        // Remove trailing "\nnil" that AO often appends
        outputData = outputData.replace(/\nnil$/, '')

        // Strip ANSI color codes from string outputs
        outputData = stripAnsiCodes(outputData)

        // For simple string outputs, return as-is without quotes
        return outputData
      }

      // For non-string data, JSON stringify with formatting
      return JSON.stringify(outputData, null, 2)
    }

    // Check for direct data property
    if (result.data) {
      if (typeof result.data === 'string') {
        // Strip ANSI color codes from string outputs
        return stripAnsiCodes(result.data)
      }
      return JSON.stringify(result.data, null, 2)
    }

    // If we have a result but no clear output, show the whole result
    return JSON.stringify(result, null, 2)
  } catch (error) {
    return `Error parsing output: ${error instanceof Error ? error.message : 'Unknown error'}`
  }
}

/**
 * ANSI color constants for terminal output formatting
 */
export const ANSI = {
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m',
  DIM: '\x1b[2m',

  // Foreground colors
  BLACK: '\x1b[30m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  WHITE: '\x1b[37m',

  // Bright foreground colors
  LIGHTRED: '\x1b[91m',
  LIGHTGREEN: '\x1b[92m',
  LIGHTYELLOW: '\x1b[93m',
  LIGHTBLUE: '\x1b[94m',
  LIGHTMAGENTA: '\x1b[95m',
  LIGHTCYAN: '\x1b[96m',

  // Background colors
  BG_BLACK: '\x1b[40m',
  BG_RED: '\x1b[41m',
  BG_GREEN: '\x1b[42m',
  BG_YELLOW: '\x1b[43m',
  BG_BLUE: '\x1b[44m',
  BG_MAGENTA: '\x1b[45m',
  BG_CYAN: '\x1b[46m',
  BG_WHITE: '\x1b[47m',

  // Special sequences
  CLEARLINE: '\r\x1b[K',
  CLEAR: '\x1b[2J\x1b[H'
} as const

/**
 * Strip ANSI escape sequences from a string
 * @param str - String containing ANSI escape sequences
 * @returns Clean string without ANSI codes
 */
export function stripAnsiCodes(str: string): string {
  // Remove standard ANSI escape sequences (\x1b[...m)
  let cleaned = str.replace(/\x1b\[[0-9;]*m/g, '')

  // Also remove ANSI sequences that might be missing the escape character ([...m)
  cleaned = cleaned.replace(/\[[0-9;]*m/g, '')

  return cleaned
}

/**
 * Create a new project with default structure
 * @param projectName - The name of the new project
 * @param ownerAddress - The wallet address of the project owner
 * @param isMainnet - Whether the project is on mainnet
 * @param processId - Optional existing process ID
 * @returns A new Project object with default files and structure
 */
export function createNewProject(
  projectName: string,
  ownerAddress: string,
  isMainnet: boolean = true,
  processId?: string
): Project {
  return {
    name: projectName,
    files: {
      "main.lua": {
        name: "main.lua",
        cellOrder: ["init"],
        cells: {
          "init": {
            id: "init",
            content: 'print("Hello AO!")',
            output: "",
            type: "CODE",
            editing: false
          }
        },
        isMainnet,
        ownerAddress
      }
    },
    process: processId || "",
    ownerAddress,
    isMainnet
  }
}


