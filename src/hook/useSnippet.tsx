import { LocalStorage, showToast, Toast } from "@raycast/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import fetch from "node-fetch";
import { ISnippet, SnippetDefaultTemperature } from "../data/snippet";
import { HookSnippet } from "./type";
import { DefaultSnippet } from "./default/snippet";
import { ConfigApiEndpointData } from "../helper/config";
import { ClearPromptSystem } from "../common/clear";
import { ConfigurationTypeCommunicationDefault } from "../helper/communication";

export function useSnippet(): HookSnippet {
  const [data, setData] = useState<ISnippet[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);

  const localStorageName = "snippets";

  useEffect(() => {
    (async () => {
      const stored = await LocalStorage.getItem<string>(localStorageName);
      if (stored) {
        setData((previous) => [...previous, ...JSON.parse(stored)]);
      } else {
        if (ConfigApiEndpointData() !== undefined && ConfigApiEndpointData().snippet !== undefined) {
          await apiLoad(setData, data);
        } else {
          setData(DefaultSnippet);
        }
      }

      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    LocalStorage.setItem(localStorageName, JSON.stringify(data));
  }, [data]);

  const reload = useCallback(async () => {
    if (ConfigApiEndpointData() === undefined || ConfigApiEndpointData().snippet === undefined) {
      setData(DefaultSnippet);
      return;
    }
    await apiLoad(setData, data);

    await showToast({
      title: "Assistant data realoaded!",
      style: Toast.Style.Success,
    });
  }, [setData, data]);

  const add = useCallback(
    async (item: ISnippet) => {
      item.isLocal = true;
      const newData: ISnippet = { ...item };
      setData([...data, newData]);

      await showToast({
        title: "Snippet saved!",
        style: Toast.Style.Success,
      });
    },
    [setData, data]
  );

  const update = useCallback(
    async (item: ISnippet) => {
      setData((prev) => {
        return prev.map((v: ISnippet) => {
          if (v.snippetId === item.snippetId) {
            return item;
          }

          return v;
        });
      });

      await showToast({
        title: "Snippet updated!",
        style: Toast.Style.Success,
      });
    },
    [setData, data]
  );

  const remove = useCallback(
    async (item: ISnippet) => {
      if (item.isLocal !== true) {
        await showToast({
          title: "Removing your Snippet imposible, Snippet is not local",
          style: Toast.Style.Failure,
        });

        return;
      }

      const newData: ISnippet[] = data.filter((o) => o.snippetId !== item.snippetId);
      setData(newData);

      await showToast({
        title: "Snippet removed!",
        style: Toast.Style.Success,
      });
    },
    [setData, data]
  );

  const clear = useCallback(async () => {
    await showToast({
      title: "You can't cleared Snippets!",
      style: Toast.Style.Failure,
    });
  }, [setData]);

  return useMemo(
    () => ({ data, isLoading, add, update, remove, clear, reload }),
    [data, isLoading, add, update, remove, clear, reload]
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function apiLoad(setData: any, oldData: ISnippet[]) {
  if (ConfigApiEndpointData().snippet === "" || ConfigApiEndpointData().snippet === undefined) {
    return setData(DefaultSnippet);
  }
  await fetch(ConfigApiEndpointData().snippet)
    .then(async (response) => response.json())
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .then(async (res: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newRes: ISnippet[] = res.map((item: any) => {
        const existing = oldData.find((x: ISnippet) => x.snippetId === item.snippetId);
        return {
          ...item,
          promptSystem: ClearPromptSystem(item.promptSystem),
          webhookUrl: existing?.webhookUrl || item.webhookUrl,
          modelTemperature: existing?.modelTemperature || SnippetDefaultTemperature,
          typeCommunication: existing?.typeCommunication || ConfigurationTypeCommunicationDefault,
          isLocal: false,
        };
      });

      setData(newRes);
    })
    .catch((error) => {
      console.error(error);
    });
}
