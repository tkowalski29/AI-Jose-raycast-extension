import * as fs from "fs";
import * as path from "path";
import { execFile, exec } from "child_process";
import fetch from "node-fetch";
// @ts-expect-error ignore
globalThis.fetch = fetch;
import { ITalk, ITalkDataResult, ITalkQuestion, newTalkDataResult } from "../data/talk";
import { InterfaceLlm } from "../data/llm";
import { ITrace } from "../data/trace";
import { IMessage } from "../data/message";
import { base64Prepare } from "../common/file";

export const LLM_BINARY = "binary";

export class BinaryLLM implements InterfaceLlm {
  async chat(chatData: ITalk): Promise<{ stream: boolean; data: ITalkDataResult }> {
    // const dir = "/tmp"
    const dir = __dirname;
    const filePath = path.join(dir, chatData.llm.object.fileDownloadName ?? "");

    chatData.conversation.question.files = await base64Prepare(chatData.conversation.question.files);

    try {
      if (!fs.existsSync(filePath)) {
        await this.#downloadFileFromUrl(chatData.llm.object.fileDownloadUrl ?? "", filePath);
        await this.#setExecutablePermissions(filePath);
      }

      const b64 = Buffer.from(JSON.stringify(chatData)).toString("base64");
      const res = await this.#executeFile(filePath, b64);

      const output: ITalk = JSON.parse(res);
      if (output.result === undefined) {
        return {
          stream: chatData.llm.stream,
          data: newTalkDataResult(),
        };
      }
      const out: ITalkDataResult = output.result;

      // this.#removeLocalFile(filePath);

      return {
        stream: chatData.llm.stream,
        data: out,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prepareResponse(chatData: ITalk, stream: boolean, trace: ITrace, answer: any): ITalkDataResult {
    const a: ITalkDataResult = answer;
    let response: ITalkDataResult = newTalkDataResult();

    if (!stream) {
      response = a;

      trace.changeHelper({
        output: a.content,
        token: {
          prompt: 0,
          completion: 0,
        },
      });
    } else {
      response = a;

      trace.changeHelper({
        output: a.content,
        token: {
          prompt: 0,
          completion: 0,
        },
      });
    }

    return response;
  }

  #prepareMessage(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    systemMessage: string | undefined,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    msgs: IMessage[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    lastMessage: ITalkQuestion | undefined
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any[] {
    return [];
  }

  async #downloadFileFromUrl(fileUrl: string, outputLocationPath: string): Promise<void> {
    if (fs.existsSync(outputLocationPath)) {
      return;
    }

    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to download file from ${fileUrl}`);
    }

    const fileStream = fs.createWriteStream(outputLocationPath);
    await new Promise((resolve, reject) => {
      response.body.pipe(fileStream);
      response.body.on("error", reject);
      fileStream.on("finish", resolve);
    });
  }

  #setExecutablePermissions(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.chmod(filePath, "755", (err) => {
        if (err) {
          reject(`Error setting executable permissions: ${err.message}`);
        } else {
          resolve();
        }
      });
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async #executeFile(filePath: string, b64: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      exec(`chmod +x ${filePath}`, (chmodError: any) => {
        if (chmodError) {
          reject(`Error setting file as executable: ${chmodError}`);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        execFile(filePath, [b64], (error: any, stdout: any, stderr: any) => {
          if (error) {
            reject(`Error executing file: ${error}`);
          }

          if (stderr !== "") {
            reject(`Error run file: ${stderr}`);
          }

          resolve(stdout);
        });
      });
    });
  }

  #removeLocalFile(filePath: string): void {
    fs.unlink(filePath, (err) => {
      if (err) {
        throw new Error(`Failed deleting file from ${filePath}, [${err.message}]`);
      }
    });
  }
}
