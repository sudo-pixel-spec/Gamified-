export interface AIResponse {
    content: string;
    tokenCount?: number;
}
export type ChatMessage = {
    role: "system" | "user" | "assistant";
    content: string;
};
export interface AIProvider {
    chat(messages: ChatMessage[]): Promise<AIResponse>;
}
export declare class MockAIProvider implements AIProvider {
    chat(messages: ChatMessage[]): Promise<AIResponse>;
}
export declare const aiProvider: AIProvider;