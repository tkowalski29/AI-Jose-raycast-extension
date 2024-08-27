import fetch from "node-fetch";
// @ts-expect-error ignore
globalThis.fetch = fetch;
import { ITalk, ITalkDataResult, ITalkQuestion, newTalkDataResult } from "../data/talk";
import { InterfaceLlm } from "../data/llm";
import { ITrace } from "../data/trace";
import { IMessage } from "../data/message";

export const LLM_API = "api";

export class ApiLLM implements InterfaceLlm {
  async chat(chatData: ITalk): Promise<{ stream: boolean; data: ITalkDataResult }> {
    try {
      console.log(`${LLM_API} - request`);
      if (chatData.llm.object.fileDownloadUrl === undefined) {
        return {
          stream: chatData.llm.stream,
          data: newTalkDataResult(),
        };
      }
      const response = await fetch(chatData.llm.object.fileDownloadUrl, {
        method: "POST",
        body: JSON.stringify(chatData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
      }
      console.log(`${LLM_API} - response`);
      const rsp = await response.json();

      if (rsp.error) {
        throw new Error(`HTTP error! Message: ${rsp.error}`);
      }

      const output: ITalk = rsp;
      if (output.result === undefined) {
        return {
          stream: chatData.llm.stream,
          data: newTalkDataResult(),
        };
      }
      const out: ITalkDataResult = output.result;

      console.log(`${LLM_API} - result`);
      return {
        stream: chatData.llm.stream,
        data: out,
      };
    } catch (error) {
      console.log(`${LLM_API} - An error occurred: ${error}`);
      throw error;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prepareResponse(chatData: ITalk, stream: boolean, trace: ITrace, answer: any): ITalkDataResult {
    const a: ITalkDataResult = answer;
    let response: ITalkDataResult = newTalkDataResult();

    if (!stream) {
      response = a;

      trace.changeHelper({
        output: a.content,
        token: {
          prompt: 0,
          completion: 0,
        },
      });
    } else {
      response = a;

      trace.changeHelper({
        output: a.content,
        token: {
          prompt: 0,
          completion: 0,
        },
      });
    }

    return response;
  }

  #prepareMessage(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    systemMessage: string | undefined,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    msgs: IMessage[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    lastMessage: ITalkQuestion | undefined
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any[] {
    return [];
  }
}
