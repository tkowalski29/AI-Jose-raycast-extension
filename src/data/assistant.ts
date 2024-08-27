export const AssistantDefaultTemperature = "0.7";

export interface IAssistant {
  typeCommunication: string;
  assistantId: string;
  title: string;
  description: string;
  emoji: string;
  avatar: string;
  model: string;
  modelTemperature: string;
  promptSystem: string;
  webhookUrl: string | undefined;
  additionalData: string | undefined;
  snippet: string[] | undefined;
  isLocal: boolean;
  llm: string | undefined;
}
