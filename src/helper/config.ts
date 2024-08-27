import { getPreferenceValues } from "@raycast/api";
import { IAnthropicConfig } from "../data/anthropic/config";
import { ICohereConfig } from "../data/cohere/config";
import { IGroqConfig } from "../data/groq/config";
import { IOllamaConfig } from "../data/ollama/config";
import { IOpenaiConfig } from "../data/openai/config";
import { IPerplexityConfig } from "../data/perplexity/config";
import { ILangfuseConfig } from "../data/langfuse/config";
import { ILunaryConfig } from "../data/lunary/config";
import { IApiEndpointConfig } from "../data/apiEndpoint/config";
import { IBinaryConfig } from "../data/binary/config";
import { IApiEndpointDataConfig } from "../data/apiEndpointData/config";

interface iConfigurationPreferences {
  anthropicApiKey: string;
  cohereApiKey: string;
  groqApiKey: string;
  ollamaApiUrl: string;
  openaiApiKey: string;
  perplexityApiKey: string;

  langfuseSecretApiKey: string;
  lanfusePublicApiKey: string;
  langfuseApiUrl: string;
  lunaryApiKey: string;

  apiEndpoint: string;
  apiBinnary: string;

  apiEndpointDataAssistant: string;
  apiEndpointDataLlm: string;
  apiEndpointDataSnippet: string;
}

export function ConfigAnthropic(): IAnthropicConfig {
  return {
    apiKey: getPreferenceValues<iConfigurationPreferences>().anthropicApiKey,
  };
}

export function ConfigCohere(): ICohereConfig {
  return {
    apiKey: getPreferenceValues<iConfigurationPreferences>().cohereApiKey,
  };
}

export function ConfigGroq(): IGroqConfig {
  return {
    apiKey: getPreferenceValues<iConfigurationPreferences>().groqApiKey,
  };
}

export function ConfigOllama(): IOllamaConfig {
  return {
    url: getPreferenceValues<iConfigurationPreferences>().ollamaApiUrl,
  };
}

export function ConfigOpenai(): IOpenaiConfig {
  return {
    apiKey: getPreferenceValues<iConfigurationPreferences>().openaiApiKey,
  };
}

export function ConfigPerplexity(): IPerplexityConfig {
  return {
    apiKey: getPreferenceValues<iConfigurationPreferences>().perplexityApiKey,
  };
}

export function ConfigLangfuse(): ILangfuseConfig {
  return {
    enable:
      getPreferenceValues<iConfigurationPreferences>().langfuseApiUrl !== "" &&
      getPreferenceValues<iConfigurationPreferences>().langfuseApiUrl !== undefined &&
      getPreferenceValues<iConfigurationPreferences>().lanfusePublicApiKey !== "" &&
      getPreferenceValues<iConfigurationPreferences>().lanfusePublicApiKey !== undefined &&
      getPreferenceValues<iConfigurationPreferences>().langfuseSecretApiKey !== "" &&
      getPreferenceValues<iConfigurationPreferences>().langfuseSecretApiKey !== undefined &&
      1 === 1,
    url: getPreferenceValues<iConfigurationPreferences>().langfuseApiUrl,
    public: getPreferenceValues<iConfigurationPreferences>().lanfusePublicApiKey,
    secret: getPreferenceValues<iConfigurationPreferences>().langfuseSecretApiKey,
  };
}

export function ConfigLunary(): ILunaryConfig {
  return {
    enable:
      getPreferenceValues<iConfigurationPreferences>().lunaryApiKey !== "" &&
      getPreferenceValues<iConfigurationPreferences>().lunaryApiKey !== undefined &&
      1 === 1,
    key: getPreferenceValues<iConfigurationPreferences>().lunaryApiKey,
  };
}

export function ConfigApiEndpoint(): IApiEndpointConfig {
  return {
    host: getPreferenceValues<iConfigurationPreferences>().apiEndpoint,
  };
}

export function ConfigBinnary(): IBinaryConfig {
  return {
    path: getPreferenceValues<iConfigurationPreferences>().apiBinnary,
  };
}

export function ConfigApiEndpointData(): IApiEndpointDataConfig {
  return {
    assistant: getPreferenceValues<iConfigurationPreferences>().apiEndpointDataAssistant,
    llm: getPreferenceValues<iConfigurationPreferences>().apiEndpointDataLlm,
    snippet: getPreferenceValues<iConfigurationPreferences>().apiEndpointDataSnippet,
  };
}
