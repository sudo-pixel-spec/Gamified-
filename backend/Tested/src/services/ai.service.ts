export interface AIResponse {
  content: string;
  tokenCount?: number;
}

export interface AIProvider {
  chat(messages: { role: string; content: string }[]): Promise<AIResponse>;
}

export class MockAIProvider implements AIProvider {
  async chat(messages: { role: string; content: string }[]): Promise<AIResponse> {
    return {
      content: "This is a mock AI response based on the lesson context.",
      tokenCount: 20
    };
  }
}

export const aiProvider: AIProvider = new MockAIProvider();
