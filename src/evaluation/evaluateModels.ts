import fs from "fs";
import path from "path";
import { REFACTOR_TYPES } from "../constants";
import { Message } from "../types";
import { generateSnippetId, getIndices } from "../utils";
import { chiSquareTest, getPValue } from "./chiSquareTest";
import { evaluatePerformance } from "./evaluatePerformance";

const projectPath = "/Users/abdul/uni/try-exension/date-fns/src";

/*
  This script evaluates the performance of the refactoring tools on files from the date-fns project.
  The script first generates buckets of files based on their line count, then for each bucket, it selects 20 files 
  and evaluates the performance of the refactoring tools on the files in the bucket.
  The script uses the chi-square test to compare the performance of the tools across the buckets.
*/
function generateBuckets(min: number, max: number, numBuckets: number) {
  const buckets = [];
  const logMin = Math.log(min);
  const logMax = Math.log(max);
  const step = (logMax - logMin) / numBuckets;

  for (let i = 0; i < numBuckets; i++) {
    const bucketMin = Math.exp(logMin + i * step);
    const bucketMax = Math.exp(logMin + (i + 1) * step);
    buckets.push({ min: Math.floor(bucketMin), max: Math.ceil(bucketMax) });
  }

  return buckets;
}

const lineBuckets = generateBuckets(10, 250, 3);
console.log(lineBuckets);

async function getTSFilesFromDir(
  dirPath: string,
  minLines: number,
  maxLines: number
): Promise<string[]> {
  const files: string[] = [];

  async function processDir(currentPath: string) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        await processDir(fullPath);
      } else if (
        entry.isFile() &&
        /\.(ts|js)$/.test(entry.name) &&
        !entry.name.includes("test")
      ) {
        const fileContent = fs.readFileSync(fullPath, "utf-8");
        const fileLines = fileContent.split("\n").length;
        if (fileLines >= minLines && fileLines <= maxLines) {
          files.push(fullPath);
        }
      }
    }
  }

  await processDir(dirPath);
  return files;
}

async function evaluatePerformanceOnRepoFiles(dirPath: string) {
  for (const { type, prompt } of REFACTOR_TYPES) {
    const results: Record<string, number[]>[] = Array.from(
      { length: 2 },
      () => ({
        bucket1: [0, 0],
        bucket2: [0, 0],
        bucket3: [0, 0],
      })
    );

    for (const [i, { min, max }] of lineBuckets.entries()) {
      const tsFiles = await getTSFilesFromDir(dirPath, min, max);

      console.log(
        `Evaluating files with ${min}-${max} lines for ${type}, ${tsFiles.length} files were found:, only 20 files will be evaluated`
      );
      const testFilesIndices = getIndices(tsFiles.length, 30);

      for (const index of testFilesIndices) {
        const filePath = tsFiles[index];
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const snippetId = generateSnippetId();

        const messages: Message[] = [
          {
            role: "user",
            content: `${prompt}${fileContent}`,
          },
        ];

        const openAIRefactor = await evaluatePerformance(
          snippetId,
          [...messages],
          "openai",
          filePath,
          type
        );

        const toolRefactor = await evaluatePerformance(
          snippetId,
          [...messages],
          "hpi",
          filePath,
          type
        );

        results[0][`bucket${i + 1}`][0] += openAIRefactor.correct;
        results[0][`bucket${i + 1}`][1] += openAIRefactor.failed;
        results[1][`bucket${i + 1}`][0] += toolRefactor.correct;
        results[1][`bucket${i + 1}`][1] += toolRefactor.failed;

        console.log(
          `File: ${filePath}\n`,
          `${type} HPI: ${toolRefactor.correct} correct, ${toolRefactor.failed} failed\n`,
          `${type} OpenAI: ${openAIRefactor.correct} correct, ${openAIRefactor.failed} failed\n`
        );
      }
    }

    const chiSquare = chiSquareTest(results[0], results[1]);
    const pValue = getPValue(chiSquare, lineBuckets.length - 1);

    console.log(`Results for ${type}: `, results);
    console.log(`Chi-Square Statistic for ${type}: ${chiSquare}`);
    console.log(`P-Value for ${type}: ${pValue}`);

    // save the results and test in a file per type
    const data = {
      result: results,
      chiSquare,
      pValue,
    };
    fs.writeFileSync(
      path.join(__dirname, `../evaluation/data/${type}_results.json`),
      JSON.stringify(data)
    );
  }
}

(async () => {
  await evaluatePerformanceOnRepoFiles(projectPath);
})();
