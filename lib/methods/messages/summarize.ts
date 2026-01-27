import { Ollama, ChatResponse, Message } from 'ollama';
import { type ResponseMessage, RoleTypes } from 'letschat-types';

export async function summarize(ollama: Ollama, model: string, newMessage: ResponseMessage) {
  const createLabelMessage: Message = {
    role: RoleTypes.System,
    content: 'Summarize the current conversation in seven words or less, declaratively without the user being mentioned.'
  }

  const newMessageForLabel: Message = {
    role: newMessage.messageRole,
    content: newMessage.content
  }

    const labelresponse = await ollama.chat({
      model: model,
      messages: [
        newMessageForLabel,
        createLabelMessage
      ]
    });

    const { 
      message: { 
        content 
      }} = labelresponse as ChatResponse;

    return content;
}