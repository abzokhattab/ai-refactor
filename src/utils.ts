import { uuid } from "uuidv4";

export function generateSnippetId(): string {
  return uuid();
}

export function getIndices(length: number, limit: number): number[] {
  if (limit >= length) {
    return Array.from({ length: limit + 1 }, (_, i) => i);
  }

  const indices = [];
  for (let i = 0; i < limit; i++) {
    for (let j = 0; j < length / limit; j++) {
      const index = i + j * limit;
      if (index < length) {
        indices.push(index);
      }
    }
  }
  return indices.slice(0, limit);
}

export function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
    "`": "&#x60;",
    "=": "&#x3D;",
  };
  return text.replace(/[&<>"'`=]/g, function (m) {
    return map[m];
  });
}
