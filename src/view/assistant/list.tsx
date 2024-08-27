import { List } from "@raycast/api";
import { IAssistant } from "../../data/assistant";
import { ISnippet } from "../../data/snippet";
import { ILlm } from "../../data/llm";
import { ConfigurationTypeCommunication } from "../../helper/communication";

export const AssistantListView = ({
  title,
  use,
  selectedAssistant,
  actionPanel,
}: {
  title: string;
  use: { assistants: IAssistant[]; snippets: ISnippet[]; llms: ILlm[] };
  selectedAssistant: string | null;
  actionPanel: (assistant: IAssistant) => JSX.Element;
}) => (
  <List.Section title={title} subtitle={use.assistants.length.toLocaleString()}>
    {use.assistants.map((assistant: IAssistant) => (
      <AssistantListItem
        key={assistant.assistantId}
        assistant={assistant}
        use={{ snippets: use.snippets, llms: use.llms }}
        selectedAssistant={selectedAssistant}
        actionPanel={actionPanel}
      />
    ))}
  </List.Section>
);

const AssistantListItem = ({
  assistant,
  use,
  selectedAssistant,
  actionPanel,
}: {
  assistant: IAssistant;
  use: { snippets: ISnippet[]; llms: ILlm[] };
  selectedAssistant: string | null;
  actionPanel: (assistant: IAssistant) => JSX.Element;
}) => {
  return (
    <List.Item
      id={assistant.assistantId}
      key={assistant.assistantId}
      title={assistant.title}
      subtitle={use.llms.find((x: { key: string; title: string }) => x.key === assistant.model)?.title}
      icon={assistant.avatar ? { source: assistant.avatar } : { source: assistant.emoji }}
      detail={<ModelDetailView assistant={assistant} use={use} />}
      actions={selectedAssistant === assistant.assistantId ? actionPanel(assistant) : undefined}
    />
  );
};

const ModelDetailView = (props: {
  assistant: IAssistant;
  use: { snippets: ISnippet[]; llms: ILlm[] };
  markdown?: string | null | undefined;
}) => {
  const { assistant, use, markdown } = props;

  return (
    <List.Item.Detail
      markdown={markdown ?? `${assistant.promptSystem}`}
      metadata={
        <List.Item.Detail.Metadata>
          <List.Item.Detail.Metadata.Label title="Title" text={assistant.title} />
          <List.Item.Detail.Metadata.Label title="Description" text={assistant.description} />
          <List.Item.Detail.Metadata.Label title="Avatar" text={assistant.avatar} icon={assistant.avatar} />
          <List.Item.Detail.Metadata.Label title="Emoji" text={assistant.emoji} icon={assistant.emoji} />
          <List.Item.Detail.Metadata.Separator />
          <List.Item.Detail.Metadata.Label
            title="Model"
            text={use.llms.find((x: { key: string; title: string }) => x.key === assistant.model)?.title}
          />
          <List.Item.Detail.Metadata.Label title="Temperature Model" text={assistant.modelTemperature} />
          {/* <List.Item.Detail.Metadata.Label title="Webhook" text={(assistant.webhookUrl ? assistant.webhookUrl : "")} /> */}
          <List.Item.Detail.Metadata.Label
            title="Type communication"
            text={
              ConfigurationTypeCommunication.find(
                (x: { key: string; title: string }) => x.key === assistant.typeCommunication
              )?.title
            }
          />
          <List.Item.Detail.Metadata.Separator />
          <List.Item.Detail.Metadata.Label title="Additional data" text={assistant.additionalData} />
          <List.Item.Detail.Metadata.Label title="Local" text={assistant.isLocal ? "YES" : "no"} />
          <List.Item.Detail.Metadata.Label title="ID" text={assistant.assistantId} />
          <List.Item.Detail.Metadata.Separator />
          <List.Item.Detail.Metadata.Label title="Available snippets" text={assistant.snippet?.length.toString()} />
          {assistant.snippet?.map((snippetId: string) => (
            <List.Item.Detail.Metadata.Label
              key={snippetId}
              title=""
              text={use.snippets.find((x: ISnippet) => x.snippetId === snippetId)?.title}
              icon={use.snippets.find((x: ISnippet) => x.snippetId === snippetId)?.emoji}
            />
          ))}
          {/* <List.Item.Detail.Metadata.Label title="__" text={assistant.modelApiKeyOrUrl} /> */}
        </List.Item.Detail.Metadata>
      }
    />
  );
};
