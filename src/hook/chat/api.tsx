import { Toast } from "@raycast/api";
import fetch from "node-fetch";
import { GetApiEnpointUrl } from "../../type/config";
import { TalkQuestionFileType, TalkType } from "../../type/talk";

export async function RunCustomApi(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toast: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setLoading: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setData: any,
  chat: TalkType
): Promise<TalkType | undefined> {
  // eslint-disable-next-line
  const fs = require("fs");
  const newChat: TalkType = JSON.parse(JSON.stringify(chat));

  if (newChat.question.files !== undefined) {
    newChat.question.files.forEach((f: TalkQuestionFileType) => {
      f.type = "image";
      f.base64 = fs.readFileSync(f.path, { encoding: "base64" });
    });
  }

  return await fetch(GetApiEnpointUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(Object.assign({ dataType: "talk" }, newChat)),
  })
    .then(async (response) => response.json())
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .then(async (res: any) => {
      if (chat.result === undefined) {
        chat.result = {
          text: "",
          imageExist: false,
          images: undefined,
          actionType: "",
          actionName: "",
          actionStatus: "",
        };
      }
      chat = { ...chat, result: res.result };

      if (typeof chat.result?.text === "string") {
        setLoading(false);

        toast.title = "Got your answer!";
        toast.style = Toast.Style.Success;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setData((prev: any) => {
          return prev.map((a: TalkType) => {
            if (a.chatId === chat.chatId) {
              return chat;
            }
            return a;
          });
        });
      }

      return chat;
    })
    .catch((error) => {
      console.log(error);

      toast.title = "Error";
      toast.message = String(error);
      toast.style = Toast.Style.Failure;

      setLoading(false);

      return undefined;
    });
}
