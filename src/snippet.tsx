import { Action, ActionPanel, Icon, List, useNavigation, confirmAlert, Alert } from "@raycast/api";
import { useEffect, useState } from "react";
import { useSnippet } from "./hook/useSnippet";
import { SnippetListView } from "./view/snippet/list";
import { SnippetImportForm } from "./view/snippet/importForm";
import { SnippetFormLocal } from "./view/snippet/formLocal";
import { SnippetFormApi } from "./view/snippet/formApi";
import { useLlm } from "./hook/useLlm";
import Onboarding from "./onboarding";
import { useAssistant } from "./hook/useAssistant";
import { useOnboarding } from "./hook/useOnboarding";
import { ISnippet } from "./data/snippet";
import { HookSnippet } from "./hook/type";
import { NeedOnboarding } from "./helper/onboarding";

export default function Snippet() {
  const { push } = useNavigation();
  const hookSnippet = useSnippet();
  const hookAssistant = useAssistant();
  const hookLlm = useLlm();
  const hookOnboarding = useOnboarding();
  const [searchText, setSearchText] = useState<string>("");
  const [selectedSnippetId, setSelectedSnippetId] = useState<string | null>(null);
  const collectionsSnipppets: HookSnippet = hookSnippet;

  useEffect(() => {
    if (searchText != "" && searchText.length > 1) {
      collectionsSnipppets.data = hookSnippet.data.filter((x: ISnippet) => x.title.includes(searchText));
    } else {
      collectionsSnipppets.data = hookSnippet.data;
    }
  }, [searchText]);

  if (!hookOnboarding.data && (NeedOnboarding(hookAssistant.data.length) || hookAssistant.data.length === 0)) {
    return <Onboarding />;
  }

  return (
    <List
      isShowingDetail={collectionsSnipppets.data.length === 0 ? false : true}
      isLoading={hookSnippet.isLoading}
      filtering={false}
      throttle={false}
      selectedItemId={selectedSnippetId || undefined}
      onSelectionChange={(id) => setSelectedSnippetId(id)}
      searchBarPlaceholder={"Search Snippet..."}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      actions={
        <ActionPanel>
          <Action
            title={"Create Snippet"}
            shortcut={{ modifiers: ["cmd"], key: "c" }}
            icon={Icon.Plus}
            onAction={() => push(<SnippetFormLocal use={{ snippets: collectionsSnipppets, llms: hookLlm.data }} />)}
          />
          <Action
            title={"Import Snippet"}
            icon={Icon.PlusCircle}
            onAction={() => push(<SnippetImportForm use={{ hookSnippet: collectionsSnipppets, llms: hookLlm.data }} />)}
          />
          <Action title={"Reload Snippets From Api"} icon={Icon.Download} onAction={() => hookSnippet.reload()} />
        </ActionPanel>
      }
    >
      {collectionsSnipppets.data.length === 0 ? (
        <List.EmptyView title="No Snippets" description="Create new Snippet with ⌘ + c shortcut" icon={Icon.Stars} />
      ) : (
        <SnippetListView
          key="Snippets"
          use={{ snippets: collectionsSnipppets.data, llms: hookLlm.data }}
          selectedSnippet={selectedSnippetId}
          actionPanel={(snippet: ISnippet) => (
            <ActionPanel>
              <ActionPanel.Section title="Modify">
                <Action
                  title={"Edit Snippet"}
                  shortcut={{ modifiers: ["cmd"], key: "e" }}
                  icon={Icon.Pencil}
                  onAction={() =>
                    snippet.isLocal
                      ? push(
                          <SnippetFormLocal
                            snippet={snippet}
                            use={{ snippets: collectionsSnipppets, llms: hookLlm.data }}
                          />
                        )
                      : push(
                          <SnippetFormApi
                            snippet={snippet}
                            use={{ snippets: collectionsSnipppets, llms: hookLlm.data }}
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
                      title: "Are you sure you want to remove this Snippet from your collection?",
                      message: "This action cannot be undone",
                      icon: Icon.RotateAntiClockwise,
                      primaryAction: {
                        title: "Remove",
                        style: Alert.ActionStyle.Destructive,
                        onAction: () => {
                          hookSnippet.remove(snippet);
                        },
                      },
                    });
                  }}
                />
              </ActionPanel.Section>
              <Action
                title={"Create Snippet"}
                shortcut={{ modifiers: ["cmd"], key: "c" }}
                icon={Icon.Plus}
                onAction={() => push(<SnippetFormLocal use={{ snippets: hookSnippet, llms: hookLlm.data }} />)}
              />
              <Action
                title={"Import Snippet"}
                icon={Icon.PlusCircle}
                onAction={() => push(<SnippetImportForm use={{ hookSnippet: hookSnippet, llms: hookLlm.data }} />)}
              />
              <Action title={"Reload Snippets From Api"} icon={Icon.Download} onAction={() => hookSnippet.reload()} />
            </ActionPanel>
          )}
        />
      )}
    </List>
  );
}
