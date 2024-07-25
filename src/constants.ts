export const REFACTOR_TYPES = [
  {
    type: "general_refactor",
    prompt:
      "Refactor the following code to improve readability, maintainability, and performance. Do not introduce any breaking changes or alter the existing functionality. Provide the complete refactored code:\n",
  },
  {
    type: "extract_method",
    prompt:
      "Extract methods from the following code to enhance modularity and readability. Ensure each new method has a clear and distinct purpose. Do not introduce any breaking changes or alter the existing functionality. Provide the complete refactored code:\n",
  },
  {
    type: "rename_variable",
    prompt:
      "Rename variables in the following code to improve clarity and understanding. Choose meaningful and descriptive names. Do not introduce any breaking changes or alter the existing functionality. Provide the complete refactored code:\n",
  },
  {
    type: "simplify_code",
    prompt:
      "Simplify the following code to make it more concise and efficient. Remove any unnecessary complexity while preserving the original functionality. Do not introduce any breaking changes. Provide the complete refactored code:\n",
  },
];
