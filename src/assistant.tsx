import { Action, ActionPanel, Icon, List, useNavigation, confirmAlert, Alert } from "@raycast/api";
import { useEffect, useState } from "react";
import { useAssistant } from "./hook/useAssistant";
import { AssistantListView } from "./view/assistant/list";
import { AssistantImportForm } from "./view/assistant/importForm";
import { useSnippet } from "./hook/useSnippet";
import { AssistantFormLocal } from "./view/assistant/formLocal";
import { AssistantFormApi } from "./view/assistant/formApi";
import { useLlm } from "./hook/useLlm";
import Onboarding from "./onboarding";
import { useOnboarding } from "./hook/useOnboarding";
import { IAssistant } from "./data/assistant";
import { NeedOnboarding } from "./helper/onboarding";

export default function Assistant() {
  const { push } = useNavigation();
  const hookAssistant = useAssistant();
  const hookLlm = useLlm();
  const hookSnippet = useSnippet();
  const hookOnboarding = useOnboarding();
  const [searchText, setSearchText] = useState<string>("");
  const [selectedAssistantId, setSelectedAssistantId] = useState<string | null>(null);

  useEffect(() => {
    if (searchText != "" && searchText.length > 1) {
      hookAssistant.data = hookAssistant.data.filter((x: IAssistant) => x.title.includes(searchText));
    }
  }, [searchText]);

  if (!hookOnboarding.data && (NeedOnboarding(hookAssistant.data.length) || hookAssistant.data.length === 0)) {
    return <Onboarding />;
  }

  return (
    <List
      isShowingDetail={hookAssistant.data.length === 0 ? false : true}
      isLoading={hookAssistant.isLoading}
      filtering={false}
      throttle={false}
      selectedItemId={selectedAssistantId || undefined}
      onSelectionChange={(id) => setSelectedAssistantId(id)}
      searchBarPlaceholder="Search assistant..."
      searchText={searchText}
      onSearchTextChange={setSearchText}
      actions={
        <ActionPanel>
          <Action
            title={"Create Assistant"}
            shortcut={{ modifiers: ["cmd"], key: "c" }}
            icon={Icon.Plus}
            onAction={() =>
              push(
                <AssistantFormLocal
                  use={{ hookAssistant: hookAssistant, snippets: hookSnippet.data, llms: hookLlm.data }}
                />
              )
            }
          />
          <Action
            title={"Import Assistant"}
            icon={Icon.PlusCircle}
            onAction={() => push(<AssistantImportForm use={{ hookAssistant: hookAssistant, llms: hookLlm.data }} />)}
          />
          <Action title={"Reload Assistants From Api"} icon={Icon.Download} onAction={() => hookAssistant.reload()} />
        </ActionPanel>
      }
    >
      <AssistantListView
        key="assistants"
        title="Assistants"
        use={{ assistants: hookAssistant.data, snippets: hookSnippet.data, llms: hookLlm.data }}
        selectedAssistant={selectedAssistantId}
        actionPanel={(assistant: IAssistant) => (
          <ActionPanel>
            <ActionPanel.Section title="Modify">
              <Action
                title={"Edit Assistant"}
                shortcut={{ modifiers: ["cmd"], key: "e" }}
                icon={Icon.Pencil}
                onAction={() =>
                  assistant.isLocal
                    ? push(
                        <AssistantFormLocal
                          assistant={assistant}
                          use={{
                            hookAssistant: hookAssistant,
                            snippets: hookSnippet.data,
                            llms: hookLlm.data,
                          }}
                        />
                      )
                    : push(
                        <AssistantFormApi
                          assistant={assistant}
                          use={{
                            hookAssistant: hookAssistant,
                            snippets: hookSnippet.data,
                            llms: hookLlm.data,
                          }}
                        />
                      )
                }
              />
              <Action
                style={Action.Style.Destructive}
                icon={Icon.RotateAntiClockwise}
                title="Remove"
                onAction={async () => {
                  await confirmAlert({
                    title: "Are you sure you want to remove this assistant from your collection?",
                    message: "This action cannot be undone",
                    icon: Icon.RotateAntiClockwise,
                    primaryAction: {
                      title: "Remove",
                      style: Alert.ActionStyle.Destructive,
                      onAction: () => {
                        hookAssistant.remove(assistant);
                      },
                    },
                  });
                }}
              />
            </ActionPanel.Section>
            <Action
              title={"Create Assistant"}
              shortcut={{ modifiers: ["cmd"], key: "c" }}
              icon={Icon.Plus}
              onAction={() =>
                push(
                  <AssistantFormLocal
                    use={{ hookAssistant: hookAssistant, snippets: hookSnippet.data, llms: hookLlm.data }}
                  />
                )
              }
            />
            <Action
              title={"Import Assistant"}
              icon={Icon.PlusCircle}
              onAction={() => push(<AssistantImportForm use={{ hookAssistant: hookAssistant, llms: hookLlm.data }} />)}
            />
            <Action title={"Reload Assistants From Api"} icon={Icon.Download} onAction={() => hookAssistant.reload()} />
          </ActionPanel>
        )}
      />
    </List>
  );
}
