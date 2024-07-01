// import {  Range} from "monaco-editor/esm/vs/editor/editor.api";

const OPENING_BRACKETS = ["(", "[", "{"];
const CLOSING_BRACKETS = [")", "]", "}"];
const QUOTES = ['"', "'", "`"];
export const ALL_BRACKETS = [...OPENING_BRACKETS, ...CLOSING_BRACKETS] as const;
export type Bracket = (typeof ALL_BRACKETS)[number];

class CompletionFormatter {
    private _characterAfterCursor: string;
    private _completion = "";
    private _normalisedCompletion = "";
    private _originalCompletion = "";
    private _textAfterCursor: string;
    private _lineText: string;
    private _characterBeforeCursor: string;
    private _editor: any; // monaco ITextModel
    private _cursorPosition: any; // monaco Position
    private _lineCount: number;

    constructor(
        editor: any,
        position: any,
    ) {
        this._editor = editor;
        this._cursorPosition = position;
        const lineEndPosition = editor.getFullModelRange()?.getEndPosition();
        const textAfterRange = {
      /* Start position */ startLineNumber: this._cursorPosition.lineNumber,
      /* Start column */ startColumn: this._cursorPosition.column,
      /* End position */ endLineNumber: lineEndPosition?.lineNumber ?? 1,
      /* End column */ endColumn: lineEndPosition?.column ?? 1,
        }
        this._lineText = editor.getLineContent(this._cursorPosition.lineNumber);
        this._textAfterCursor = editor.getValueInRange(textAfterRange);
        this._editor = editor;
        this._characterBeforeCursor =
            this._lineText[this._cursorPosition.column - 2] ?? "";
        this._characterAfterCursor =
            this._lineText[this._cursorPosition.column] ?? "";
        this._lineCount = editor.getLineCount();
    }

    // Check if the open and close brackets are a matching pair
    private isMatchingPair = (open?: Bracket, close?: string): boolean => {
        return (
            (open === "(" && close === ")") ||
            (open === "[" && close === "]") ||
            (open === "{" && close === "}")
        );
    };

    // Match the completion brackets to ensure they are balanced
    private matchCompletionBrackets = (): CompletionFormatter => {
        let accumulatedCompletion = "";
        const openBrackets: Bracket[] = [];
        for (const character of this._originalCompletion) {
            if (OPENING_BRACKETS.includes(character)) {
                openBrackets.push(character);
            }

            if (CLOSING_BRACKETS.includes(character)) {
                if (
                    openBrackets.length &&
                    this.isMatchingPair(openBrackets[openBrackets.length - 1], character)
                ) {
                    openBrackets.pop();
                } else {
                    break;
                }
            }
            accumulatedCompletion += character;
        }

        // If the brackets are not balanced, return the original completion, otherwise return the matched completion
        this._completion =
            accumulatedCompletion.trimEnd() || this._originalCompletion.trimEnd();

        return this;
    };

    private ignoreBlankLines = (): CompletionFormatter => {
        // If the completion is a blank line, return an empty string
        if (
            this._completion.trimStart() === "" &&
            this._originalCompletion !== "\n"
        ) {
            this._completion = this._completion.trim();
        }
        return this;
    };

    // Remove leading and trailing whitespace from the text
    private normalise = (text: string) => text?.trim();

    private removeDuplicateStartOfSuggestions(): this {
        // Remove the text that is already present in the editor from the completion
        const before = this._editor
            .getValueInRange(
                // new Range(
                {
                    startLineNumner: 1,
                    startColumn: 1,
                    endLineNumber: this._cursorPosition.lineNumber,
                    endColumn: this._cursorPosition.column,
                }
                // ),
            )
            .trim();

        const completion = this.normalise(this._completion);

        const maxLength = Math.min(completion.length, before.length);
        let overlapLength = 0;

        for (let length = 1; length <= maxLength; length++) {
            const endOfBefore = before.substring(before.length - length);
            const startOfCompletion = completion.substring(0, length);
            if (endOfBefore === startOfCompletion) {
                overlapLength = length;
            }
        }

        // Remove the overlapping part from the start of completion
        if (overlapLength > 0) {
            this._completion = this._completion.substring(overlapLength);
        }

        return this;
    }

    // Check if the cursor is in the middle of a word
    private isCursorAtMiddleOfWord() {
        return (
            this._characterBeforeCursor &&
            /\w/.test(this._characterBeforeCursor) &&
            /\w/.test(this._characterAfterCursor)
        );
    }

