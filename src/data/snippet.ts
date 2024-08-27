export const SnippetDefaultTemperature = "0.7";

export interface ISnippet {
  typeCommunication: string;
  snippetId: string;
  title: string;
  description: string | undefined;
  category: string;
  emoji: string;
  model: string;
  modelTemperature: string;
  promptSystem: string | undefined;
  webhookUrl: string | undefined;
  isLocal: boolean;
  tag: [] | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: any | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  postSchema: any | undefined;
}

export function NewSnippet(): undefined {
  return undefined;
}
