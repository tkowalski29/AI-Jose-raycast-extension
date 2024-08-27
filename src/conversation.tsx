import { ActionPanel, Icon, List, useNavigation, confirmAlert, Alert, Action } from "@raycast/api";
import { useEffect, useState } from "react";
import { useConversations } from "./hook/useConversations";
import { ConversationListView } from "./view/chat/conversationList";
import Onboarding from "./onboarding";
import { useAssistant } from "./hook/useAssistant";
import { useOnboarding } from "./hook/useOnboarding";
import { ITalk } from "./data/talk";
import { IConversation } from "./data/conversation";
import Talk from "./talk";
import { NeedOnboarding } from "./helper/onboarding";

export default function Conversation() {
  const { push } = useNavigation();
  const hookConversation = useConversations();
  const hookAssistant = useAssistant();
  const hookOnboarding = useOnboarding();
  const [searchText, setSearchText] = useState<string>("");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<IConversation | null>();

  useEffect(() => {
    setConversation(hookConversation.data.find((x: IConversation) => x.conversationId === selectedConversationId));
  }, [selectedConversationId]);
  useEffect(() => {
    if (conversation) {
      hookConversation.update(conversation);
    }
  }, [conversation]);

  if (!hookOnboarding.data && (NeedOnboarding(hookAssistant.data.length) || hookAssistant.data.length === 0)) {
    return <Onboarding />;
  }

  const uniqueConversations = hookConversation.data.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (value: any, index: any, self: any) =>
      index === self.findIndex((conversation: IConversation) => conversation.conversationId === value.conversationId)
  );

  const filteredConversations = searchText
    ? uniqueConversations.filter((x: IConversation) =>
        x.messages.some(
          (x: ITalk) =>
            x.conversation.question.content.toLowerCase().includes(searchText.toLocaleLowerCase()) ||
            x.result?.content.toLowerCase().includes(searchText.toLocaleLowerCase())
        )
      )
    : uniqueConversations;

  const sortedConversations = filteredConversations.sort(
    (a: IConversation, b: IConversation) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <List
      isShowingDetail={false}
      isLoading={hookConversation.isLoading}
      filtering={false}
      throttle={false}
      selectedItemId={selectedConversationId || undefined}
      onSelectionChange={(id) => {
        if (id !== selectedConversationId) {
          setSelectedConversationId(id);
        }
      }}
      searchBarPlaceholder="Search conversation..."
      searchText={searchText}
      onSearchTextChange={setSearchText}
    >
      {hookConversation.data.length === 0 ? (
        <List.EmptyView
          title="No Conversation"
          description="Your recent conversation will be showed up here"
          icon={Icon.Stars}
        />
      ) : (
        <>
          {sortedConversations && (
            <ConversationListView
              title="Recent"
              use={{ conversations: sortedConversations }}
              selectedConversation={selectedConversationId}
              actionPanel={(conversation: IConversation) => (
                <ActionPanel>
                  <Action
                    title="Conrinue Ask"
                    icon={Icon.ArrowRight}
                    onAction={() => push(<Talk conversation={conversation} />)}
                  />
                  <ActionPanel.Section title="Delete">
                    <Action
                      style={Action.Style.Destructive}
                      icon={Icon.RotateAntiClockwise}
                      title="Remove"
                      onAction={async () => {
                        await confirmAlert({
                          title: "Are you sure you want to remove this conversation?",
                          message: "This action cannot be undone",
                          icon: Icon.RotateAntiClockwise,
                          primaryAction: {
                            title: "Remove",
                            style: Alert.ActionStyle.Destructive,
                            onAction: () => {
                              hookConversation.remove(conversation);
                            },
                          },
                        });
                      }}
                    />
                  </ActionPanel.Section>
                </ActionPanel>
              )}
            />
          )}
        </>
      )}
    </List>
  );
}
