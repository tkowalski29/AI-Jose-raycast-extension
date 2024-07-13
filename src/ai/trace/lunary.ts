import { Monitor as Lunary } from "lunary";
import { IChat } from '../type';
import { ITrace, ITraceHelper, newTraceHelper } from './type';

export const TRACE_LUNARY = "lunary"

export class LunaryTrace implements ITrace {
  protected key: string;
  protected trace: Lunary | undefined;
  protected traceHelperObject: ITraceHelper = newTraceHelper();

  constructor(key: string | undefined) {
    if (!key) {
      throw new Error('KEY is not defined');
    }

    this.key = key
    this.#initialize()
  }

  #initialize() {
    if (this.trace === undefined) {
      const t = new Lunary()
      t.init({ appId: process.env.LUNARY_PUBLIC_KEY })

      this.trace = t
    }
  }

  changeHelper(data: ITraceHelper) {
    this.traceHelperObject = data
  }

  init(chatData: IChat, tags: string[]) {
    if (!this.trace) throw new Error('TRACE is not initialized');

    let obj = {
      runId: chatData.id,
      userId: chatData.user.id,
      name: chatData.model,
      input: chatData.messages.history,
    }
    if (tags !== undefined) {
      // @ts-expect-error
      obj.tags = tags
    }

    this.trace.trackEvent('llm', 'start', obj)
  }

  llmStart(chatData: IChat) {
    if (!this.trace) throw new Error('TRACE is not initialized');

    this.trace.trackEvent('llm', 'end', {
      runId: chatData.id,
    })
  }

  llmFinish() {
    if (!this.trace) throw new Error('TRACE is not initialized');

    this.trace.trackEvent('llm', 'end', {
      output: {
        role: 'ai',
        text: this.traceHelperObject.output,
      },
      tokensUsage: {
        completion: this.traceHelperObject.token.completion,
        prompt: this.traceHelperObject.token.prompt,
      }
    })
  }

  end() {
    if (!this.trace) throw new Error('TRACE is not initialized');
  }
}
