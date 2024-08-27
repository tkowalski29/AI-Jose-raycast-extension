import { LocalStorage } from "@raycast/api";
import {
  ConfigAnthropic,
  ConfigApiEndpoint,
  ConfigBinnary,
  ConfigCohere,
  ConfigGroq,
  ConfigOllama,
  ConfigOpenai,
  ConfigPerplexity,
} from "./config";

export function NeedOnboarding(assistans: number | undefined): boolean {
  LocalStorage.getItem<string>("onboarding").then((value) => {
    if (value === "finish") {
      return false;
    }
  });
  if (assistans !== undefined && assistans !== 0) {
    return false;
  }
  if (ConfigAnthropic().apiKey !== "" && ConfigAnthropic().apiKey !== undefined) {
    return false;
  }
  if (ConfigCohere().apiKey !== "" && ConfigCohere().apiKey !== undefined) {
    return false;
  }
  if (ConfigGroq().apiKey !== "" && ConfigGroq().apiKey !== undefined) {
    return false;
  }
  if (ConfigOllama().url !== "" && ConfigOllama().url !== undefined) {
    return false;
  }
  if (ConfigOpenai().apiKey !== "" && ConfigOpenai().apiKey !== undefined) {
    return false;
  }
  if (ConfigPerplexity().apiKey !== "" && ConfigPerplexity().apiKey !== undefined) {
    return false;
  }
  if (ConfigApiEndpoint().host !== "" && ConfigApiEndpoint().host !== undefined) {
    return false;
  }
  if (ConfigBinnary().path !== "" && ConfigBinnary().path !== undefined) {
    return false;
  }

  return true;
}
