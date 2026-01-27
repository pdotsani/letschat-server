import { Message } from 'ollama';
import { Response } from 'express';
import { Role } from 'letschat-types';

interface CreateMessageParams extends Message {
  chatId: string;
  content: string;
  role: Role;
} 

export const createMessage = async (res: Response, params: CreateMessageParams) => {
  const client = res.locals.client;
  const { data: { user }, error: userError } = await client.auth.getUser();

  if (userError || !user) {
    throw new Error(userError?.message ? userError.message : 'Failed to get user');
  }
  
  const { chatId, content, role } = params as CreateMessageParams;

  try {
    const { error } = await client.from('messages').insert({
      user_id: user.id,
      chat_id: chatId,
      message: content,
      role: role,
      created_at: new Date()
    });

    if (error) {
      throw new Error(error.message);
    }

    return res.json({ message: 'Message created' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create message' });
  }
}