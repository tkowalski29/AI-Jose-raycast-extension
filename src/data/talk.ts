import { v4 as uuidv4 } from "uuid";
import { ReplacePlaceholders } from "../common/clear";
import { AssistantDefaultTemperature, IAssistant } from "./assistant";
import { ConversationSelectedTypeAssistant, ConversationSelectedTypeSnippet, IConversation } from "./conversation";
import { ILlm } from "./llm";
import { IMessage } from "./message";
import { ISnippet, SnippetDefaultTemperature } from "./snippet";

export interface ITalk {
  id: string;
  llm: {
    key: string;
    object: ILlm;
    temperature: string | undefined;
    stream: boolean;
    outputFormat: string;
  };
  user: {
    id: string;
    name: string;
    email: string | undefined;
  };
  device: {
    name: string;
  };
  conversation: {
    id: string;
    type: string;
    system: string | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    schema: any | undefined;
    question: ITalkQuestion;
    history: IMessage[];
  };
  assistant: {
    id: string;
    object: IAssistant;
  };
  snippet: {
    id: string | undefined;
    object: ISnippet | undefined;
  };
  createdAt: string;
  result: ITalkDataResult | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any | undefined;
}

export interface ITalkQuestion {
  content: string;
  files: ITalkQuestionFile[] | undefined;
}

export interface ITalkQuestionFile {
  type: string;
  path: string | undefined;
  base64: string | undefined;
  url: string | undefined;
}

export interface ITalkDataResult {
  content: string;
  finish: boolean;
  createdAt: string;
  assistant: IAssistant | undefined;
  image:
    | {
        exist: boolean;
        url: string[] | undefined;
      }
    | undefined;
  action:
    | {
        type: string;
        name: string;
        status: string;
      }
    | undefined;
  funcCall: ITalkDataFunctionCall | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  funcCallArguments: any | undefined;
}

export interface ITalkDataFunctionCall {
  name: string;
  arguments: boolean;
}

export const initData = (d: ITalk): ITalk => {
  let promptString = d.assistant.object.promptSystem;
  d.llm.temperature = d.assistant.object.modelTemperature || AssistantDefaultTemperature;
  if (d.snippet.object?.promptSystem && d.conversation.type === ConversationSelectedTypeSnippet) {
    promptString = d.snippet.object.promptSystem;
    d.llm.temperature = d.snippet.object.modelTemperature || SnippetDefaultTemperature;
  }
  d.conversation.system = ReplacePlaceholders(d, promptString);

  return d;
};

export const newTalkDataResult = (): ITalkDataResult => {
  return {
    content: "",
    finish: false,
    createdAt: new Date().toISOString(),
    assistant: undefined,
    image: undefined,
    action: undefined,
    funcCall: undefined,
    funcCallArguments: undefined,
  };
};

export function NewTalk(
  question: ITalkQuestion,
  conversation: IConversation,
  llm: ILlm,
  assistant: IAssistant,
  snippet: ISnippet | undefined,
  userName: string,
  device: string
): ITalk {
  const history: IMessage[] = [];
  for (const c of conversation.messages) {
    history.push(...c.conversation.history);
  }

  return {
    id: uuidv4(),
    llm: {
      key: llm.key,
      object: llm,
      temperature: undefined,
      stream: false,
      outputFormat: "stream",
    },
    user: {
      id: userName,
      name: device,
      email: undefined,
    },
    device: {
      name: device,
    },
    conversation: {
      id: conversation.conversationId,
      type: ConversationSelectedTypeAssistant,
      system: undefined,
      schema: undefined,
      question: question,
      history: history,
    },
    assistant: {
      id: assistant.assistantId,
      object: assistant,
    },
    snippet: {
      id: snippet?.snippetId || undefined,
      object: snippet,
    },
    createdAt: new Date().toISOString(),
    result: undefined,
    context: undefined,
  };
}
