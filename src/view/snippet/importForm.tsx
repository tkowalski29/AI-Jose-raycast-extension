import { Action, ActionPanel, Form, Icon, useNavigation } from "@raycast/api";
import { useForm, FormValidation } from "@raycast/utils";
import { v4 as uuidv4 } from "uuid";
import { HookSnippet } from "../../hook/type";
import { ILlm } from "../../data/llm";
import { ISnippet, SnippetDefaultTemperature } from "../../data/snippet";
import { ClearImportModel, ClearImportModelTemperature } from "../../common/llm";
import { ConfigurationTypeCommunicationDefault } from "../../helper/communication";

export const SnippetImportForm = (props: { use: { hookSnippet: HookSnippet; llms: ILlm[] } }) => {
  const { use } = props;
  const { pop } = useNavigation();

  const { handleSubmit } = useForm<{ json: string }>({
    onSubmit: async (data: { json: string }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      JSON.parse(data.json).map((item: any) => {
        let iModel = ClearImportModel(item.model);
        if (!use.llms.some((model) => model.key === iModel)) {
          iModel = "openai__gpt-4o-mini";
        }

        const newSnippet: ISnippet = {
          snippetId: uuidv4(),
          title: item.title,
          category: "new",
          emoji: item.icon,
          model: iModel,
          modelTemperature: ClearImportModelTemperature(item.creativity, SnippetDefaultTemperature),
          promptSystem: item.prompt,
          webhookUrl: undefined,
          isLocal: false,
          typeCommunication: ConfigurationTypeCommunicationDefault,
          description: undefined,
          tag: undefined,
          schema: undefined,
          postSchema: undefined,
        };

        use.hookSnippet.add({ ...newSnippet });
      });
      pop();
    },
    validation: {
      json: FormValidation.Required,
    },
  });

  return (
    <>
      <Form
        actions={
          <ActionPanel>
            <Action.SubmitForm title="Submit" icon={Icon.SaveDocument} onSubmit={handleSubmit} />
          </ActionPanel>
        }
      >
        <Form.TextArea
          id="json"
          title="Json string"
          placeholder='[{"name": "...", "instructions": "..."}]'
          info="Json string from https://prompts.ray.so/code"
        />
      </Form>
    </>
  );
};
