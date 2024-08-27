import { List } from "@raycast/api";
import { ISnippet } from "../../data/snippet";
import { ILlm } from "../../data/llm";
import { ConfigurationTypeCommunication } from "../../helper/communication";

export const SnippetListView = ({
  use,
  selectedSnippet,
  actionPanel,
}: {
  use: { snippets: ISnippet[]; llms: ILlm[] };
  selectedSnippet: string | null;
  actionPanel: (snippet: ISnippet) => JSX.Element;
}) => {
  return (
    <>
      {Object.entries(SnippetGroupByCategory(use.snippets) as Record<string, ISnippet[]>).map(([name, list]) => (
        <List.Section key={name} title={name} subtitle={list.length.toLocaleString()}>
          {list.map((snippet: ISnippet) => (
            <SnippetListItem
              key={snippet.snippetId}
              snippet={snippet}
              use={{ llms: use.llms }}
              selectedsnippet={selectedSnippet}
              actionPanel={actionPanel}
            />
          ))}
        </List.Section>
      ))}
    </>
  );
};

export function SnippetGroupByCategory(array: ISnippet[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return array.reduce((acc: any, obj: ISnippet) => {
    const key = obj.category;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {});
}

export const SnippetListItem = ({
  snippet,
  use,
  selectedsnippet,
  actionPanel,
}: {
  snippet: ISnippet;
  use: { llms: ILlm[] };
  selectedsnippet: string | null;
  actionPanel: (snippet: ISnippet) => JSX.Element;
}) => {
  return (
    <List.Item
      id={snippet.snippetId}
      key={snippet.snippetId}
      title={snippet.title}
      subtitle={use.llms.find((x: { key: string; title: string }) => x.key === snippet.model)?.title}
      icon={{ source: snippet.emoji }}
      detail={<ModelDetailView snippet={snippet} use={{ llms: use.llms }} />}
      actions={selectedsnippet === snippet.snippetId ? actionPanel(snippet) : undefined}
    />
  );
};

const ModelDetailView = (props: { use: { llms: ILlm[] }; snippet: ISnippet; markdown?: string | null | undefined }) => {
  const { snippet, use, markdown } = props;

  return (
    <List.Item.Detail
      markdown={markdown ?? `${snippet.promptSystem}`}
      metadata={
        <List.Item.Detail.Metadata>
          <List.Item.Detail.Metadata.Label title="Title" text={snippet.title} />
          <List.Item.Detail.Metadata.Label title="Category" text={snippet.category} />
          <List.Item.Detail.Metadata.Label title="Emoji" text={snippet.emoji} icon={snippet.emoji} />
          <List.Item.Detail.Metadata.Separator />
          <List.Item.Detail.Metadata.Label
            title="Model"
            text={use.llms.find((x: { key: string; title: string }) => x.key === snippet.model)?.title}
          />
          <List.Item.Detail.Metadata.Label title="Temperature Model" text={snippet.modelTemperature} />
          <List.Item.Detail.Metadata.Label title="Webhook" text={snippet.webhookUrl ? snippet.webhookUrl : ""} />
          <List.Item.Detail.Metadata.Label
            title="Type communication"
            text={
              ConfigurationTypeCommunication.find(
                (x: { key: string; title: string }) => x.key === snippet.typeCommunication
              )?.title
            }
          />
          <List.Item.Detail.Metadata.Separator />
          <List.Item.Detail.Metadata.Label title="Local" text={snippet.isLocal ? "YES" : "no"} />
          <List.Item.Detail.Metadata.Label title="ID" text={snippet.snippetId} />
          <List.Item.Detail.Metadata.Separator />
        </List.Item.Detail.Metadata>
      }
    />
  );
};
