import { CohereClient } from "cohere-ai";
import { Stream } from "cohere-ai/core";
import { Message, NonStreamedChatResponse, StreamedChatResponse } from "cohere-ai/api";
import { ITalk, ITalkDataResult, ITalkQuestion, newTalkDataResult } from "../data/talk";
import { InterfaceLlm } from "../data/llm";
import { ITrace } from "../data/trace";
import { IMessage } from "../data/message";

export const LLM_COHERE = "cohere";

export class CohereLLM implements InterfaceLlm {
  protected key: string;
  protected llm: CohereClient | undefined;
  protected defaultModel: string = "command";

  constructor(key: string | undefined) {
    if (!key) {
      throw new Error("Cohere setting `API Key` is not defined");
    }

    this.key = key;
    this.#initialize();
  }

  #initialize() {
    if (this.llm === undefined) {
      this.llm = new CohereClient({ token: this.key });
    }
  }

  async chat(
    chatData: ITalk
  ): Promise<{ stream: boolean; data: Stream<StreamedChatResponse> | NonStreamedChatResponse }> {
    if (!this.llm) throw new Error("Cohere LLM is not initialized");

    try {
      if (!chatData.llm.stream) {
        const answer = await this.llm.chat({
          model: chatData.llm.object.model || this.defaultModel,
          chatHistory: this.#prepareMessage(undefined, chatData.conversation.history, undefined),
          preamble: chatData.conversation.system,
          message: chatData.conversation.question.content,
        });

        return {
          stream: chatData.llm.stream,
          data: answer,
        };
      } else {
        const answer = await this.llm.chatStream({
          model: chatData.llm.object.model || this.defaultModel,
          chatHistory: this.#prepareMessage(undefined, chatData.conversation.history, undefined),
          preamble: chatData.conversation.system,
          message: chatData.conversation.question.content,
        });

        return {
          stream: chatData.llm.stream,
          data: answer,
        };
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prepareResponse(chatData: ITalk, stream: boolean, trace: ITrace, answer: any): ITalkDataResult {
    const response: ITalkDataResult = newTalkDataResult();
    response.assistant = chatData.assistant.object;

    if (!stream) {
      response.content = answer.text;
      response.finish = true;

      trace.changeHelper({
        output: answer.text,
        token: {
          prompt: answer.meta?.tokens?.inputTokens || 0,
          completion: answer.meta?.tokens?.outputTokens || 0,
        },
      });
    } else {
      switch (answer.eventType) {
        case "stream-start":
          break;
        case "text-generation":
          response.content = answer.text;
          response.finish = answer.is_finished;
          break;
        case "stream-end":
          response.content = answer.response.text;
          response.finish = answer.is_finished;

          trace.changeHelper({
            output: answer.response.text,
            token: {
              prompt: answer.response.meta?.tokens?.inputTokens || 0,
              completion: answer.response.meta?.tokens?.outputTokens || 0,
            },
          });
          break;
      }
    }

    return response;
  }

  #prepareMessage(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    systemMessage: string | undefined,
    msgs: IMessage[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    lastMessage: ITalkQuestion | undefined
  ): Message[] {
    const result: Message[] = [];

    for (const msg of msgs) {
      if (msg.question.content) {
        result.push({
          role: "USER",
          message: msg.question.content,
        });
      }
      if (msg.answer !== undefined && msg.answerContent) {
        result.push({
          role: "CHATBOT",
          message: msg.answerContent,
        });
      }
    }

    return result;
  }
}
