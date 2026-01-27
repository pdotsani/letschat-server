import { Ollama, ChatResponse, Message } from 'ollama';
import { type ResponseMessage, type Role, RoleTypes } from 'letschat-types';

export async function summarize(ollama: Ollama, model: string, newMessage: Message) {
  const createLabelMessage: Message = {
      role: RoleTypes.System,
      content: 'Summarize the current conversation in seven words or less, declaratively without the user being mentioned.'
    }

    const labelresponse = await ollama.chat({
      model: model,
      messages: [
        newMessage,
        createLabelMessage
      ]
    });

    const { 
      message: { 
        content 
      }} = labelresponse as ChatResponse;

    return content;
}