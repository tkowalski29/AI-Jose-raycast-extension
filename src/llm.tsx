import { Action, ActionPanel, Icon, List, useNavigation, confirmAlert, Alert } from "@raycast/api";
import { useEffect, useState } from "react";
import { useLlm } from "./hook/useLlm";
import { LlmListView } from "./view/llm/list";
import { LlmFormLocal } from "./view/llm/formLocal";
import { LlmFormApi } from "./view/llm/formApi";
import Onboarding from "./onboarding";
import { useAssistant } from "./hook/useAssistant";
import { useOnboarding } from "./hook/useOnboarding";
import { ILlm } from "./data/llm";
import { HookLlm } from "./hook/type";
import { NeedOnboarding } from "./helper/onboarding";

export default function Llm() {
  const { push } = useNavigation();
  const hookLlm = useLlm();
  const hookAssistant = useAssistant();
  const hookOnboarding = useOnboarding();
  const [searchText, setSearchText] = useState<string>("");
  const [selectedLlmId, setSelectedLlmId] = useState<string | null>(null);
  const collectionsLlms: HookLlm = hookLlm;

  useEffect(() => {
    if (searchText != "" && searchText.length > 1) {
      collectionsLlms.data = hookLlm.data.filter((x: ILlm) => x.title.includes(searchText));
    } else {
      collectionsLlms.data = hookLlm.data;
    }
  }, [searchText]);

  if (!hookOnboarding.data && (NeedOnboarding(hookAssistant.data.length) || hookAssistant.data.length === 0)) {
    return <Onboarding />;
  }

  return (
    <List
      isShowingDetail={collectionsLlms.data.length === 0 ? false : true}
      isLoading={hookLlm.isLoading}
      filtering={false}
      throttle={false}
      selectedItemId={selectedLlmId || undefined}
      onSelectionChange={(id) => setSelectedLlmId(id)}
      searchBarPlaceholder={"Search Llm..."}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      actions={
        <ActionPanel>
          <Action
            title={"Create Llm"}
            shortcut={{ modifiers: ["cmd"], key: "c" }}
            icon={Icon.Plus}
            onAction={() => push(<LlmFormLocal use={{ llms: collectionsLlms }} />)}
          />
          <Action title={"Reload Llms From Api"} icon={Icon.Download} onAction={() => hookLlm.reload()} />
        </ActionPanel>
      }
    >
      <LlmListView
        key="Llms"
        llms={collectionsLlms.data}
        selectedLlm={selectedLlmId}
        actionPanel={(llm: ILlm) => (
          <ActionPanel>
            <ActionPanel.Section title="Modify">
              <Action
                title={"Edit Llm"}
                shortcut={{ modifiers: ["cmd"], key: "e" }}
                icon={Icon.Pencil}
                onAction={() =>
                  llm.isLocal
                    ? push(<LlmFormLocal llm={llm} use={{ llms: collectionsLlms }} />)
                    : push(<LlmFormApi llm={llm} use={{ llms: collectionsLlms }} />)
                }
              />
              <Action
                style={Action.Style.Destructive}
                icon={Icon.RotateAntiClockwise}
                title="Remove"
                onAction={async () => {
                  await confirmAlert({
                    title: "Are you sure you want to remove this Llm from your collection?",
                    message: "This action cannot be undone",
                    icon: Icon.RotateAntiClockwise,
                    primaryAction: {
                      title: "Remove",
                      style: Alert.ActionStyle.Destructive,
                      onAction: () => {
                        hookLlm.remove(llm);
                      },
                    },
                  });
                }}
              />
            </ActionPanel.Section>
            <Action
              title={"Create Llm"}
              shortcut={{ modifiers: ["cmd"], key: "c" }}
              icon={Icon.Plus}
              onAction={() => push(<LlmFormLocal use={{ llms: hookLlm }} />)}
            />
            <Action title={"Reload Llms From Api"} icon={Icon.Download} onAction={() => hookLlm.reload()} />
          </ActionPanel>
        )}
      />
    </List>
  );
}
