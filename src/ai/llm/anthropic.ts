import Anthropic from '@anthropic-ai/sdk';
import { Message, MessageParam, RawMessageStreamEvent } from '@anthropic-ai/sdk/resources/messages.mjs';
import { Stream } from '@anthropic-ai/sdk/streaming.mjs';
import { ILlm } from './type';
import { EMessage_role, IChat, IMessage } from '../type';
import { ITrace } from '../trace/type';

export const LLM_ANTHROPIC = "anthropic"

export class AnthropicLLM implements ILlm {
  protected key: string;
  protected llm: Anthropic | undefined;
  protected defaultModel: string = "claude-3-opus-20240229";

  constructor(key: string | undefined) {
    if (!key) {
      throw new Error('KEY is not defined');
    }

    this.key = key
    this.#initialize()
  }

  #initialize() {
    if (this.llm === undefined) {
      this.llm = new Anthropic({ apiKey: this.key })
    }
  }

  async chat(chatData: IChat): Promise<{ stream: boolean, data: Stream<RawMessageStreamEvent> | Message }> {
    if (!this.llm) throw new Error('LLM is not initialized');
    
    try {
      const answer = await this.llm.messages.create({
        stream: chatData.stream,
        model: chatData.model || this.defaultModel,
        messages: this.#prepareMessage("", chatData.messages.history, chatData.messages.message),
        system: chatData.messages.prompt,
        max_tokens: 1024,
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
      done: false
    };

    if (!stream) {
      response.message = { content: answer.content[0].text }
      response.done = true;

      trace.changeHelper({
        output: answer.content[0].text,
        token: {
          prompt: answer.usage.input_tokens || 0,
          completion: answer.usage.output_tokens || 0
        }
      })
    } else {
      switch (answer.type) {
        case 'message_start':
          trace.changeHelper({
            token: {
              prompt: answer.message.usage.input_tokens || 0,
              completion: answer.message.usage.output_tokens || 0
            }
          })
          break;
        case 'content_block_delta':
          response.message = { content: answer.delta.text }
          actualTrace = trace.changeHelper(undefined)
          trace.changeHelper({
            output: actualTrace.output + answer.delta.text,
          })
          break;
        case 'message_delta':
          actualTrace = trace.changeHelper(undefined)
          trace.changeHelper({
            token: {
              completion: actualTrace.token.completion + answer.usage.output_tokens,
            }
          })
          break;
        case 'message_stop':
          response.done = true;
          break;
        case 'content_block_start' || 'content_block_stop':
          break;
      }
    }

    return response
  }

  #prepareMessage(systemMessage: string, msgs: IMessage[], lastMessage: string): MessageParam[] {
    const result: MessageParam[] = [];

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
        case EMessage_role.SYSTEM || EMessage_role.FUNCTION || EMessage_role.TOOL:
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
