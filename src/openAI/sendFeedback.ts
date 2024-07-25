import { Message } from "../types";
import { refactorWithOpenAI } from "./refactorWithOpenAI";

export async function sendFeedback(
  messages: Message[],
  lastReponse: string,
  errorMessage: string
): Promise<string> {
  const chat: Message[] = [
    ...messages,
    { role: "assistant", content: lastReponse },
    { role: "user", content: errorMessage },
  ];

  return await refactorWithOpenAI(chat);
}
