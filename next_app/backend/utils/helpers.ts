// Helper function to construct prompt
export function constructPrompt({ message, fileContext = "" }: { message: string, fileContext: string }) {
    let contextualPrompt = "";

    if (fileContext) {
        contextualPrompt += `File context: ${fileContext}\n`;
    }

    contextualPrompt += `\nUser message: ${message}`;

    contextualPrompt += `\n\nrespond as concise as possible`;
    return contextualPrompt;
}

// Helper function to calculate and log token usage
export function calculateCost(tokens: number) {
    console.log(`Token usage: ${tokens}`);
} 