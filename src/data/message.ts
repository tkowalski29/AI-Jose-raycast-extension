import { IFunction } from "./function";
import { ITalkDataResult, ITalkQuestion } from "./talk";

export enum EMessage_role {
  USER = "user",
  AI = "ai",
  SYSTEM = "system",
  FUNCTION = "function",
  TOOL = "tool",
}

export interface IMessage {
  messageId: string;
  createdAt: string;
  updatedAt: string | undefined;
  question: ITalkQuestion;
  answer: ITalkDataResult | undefined;
  conversation: string;
  answerContent: string | undefined;
  functionDefinition: IFunction | undefined;
}
