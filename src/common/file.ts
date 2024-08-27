import * as fs from "fs";
import { ITalkQuestionFile } from "../data/talk";

export const base64Prepare = async (
  files: ITalkQuestionFile[] | undefined
): Promise<ITalkQuestionFile[] | undefined> => {
  if (files !== undefined) {
    files
      .filter((f: ITalkQuestionFile) => Object.keys(f).length > 0)
      .forEach((f: ITalkQuestionFile) => {
        if (f.path !== undefined && f.path !== "") {
          f.base64 = fs.readFileSync(f.path, { encoding: "base64" });
        }
      });
  }

  return files;
};
