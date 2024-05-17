"use client"

import * as monaco from 'monaco-editor';

export function luaCompletionProvider(monaco: typeof import("monaco-editor")): monaco.languages.CompletionItemProvider {
    return {
        provideCompletionItems: function (mode, position, context, token) {
            return {
                suggestions: [
                    {
                        label: "print",
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'print(${1:value})',
                        documentation: "Prints text",
                        range: {
                            startLineNumber: position.lineNumber,
                            startColumn: position.column - 1,
                            endLineNumber: position.lineNumber,
                            endColumn: position.column
                        },
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: "Send",
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'Send({\n\tTarget = ${1|ao.id|},\n\tData = "${2}"\n\tAction="${3}"\n})',
                        documentation: "Send a message to a process",
                        range: {
                            startLineNumber: position.lineNumber,
                            startColumn: position.column - 1,
                            endLineNumber: position.lineNumber,
                            endColumn: position.column
                        },
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    }
                ]
            }
        },
        resolveCompletionItem(item, token) {
            return item
        },

    }
}