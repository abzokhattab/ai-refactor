import axios from "axios";

const SERVER_URL = "http://delos.eaalab.hpi.uni-potsdam.de/chat";

export async function queryChat(
  snippetId: string,
  messages: any[]
): Promise<any> {
  const res = await axios.post(SERVER_URL, {
    snippet_id: snippetId,
    messages: messages,
  });

  return res.data?.response;
}
