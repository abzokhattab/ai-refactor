export interface Message {
  role: string;
  content: string;
}

export interface EvaluationResult {
  correct: number;
  failed: number;
}

export interface ChatOutput {
  correct: Message[][];
  failed: Message[][];
}
