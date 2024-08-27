import { List } from "@raycast/api";
import { IConversation } from "../../data/conversation";

export const ConversationListView = (props: {
  title: string;
  use: { conversations: IConversation[] };
  selectedConversation: string | null;
  actionPanel: (conversation: IConversation) => JSX.Element;
}) => {
  const { title, use, selectedConversation, actionPanel } = props;

  return (
    <List.Section title={title} subtitle={use.conversations.length.toLocaleString()}>
      {use.conversations.map((conversation) => (
        <List.Item
          id={conversation.conversationId}
          key={conversation.conversationId}
          title={conversation.messages[conversation.messages.length - 1].conversation.question.content}
          icon={conversation.selectedAssistant.avatar}
          accessories={[
            { text: conversation.messages[conversation.messages.length - 1].result?.content },
            { tag: conversation.selectedAssistant.title },
            { text: new Date(conversation.createdAt ?? 0).toLocaleDateString() },
          ]}
          actions={
            conversation && selectedConversation === conversation.conversationId ? actionPanel(conversation) : undefined
          }
        />
      ))}
    </List.Section>
  );
};
