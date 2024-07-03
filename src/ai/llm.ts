import { ChatOpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { GetApiOpenAiKey } from "../type/config";
import { Toast } from "@raycast/api";
import { TalkType } from "../type/talk";

export const Call = async (
  chat: TalkType,
  messages: any[],
  config: { stream: boolean; temperature: string; model: string },
  interaction: { toast: Toast; setData: any; setStreamData: any; setLoading: any }
): Promise<any> => {
  const modelSettings = {
    apiKey: GetApiOpenAiKey(),
    modelName: config.model,
    streaming: false,
    temperature: parseFloat(config.temperature),
    callbacks: [
      {
        handleLLMNewToken: async (token: string, idx: any, runId: any, parentRunId: any, tags: any, fields: any) => {
          if (fields.chunk.generationInfo.finish_reason === "stop") {
            interaction.setData((prev: any) => {
              return prev.map((a: TalkType) => {
                if (a.chatId === chat.chatId) {
                  return chat;
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
            return;
          }
          if (chat.result === undefined) {
            chat.result = {
              text: token,
              imageExist: false,
              images: undefined,
              actionType: "",
              actionName: "",
              actionStatus: "",
            };
          }

          chat.result.text += token;

          interaction.setStreamData({ ...chat, result: chat.result });
        },
        handleLLMEnd: async (output: any) => {
          if (chat.result === undefined) {
            chat.result = {
              text: output.generations[0][0].text,
              imageExist: false,
              images: undefined,
              actionType: "",
              actionName: "",
              actionStatus: "",
            };
          }
          chat.result.text = output.generations[0][0].text;

          interaction.setData((prev: any) => {
            return prev.map((a: TalkType) => {
              if (a.chatId === chat.chatId) {
                return chat;
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
        },
        handleLLMError: async (err: Error) => {
          console.error(err);
        },
      },
    ],
  };

  const c = new ChatOpenAI(modelSettings);
  await c.invoke(messages);

  return chat;
};

export const Embed = async (query: string) => {
  const embeddings = new OpenAIEmbeddings();
  return embeddings.embedQuery(query);
};
