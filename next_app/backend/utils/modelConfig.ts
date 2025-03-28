import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT, SYSTEM_PROMPT_SMALL } from "../systemPrompt";
import "dotenv/config";

// Available models
export const availableModels = {
    "Gemini 2.0 FL (high context)": "gemini-2.0-flash-lite",
    "Qwen 2.5 coder": "qwen-2.5-coder-32b",
    "Deepseek R1": "deepseek-r1-distill-llama-70b",
    "Llama 3": "llama3-70b-8192",
    "Llama 3.3 70b": "llama-3.3-70b-versatile",
    "Gemma 2": "gemma2-9b-it"
};

// Models that need larger context
export const largeModels = ["gemini-2.0-flash-lite"];

// Initialize the Google AI client
const apiKey = process.env.GEMINI_API_KEY;
export const genAI = new GoogleGenerativeAI(apiKey);

export const gemini = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-lite",
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain"
    }
}); 