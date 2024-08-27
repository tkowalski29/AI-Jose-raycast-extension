import { v4 as uuidv4 } from "uuid";
import { IAssistant } from "./assistant";
import { ISnippet } from "./snippet";
import { ITalk } from "./talk";

export const ConversationSelectedTypeAssistant = "assistant";
export const ConversationSelectedTypeSnippet = "snippet";

export interface IConversation {
  conversationId: string;
  createdAt: string;
  updatedAt: string;
  summary: string | undefined;
  title: string | undefined;
  responseStream: boolean;
  assistant: string;
  assistantTitle: string;
  assistantAvatar: string;
  device: string | undefined;
  userName: string | undefined;
  selectedType: string;
  selectedAssistant: IAssistant;
  selectedSnippet: ISnippet | undefined;
  cleared: boolean;
  messages: ITalk[];
}

export function NewConversation(
  assistant: IAssistant,
  cleared: boolean,
  userName: string,
  device: string
): IConversation {
  return {
    conversationId: uuidv4(),
    userName: userName,
    device: device,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    summary: undefined,
    title: undefined,
    responseStream: true,
    assistant: assistant.assistantId,
    assistantTitle: assistant.title,
    assistantAvatar: assistant.avatar,
    selectedType: ConversationSelectedTypeAssistant,
    selectedAssistant: assistant,
    selectedSnippet: undefined,
    cleared: cleared,
    messages: [],
  };
}
