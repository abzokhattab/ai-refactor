import * as vscode from "vscode";
import { extractCodeBlocks } from "./hpi/extractCodeBlock";
import { queryChat } from "./hpi/queryChat";
import { sendFeedback } from "./hpi/sendFeedback";
import { Message } from "./types";
import { escapeHtml, generateSnippetId } from "./utils";
import { runsTestsSuccessfully } from "./testRunner";

const FEEDBACK_MAX_ATTEMPTS = 5;
const config = vscode.workspace.getConfiguration();
const maxAttempts =
  config.get<number>("maxRefactoringAttempts") ?? FEEDBACK_MAX_ATTEMPTS;

const disableTestsCheck = config.get<boolean>("disableTestsCheck") ?? false;
const installDependenciesCommand =
  config.get<string>("installDependenciesCommand") ?? "npm install";
const runTestsCommand = config.get<string>("runTestsCommand") ?? "npm test";

const generalRefactorPrompt = config.get<string>(
  "generalRefactor.prompt"
) as string;
const extractMethodPrompt = config.get<string>(
  "extractMethod.prompt"
) as string;
const renameVariablePrompt = config.get<string>(
  "renameVariable.prompt"
) as string;
const simplifyCodePrompt = config.get<string>("simplifyCode.prompt") as string;

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "ai-refactor" is now active!');

  const refactorDisposable = vscode.commands.registerCommand(
    "ai-refactor.generalRefactor",
    async () => {
      await handleRefactor(generalRefactorPrompt);
    }
  );

  const extractMethodDisposable = vscode.commands.registerCommand(
    "ai-refactor.extractMethod",
    async () => {
      await handleRefactor(extractMethodPrompt);
    }
  );

  const renameVariableDisposable = vscode.commands.registerCommand(
    "ai-refactor.RenameVariable",
    async () => {
      await handleRefactor(renameVariablePrompt);
    }
  );

  const simplifyCodeDisposable = vscode.commands.registerCommand(
    "ai-refactor.SimplifyCode",
    async () => {
      await handleRefactor(simplifyCodePrompt);
    }
  );

  context.subscriptions.push(
    refactorDisposable,
    extractMethodDisposable,
    renameVariableDisposable,
    simplifyCodeDisposable
  );
}

async function handleRefactor(initialPrompt: string) {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);
    const filePath = editor.document.uri.fsPath;

    if (!selectedText.trim()) {
      vscode.window.showErrorMessage("Please select a function to refactor.");
      return;
    }

    const originalCode = editor.document.getText();
    const snippetId = generateSnippetId();

    const refactoredCode = await tryRefactor(
      snippetId,
      selectedText,
      originalCode,
      filePath,
      initialPrompt
    );

    if (refactoredCode) {
      showRefactoringDiff(selectedText, refactoredCode, selection);
    } else {
      vscode.window.showErrorMessage(
        "The model was not able to refactor this function."
      );
    }
  }
}

export function deactivate() {}

async function tryRefactor(
  snippetId: string,
  selectedText: string,
  originalFile: string,
  filePath: string,
  initialPrompt: string
): Promise<string | null> {
  try {
    const messages: Message[] = [
      {
        role: "user",
        content: `${initialPrompt}\n${selectedText}`,
      },
    ];

    let attempts = 0;

    let response = await queryChat(snippetId, messages);

    while (attempts < maxAttempts) {
      const extractedBlocks = extractCodeBlocks(response);

      if (disableTestsCheck) {
        return extractedBlocks;
      }

      let testError;
      if (extractedBlocks) {
        // replace the selected text with the extracted code and pass it to the test runner
        const newFileContent = originalFile.replace(
          selectedText,
          extractedBlocks
        );

        const testError = await runsTestsSuccessfully(
          newFileContent,
          filePath,
          installDependenciesCommand,
          runTestsCommand
        );
        if (testError === true) {
          return extractedBlocks;
        }
      }

      vscode.window.showInformationMessage(
        `Model suggestion broke the tests. \nAttempt: ${attempts + 1}`
      );

      const errorPrompt = `The suggested changes code broke project tests, please try again and return the complete code, here is the error message: ${testError}`;
      response = await sendFeedback(snippetId, errorPrompt);
      attempts++;
    }

    vscode.window.showInformationMessage(
      `The model was not able to refactor this function after ${maxAttempts} attempts`
    );
    console.error(`Error: Test failed after ${maxAttempts} attempts`);
    return null;
  } catch (error) {
    console.error("Error during refactoring:", error);
    return null;
  }
}

function showRefactoringDiff(
  originalCode: string,
  refactoredCode: string,
  selection: vscode.Selection
) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active text editor found.");
    return;
  }
  const document = editor.document;

  const panel = vscode.window.createWebviewPanel(
    "generalRefactor",
    "Refactor Method",
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
    }
  );

  panel.webview.html = getWebviewContent(originalCode, refactoredCode);

  panel.webview.onDidReceiveMessage(
    (message) => {
      if (message.command === "apply") {
        editor
          .edit((editBuilder) => {
            editBuilder.replace(selection, refactoredCode);
          })
          .then(() => {
            vscode.window.showInformationMessage(
              "Refactoring applied successfully!"
            );
            document.save();
            panel.dispose();
          });
      } else if (message.command === "discard") {
        vscode.window.showInformationMessage("Refactoring discarded.");
        panel.dispose();
      }
    },
    undefined,
    []
  );
}

function getWebviewContent(
  originalCode: string,
  refactoredCode: string
): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <style>
        pre { white-space: pre-wrap; word-wrap: break-word; }
        code { display: block; padding: 10px; }
      </style>
    </head>
    <body>
      <h1>Refactoring Suggestion</h1>
      <h2>Original Code</h2>
      <pre><code>${escapeHtml(originalCode)}</code></pre>
      <h2>Refactored Code</h2>
      <pre><code>${escapeHtml(refactoredCode)}</code></pre>
      <button onclick="applyChange()">Apply Change</button>
      <button onclick="discardChange()">Discard Change</button>

      <script>
        const vscode = acquireVsCodeApi();

        function applyChange() {
          vscode.postMessage({ command: 'apply' });
        }

        function discardChange() {
          vscode.postMessage({ command: 'discard' });
        }
      </script>
    </body>
    </html>
  `;
}
