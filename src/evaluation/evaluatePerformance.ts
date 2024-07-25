import { extractCodeBlocks } from "../hpi/extractCodeBlock";
import { queryChat } from "../hpi/queryChat";
import { sendFeedback as sendFeedbackHpi } from "../hpi/sendFeedback";
import { refactorWithOpenAI } from "../openAI/refactorWithOpenAI";
import { sendFeedback as sendFeedbackOpenAI } from "../openAI/sendFeedback";
import * as fs from "fs/promises"; // Using fs.promises for async/await support
import { runsTestsSuccessfully } from "../testRunner";
import { ChatOutput, EvaluationResult, Message } from "../types";

async function saveToFile(
  filePath: string,
  newData: ChatOutput
): Promise<void> {
  try {
    let existingData: ChatOutput = { correct: [], failed: [] };

    try {
      const data = await fs.readFile(filePath, "utf-8");
      existingData = JSON.parse(data);
    } catch (err: any) {
      if (err.code !== "ENOENT") throw err;
    }

    const updatedData = {
      correct: [...existingData.correct, ...newData.correct],
      failed: [...existingData.failed, ...newData.failed],
    };

    await fs.writeFile(filePath, JSON.stringify(updatedData, null, 2));
  } catch (err) {
    console.error("Error saving to file:", err);
    throw err;
  }
}

async function evaluatePerformance(
  snippetId: string,
  messages: Message[],
  model: "hpi" | "openai",
  filePath: string,
  type: string
): Promise<EvaluationResult> {
  const result: EvaluationResult = { correct: 0, failed: 0 };
  const chatOutputs: ChatOutput = { correct: [], failed: [] };
  let attempts = 0;
  const maxAttempts = 1;

  const getModelResponse = async () => {
    return model === "hpi"
      ? await queryChat(snippetId, messages)
      : await refactorWithOpenAI(messages);
  };

  const getFeedbackResponse = async (testError: string, response: string) => {
    const errorPrompt = `The suggested changes code broke project tests, please try again and return the complete code, here is the error message: ${testError}`;
    return model === "hpi"
      ? await sendFeedbackHpi(snippetId, errorPrompt)
      : await sendFeedbackOpenAI(messages, response, errorPrompt);
  };

  const processResponse = async (response: string) => {
    const extractedBlocks = extractCodeBlocks(response);
    if (!extractedBlocks) {
      result.failed += 1;
      attempts += 1;
      chatOutputs.failed.push([
        ...messages,
        {
          role: model,
          content: "Code changes cannot be extracted from the response",
        },
      ]);

      return null;
    }
    return await runsTestsSuccessfully(extractedBlocks, filePath);
  };

  const initialResponse = await getModelResponse();
  let response = initialResponse;
  messages.push({
    role: model === "openai" ? "assistant" : "model",
    content: response,
  });

  let isPassed = false;
  while (attempts < maxAttempts) {
    const testError = await processResponse(response);

    if (testError === true) {
      result.correct += 1;
      chatOutputs.correct.push([...messages]);
      isPassed = true;
      break;
    } else if (testError === null) {
      break;
    } else {
      result.failed += 1;
      attempts += 1;
      messages.push({ role: "user", content: testError as string });
      const feedbackResponse = await getFeedbackResponse(
        testError as string,
        response
      );
      response = feedbackResponse;
    }
  }

  if (!isPassed) {
    chatOutputs.failed.push([...messages]);
  }

  await saveToFile(
    `./src/evaluation/output/${model}_${type}_evaluate.json`,
    chatOutputs
  );

  return result;
}

export { evaluatePerformance };
