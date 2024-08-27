import { IAssistant } from "../data/assistant";
import { IConversation } from "../data/conversation";
import { ILlm } from "../data/llm";
import { ISnippet } from "../data/snippet";
import { ITalk } from "../data/talk";

export type HookAssistant = {
  data: IAssistant[];
  isLoading: boolean;
  add: (arg: IAssistant) => Promise<void>;
  update: (arg: IAssistant) => Promise<void>;
  remove: (arg: IAssistant) => Promise<void>;
  clear: () => Promise<void>;
  reload: () => Promise<void>;
};

export type HookConversation = {
  data: IConversation[];
  isLoading: boolean;
  add: (arg: IConversation) => Promise<void>;
  update: (arg: IConversation) => Promise<void>;
  remove: (arg: IConversation) => Promise<void>;
  clear: () => Promise<void>;
};

export type HookLlm = {
  data: ILlm[];
  isLoading: boolean;
  add: (arg: ILlm) => Promise<void>;
  update: (arg: ILlm) => Promise<void>;
  remove: (arg: ILlm) => Promise<void>;
  clear: () => Promise<void>;
  reload: () => Promise<void>;
};

export type HookOnboarding = {
  data: boolean;
  isLoading: boolean;
  finish: () => Promise<void>;
};

export type HookSnippet = {
  data: ISnippet[];
  isLoading: boolean;
  add: (arg: ISnippet) => Promise<void>;
  update: (arg: ISnippet) => Promise<void>;
  remove: (arg: ISnippet) => Promise<void>;
  clear: () => Promise<void>;
  reload: () => Promise<void>;
};

export interface HookTalk {
  data: ITalk[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setData: any;
  isLoading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setLoading: any;
  selectedChatId: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setSelectedChatId: any;
  ask: (arg_1: string, arg_2: string[] | undefined, arg_3: IConversation) => Promise<void>;
  clear: () => Promise<void>;
  streamData: ITalk | undefined;
}

export interface HookQuestionTalk {
  data: string;
  isLoading: boolean;
  update: (arg: string) => Promise<void>;
}
