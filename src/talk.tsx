import { Action, ActionPanel, Icon, List, useNavigation } from "@raycast/api";
import { useEffect, useState } from "react";
import { useConversations } from "./hook/useConversations";
import { useQuestion } from "./hook/useQuestion";
import { ChatView } from "./view/chat/view";
import { useAssistant } from "./hook/useAssistant";
import { ChatFullForm } from "./view/chat/form";
import { useSnippet } from "./hook/useSnippet";
import { ChatDropdown } from "./view/chat/dropdown";
import Onboarding from "./onboarding";
import { GetDevice, GetUserName } from "./helper/const";
import { useOnboarding } from "./hook/useOnboarding";
import { IAssistant } from "./data/assistant";
import { ISnippet } from "./data/snippet";
import {
  ConversationSelectedTypeAssistant,
  ConversationSelectedTypeSnippet,
  IConversation,
  NewConversation,
} from "./data/conversation";
import { useTalk } from "./hook/useTalk";
import { DefaultSnippet } from "./hook/default/snippet";
import { NeedOnboarding } from "./helper/onboarding";

export default function Talk(props: { conversation?: IConversation; arguments?: { ask: string } }) {
  const { push } = useNavigation();
  const hookConversation = useConversations();
  const hookAssistant = useAssistant();
  const hookOnboarding = useOnboarding();
  const hookSnippet = useSnippet();
  const hookTalk = useTalk();
  const question = useQuestion({
    initialQuestion: props.arguments && props.arguments.ask ? props.arguments.ask : "",
    // disableAutoLoad: props.conversation ? true : props.arguments && props.arguments.ask ? true : false,
    disableAutoLoad: false,
  });
  const isLoadConversation = props.conversation ? true : false;

  const [conversation, setConversation] = useState<IConversation>(
    props.conversation ? props.conversation : NewConversation(hookAssistant.data[0], false, GetUserName(), GetDevice())
  );
  const [selectedAssistant, setSelectedAssistant] = useState<IAssistant>(
    props.conversation && props.conversation.selectedAssistant
      ? props.conversation.selectedAssistant
      : hookAssistant.data[0]
  );
  const [selectedSnippet, setSelectedSnippet] = useState<ISnippet | undefined>(
    props.conversation && props.conversation.selectedSnippet ? props.conversation.selectedSnippet : DefaultSnippet[0]
  );

  useEffect(() => {
    if (props.conversation?.conversationId !== conversation.conversationId || hookConversation.data.length === 0) {
      hookConversation.add(conversation);
    }
  }, []);
  useEffect(() => {
    if (conversation.cleared === true && conversation.messages.length === 0) {
      hookConversation.add(conversation);
    } else {
      hookConversation.update(conversation);
    }
  }, [conversation]);
  useEffect(() => {
    if (hookAssistant.data && conversation.messages.length === 0) {
      setConversation({ ...conversation, selectedAssistant: selectedAssistant, updatedAt: new Date().toISOString() });
    }
  }, [hookAssistant.data]);
  useEffect(() => {
    if (selectedSnippet !== undefined && hookSnippet.data && conversation.messages.length === 0) {
      setConversation({ ...conversation, selectedSnippet: selectedSnippet, updatedAt: new Date().toISOString() });
    }
  }, [hookSnippet.data]);
  useEffect(() => {
    if (isLoadConversation === false && conversation.cleared === false && conversation.messages.length === 0) {
      const convs = hookConversation.data
        .filter((conversation: IConversation) => conversation.messages.length > 0)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      if (convs[0]) {
        console.info("load last conversation");
        setSelectedAssistant(convs[0].selectedAssistant);
        setConversation(convs[0]);
      }
    }
  }, [hookConversation.data]);
  useEffect(() => {
    const updatedConversation = { ...conversation, chats: hookTalk.data, updatedAt: new Date().toISOString() };
    setConversation(updatedConversation);
  }, [hookTalk.data]);
  useEffect(() => {
    const selected = hookAssistant.data.find((x: IAssistant) => x.assistantId === selectedAssistant.assistantId);
    conversation.selectedType = ConversationSelectedTypeAssistant;
    setConversation({
      ...conversation,
      selectedAssistant: selected ?? conversation.selectedAssistant,
      updatedAt: new Date().toISOString(),
    });
  }, [selectedAssistant]);
  useEffect(() => {
    if (selectedSnippet !== undefined) {
      const selected = hookSnippet.data.find((x: ISnippet) => x.snippetId === selectedSnippet.snippetId);
      conversation.selectedType = ConversationSelectedTypeSnippet;
      setConversation({
        ...conversation,
        selectedSnippet: selected ?? conversation.selectedSnippet,
        updatedAt: new Date().toISOString(),
      });
    }
  }, [selectedSnippet]);

  if (!hookOnboarding.data && (NeedOnboarding(hookAssistant.data.length) || hookAssistant.data.length === 0)) {
    return <Onboarding />;
  }

  return (
    <List
      searchText={question.data}
      isShowingDetail={conversation.messages.length > 0 ? true : false}
      filtering={false}
      isLoading={question.isLoading ? question.isLoading : hookTalk.isLoading}
      onSearchTextChange={question.update}
      throttle={false}
      navigationTitle={"Ask " + (selectedAssistant !== undefined ? selectedAssistant.title : "")}
      actions={
        !question.data ? (
          <ActionPanel>
            <ActionPanel.Section title="Input">
              <Action
                title="Full Text Input"
                shortcut={{ modifiers: ["cmd"], key: "t" }}
                icon={Icon.Text}
                onAction={() => {
                  push(
                    <ChatFullForm
                      initialQuestion={question.data}
                      onSubmit={(question: string, file: string[] | undefined) =>
                        hookTalk.ask(question, file, conversation)
                      }
                    />
                  );
                }}
              />
            </ActionPanel.Section>
          </ActionPanel>
        ) : (
          <ActionPanel>
            <Action
              title="Get Answer"
              icon={Icon.ArrowRight}
              onAction={() => hookTalk.ask(question.data, undefined, conversation)}
            />
            <ActionPanel.Section title="Input">
              <Action
                title="Full Text Input"
                shortcut={{ modifiers: ["cmd"], key: "t" }}
                icon={Icon.Text}
                onAction={() => {
                  push(
                    <ChatFullForm
                      initialQuestion={question.data}
                      onSubmit={(question: string, file: string[] | undefined) =>
                        hookTalk.ask(question, file, conversation)
                      }
                    />
                  );
                }}
              />
            </ActionPanel.Section>
          </ActionPanel>
        )
      }
      selectedItemId={hookTalk.selectedChatId || undefined}
      searchBarAccessory={
        <ChatDropdown
          use={{ assistants: hookAssistant.data, snippets: hookSnippet.data }}
          selectedAssistant={selectedAssistant}
          onAssistantChange={setSelectedAssistant}
          onSnippetChange={setSelectedSnippet}
        />
      }
      onSelectionChange={(id: string | null) => {
        if (id !== null && id !== hookTalk.selectedChatId) {
          hookTalk.setSelectedChatId(id);
        }
      }}
      searchBarPlaceholder={
        selectedAssistant !== undefined
          ? selectedAssistant.title + (hookTalk.data.length > 0 ? " - Ask another question..." : " - Ask a question...")
          : "Ask a question..."
      }
    >
      <ChatView
        data={conversation.messages}
        question={question.data}
        conversation={conversation}
        setConversation={setConversation}
        use={{ chats: hookTalk, conversations: hookConversation }}
        selectedAssistant={selectedAssistant}
      />
    </List>
  );
}
