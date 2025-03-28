import { Router } from 'express';
import { availableModels, largeModels, gemini } from '../../utils/modelConfig';
import { constructPrompt, calculateCost } from '../../utils/helpers';
import { ChatRequest } from '../../types';
import { SYSTEM_PROMPT_SMALL } from '../../systemPrompt';

const router = Router();

// Chat route
router.post('/', async (req, res) => {
    try {
        const { message, fileContext, chat, model } = req.body as ChatRequest;

        if (!Object.values(availableModels).includes(model)) {
            return res.status(400).json({
                error: "unknown model"
            });
        }

        const prompt = constructPrompt({
            message,
            fileContext,
        });

        if (largeModels.includes(model)) {
            //replace role system with role model, and content with parts:[{text: content}], remove any other fields
            let newChat = chat.map((c: any) => ({ role: c.role === "assistant" ? "model" : c.role, parts: [{ text: c.content }] }));
            // remove first message if it is from model
            if (newChat[0].role === "model") {
                newChat.shift();
            }

            const session = gemini.startChat({
                history: newChat || [],
            });

            const result = await session.sendMessage(prompt);

            // log usage 
            console.log("Gemini usage:", result.response.usageMetadata.totalTokenCount);
            return res.status(200).json({
                response: result.response.text(),
            });
        }

        //small model
        const system = { role: "system", content: SYSTEM_PROMPT_SMALL };
        const newChat = [system, ...(chat || []), { role: "user", content: prompt }];

        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages: newChat,
                    model: model || "qwen-2.5-coder-32b",
                    temperature: 1,
                    max_tokens: 1024,
                    top_p: 1,
                    stream: false,
                    stop: null,
                }),
            },
        );

        if (!response.ok) {
            const errorData = await response.text();
            console.error("Groq API response:", errorData);
            throw new Error(`Groq API error: ${response.statusText} - ${errorData}`);
        }

        const completion = await response.json();

        if (completion.choices?.[0]?.message?.content) {
            if (completion.usage) {
                calculateCost(completion.usage.total_tokens);
            }

            res.header("Access-Control-Allow-Origin", req.headers.origin);
            res.header("Access-Control-Allow-Credentials", "true");

            return res.status(200).json({
                response: completion.choices[0].message.content,
                fileContext: fileContext,
            });
        }

        throw new Error("No completion generated");
    } catch (err) {
        console.error("Chat error:", err);
        return res.status(500).json({
            response: null,
            error: err.message,
        });
    }
});

// CORS options for chat route
router.options('/', (req, res) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.header("Access-Control-Allow-Credentials", "true");
    res.status(200).end();
});

export default router; 