import { Editor } from "@monaco-editor/react";

import { useGlobalState, useProjectManager } from "@/hooks";
import notebookTheme from "@/monaco-themes/notebook.json";
import { editor } from "monaco-editor";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import debounce from "lodash.debounce";

const monacoConfig: editor.IStandaloneEditorConstructionOptions = {
  fontFamily: "monospace",
  fontSize: 14,
  lineHeight: 20,
  lineNumbersMinChars: 3,
  scrollBeyondLastLine: false,
};

async function fetchGroqSuggestions(
  previous_lines: string,
  current_line: string,
  position: number
) {
  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [
            {
              role: "system",
              content: `You are a Lua code completion assistant specializing in contextual code suggestions. You must follow these guidelines:

                  ## Response Format
                  - Provide ONLY the code completion suggestion
                  - No explanations or markdown
                  - No surrounding quotes or backticks
                  - Complete the current line/block in a natural way
                  - Maximum response length: 100 tokens

                  ## Context Analysis Rules
                  1. Examine the code structure:
                    - Detect incomplete control structures (if, for, while)
                    - Identify function definitions and calls
                    - Look for table operations
                    - Check for unfinished string operations
                    - Note variable scoping and naming patterns

                  2. Consider common Lua patterns:
                    - Table manipulation (insert, remove, concat)
                    - String operations (sub, format, match)
                    - Math operations
                    - File I/O operations
                    - Error handling patterns

                  3. Maintain consistency with:
                    - Existing variable names
                    - Code style (spacing, naming conventions)
                    - Error handling approaches
                    - Comment style if present

                  ## Completion Priority Rules
                  1. First priority - Complete the current syntactic structure:
                    - Close open parentheses, brackets, quotes
                    - Complete control structure blocks
                    - Finish function declarations

                  2. Second priority - Suggest logical next steps:
                    - Common function calls based on context
                    - Error handling where appropriate
                    - Variable declarations or assignments
                    - Return statements in functions

                  3. Third priority - Add helpful additions:
                    - Parameter suggestions
                    - Table key completions
                    - Common method chains
                    - Related variable operations`,
            },
            {
              role: "user",
              content: `Task: Complete this Lua code based on context.

                      Previous context (up to 5 lines):
                      ${previous_lines}

                      Current incomplete line:
                      ${current_line}

                      Cursor position: ${position}

                      Generate a completion that:
                      1. Maintains the current code structure
                      2. Follows Lua best practices
                      3. Completes any unfinished syntax
                      4. Suggests logical next steps


                      ## Examples

                      Input Context:
                      local function calculateDistance(x1, y1, x2, y2)
                          local dx = x2 - x1
                          local dy = y2 - y1
                          return math.


                      Good Completion:
                      sqrt(dx * dx + dy * dy)


                      Input Context:
                      local function processTable(t)
                          for k, v in pairs(t) do
                              if type(v) == "table" then


                      Good Completion:

                                  processTable(v)
                              elseif type(v) == "string" then
                                  t[k] = v:upper()
                              end


                  `,
            },
          ],
          max_tokens: 200,
          temperature: 0.3,
          top_p: 0.9,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch AI completion");
    }

    const data = await response.json();
    console.log("data>>", data.choices[0].message.content.trim());

    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error fetching suggestions from Groq API:", error);
    return [];
  }
}

const debouncedFetchSuggestions = debounce(
  async (previous_lines: string, current_line: string, offset: number) => {
    await fetchGroqSuggestions(previous_lines, current_line, offset);
  },
  600
);

export default function SingleFileEditor() {
  const manager = useProjectManager();
  const globalState = useGlobalState();
  const { theme } = useTheme();

  const editorRef = useRef(null);

  const project = manager.getProject(globalState.activeProject);
  const file = project.getFile(globalState.activeFile);

  return (
    <>
      <Editor
        className="font-btr-code"
        height="100%"
        // beforeMount={(m) => {
        //   m.editor.remeasureFonts()
        // }}
        onMount={(editor, monaco) => {
          editorRef.current = editor;
          monaco.editor.defineTheme(
            "notebook",
            notebookTheme as editor.IStandaloneThemeData
          );
          if (theme == "dark") monaco.editor.setTheme("notebook");
          else monaco.editor.setTheme("vs-light");
          // set font family
          // editor.updateOptions({ fontFamily: "DM Mono" });
          // monaco.editor.remeasureFonts();
          // run function on shift+enter
          editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
            // runNormalCode();
            document.getElementById("run-code-btn")?.click();
          });

          editor.addAction({
            id: "format-code",
            label: "Format Code",
            contextMenuGroupId: "navigation",
            run: async function (editor) {
              const luamin = require("lua-format");
              const input = editor.getValue();
              console.log("formatting code");
              const output: string = luamin.Beautify(input, {
                RenameVariables: false,
                RenameGlobals: false,
                SolveMath: true,
              });
              // remove source first line
              editor.setValue(
                output.split("\n").slice(1).join("\n").trimStart()
              );
            },
          });

          monaco.languages.registerInlineCompletionsProvider("lua", {
            // triggerCharacters: [".", ":", " ", "\n"],
            provideInlineCompletions: async (model, position) => {
              // Get the current line and the lines above it for context
              const lineContent = model.getLineContent(position.lineNumber);
              const prevLines = model
                .getLinesContent()
                .slice(
                  Math.max(0, position.lineNumber - 5),
                  position.lineNumber - 1
                );

              const offset = model.getOffsetAt(position);

              console.log("prev", prevLines);
              console.log("curr", lineContent);

              const suggestion: string = await fetchGroqSuggestions(
                prevLines.join("\n"),
                lineContent,
                offset
              );

              console.log("sugg", suggestion);

              return {
                items: [
                  {
                    // label: suggestion,
                    // kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: suggestion,
                    range: {
                      startLineNumber: position.lineNumber,
                      startColumn: position.column,
                      endLineNumber: position.lineNumber,
                      endColumn: position.column,
                    },
                  },
                ],
              };
            },
            freeInlineCompletions: () => {},
          });
        }}
        value={file ? file.content.cells[file.content.cellOrder[0]].code : ""}
        onChange={(value) => {
          const editor = editorRef.current;

          if (editor) {
            const position = editor.getPosition();
            const offset = editor.getModel().getOffsetAt(position);
            const lineContent = editor
              .getModel()
              .getLineContent(position.lineNumber);

            const prevLines = editor
              .getModel()
              .getLinesContent()
              .slice(
                Math.max(0, position.lineNumber - 5),
                position.lineNumber - 1
              );

            // Fetch suggestions based on current code and position
            debouncedFetchSuggestions(prevLines, lineContent, offset);

            const newContent = { ...file.content };
            newContent.cells[file.content.cellOrder[0]] = {
              ...file.content.cells[file.content.cellOrder[0]],
              code: value,
            };
            manager.updateFile(project, { file, content: newContent });
          }

          //   const offset = editor.getModel().getOffsetAt(editor.getPosition());
          //   debouncedFetchSuggestions(value, offset);
        }}
        language={file && file.language}
        options={monacoConfig}
      />
    </>
  );
}
