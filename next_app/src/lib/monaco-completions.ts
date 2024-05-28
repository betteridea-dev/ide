"use client"

import * as monaco from 'monaco-editor';

export function luaCompletionProvider(monaco: typeof import("monaco-editor")): monaco.languages.CompletionItemProvider {

    return {
        provideCompletionItems: function (model, position, context, token) {
            const textUntilPosition = model.getValueInRange({
                startLineNumber: 1,
                startColumn: 1,
                endLineNumber: position.lineNumber,
                endColumn: position.column
            });


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
                        insertText: 'Send({\n\tTarget = ${1|ao.id|},\n\tData = "${2}",\n\tAction="${3}"\n})',
                        documentation: "Send a message to a process",
                        range: {
                            startLineNumber: position.lineNumber,
                            startColumn: position.column - 1,
                            endLineNumber: position.lineNumber,
                            endColumn: position.column
                        },
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'Handlers.add',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'Handlers.add(\n\t"${1:handler_name}",\n\tHandlers.utils.hasMatching${2|Tag,Action|}(),\n\tfunction(msg)\n\t\t${3}\n\tend\n)',
                        range: {
                            startLineNumber: position.lineNumber,
                            startColumn: position.column - 1,
                            endLineNumber: position.lineNumber,
                            endColumn: position.column
                        },
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'Handlers.utils.hasMatchingTag',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'Handlers.utils.hasMatchingTag("${1:tag_name}", "${2:tag_value}")',
                        range: {
                            startLineNumber: position.lineNumber,
                            startColumn: position.column - 1,
                            endLineNumber: position.lineNumber,
                            endColumn: position.column
                        },
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'Handlers.utils.hasMatchingData',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'Handlers.utils.hasMatchingTag("${1:data_value}")',
                        range: {
                            startLineNumber: position.lineNumber,
                            startColumn: position.column - 1,
                            endLineNumber: position.lineNumber,
                            endColumn: position.column
                        },
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    },
                    {
                        label: 'Handlers.list',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'Handlers.list()',
                        range: {
                            startLineNumber: position.lineNumber,
                            startColumn: position.column - 1,
                            endLineNumber: position.lineNumber,
                            endColumn: position.column
                        }
                    }
                ]
            }


        },
        resolveCompletionItem(item, token) {
            return item
        },

    }
}