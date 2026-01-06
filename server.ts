import 'dotenv/config';
import ollama, { ChatResponse, Message } from 'ollama';
import express, { Request, Response } from 'express';
import { ResponseMessage, Role } from 'letschat';

const app = express();
const PORT = process.env.PORT ? process.env.PORT : 5050;

// Middleware
app.use(express.json());

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
    role: Role.User,
    content
  }

  try {
    const response = await ollama.chat({
      model: model,
      messages: [
        ...(history || []),
        newMessage
      ]
    });

    const { 
      created_at, 
      message: { 
        role: messageRole, 
        content 
      }} = response as ChatResponse;

    const returnMessage: ResponseMessage = {
      content,
      messageRole: messageRole as Role,
      timestamp: created_at
    }
    
    return res.json(returnMessage);

  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

