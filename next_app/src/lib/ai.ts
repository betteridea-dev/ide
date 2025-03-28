// Constants
export const luaCompletionPretext = `
## Task: Code Completion

    ### Language: LUA
             
    ### Instructions:
    - You are a world class coding assistant.
    - Given the current text, context, and the last character of the user input, provide a suggestion for code completion.
    - The suggestion must be based on the current text, as well as the text before the cursor.
    - This is not a conversation, so please do not ask questions or prompt for additional information.
    
    ### Notes
    - NEVER INCLUDE ANY MARKDOWN IN THE RESPONSE - THIS MEANS CODEBLOCKS AS WELL.
    - Never include any annotations such as "# Suggestion:" or "# Suggestions:".
    - Newlines should be included after any of the following characters: "{", "[", "(", ")", "]", "}", and ",".
    - Never suggest a newline after a space or newline.
    - Ensure that newline suggestions follow the same indentation as the current line.
    - The suggestion must start with the last character of the current user input.
    - Only ever return the code snippet, do not return any markdown unless it is part of the code snippet.
    - Do not return any code that is already present in the current text.
    - Do not return anything that is not valid code.
    - If you do not have a suggestion, return an empty string.
`

// Types
export interface CompletionContext {
    textBeforeCursor: string;
    textBeforeCursorOnCurrentLine: string;
    language?: SupportedLanguage;
}

export type SupportedLanguage = 'lua' | 'javascript' | 'typescript' | 'json';

export interface AICompletionRequest {
    context: CompletionContext;
    model?: string;
}

export interface AICompletionResponse {
    completion: string;
    error?: string;
}

// Utility functions
export function generateContext({ textBeforeCursor, textBeforeCursorOnCurrentLine, language = 'lua' }: CompletionContext): string {
    const pretext = language === 'lua' ? luaCompletionPretext : luaCompletionPretext; // Add more languages as needed

    return `${pretext}
TEXT BEFORE CURSOR: ${textBeforeCursor}

TEXT BEFORE CURSOR ON CURRENT LINE: ${textBeforeCursorOnCurrentLine}
`;
}

// API call function
export async function getCompletion({ context, model = 'default' }: AICompletionRequest): Promise<AICompletionResponse> {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: generateContext(context),
                model,
            }),
        });

        if (!response.ok) {
            throw new Error(`AI completion failed: ${response.statusText}`);
        }

        const data = await response.json();
        return {
            completion: data.response || '',
        };
    } catch (error) {
        console.error('AI completion error:', error);
        return {
            completion: '',
            error: error.message,
        };
    }
}