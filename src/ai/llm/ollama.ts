import { Ollama, Message, ChatResponse } from "ollama";
import { AbortableAsyncIterator } from "ollama/src/utils.js";
import { ITrace } from "../trace/type";
import { ILlm } from "./type";
import { EMessage_role, IChat, IMessage } from "../type";

export const LLM_OLLAMA = "ollama"

export class OllamaLLM implements ILlm {
  protected host: string;
  protected llm: Ollama | undefined;
  protected defaultModel: string = "llama3";

  constructor(host: string | undefined) {
    if (!host) {
      throw new Error('HOST is not defined');
    }

    this.host = host
    this.#initialize()
  }

  #initialize() {
    if (this.llm === undefined) {
      this.llm = new Ollama({ host: this.host })
    }
  }

  async chat(chatData: IChat): Promise<{ stream: boolean, data: AbortableAsyncIterator<ChatResponse> | ChatResponse }> {
    if (!this.llm) throw new Error('LLM is not initialized');
    
    try {
      const answer = await this.llm.chat({
        // @ts-expect-error
        stream: chatData.stream,
        model: chatData.model || this.defaultModel,
        messages: this.#prepareMessage(chatData.messages.prompt, chatData.messages.history, chatData.messages.message),
      });

      return {
        stream: chatData.stream,
        data: answer
      }
    } catch (error) {
      throw error;
    }
  }

  prepareResponse(stream: boolean, trace: ITrace, answer: any): any {
    let actualTrace = trace.changeHelper(undefined)
    let response = {
      createdAt: new Date().toISOString(),
      message: { content: "" },
      data: answer,
      trace: trace,
      done: false
    };

    if (!stream) {
      response.message = { content: answer.message.content }
      response.done = true;

      trace.changeHelper({
        output: answer.message.content,
        token: {
          prompt: answer.prompt_eval_count || 0,
          completion: answer.eval_count || 0
        }
      })
    } else {
      response.message = { content: answer.message.content || '' }

      if (answer.done) {
        response.done = true
        trace.changeHelper({
          token: {
            prompt: answer.eval_count || 0,
            completion: answer.prompt_eval_count || 0
          }
        })
      }
      actualTrace = trace.changeHelper(undefined)
      trace.changeHelper({
        output: actualTrace.output + (answer.message.content || ''),
      })
    }

    return response
  }

  #prepareMessage(systemMessage: string, msgs: IMessage[], lastMessage: string): Message[] {
    const result: Message[] = [];

    result.push({
      role: "system",
      content: systemMessage,
    });

    for (const msg of msgs) {
      switch (msg.role) {
        case EMessage_role.USER:
          result.push({
            role: "user",
            content: msg.content,
          });
          break;
        case EMessage_role.AI:
          result.push({
            role: "assistant",
            content: msg.content,
          });
          break;
        case EMessage_role.SYSTEM:
          result.push({
            role: "system",
            content: msg.content,
          });
          break;
        case EMessage_role.FUNCTION || EMessage_role.TOOL:
          continue
          break;
      }
    }

    result.push({
      role: "user",
      content: lastMessage,
    });

    return result;
  }
}
