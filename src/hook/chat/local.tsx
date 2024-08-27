import { Toast } from "@raycast/api";
import { Trace } from "../../trace/trace";
import { LangFuseTrace } from "../../trace/langfuse";
import { LunaryTrace } from "../../trace/lunary";
import { AnthropicLLM, LLM_ANTHROPIC } from "../../llm/anthropic";
import { CohereLLM, LLM_COHERE } from "../../llm/cohere";
import { GroqLLM, LLM_GROQ } from "../../llm/groq";
import { LLM_OLLAMA, OllamaLLM } from "../../llm/ollama";
import { LLM_OPENAI, OpenaiLLM } from "../../llm/openai";
import { LLM_PERPLEXITY, PerplexityLLM } from "../../llm/perplexity";
import { LLM_BINARY, BinaryLLM } from "../../llm/binary";
import { initData, ITalk, newTalkDataResult } from "../../data/talk";
import { InterfaceLlm } from "../../data/llm";
import {
  ConfigAnthropic,
  ConfigCohere,
  ConfigGroq,
  ConfigLangfuse,
  ConfigLunary,
  ConfigOllama,
  ConfigOpenai,
  ConfigPerplexity,
} from "../../helper/config";

export async function RunLocal(
  chatData: ITalk,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interaction: { toast: Toast; setData: any; setStreamData: any; setLoading: any }
): Promise<ITalk | undefined> {
  chatData = initData(chatData);
  chatData.llm.stream = true;

  let langFuseTrace = undefined;
  let lunaryTrace = undefined;
  if (ConfigLangfuse().enable) {
    langFuseTrace = new LangFuseTrace(ConfigLangfuse().secret, ConfigLangfuse().public, ConfigLangfuse().url);
  }
  if (ConfigLunary().enable) {
    lunaryTrace = new LunaryTrace(ConfigLunary().key);
  }

  // eslint-disable-next-line no-useless-catch
  try {
    const trace = new Trace();
    trace.init(langFuseTrace, lunaryTrace);
    trace.start(chatData, [`llm:${chatData.llm.object.company}`, `stream:${chatData.llm.stream}`]);
    let llm: InterfaceLlm | undefined = undefined;

    trace.llmStart(chatData);
    switch (chatData.llm.object.company) {
      case LLM_ANTHROPIC:
        llm = new AnthropicLLM(
          chatData.llm.object?.useLocalOrEnv === "local" ? chatData.llm.object?.apiKeyOrUrl : ConfigAnthropic().apiKey
        );
        break;
      case LLM_BINARY:
        chatData.llm.stream = false;

        llm = new BinaryLLM();
        break;
      case LLM_COHERE:
        llm = new CohereLLM(
          chatData.llm.object?.useLocalOrEnv === "local" ? chatData.llm.object?.apiKeyOrUrl : ConfigCohere().apiKey
        );
        break;
      case LLM_GROQ:
        llm = new GroqLLM(
          chatData.llm.object?.useLocalOrEnv === "local" ? chatData.llm.object?.apiKeyOrUrl : ConfigGroq().apiKey
        );
        break;
      case LLM_OLLAMA:
        chatData.llm.stream = false;
        llm = new OllamaLLM(
          chatData.llm.object?.useLocalOrEnv === "local" ? chatData.llm.object?.apiKeyOrUrl : ConfigOllama().url
        );
        break;
      case LLM_OPENAI:
        llm = new OpenaiLLM(
          chatData.llm.object?.useLocalOrEnv === "local" ? chatData.llm.object?.apiKeyOrUrl : ConfigOpenai().apiKey
        );
        break;
      case LLM_PERPLEXITY:
        llm = new PerplexityLLM(
          chatData.llm.object?.useLocalOrEnv === "local" ? chatData.llm.object?.apiKeyOrUrl : ConfigPerplexity().apiKey
        );
        break;
    }

    if (llm === undefined) {
      throw new Error("Unknown llm: " + chatData.llm.object.company);
      return;
    }

    const answer = await llm.chat(chatData);

    if (!answer.stream) {
      const r = llm.prepareResponse(chatData, answer.stream, trace, answer.data);

      if (chatData.result === undefined) {
        chatData.result = newTalkDataResult();
      }
      chatData.result = r;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      interaction.setData((prev: any) => {
        return prev.map((a: ITalk) => {
          if (a.id === chatData.id) {
            return chatData;
          }
          return a;
        });
      });

      setTimeout(async () => {
        interaction.setStreamData(undefined);
      }, 5);
      interaction.setLoading(false);

      interaction.toast.title = "Got your answer!";
      interaction.toast.style = Toast.Style.Success;
    } else {
      for await (const chunk of answer.data) {
        const r = llm.prepareResponse(chatData, answer.stream, trace, chunk);

        if (r.finish) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          interaction.setData((prev: any) => {
            return prev.map((a: ITalk) => {
              if (a.id === chatData.id) {
                return chatData;
              }
              return a;
            });
          });

          setTimeout(async () => {
            interaction.setStreamData(undefined);
          }, 5);

          interaction.setLoading(false);

          interaction.toast.title = "Got your answer!";
          interaction.toast.style = Toast.Style.Success;
          return chatData;
        }
        if (chatData.result === undefined) {
          chatData.result = newTalkDataResult();
        }
        chatData.result.content += r.content;

        interaction.setStreamData({ ...chatData });
      }
    }

    trace.finish();
    return chatData;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw error;
  }
}
