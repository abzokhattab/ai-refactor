import * as fs from "fs";
import * as path from "path";
import * as child_process from "child_process";

const DEFAULT_INSTALL_DEPENDENCIES_COMMAND = "npm install";
const DEFAULT_RUN_TESTS_COMMAND = "npm run test";

/**
 * Installs project dependencies.
 * @param projectDir - The directory of the project.
 * @param installDependenciesCommand - The command to install dependencies.
 * @returns A promise that resolves when dependencies are installed.
 */
function installDependencies(
  projectDir: string,
  installDependenciesCommand = DEFAULT_INSTALL_DEPENDENCIES_COMMAND
): Promise<void> {
  return new Promise((resolve, reject) => {
    child_process.exec(
      installDependenciesCommand,
      { cwd: projectDir },
      (execErr) => {
        if (execErr) {
          reject(execErr);
        } else {
          resolve();
        }
      }
    );
  });
}

/**
 * Runs tests on the current project to ensure the provided code changes don't break anything.
 * @param code - The new code to be tested.
 * @param filePath - The file path to be replaced temporarily.
 * @param runTestsCommand - The command to run tests.
 * @returns A promise that resolves to null if the tests pass, and an error message if they fail.
 */
export async function runsTestsSuccessfully(
  code: string,
  filePath: string,
  runTestsCommand = DEFAULT_RUN_TESTS_COMMAND,
  installDependenciesCommand = DEFAULT_INSTALL_DEPENDENCIES_COMMAND
): Promise<string | boolean> {
  const projectDir = path.resolve(path.dirname(filePath));
  await installDependencies(projectDir, installDependenciesCommand);
  return new Promise((resolve, reject) => {
    try {
      // Read the current content of the file and keep it in memory
      const originalCode = fs.readFileSync(filePath, "utf-8");

      // Write the new code to the file
      fs.writeFileSync(filePath, code);

      // Run the tests using npm
      child_process.exec(
        runTestsCommand,
        { cwd: projectDir },
        (execErr, stdout, stderr) => {
          // Restore the original code
          fs.writeFileSync(filePath, originalCode);

          if (execErr) {
            // console.log("Tests failed!");
            // Only return the first 300 characters of the error message
            resolve(execErr.toString().substring(0, 300));
          } else {
            // console.log("Tests passed!");
            resolve(true);
          }
        }
      );
    } catch (error) {
      // Handle read or write errors
      reject(error);
    }
  });
}
