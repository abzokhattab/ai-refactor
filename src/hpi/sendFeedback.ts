import { Message } from "../types";
import { queryChat } from "./queryChat";

export async function sendFeedback(
  snippetId: string,
  errorMessage: string
): Promise<string> {
  const messages: Message[] = [{ role: "user", content: errorMessage }];

  return await queryChat(snippetId, messages);
}
