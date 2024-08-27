import { environment } from "@raycast/api";

export function GetUserName(): string {
  // eslint-disable-next-line
  const match = environment.assetsPath.match(/\/Users\/([^\/]+)/);
  return match ? match[1] : "unknown";
}

export function GetDevice(): string {
  return "raycast";
}
