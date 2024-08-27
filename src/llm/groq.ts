import Groq from "groq-sdk";
import { Stream } from "groq-sdk/lib/streaming";
import { ChatCompletion, ChatCompletionChunk, ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";
import { ITalk, ITalkDataResult, ITalkQuestion, newTalkDataResult } from "../data/talk";
import { InterfaceLlm } from "../data/llm";
import { ITrace } from "../data/trace";
import { IMessage } from "../data/message";

export const LLM_GROQ = "groq";

export class GroqLLM implements InterfaceLlm {
  protected key: string;
  protected llm: Groq | undefined;
  protected defaultModel: string = "llama3-8b-8192";

  constructor(key: string | undefined) {
    if (!key) {
      throw new Error("Groq setting `API Key` is not defined");
    }

    this.key = key;
    this.#initialize();
  }

  #initialize() {
    if (this.llm === undefined) {
      this.llm = new Groq({ apiKey: this.key });
    }
  }

  async chat(chatData: ITalk): Promise<{ stream: boolean; data: Stream<ChatCompletionChunk> | ChatCompletion }> {
    if (!this.llm) throw new Error("Groq LLM is not initialized");

    try {
      const answer = await this.llm.chat.completions.create({
        stream: chatData.llm.stream,
        model: chatData.llm.object.model || this.defaultModel,
        messages: this.#prepareMessage(
          chatData.conversation.system,
          chatData.conversation.history,
          chatData.conversation.question
        ),
      });

      return {
        stream: chatData.llm.stream,
        data: answer,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prepareResponse(chatData: ITalk, stream: boolean, trace: ITrace, answer: any): ITalkDataResult {
    let actualTrace = trace.changeHelper(undefined);
    const response: ITalkDataResult = newTalkDataResult();
    response.assistant = chatData.assistant.object;

    if (!stream) {
      response.content = answer.choices[0].message.content;
      response.finish = true;

      trace.changeHelper({
        output: answer.choices[0].message,
        token: {
          prompt: answer.usage.prompt_tokens || 0,
          completion: answer.usage.completion_tokens || 0,
        },
      });
    } else {
      response.content = answer.choices[0]?.delta?.content || "";

      if (answer.choices[0]?.finish_reason === "stop") {
        response.finish = true;
        trace.changeHelper({
          token: {
            prompt: answer.x_groq.usage.prompt_tokenss || 0,
            completion: answer.x_groq.usage.completion_tokens || 0,
          },
        });
      }
      actualTrace = trace.changeHelper(undefined);
      trace.changeHelper({
        output: actualTrace.output + (answer.choices[0]?.delta?.content || ""),
      });
    }

    return response;
  }

  #prepareMessage(
    systemMessage: string | undefined,
    msgs: IMessage[],
    lastMessage: ITalkQuestion | undefined
  ): ChatCompletionMessageParam[] {
    const result: ChatCompletionMessageParam[] = [];

    if (systemMessage) {
      result.push({
        role: "system",
        content: systemMessage,
      });
    }

    for (const msg of msgs) {
      if (msg.question.content) {
        result.push({
          role: "user",
          content: msg.question.content,
        });
      }
      if (msg.answer !== undefined && msg.answerContent) {
        result.push({
          role: "assistant",
          content: msg.answerContent,
        });
      }
    }

    if (lastMessage) {
      result.push({
        role: "user",
        content: lastMessage.content,
      });
    }

    return result;
  }
}
