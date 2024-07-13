export interface ITraceHelper {
  output: string,
  token: {
    completion: number,
    prompt: number
  }
}

export const newTraceHelper = (): ITraceHelper => {
  return {
    output: '',
    token: {
      completion: 0,
      prompt: 0
    }
  }
}

export class ITrace {
  // @ts-expect-error
  changeHelper(data: any | undefined)
  // @ts-expect-error
  init(chatData: IChat, tags: string[])
  // @ts-expect-error
  llmStart(chatData: IChat)
  // @ts-expect-error
  llmFinish(completion: any, tPromt: number, tCompletion: number)
  // @ts-expect-error
  end()
}
