import { LocalStorage, showToast, Toast } from "@raycast/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import fetch from "node-fetch";
import { AssistantDefaultTemperature, IAssistant } from "../data/assistant";
import { RemoveDuplicatesByField } from "../common/list";
import { HookAssistant } from "./type";
import { DefaultAssistant } from "./default/assistant";
import { ConfigApiEndpointData } from "../helper/config";
import { ClearPromptSystem } from "../common/clear";
import { ConfigurationTypeCommunicationDefault } from "../helper/communication";

export function useAssistant(): HookAssistant {
  const [data, setData] = useState<IAssistant[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);

  const localStorageName = "assistants";

  useEffect(() => {
    (async () => {
      const stored = await LocalStorage.getItem<string>(localStorageName);
      if (stored) {
        setData((previous) => RemoveDuplicatesByField([...previous, ...JSON.parse(stored)], "assistantId"));
      } else {
        if (ConfigApiEndpointData() !== undefined && ConfigApiEndpointData().assistant !== undefined) {
          await apiLoad(setData, data);
        } else {
          setData(DefaultAssistant);
        }
      }

      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      LocalStorage.setItem(localStorageName, JSON.stringify(RemoveDuplicatesByField(data, "assistantId")));
    }
  }, [data, isLoading]);

  const reload = useCallback(async () => {
    if (ConfigApiEndpointData() === undefined || ConfigApiEndpointData().assistant === undefined) {
      setData(DefaultAssistant);
      return;
    }
    await apiLoad(setData, data);

    await showToast({
      title: "Assistant data realoaded!",
      style: Toast.Style.Success,
    });
  }, [setData, data]);

  const add = useCallback(
    async (item: IAssistant) => {
      item.isLocal = true;
      const newData: IAssistant = { ...item };
      setData([...data, newData]);

      await showToast({
        title: "Assistant saved!",
        style: Toast.Style.Success,
      });

      await LocalStorage.setItem("onboarding", "finish");
    },
    [setData, data]
  );

  const update = useCallback(
    async (item: IAssistant) => {
      setData((prev) => {
        return prev.map((v: IAssistant) => {
          if (v.assistantId === item.assistantId) {
            return item;
          }

          return v;
        });
      });

      await showToast({
        title: "Assistant updated!",
        style: Toast.Style.Success,
      });
    },
    [setData, data]
  );

  const remove = useCallback(
    async (item: IAssistant) => {
      if (item.isLocal !== true) {
        await showToast({
          title: "Removing your assistant imposible, assistant is not local",
          style: Toast.Style.Failure,
        });

        return;
      }

      const newData: IAssistant[] = data.filter((o) => o.assistantId !== item.assistantId);
      setData(newData);

      await showToast({
        title: "Assistant removed!",
        style: Toast.Style.Success,
      });
    },
    [setData, data]
  );

  const clear = useCallback(async () => {
    await showToast({
      title: "You can't cleared assistants!",
      style: Toast.Style.Failure,
    });
  }, [setData]);

  return useMemo(
    () => ({ data, isLoading, add, update, remove, clear, reload }),
    [data, isLoading, add, update, remove, clear, reload]
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function apiLoad(setData: any, oldData: IAssistant[]) {
  if (ConfigApiEndpointData().assistant === "" || ConfigApiEndpointData().assistant === undefined) {
    return setData(DefaultAssistant);
  }
  await fetch(ConfigApiEndpointData().assistant)
    .then(async (response) => response.json())
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .then(async (res: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newRes: IAssistant[] = res.map((item: any) => {
        const existing = oldData.find((x: IAssistant) => x.assistantId === item.assistantId);
        return {
          ...item,
          promptSystem: ClearPromptSystem(item.promptSystem),
          modelApiKeyOrUrl: undefined,
          webhookUrl: existing?.webhookUrl || item.webhookUrl,
          modelTemperature: existing?.modelTemperature || AssistantDefaultTemperature,
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
