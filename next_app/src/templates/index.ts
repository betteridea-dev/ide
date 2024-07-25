import { source as aoBot } from "@/templates/ao/ao-bot";
import { source as arInGrid } from "@/templates/ao/ar-in-arena";
import { source as memeFrame } from "@/templates/ao/memeframe";
import { source as LlamaComplainer } from "@/templates/ao/llama-complainer";
import { source as FantasyLlama } from "@/templates/ao/fantasy-llama";

export const AOTemplates = {
    "": 'print("Hello AO!")',
    "Reality Agent - Chatter": FantasyLlama,
    "Reality Agent - Complainer": LlamaComplainer,
    "Deathmatch Arena": arInGrid,
    "Deathmatch Bot": aoBot,
    "MemeFrame": memeFrame
}

