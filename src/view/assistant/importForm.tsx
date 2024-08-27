import { Action, ActionPanel, Form, Icon, useNavigation } from "@raycast/api";
import { useForm, FormValidation } from "@raycast/utils";
import { v4 as uuidv4 } from "uuid";
import { ILlm } from "../../data/llm";
import { AssistantDefaultTemperature, IAssistant } from "../../data/assistant";
import { HookAssistant } from "../../hook/type";
import { ClearImportModel, ClearImportModelTemperature } from "../../common/llm";
import { ConfigurationTypeCommunicationDefault } from "../../helper/communication";

export const AssistantImportForm = (props: { use: { hookAssistant: HookAssistant; llms: ILlm[] } }) => {
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

        const newAssistant: IAssistant = {
          assistantId: uuidv4(),
          title: item.name,
          description: "",
          emoji: item.icon,
          avatar: "",
          model: iModel,
          modelTemperature: ClearImportModelTemperature(item.creativity, AssistantDefaultTemperature),
          promptSystem: item.instructions,
          webhookUrl: undefined,
          additionalData: "",
          snippet: undefined,
          isLocal: false,
          typeCommunication: ConfigurationTypeCommunicationDefault,
          llm: undefined,
        };

        use.hookAssistant.add({ ...newAssistant });
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
          info="Json string from https://presets.ray.so/code"
        />
      </Form>
    </>
  );
};
