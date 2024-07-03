import { Toast } from "@raycast/api";
import { CreateChatCompletionDeltaResponseType } from "../../type/chat";
import { AssistantDefaultTemperature } from "../../type/assistant";
import { SnippetDefaultTemperature } from "../../type/snippet";
import { ChangePromptSystem, GetApiOpenAiKey, IsClearHistoryWhenUseSnippet } from "../../type/config";
import { ChatTransfomer } from "../../type/chatOpenAi";
import { Configuration, OpenAIApi } from "openai";
import { TalkType } from "../../type/talk";
import { ReplacePlaceholders } from "../../common/prompt";
import { ConversationSelectedTypeSnippet } from "../../type/conversation";

export async function RunOpenAiApi(toast: any, setLoading: any, setData: any, setStreamData: any, data: any, chat: TalkType): Promise<TalkType | undefined> {
  const useStream = true
  const chatGPT = new OpenAIApi(new Configuration({
    apiKey: GetApiOpenAiKey(),
    basePath: "https://api.openai.com/v1",
  }));

  let promptString = chat.assistant.promptSystem
  let temperature = chat.assistant.modelTemperature ? chat.assistant.modelTemperature : AssistantDefaultTemperature
  let model = chat.assistant.model
  let loadHistory = true
  if (chat.snippet?.promptSystem && chat.conversationType === ConversationSelectedTypeSnippet) {
    promptString = chat.snippet.promptSystem
    temperature = chat.snippet.modelTemperature ? chat.snippet.modelTemperature : SnippetDefaultTemperature
    model = chat.snippet.model
    if (IsClearHistoryWhenUseSnippet()) {
      loadHistory = false
    }
  }
  promptString = ReplacePlaceholders(chat, promptString)
  model = model.split("__")[1]

  await chatGPT.createChatCompletion(
    {
      model: model,
      temperature: Number(temperature),
      messages: [...ChatTransfomer(data.reverse(), ChangePromptSystem(promptString), loadHistory), { role: "user", content: chat.question.text }],
      stream: useStream,
    },
    {
      responseType: useStream ? "stream" : undefined,
      headers: { "api-key": GetApiOpenAiKey() },
      params: {},
    }
  )
  .then(async (res: any) => {
    if (useStream) {
      return new Promise((resolve, reject) => {
        (res.data as any).on("data", (data: CreateChatCompletionDeltaResponseType) => {
          const lines = data
            .toString()
            .split("\n")
            .filter((line: string) => line.trim() !== "");

          for (const line of lines) {
            let message = ""
            let response: CreateChatCompletionDeltaResponseType | undefined = undefined
            try {
              message = line.replace(/^data: /, "");
              response = JSON.parse(message);
            } catch (error) {
            }
            
            if (message === "[DONE]" || response?.choices[0].finish_reason === "stop") {
              setData((prev: any) => {
                return prev.map((a: TalkType) => {
                  if (a.chatId === chat.chatId) {
                    return chat;
                  }
                  return a;
                });
              });

              setTimeout(async () => {
                setStreamData(undefined);
              }, 5);

              setLoading(false);

              toast.title = "Got your answer!";
              toast.style = Toast.Style.Success;

              resolve(chat);
            }
            try {
              const SAFE_OVERLAP = 10;
              let content = response?.choices[0].delta?.content;

              if (content) {
                if (chat.result === undefined) {
                  chat.result = { text: content, imageExist: false, images: undefined, actionType: "", actionName: "", actionStatus: "" }
                } else {
                  const endOfCurrentText = chat.result.text.slice(-SAFE_OVERLAP);
                  const overlapIndex = content.indexOf(endOfCurrentText);

                  if (overlapIndex !== -1) {
                    content = content.slice(overlapIndex + SAFE_OVERLAP);
                  }

                  chat.result.text += content;
                }
                setStreamData({ ...chat, result: chat.result });
              }
            } catch (error) {
              toast.title = "Error";
              toast.message = `Couldn't stream message`;
              toast.style = Toast.Style.Failure;
              
              setLoading(false);
            }
          }
        });
      })
    } else {
      if (chat.result === undefined) {
        chat.result = { text: "", imageExist: false, images: undefined, actionType: "", actionName: "", actionStatus: "" }
      }
      chat.result.text = res.data.choices.map((x: any) => x.message)[0]?.content ?? ""
      chat = { ...chat, result: chat.result };

      if (typeof chat.result?.text === "string") {
        setLoading(false);

        toast.title = "Got your answer!";
        toast.style = Toast.Style.Success;

        setData((prev: TalkType[]) => {
          return prev.map((a: TalkType) => {
            if (a.chatId === chat.chatId) {
              return chat;
            }
            return a;
          });
        });
      }

      return chat
    }
  })
  .catch((error: any) => {
    if (error?.message) {
      if (error.message.includes("429")) {
        toast.title = "You've reached your API limit";
        toast.message = "Please upgrade to pay-as-you-go";
      } else {
        toast.title = "Error";
        toast.message = error.message;
      }
    }
    toast.style = Toast.Style.Failure;

    setLoading(false);

    return chat
  });

  return chat
}
