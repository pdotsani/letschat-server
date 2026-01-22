import 'dotenv/config';
import { Ollama, ChatResponse, Message } from 'ollama';
import express, { Request, Response } from 'express';
import { type ResponseMessage, type Role, RoleTypes } from 'letschat-types';
import cors from 'cors';
import morgan from 'morgan';

import { jwtAuth } from './middleware/auth';

const app = express();
const PORT = process.env.PORT ? process.env.PORT : 5050;

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

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
  const { content, history, model } = req.body;

  if (!model) {
    return res.status(400).json({ error: 'Model is required' });
  }

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  const newMessage: Message = {
    role: RoleTypes.User,
    content
  }

  const modifiedHistory = history?.map((message: ResponseMessage) => ({
    role: message.messageRole,
    content: message.content
  }));

  try {
    const response = await ollama.chat({
      model: model,
      messages: [
        ...(modifiedHistory || []),
        newMessage
      ]
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
    
    return res.json(returnMessage);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      error: 'Failed response',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

