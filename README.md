# AI Refactor

**Tool URL on Visual Studio Code Marketplace**: [AI Refactor Extension](https://marketplace.visualstudio.com/items?itemName=AbdelrahmanKhattab.ai-refactor)

AI Refactor is a Visual Studio Code extension designed to enhance developer productivity by providing automated code refactoring capabilities. Leveraging the Gemma-7b-it model, this extension helps developers perform complex code refactorings efficiently while maintaining code integrity through integrated testing.

## Features

- **General Refactoring** : Refactor code without introducing breaking changes.

- **Extract Method** : Extract methods from the code for better modularity.

- **Rename Variables** : Rename variables for improved clarity without breaking the code.

- **Simplify Code** : Simplify code to make it more readable and maintainable.

## Requirements

- Visual Studio Code version 1.90.0 or higher

- Node.js and npm installed on your system

- Connection to the HPI VPN network to query the model inside HPI. The extension requires access to the server hosted within the HPI network, and requests will fail if the user is not connected to the HPI VPN.

## Installation

1. **Clone the repository** :

```sh
git clone https://github.com/yourusername/ai-refactor.git
cd ai-refactor
```

1. **Install dependencies** :

```sh
npm install
```

1. **Build the extension** :

```sh
npm run compile
```

1. **Open the project in Visual Studio Code** :

```sh
code .
```

1. **Run the extension** :

- Press `F5` to open a new VS Code window with the extension loaded.

## Usage

1. **Select a piece of code** : Highlight the code you want to refactor.

2. **Right-click to open the context menu** .

3. **Choose a refactoring command** :

- `General Refactoring`

- `Extract Method`

- `Rename Variables`

- `Simplify Code`

The refactored code will be displayed in a side-by-side view for review. You can apply or discard the changes based on your preference.

## Configuration

You can configure the extension settings in your `settings.json` file or through the VS Code settings UI.

```json
{
  "ai-refactor.generalRefactor.prompt": "Refactor the following code without introducing breaking changes:",
  "ai-refactor.extractMethod.prompt": "Extract methods from the following code without introducing breaking changes:",
  "ai-refactor.renameVariable.prompt": "Rename variables in the following code for better clarity without introducing breaking changes:",
  "ai-refactor.simplifyCode.prompt": "Simplify the following code without introducing breaking changes:",
  "ai-refactor.installDependenciesCommand": "npm install",
  "ai-refactor.runTestsCommand": "npm test",
  "ai-refactor.maxRefactoringAttempts": 5,
  "ai-refactor.disableTestsCheck": false
}
```

### Commands

The extension provides the following commands:

- `ai-refactor.generalRefactor`: General Refactoring

- `ai-refactor.extractMethod`: Extract Method

- `ai-refactor.RenameVariable`: Rename Variables

- `ai-refactor.SimplifyCode`: Simplify Code

these commands are accessible from the context menu in the editor:

### Example

**Context menu:**
![New actions inside the context menu](https://github.com/abzokhattab/ai-refactor/blob/main/media/context-menu.png?raw=true)
**Output:** ![Model output](https://github.com/abzokhattab/ai-refactor/blob/main/media/output.png?raw=true)

### POC Video

<video src="https://github.com/abzokhattab/ai-refactor/blob/main/media/POC.mp4?raw=true" width=180/>

## License

This project is licensed under the MIT License.
