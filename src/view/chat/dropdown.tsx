import { List } from "@raycast/api";
import { SnippetGroupByCategory } from "../snippet/list";
import { ISnippet } from "../../data/snippet";
import { IAssistant } from "../../data/assistant";

export const ChatDropdown = (props: {
  use: { assistants: IAssistant[]; snippets: ISnippet[] };
  selectedAssistant: IAssistant | undefined;
  onAssistantChange: React.Dispatch<React.SetStateAction<IAssistant>>;
  onSnippetChange: React.Dispatch<React.SetStateAction<ISnippet | undefined>>;
}) => {
  const { use, selectedAssistant, onAssistantChange, onSnippetChange } = props;
  const filtredSnippets = use.snippets.filter((snippet: ISnippet) =>
    (selectedAssistant !== undefined && selectedAssistant.snippet ? selectedAssistant.snippet.join(", ") : "").includes(
      snippet.snippetId
    )
  );
  let assistantsList = use.assistants;
  if (selectedAssistant !== undefined) {
    assistantsList = assistantsList.filter(
      (assistant: IAssistant) => assistant.assistantId !== selectedAssistant.assistantId
    );
  }

  return (
    <List.Dropdown
      tooltip="Select"
      storeValue={true}
      defaultValue={"assistant__" + (selectedAssistant !== undefined ? selectedAssistant.assistantId : "")}
      onChange={(value: string) => {
        const data = value.split("__");
        if (data[0] === "assistant") {
          const item = use.assistants.find((assistant: IAssistant) => assistant.assistantId == data[1]);
          if (!item) return;
          onAssistantChange(item);
        } else if (data[0] === "snippet") {
          const item = use.snippets.find((snippet: ISnippet) => snippet.snippetId == data[1]);
          if (!item) return;
          onSnippetChange(item);
        }
      }}
    >
      <>
        {Object.entries(SnippetGroupByCategory(filtredSnippets) as Record<string, ISnippet[]>).map(([name, list]) => (
          <List.Dropdown.Section key={name} title={name + " - Snippets"}>
            {list.map((snippet: ISnippet) => (
              <List.Dropdown.Item
                key={snippet.snippetId}
                title={snippet.title}
                value={"snippet__" + snippet.snippetId}
                icon={{ source: snippet.emoji }}
              />
            ))}
          </List.Dropdown.Section>
        ))}
      </>
      <List.Dropdown.Section title="Change to Assistant">
        {selectedAssistant && (
          <List.Dropdown.Item
            key={selectedAssistant.assistantId}
            title={selectedAssistant.title}
            value={"assistant__" + selectedAssistant.assistantId}
            icon={selectedAssistant.avatar ? { source: selectedAssistant.avatar } : { source: selectedAssistant.emoji }}
          />
        )}
        {assistantsList.map((assistant: IAssistant) => (
          <List.Dropdown.Item
            key={assistant.assistantId}
            title={assistant.title}
            value={"assistant__" + assistant.assistantId}
            icon={assistant.avatar ? { source: assistant.avatar } : { source: assistant.emoji }}
          />
        ))}
      </List.Dropdown.Section>
    </List.Dropdown>
  );
};
