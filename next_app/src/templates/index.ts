import { source as aoBot } from "@/templates/ao/ao-bot";
import { source as arInGrid } from "@/templates/ao/ar-in-arena";
import { source as memeFrame } from "@/templates/ao/memeframe";
import { source as LlamaWanderer } from "@/templates/ao/weaveworld-agent";
import { source as FantasyLlama } from "@/templates/ao/fantasy-llama";

export const AOTemplates = {
    "": 'print("Hello AO!")',
    "WeaveWorld Agent": LlamaWanderer,
    "Fantasy Llama": FantasyLlama,
    "ArweaveIndia Deathmatch Arena": arInGrid,
    "Deathmatch Bot": aoBot,
    "MemeFrame": memeFrame
}

