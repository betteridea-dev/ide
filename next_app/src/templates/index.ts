import { source as aoBot } from "@/templates/ao/ao-bot";
import { source as arInGrid } from "@/templates/ao/ar-in-arena";
import { source as memeFrame } from "@/templates/ao/memeframe";
import {source as LlamaWanderer} from "@/templates/ao/llama-wanderer";

export const AOTemplates = {
    "": 'print("Hello AO!")',
    "Llama Wanderer": LlamaWanderer,
    "ArweaveIndia Deathmatch Arena": arInGrid,
    "Deathmatch Bot": aoBot,
    "MemeFrame": memeFrame
}

