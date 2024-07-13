import { ITrace } from "../trace/type";
import { IChat } from "../type";

export class ILlm {
  // @ts-expect-error
  async chat(chatData: IChat): Promise<any>;
  // @ts-expect-error
  prepareResponse(stream: boolean, trace: ITrace, answer: any): any
}