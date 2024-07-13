import { OpenAI } from 'openai';
import { ChatCompletion, ChatCompletionChunk, ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { Stream } from 'openai/streaming.mjs';
import { ITrace } from "../trace/type";
import { ILlm } from "./type";
import { EMessage_role, IChat, IMessage } from "../type";

export const LLM_PERPLEXITY = "perplexity"

export class PerplexityLLM implements ILlm {
  protected key: string;
  protected llm: OpenAI | undefined;
  protected defaultModel: string = "llama-3-sonar-small-32k-online";

  constructor(key: string | undefined) {
    if (!key) {
      throw new Error('KEY is not defined');
    }

    this.key = key
    this.#initialize()
  }

  #initialize() {
    if (this.llm === undefined) {
      this.llm = new OpenAI({ 
        baseURL: 'https://api.perplexity.ai/',
        apiKey: this.key 
      })
    }
  }

  async chat(chatData: IChat): Promise<{ stream: boolean, data: Stream<ChatCompletionChunk> | ChatCompletion }> {
    if (!this.llm) throw new Error('LLM is not initialized');
    
    try {
      const answer = await this.llm.chat.completions.create({
        model: chatData.model || this.defaultModel,
        messages: this.#prepareMessage(chatData.messages.prompt, chatData.messages.history, chatData.messages.message),
        stream: chatData.stream,
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
      response.message = { content: answer.choices[0].message }
      response.done = true;

      trace.changeHelper({
        output: answer.choices[0].message,
        token: {
          prompt: answer.usage.prompt_tokens || 0,
          completion: answer.usage.completion_tokens || 0
        }
      })
    } else {
      response.message = { content: answer.choices[0]?.delta?.content || '' }

      if (answer.choices[0]?.finish_reason === 'stop') {
        response.done = true
      }
      actualTrace = trace.changeHelper(undefined)
      trace.changeHelper({
        output: actualTrace.output + (answer.choices[0]?.delta?.content || ''),
      })
    }

    return response
  }

  #prepareMessage(systemMessage: string, msgs: IMessage[], lastMessage: string): ChatCompletionMessageParam[] {
    const result: ChatCompletionMessageParam[] = [];

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