    // Remove unnecessary quotes in the middle of the completion
    private removeUnnecessaryMiddleQuote(): CompletionFormatter {
        const startsWithQuote = QUOTES.includes(this._completion[0] ?? "");
        const endsWithQuote = QUOTES.includes(
            this._completion[this._completion.length - 1] ?? "",
        );

        if (startsWithQuote && endsWithQuote) {
            this._completion = this._completion.substring(1);
        }

        if (endsWithQuote && this.isCursorAtMiddleOfWord()) {
            this._completion = this._completion.slice(0, -1);
        }

        return this;
    }

    // Remove duplicate lines that are already present in the editor
    private preventDuplicateLines = (): CompletionFormatter => {
        let nextLineIndex = this._cursorPosition.lineNumber + 1;
        while (
            nextLineIndex < this._cursorPosition.lineNumber + 3 &&
            nextLineIndex < this._lineCount
        ) {
            const line = this._editor.getLineContent(nextLineIndex);
            if (this.normalise(line) === this.normalise(this._originalCompletion)) {
                this._completion = "";
                return this;
            }
            nextLineIndex++;
        }
        return this;
    };

    // Remove newlines after spaces or newlines
    public removeInvalidLineBreaks = (): CompletionFormatter => {
        if (this._completion.endsWith("\n")) {
            this._completion = this._completion.trimEnd();
        }
        return this;
    };

    private newLineCount = () => {
        return this._completion.match(/\n/g) || [];
    };

    private getLastLineColumnCount = () => {
        const lines = this._completion.split("\n");
        return lines[lines.length - 1].length;
    };

    private trimStart = () => {
        const firstNonSpaceIndex = this._completion.search(/\S/);

        /* If the first non-space character is in front of the cursor, remove it */
        if (firstNonSpaceIndex > this._cursorPosition.column - 1) {
            this._completion = this._completion.substring(firstNonSpaceIndex);
        }

        return this;
    };

    private stripMarkdownAndSuggestionText = () => {
        // Remove the backticks and the language name from a code block
        this._completion = this._completion.replace(/```.*\n/g, "");
        this._completion = this._completion.replace(/```/g, "");
        this._completion = this._completion.replace(/`/g, "");

        // Remove variations of "# Suggestion:" and "# Suggestions:" if they exist
        this._completion = this._completion.replace(/# ?Suggestions?: ?/g, "");

        return this;
    };

    private getNoTextBeforeOrAfter = () => {
        const textAfter = this._textAfterCursor;
        const textBeforeRange =
        {
            startLineNumber: 0,
            startColumn: 0,
            endLineNumber: this._cursorPosition.lineNumber,
            endColumn: this._cursorPosition.column,
        }


        const textBefore = this._editor.getValueInRange(textBeforeRange);

        return !textAfter || !textBefore;
    };

    private ignoreContextCompletionAtStartOrEnd = () => {
        const isNoTextBeforeOrAfter = this.getNoTextBeforeOrAfter();

        const contextMatch = this._normalisedCompletion.match(
            /\/\*\s*Language:\s*(.*)\s*\*\//,
        );

        const extensionContext = this._normalisedCompletion.match(
            /\/\*\s*File extension:\s*(.*)\s*\*\//,
        );

        const commentMatch = this._normalisedCompletion.match(/\/\*\s*\*\//);

        if (
            isNoTextBeforeOrAfter &&
            (contextMatch || extensionContext || commentMatch)
        ) {
            this._completion = "";
        }

        return this;
    };

    // Format the completion based on the cursor position, formatted completion, and range
    private formatCompletion = (range: any) => {
        const newLineCount = this.newLineCount();
        const getLastLineLength = this.getLastLineColumnCount();
        return {
            insertText: this._completion,
            range: {
                startLineNumber: this._cursorPosition.lineNumber,
                startColumn: this._cursorPosition.column,
                endLineNumber: this._cursorPosition.lineNumber + newLineCount.length,
                endColumn:
                    this._cursorPosition.lineNumber === range.startLineNumber &&
                        newLineCount.length === 0
                        ? this._cursorPosition.column + getLastLineLength
                        : getLastLineLength,
            },
        };
    };

    public format = (
        insertText: string,
        range: any,
    ): { insertText: string; range: any } => {
        this._completion = "";
        this._normalisedCompletion = this.normalise(insertText);
        this._originalCompletion = insertText;
        return this.matchCompletionBrackets()
            .ignoreBlankLines()
            .removeDuplicateStartOfSuggestions()
            .removeUnnecessaryMiddleQuote()
            .preventDuplicateLines()
            .removeInvalidLineBreaks()
            .trimStart()
            .stripMarkdownAndSuggestionText()
            .ignoreContextCompletionAtStartOrEnd()
            .formatCompletion(range);
    };
}

export { CompletionFormatter };