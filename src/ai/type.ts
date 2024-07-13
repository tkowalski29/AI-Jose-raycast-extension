export interface IChat {
  id: string
  user: {
    id: string
  };
  llm: string
  model: string
  stream: boolean
  messages: {
    prompt: string
    message: string
    history: IMessage[]
  };
}

export enum EMessage_role {
  USER = 'user',
  AI = 'ai',
  SYSTEM = 'system',
  FUNCTION = 'function',
  TOOL = 'tool'
}

export interface IMessage {
  role: EMessage_role
  content: string
  functions?: any[]
  functionCall?: {
    name: string
    arguments: any
  }
}