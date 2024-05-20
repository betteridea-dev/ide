import { source as aoBot } from "@/templates/ao/ao-bot";
import { source as arInGrid } from "@/templates/ao/ar-in-arena";

export function GetAOTemplates() {
    return {
        "": 'print("Hello AO!")',
        "ArweaveIndia Deathmatch Arena": arInGrid,
        "Deathmatch Bot": aoBot,
    }
}