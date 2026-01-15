import 'dotenv/config';
import { Ollama, ChatResponse, Message } from 'ollama';
import express, { Request, Response } from 'express';
import { type ResponseMessage, type Role, RoleTypes } from 'letschat-types';
import cors from 'cors';
import morgan from 'morgan';


const app = express();
const PORT = process.env.PORT ? process.env.PORT : 5050;

// Middleware
app.use(express.json());

// CORS middleware
app.use(cors());

app.use(morgan('dev')); 

const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || 'http://localhost:11434'
});

// Chat endpoint
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
    return res.status(500).json({ error: error });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

