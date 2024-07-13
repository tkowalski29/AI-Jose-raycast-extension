import { CohereClient } from "cohere-ai";
import { Message, NonStreamedChatResponse, StreamedChatResponse } from "cohere-ai/api";
import { ITrace } from "../trace/type";
import { ILlm } from "./type";
import { EMessage_role, IChat, IMessage } from "../type";
import { Stream } from "cohere-ai/core";

export const LLM_COHERE = "cohere"

export class CohereLLM implements ILlm {
  protected key: string;
  protected llm: CohereClient | undefined;
  protected defaultModel: string = "command";

  constructor(key: string | undefined) {
    if (!key) {
      throw new Error('KEY is not defined');
    }

    this.key = key
    this.#initialize()
  }

  #initialize() {
    if (this.llm === undefined) {
      this.llm = new CohereClient({ token: this.key })
    }
  }

  async chat(chatData: IChat): Promise<{ stream: boolean, data: Stream<StreamedChatResponse> | NonStreamedChatResponse }> {
    if (!this.llm) throw new Error('LLM is not initialized');
    
    try {
      if (!chatData.stream) {
        const answer = await this.llm.chat({
          model: chatData.model || this.defaultModel,
          chatHistory: this.#prepareMessage("", chatData.messages.history, ""),
          preamble: chatData.messages.prompt,
          message: chatData.messages.message,
        });

        return {
          stream: chatData.stream,
          data: answer
        }
      } else {
        const answer = await this.llm.chatStream({
          model: chatData.model || this.defaultModel,
          chatHistory: this.#prepareMessage("", chatData.messages.history, ""),
          preamble: chatData.messages.prompt,
          message: chatData.messages.message,
        });

        return {
          stream: chatData.stream,
          data: answer
        }
      }
    } catch (error) {
      throw error;
    }
  }

  prepareResponse(stream: boolean, trace: ITrace, answer: any): any {
    let response = {
      createdAt: new Date().toISOString(),
      message: { content: "" },
      data: answer,
      done: false
    };

    if (!stream) {
      response.message = { content: answer.text }
      response.done = true;

      trace.changeHelper({
        output: answer.text,
        token: {
          prompt: answer.meta?.tokens?.inputTokens || 0,
          completion: answer.meta?.tokens?.outputTokens || 0
        }
      })
    } else {
      switch (answer.eventType) {
        case "stream-start":
          break;
        case "text-generation":
          response.message.content = answer.text;
          response.done = answer.is_finished;
          break;
        case "stream-end":
          response.message.content = answer.response.text;
          response.done = answer.is_finished;

          trace.changeHelper({
            output: answer.response.text,
            token: {
              prompt: answer.response.meta?.tokens?.inputTokens || 0,
              completion: answer.response.meta?.tokens?.outputTokens || 0
            }
          })
          break;
      }
    }

    return response
  }

  #prepareMessage(systemMessage: string, msgs: IMessage[], lastMessage: string): Message[] {
    const result: Message[] = [];

    for (const msg of msgs) {
      switch (msg.role) {
        case EMessage_role.USER:
          result.push({
            role: "USER",
            message: msg.content,
          });
          break;
        case EMessage_role.AI:
          result.push({
            role: "CHATBOT",
            message: msg.content,
          });
          break;
        case EMessage_role.SYSTEM:
          result.push({
            role: "SYSTEM",
            message: msg.content,
          });
          break;
        case EMessage_role.FUNCTION || EMessage_role.TOOL:
          continue
          break;
      }
    }

    return result;
  }
}
