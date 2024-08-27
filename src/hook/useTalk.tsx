import { clearSearchBar, showToast, Toast } from "@raycast/api";
import { useCallback, useMemo, useState } from "react";
import fetch from "node-fetch";
import { useConversations } from "./useConversations";
import { RunLocal } from "./chat/local";
import { RunBinnary } from "./chat/binary";
import { RunCustomApi } from "./chat/api";
import { useLlm } from "./useLlm";
import { ITalk, ITalkQuestion, ITalkQuestionFile, NewTalk } from "../data/talk";
import {
  ConversationSelectedTypeAssistant,
  ConversationSelectedTypeSnippet,
  IConversation,
} from "../data/conversation";
import { ILlm } from "../data/llm";
import { HookTalk } from "./type";
import { GetDevice, GetUserName } from "../helper/const";
import {
  ConfigurationTypeCommunicationBinaryFile,
  ConfigurationTypeCommunicationExternalApi,
  ConfigurationTypeCommunicationLocal,
} from "../helper/communication";

export function useTalk(): HookTalk {
  const [data, setData] = useState<ITalk[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [streamData, setStreamData] = useState<ITalk | undefined>();
  const conversations = useConversations();
  const llms = useLlm();

  async function ask(question: string, file: string[] | undefined, conversation: IConversation) {
    clearSearchBar();

    setLoading(true);
    const toast = await showToast({
      title: "Getting your answer...",
      style: Toast.Style.Animated,
    });

    try {
      const chatQuestion: ITalkQuestion = { content: question, files: undefined };
      if (file) {
        const f: ITalkQuestionFile = { type: "image", path: file[0], base64: undefined, url: undefined };
        chatQuestion.files = [f];
      }

      const llmObject = llms.data.filter((llm: ILlm) => chat.assistant.object.model === llm.key);

      const chat: ITalk = NewTalk(
        chatQuestion,
        conversation,
        llmObject[0],
        conversation.selectedAssistant,
        conversation.selectedSnippet,
        GetUserName(),
        GetDevice()
      );
      chat.conversation.type = conversation.selectedType;

      setData(() => {
        return [...conversation.messages, chat];
      });

      setTimeout(async () => {
        setSelectedChatId(chat.id);
      }, 50);

      console.info("SelectedType: " + conversation.selectedType);
      const typeCommunication =
        conversation.selectedType === ConversationSelectedTypeSnippet
          ? conversation.selectedSnippet?.typeCommunication
          : conversation.selectedAssistant.typeCommunication;
      let chatResponse: ITalk | undefined = undefined;

      switch (typeCommunication) {
        case ConfigurationTypeCommunicationLocal:
          console.info("Using local");
          chatResponse = await RunLocal(chat, { toast, setData, setStreamData, setLoading });
          break;
        case ConfigurationTypeCommunicationExternalApi:
          console.info("Using custom API endpoint");
          chatResponse = await RunCustomApi(chat, { toast, setData, setStreamData, setLoading });
          break;
        case ConfigurationTypeCommunicationBinaryFile:
          console.info("Using local binnary file");
          chatResponse = await RunBinnary(chat, { toast, setData, setStreamData, setLoading });
          break;
        default:
          console.info("Using default");
          chatResponse = await RunLocal(chat, { toast, setData, setStreamData, setLoading });
      }

      if (chatResponse !== undefined) {
        console.info("Send webhook?");
        sendWebhook(chatResponse, setData, chat.snippet?.object?.webhookUrl);
        sendWebhook(chatResponse, setData, chat.assistant.object.webhookUrl);
      }

      if (chatResponse !== undefined) {
        console.info("Reset selected");
        conversation.selectedType = ConversationSelectedTypeAssistant;
        await conversations.update(conversation);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.title = error.toString();
      toast.style = Toast.Style.Failure;
    }
  }

  const clear = useCallback(async () => {
    setData([]);
  }, [setData]);

  return useMemo(
    () => ({ data, setData, isLoading, setLoading, selectedChatId, setSelectedChatId, ask, clear, streamData }),
    [data, setData, isLoading, setLoading, selectedChatId, setSelectedChatId, ask, clear, streamData]
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendWebhook(chat: ITalk, setData: any, webhook: string | undefined) {
  const newChat: ITalk = JSON.parse(JSON.stringify(chat));
  // eslint-disable-next-line
  // @ts-ignore
  newChat.assistant = { assistantId: newChat.assistant.assistantId };

  if (webhook === "" || webhook === null || webhook === undefined) {
    return;
  }

  fetch(webhook, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(chat),
  })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .then(async (res: any) => {
      const data = await res.json();
      Object.assign(chat, data);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setData((prev: any) => {
        return prev.map((a: ITalk) => {
          if (a.id === chat.id) {
            return chat;
          }
          return a;
        });
      });
    })
    .catch((error) => {
      console.info("Webhook error");
      console.error(error);
    });
}
