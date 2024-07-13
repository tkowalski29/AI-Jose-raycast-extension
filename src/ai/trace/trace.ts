import { LangFuseTrace } from './langfuse';
import { LunaryTrace } from './lunary';
import { IChat } from '../type';
import { ITrace, ITraceHelper, newTraceHelper } from './type';

export const TRACE_LANGFUSE = "langfuse"

export class Trace implements ITrace {
  protected langFuseTrace: LangFuseTrace | undefined;
  protected lunaryTrace: LunaryTrace | undefined;
  protected traceHelperObject: ITraceHelper = newTraceHelper();

  constructor(langFuse: LangFuseTrace | undefined, lunary: LunaryTrace | undefined) {
    if (langFuse) {
      this.langFuseTrace = langFuse
    }
    if (lunary) {
      this.lunaryTrace = lunary
    }
  }

  changeHelper(data: any | undefined) {
    if (data !== undefined) {
      this.traceHelperObject = Object.assign(this.traceHelperObject, data);

      if (this.langFuseTrace) {
        this.langFuseTrace.changeHelper(this.traceHelperObject);
      }
      if (this.lunaryTrace) {
        this.lunaryTrace.changeHelper(this.traceHelperObject);
      }
    }

    return this.traceHelperObject
  }

  init(chatData: IChat, tags: string[]) {
    if (this.langFuseTrace) {
      this.langFuseTrace.init(chatData, tags)
    }
    if (this.lunaryTrace) {
      this.lunaryTrace.init(chatData, tags)
    }
  }

  llmStart(chatData: IChat) {
    if (this.langFuseTrace) {
      this.langFuseTrace.llmStart(chatData)
    }
    if (this.lunaryTrace) {
      this.lunaryTrace.llmStart(chatData)
    }
  }

  llmFinish(chatData: IChat) {
    if (this.langFuseTrace) {
      this.langFuseTrace.llmFinish()
    }
    if (this.lunaryTrace) {
      this.lunaryTrace.llmFinish()
    }
  }

  end() {
    if (this.langFuseTrace) {
      this.langFuseTrace.end()
    }
    if (this.lunaryTrace) {
      this.lunaryTrace.end()
    }
  }
}
