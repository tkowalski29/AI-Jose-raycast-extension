import { LocalStorage, showToast, Toast } from "@raycast/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import fetch from "node-fetch";
import { ILlm } from "../data/llm";
import { RemoveDuplicatesByField } from "../common/list";
import { HookLlm } from "./type";
import { DefaultLlm } from "./default/llm";
import { ConfigApiEndpointData } from "../helper/config";

export function useLlm(): HookLlm {
  const [data, setData] = useState<ILlm[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);

  const localStorageName = "llms";

  useEffect(() => {
    (async () => {
      const stored = await LocalStorage.getItem<string>(localStorageName);
      if (stored) {
        setData((previous) => RemoveDuplicatesByField([...previous, ...JSON.parse(stored)], "key"));
      } else {
        if (ConfigApiEndpointData() !== undefined && ConfigApiEndpointData().llm !== undefined) {
          await apiLoad(setData);
        } else {
          setData(DefaultLlm);
        }
      }

      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      LocalStorage.setItem(localStorageName, JSON.stringify(RemoveDuplicatesByField(data, "key")));
    }
  }, [data, isLoading]);

  const reload = useCallback(async () => {
    if (ConfigApiEndpointData() === undefined || ConfigApiEndpointData().llm === undefined) {
      setData(DefaultLlm);
      return;
    }
    await apiLoad(setData);

    await showToast({
      title: "LLM data realoaded!",
      style: Toast.Style.Success,
    });
  }, [setData, data]);

  const add = useCallback(
    async (item: ILlm) => {
      item.isLocal = true;
      const newData: ILlm = { ...item };
      setData([...data, newData]);

      await showToast({
        title: "Llm saved!",
        style: Toast.Style.Success,
      });
    },
    [setData, data]
  );

  const update = useCallback(
    async (item: ILlm) => {
      setData((prev) => {
        return prev.map((v: ILlm) => {
          if (v.key === item.key) {
            return item;
          }

          return v;
        });
      });

      await showToast({
        title: "Llm updated!",
        style: Toast.Style.Success,
      });
    },
    [setData, data]
  );

  const remove = useCallback(
    async (item: ILlm) => {
      if (item.isLocal !== true) {
        await showToast({
          title: "Removing your Llm imposible, Llm is not local",
          style: Toast.Style.Failure,
        });

        return;
      }

      const newData: ILlm[] = data.filter((o) => o.key !== item.key);
      setData(newData);

      await showToast({
        title: "Llm removed!",
        style: Toast.Style.Success,
      });
    },
    [setData, data]
  );

  const clear = useCallback(async () => {
    await showToast({
      title: "You can't cleared Llms!",
      style: Toast.Style.Failure,
    });
  }, [setData]);

  return useMemo(
    () => ({ data, isLoading, add, update, remove, clear, reload }),
    [data, isLoading, add, update, remove, clear, reload]
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function apiLoad(setData: any) {
  if (ConfigApiEndpointData().llm === "" || ConfigApiEndpointData().llm === undefined) {
    return setData(DefaultLlm);
  }
  await fetch(ConfigApiEndpointData().llm)
    .then(async (response) => response.json())
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .then(async (res: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newRes: ILlm[] = res.map((item: any) => {
        return {
          ...item,
          isLocal: false,
        };
      });

      setData(newRes);
    })
    .catch((error) => {
      console.error(error);
    });
}
