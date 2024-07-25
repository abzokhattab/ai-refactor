import axios from "axios";
import { Message } from "../types";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is missing");
}

export async function refactorWithOpenAI(messages: Message[]): Promise<string> {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${OPENAI_API_KEY}`,
  };

  const response = await axios.post(
    OPENAI_URL,
    {
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    },
    { headers }
  );

  return response.data?.choices?.[0]?.message?.content;
}
