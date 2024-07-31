export function extractCodeBlocks(input: string): string | null {
  // Iterate through the sections to find the last code block
  const codeBlockMatch = input.match(/```[\s\S]*?```/);

  // Remove the ``` delimiters from the code block content
  return codeBlockMatch
    ? codeBlockMatch[0].replace(/```[\w]*\n?|```/g, "").trim()
    : input;
}
