import 'dotenv/config';
import ollama from 'ollama';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;


// Middleware
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Test route is working!' });
});

app.post('/api/chat', async (req, res) => {
  const { message, history, model } = req.body;
  const response = await ollama.chat({
    model: model || process.env.DEFAULT_MODEL,
    messages: [
      ...history,
      {
        role: 'user',
        content: message
      }
    ]
  });

  res.json({ response });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

