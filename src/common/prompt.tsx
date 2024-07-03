import { BaseMessageChunk } from "@langchain/core/messages";

export function ReplacePlaceholders(obj: any, prompt: string): string {
  return prompt.replace(/\{([^{}]+)\}/g, (match, p1) => {
    const value = GetNestedValue(obj, p1);
    return value !== undefined ? value : match;
  });
}

export function GetNestedValue(obj: any, param: string): string | undefined {
  if (param === "question") {
    param = "question->text";
  }
  const keys = param.split('->');

  return keys.reduce((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return acc[key];2
      
    }
    return undefined;
  }, obj);
}

export const CurrentDate = () => {
  let date = new Date();

  let weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let weekday = weekdays[date.getDay()];

  let month = (date.getMonth() + 1).toString().padStart(2, '0'); // months are 0-based in JS
  let day = date.getDate().toString().padStart(2, '0');
  let year = date.getFullYear();

  let hours = date.getHours().toString().padStart(2, '0');
  let minutes = date.getMinutes().toString().padStart(2, '0');

  return `${weekday}, ${month}/${day}/${year} ${hours}:${minutes}`;
}

export const ParseFunctionCall = (result: BaseMessageChunk): { name: string, args: any } | null => {
  if (result?.additional_kwargs?.function_call === undefined) {
    return null;
  }
  return {
    name: result.additional_kwargs.function_call.name,
    args: JSON.parse(result.additional_kwargs.function_call.arguments),
  }
}
