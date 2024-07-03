import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { TalkType } from "../../type/talk";
import { CurrentDate } from "../../common/prompt";

export const IntentRecognition = (assistantName: string, question: string) => {
  const messages = [
    new AIMessage(`As ${assistantName}, describe the user's intent.`),
    new HumanMessage(question),
  ];

  const schemas = [
    {
      name: 'describe_intention',
      description: `Describe the user intention towards ${assistantName}, based on the latest message and details from summary of their conversation.`,
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'number',
            description: `
              Type has to be set to either 1 or 0:
              0: 'query' — when ${assistantName} has to say, write, remind, translate, correct, help, simply answer to the user's question or access her long-term memory or notes. Should be picked by default and for common conversations and chit-chat.
              1: 'action' — when the user asks ${assistantName} explicitly to perform an action that she needs to do herself related to Internet connection to the external apps, services, APIs, models (like Wolfram Alpha) finding sth on a website, calculating, giving environment related info (like weather or nearest locations) accessing and reading websites/urls contents, listing/updating tasks, and events and memorizing something by ${assistantName}.
            `,
          },
          category: {
            type: 'number',
            description: `
              Category has to be set to either 1, 2, 3 or 4:
              1: 'memory' — queries related to ${assistantName}'s memory and knowledge about the user and related to him: events, preferences, relationships, music, people he (or ${assistantName}) may know (described usually by names or not commonly known people), things she know about herself and the user and things they share,
              2: 'note' — queries explicitly related to reading (not saving!) the user and ${assistantName} notes,
              3: 'resource' — queries related to links, websites, urls, apps, or knowledge that is not related to the user and ${assistantName},
              4: 'all' — chosen otherwise and for general queries
            `,
          }
        },
        required: ['category', 'type'],
      },
    },
  ]

  return {
    messages,
    schemas,
    defaultSchema: 'describe_intention'
  };
}

export const Respond = (prompt: string, question: string, conversation: TalkType[], loadConverasationsHistory: boolean): any => {
  let messages = [
    new AIMessage(prompt)
  ];

  if (loadConverasationsHistory && conversation.length) {
    conversation.forEach(({ question, result }) => {
      messages.push(new HumanMessage(question.text));
      if (result) {
        messages.push(new AIMessage(result.text));
      }
    });
  }

  messages.push(new HumanMessage(question));

  return {
    messages
  }
}

export const Plan = async (question: string, actions: any[], context: any[]): Promise<{ uuid: string }> => {
  const model = new ChatOpenAI({
    modelName: 'gpt-4-1106-preview',
    temperature: 0,
    maxConcurrency: 1,
  });

  const r = await model.invoke([
    new AIMessage(`
      As Jose, you need to pick a single action that is the most relevant to the user's query and context below. Your only job is to return UUID of this action and nothing else.
      conversation context###${context.map((doc) => doc[0].pageContent).join('\n\n')}###
      available actions###${actions.map((action) => `(${action[0].metadata.uuid}) + ${action[0].pageContent}`).join('\n\n')}###
    `),
    new HumanMessage(question + '### Pick an action (UUID): '),
  ]);

  return { uuid: r.content.toString() }
}

export const Rerank = async (question: string, documents: any) => {
  const model = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo-16k',
    temperature: 0,
    maxConcurrency: 15,
  });
  console.log('Reranking documents...');

  const checks: any = [];
  for (const [document] of documents) {
    console.log('Checking document: ' + document.metadata.name);
    checks.push({
      uuid: document.metadata.uuid,
      rank: model.invoke([
        new AIMessage(`
          Check if the following document is relevant to the user query: """${question}""" and may be helpful to answer the question / query. Return 0 if not relevant, 1 if relevant.
                
          Facts: 
            - Current date and time: ${CurrentDate()} 
                
          Warning:
            - You're forced to return 0 or 1 and forbidden to return anything else under any circumstances.
            - Pay attention to the keywords from the query, mentioned links etc.
                 
          Additional info: 
            - Document title: ${document.metadata.name}

          Document content: ###${document.pageContent}###
                 
          Query:
        `),
        new HumanMessage(question + '### Is relevant (0 or 1):'),
      ])
    });
  }

  const results = await Promise.all(checks.map((check: any) => check.rank));
  const rankings = results.map((result, index) => {
    return { uuid: checks[index].uuid, score: result.content }
  });
  console.log('Reranked documents.');
  return documents.filter((document: any) => rankings.find((ranking) => ranking.uuid === document[0].metadata.uuid && ranking.score === '1'));
}
