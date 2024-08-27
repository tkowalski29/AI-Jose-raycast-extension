import { ITalk, ITalkDataResult } from "./talk";
import { ITrace } from "./trace";

export interface ILlm {
  key: string;
  title: string;
  company: string;
  model: string;
  trainingDataTo: string | undefined;
  tokens:
    | {
        contextWindow: string | undefined;
        maxOutput: string | undefined;
      }
    | undefined;
  isLocal: boolean;
  apiKeyOrUrl: string | undefined;
  useLocalOrEnv: string | undefined;
  fileDownloadUrl: string | undefined;
  fileDownloadName: string | undefined;
}

export class InterfaceLlm {
  // @ts-expect-error ignore
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async chat(chatData: ITalk): Promise<any>;
  // @ts-expect-error ignore
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prepareResponse(chatData: ITalk, stream: boolean, trace: ITrace, answer: any): ITalkDataResult;
}
