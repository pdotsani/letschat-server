import 'dotenv/config';
import { Ollama, ChatResponse, Message } from 'ollama';
import express, { Request, Response } from 'express';
import { type ResponseMessage, type Role, RoleTypes } from 'letschat-types';
import cors from 'cors';
import morgan from 'morgan';

import { jwtAuth } from './middleware/auth';
import { createChat } from './lib/methods/chats/create';
import { createMessage } from './lib/methods/messages/create';
import { summarize } from './lib/methods/messages/summarize';

const app = express();
const PORT = process.env.PORT ? process.env.PORT : 5050;

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'development'));

// Route middleware
app.use('/api', jwtAuth);

const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || 'http://localhost:11434'
});

/**
 * /api/chat
 * 
 * Endpoint to handle chat requests. This endpoint takes in a content and history, and returns a response message.
 * 
 */
app.post('/api/chat', async (req: Request, res: Response) => {
  const { content, history, model, chatId } = req.body;

  if (!model) {
    return res.status(400).json({ error: 'Model is required' });
  }

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  const newMessage: ResponseMessage = {
    messageRole: RoleTypes.User,
    content,
  }

  if (!history.length) {
    const summary = await summarize(ollama, model, newMessage);
    const data = await createChat(res, summary);
    
    const newChatId = data.id;

    if (!newChatId) {
      return res.status(500).json({ error: 'Failed to create chat' });
    }

    await createMessage(res, {
      chatId: newChatId,
      content: newMessage.content,
      role: newMessage.messageRole
    })
  } else {
    if (!chatId) {
      return res.status(400).json({ error: 'ChatId is required' });
    }

    await createMessage(res, {
      chatId,
      content: newMessage.content,
      role: newMessage.messageRole
    })
  }

  const modifiedHistory = history?.map((message: ResponseMessage) => ({
    role: message.messageRole,
    content: message.content
  }));

  const modifiedNewMessage: Message = {
    role: newMessage.messageRole,
    content: newMessage.content
  }

  try {
    const response = await ollama.chat({
      model: model,
      messages: [
        ...(modifiedHistory || []),
        modifiedNewMessage
      ],
    });

    const { 
      created_at, 
      message: { 
        role, 
        content 
      }} = response as ChatResponse;

    const returnMessage: ResponseMessage = {
      content,
      messageRole: role as Role,
      timestamp: created_at
    }

    await createMessage(res, {
      chatId,
      content: returnMessage.content,
      role: returnMessage.messageRole
    })
    
    return res.json(returnMessage);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      error: 'Failed response',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/api/chats', async (req: Request, res: Response) => {
  const client = res.locals.client;
  const { data: { user }, error: userError } = await client.auth.getUser();

  if (userError || !user) {
    throw new Error(userError?.message ? userError.message : 'Failed to get user');
  }

  const { data, error } = await client
    .from('chats')
    .select('id,name,updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: 'Failed to get chats' });
  }

  return res.json(data);
});

app.get('/api/chat/:chatId', async (req: Request, res: Response) => {
  const client = res.locals.client;
  const { data: { user }, error: userError } = await client.auth.getUser();

  if (userError || !user) {
    throw new Error(userError?.message ? userError.message : 'Failed to get user');
  }

  const { chatId } = req.params;

  const { data, error } = await client
    .from('messages')
    .select('message,role,created_at')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (error) {
    return res.status(500).json({ error: 'Failed to get chat messages' });
  }

  return res.json(data);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

