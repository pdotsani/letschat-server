import 'dotenv/config';
import ollama from 'ollama';
import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT ? process.env.PORT : 5000;

// Middleware
app.use(express.json());

// Chat endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  const { message, history, model } = req.body;

  if (!model) {
    return res.status(400).json({ error: 'Model is required' });
  }

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const response = await ollama.chat({
      model: model,
      messages: [
        ...(history || []),
        {
          role: 'user',
          content: message
        }
      ]
    });

    return res.json({ response });

  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

