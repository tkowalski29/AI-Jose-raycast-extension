import { Toast } from "@raycast/api";
import { GetApiBinnaryPath } from "../../type/config";
import { TalkQuestionFileType, TalkType } from "../../type/talk";

export async function RunBinnary(
  toast: any,
  setLoading: any,
  setData: any,
  chat: TalkType
): Promise<TalkType | undefined> {
  const util = require("util");
  const fs = require("fs");
  const exec = util.promisify(require("child_process").exec);
  const newChat: TalkType = JSON.parse(JSON.stringify(chat));

  if (newChat.question.files !== undefined) {
    newChat.question.files.forEach((f: TalkQuestionFileType) => {
      f.type = "image";
      f.base64 = fs.readFileSync(f.path, { encoding: "base64" });
    });
  }
  const b64 = Buffer.from(JSON.stringify(newChat)).toString("base64");

  try {
    const { stdout, stderr } = await exec(`chmod +x ${GetApiBinnaryPath()}; .${GetApiBinnaryPath()} '${b64}'`);

    if (stderr !== "") {
      console.log(stderr);

      toast.title = "Error";
      toast.message = String(stderr);
      toast.style = Toast.Style.Failure;

      setLoading(false);

      return undefined;
    }

    const out: TalkType = JSON.parse(stdout);
    chat = { ...chat, result: out.result ?? undefined };

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

    return chat;
  } catch (error) {
    console.log(error);

    toast.title = "Error";
    toast.message = String(error);
    toast.style = Toast.Style.Failure;

    setLoading(false);

    return undefined;
  }
}
