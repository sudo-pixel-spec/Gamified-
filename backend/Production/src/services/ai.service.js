"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiProvider = exports.MockAIProvider = void 0;
const openai_1 = __importDefault(require("openai"));
class MockAIProvider {
    async chat(messages) {
        return {
            content: "This is a mock AI response based on the lesson context.",
            tokenCount: 20,
        };
    }
}
exports.MockAIProvider = MockAIProvider;
class OpenAIProvider {
    client;
    constructor() {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY is not set");
        }
        this.client = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    async chat(messages) {
        const completion = await this.client.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
        });
        const response = {
            content: completion.choices?.[0]?.message?.content ?? "",
        };
        if (completion.usage?.total_tokens != null) {
            response.tokenCount = completion.usage.total_tokens;
        }
        return response;
    }
}
exports.aiProvider = process.env.NODE_ENV === "test"
    ? new MockAIProvider()
    : new OpenAIProvider();