const request = require('supertest');
const express = require('express');

jest.mock('ollama');

// Mock dotenv
jest.mock('dotenv/config');

// Mock morgan
jest.mock('morgan', () => {
  return jest.fn(() => (req, res, next) => next());
});

const ollama = require('ollama').default;

// Define RoleTypes constant
const RoleTypes = {
  User: 'user',
  Assistant: 'assistant',
};

// Create test app (same setup as your service but without the listen call)
const createTestApp = () => {
  const app = express();
  const cors = require('cors');
  const morgan = require('morgan');

  app.use(express.json());
  app.use(cors());
  app.use(morgan('dev'));

  app.post('/api/chat', async (req, res) => {
    const { content, history, model } = req.body;

    if (!model) {
      return res.status(400).json({ error: 'Model is required' });
    }

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const newMessage = {
      role: RoleTypes.User,
      content,
    };

    try {
      const response = await ollama.chat({
        model: model,
        messages: [...(history || []), newMessage],
      });

      const {
        created_at,
        message: { role, content: responseContent },
      } = response;

      const returnMessage = {
        content: responseContent,
        messageRole: role,
        timestamp: created_at,
      };

      return res.json(returnMessage);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  return app;
};

describe('Chat Service API', () => {
  let app;
  const mockOllamaChat = ollama.chat;

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });

  describe('POST /api/chat', () => {
    describe('Successful requests', () => {
      it('should successfully process a chat request with minimal payload', async () => {
        const mockResponse = {
          model: 'llama2',
          created_at: '2024-01-08T10:00:00Z',
          message: {
            role: 'assistant',
            content: 'Hello! How can I help you?',
          },
          done: true,
          total_duration: 1000000,
          load_duration: 500000,
          prompt_eval_count: 10,
          prompt_eval_duration: 300000,
          eval_count: 20,
          eval_duration: 200000,
        };

        mockOllamaChat.mockResolvedValue(mockResponse);

        const response = await request(app)
          .post('/api/chat')
          .send({
            model: 'llama2',
            content: 'Hello',
          })
          .expect(200);

        expect(response.body).toEqual({
          content: 'Hello! How can I help you?',
          messageRole: 'assistant',
          timestamp: '2024-01-08T10:00:00Z',
        });

        expect(mockOllamaChat).toHaveBeenCalledWith({
          model: 'llama2',
          messages: [
            {
              role: 'user',
              content: 'Hello',
            },
          ],
        });
        expect(mockOllamaChat).toHaveBeenCalledTimes(1);
      });

      it('should successfully process a chat request with conversation history', async () => {
        const mockResponse = {
          model: 'llama2',
          created_at: '2024-01-08T10:05:00Z',
          message: {
            role: 'assistant',
            content: 'The capital of France is Paris.',
          },
          done: true,
          total_duration: 1000000,
          load_duration: 500000,
          prompt_eval_count: 15,
          prompt_eval_duration: 400000,
          eval_count: 25,
          eval_duration: 300000,
        };

        mockOllamaChat.mockResolvedValue(mockResponse);

        const conversationHistory = [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there!' },
        ];

        const response = await request(app)
          .post('/api/chat')
          .send({
            model: 'llama2',
            content: 'What is the capital of France?',
            history: conversationHistory,
          })
          .expect(200);

        expect(response.body).toEqual({
          content: 'The capital of France is Paris.',
          messageRole: 'assistant',
          timestamp: '2024-01-08T10:05:00Z',
        });

        expect(mockOllamaChat).toHaveBeenCalledWith({
          model: 'llama2',
          messages: [
            ...conversationHistory,
            {
              role: 'user',
              content: 'What is the capital of France?',
            },
          ],
        });
      });

      it('should handle different model names', async () => {
        const mockResponse = {
          model: 'mistral',
          created_at: '2024-01-08T10:10:00Z',
          message: {
            role: 'assistant',
            content: 'Response from Mistral',
          },
          done: true,
          total_duration: 1000000,
          load_duration: 500000,
          prompt_eval_count: 10,
          prompt_eval_duration: 300000,
          eval_count: 20,
          eval_duration: 200000,
        };

        mockOllamaChat.mockResolvedValue(mockResponse);

        await request(app)
          .post('/api/chat')
          .send({
            model: 'mistral',
            content: 'Test message',
          })
          .expect(200);

        expect(mockOllamaChat).toHaveBeenCalledWith({
          model: 'mistral',
          messages: expect.any(Array),
        });
      });

      it('should handle empty history array', async () => {
        const mockResponse = {
          model: 'llama2',
          created_at: '2024-01-08T10:15:00Z',
          message: {
            role: 'assistant',
            content: 'Response',
          },
          done: true,
          total_duration: 1000000,
          load_duration: 500000,
          prompt_eval_count: 10,
          prompt_eval_duration: 300000,
          eval_count: 20,
          eval_duration: 200000,
        };

        mockOllamaChat.mockResolvedValue(mockResponse);

        await request(app)
          .post('/api/chat')
          .send({
            model: 'llama2',
            content: 'Hello',
            history: [],
          })
          .expect(200);

        expect(mockOllamaChat).toHaveBeenCalledWith({
          model: 'llama2',
          messages: [
            {
              role: 'user',
              content: 'Hello',
            },
          ],
        });
      });
    });

    describe('Validation errors', () => {
      it('should return 400 if model is missing', async () => {
        const response = await request(app)
          .post('/api/chat')
          .send({
            content: 'Hello',
          })
          .expect(400);

        expect(response.body).toEqual({
          error: 'Model is required',
        });

        expect(mockOllamaChat).not.toHaveBeenCalled();
      });

      it('should return 400 if model is null', async () => {
        const response = await request(app)
          .post('/api/chat')
          .send({
            model: null,
            content: 'Hello',
          })
          .expect(400);

        expect(response.body).toEqual({
          error: 'Model is required',
        });
      });

      it('should return 400 if model is empty string', async () => {
        const response = await request(app)
          .post('/api/chat')
          .send({
            model: '',
            content: 'Hello',
          })
          .expect(400);

        expect(response.body).toEqual({
          error: 'Model is required',
        });
      });

      it('should return 400 if content is missing', async () => {
        const response = await request(app)
          .post('/api/chat')
          .send({
            model: 'llama2',
          })
          .expect(400);

        expect(response.body).toEqual({
          error: 'Content is required',
        });

        expect(mockOllamaChat).not.toHaveBeenCalled();
      });

      it('should return 400 if content is null', async () => {
        const response = await request(app)
          .post('/api/chat')
          .send({
            model: 'llama2',
            content: null,
          })
          .expect(400);

        expect(response.body).toEqual({
          error: 'Content is required',
        });
      });

      it('should return 400 if content is empty string', async () => {
        const response = await request(app)
          .post('/api/chat')
          .send({
            model: 'llama2',
            content: '',
          })
          .expect(400);

        expect(response.body).toEqual({
          error: 'Content is required',
        });
      });

      it('should return 400 if both model and content are missing', async () => {
        const response = await request(app)
          .post('/api/chat')
          .send({})
          .expect(400);

        expect(response.body).toEqual({
          error: 'Model is required',
        });
      });

      it('should return 400 for malformed JSON', async () => {
        await request(app)
          .post('/api/chat')
          .send('invalid json')
          .set('Content-Type', 'application/json')
          .expect(400);
      });
    });

    describe('Error handling', () => {
      it('should return 500 if ollama.chat throws an error', async () => {
        mockOllamaChat.mockRejectedValue(new Error('Ollama service error'));

        const response = await request(app)
          .post('/api/chat')
          .send({
            model: 'llama2',
            content: 'Hello',
          })
          .expect(500);

        expect(response.body).toEqual({
          error: 'Internal server error',
        });

        expect(mockOllamaChat).toHaveBeenCalled();
      });

      it('should return 500 if ollama.chat throws a network error', async () => {
        mockOllamaChat.mockRejectedValue(new Error('Network timeout'));

        await request(app)
          .post('/api/chat')
          .send({
            model: 'llama2',
            content: 'Hello',
          })
          .expect(500);
      });

      it('should return 500 for any unexpected error', async () => {
        mockOllamaChat.mockRejectedValue('Unexpected error');

        await request(app)
          .post('/api/chat')
          .send({
            model: 'llama2',
            content: 'Hello',
          })
          .expect(500);
      });
    });

    describe('Edge cases', () => {
      it('should handle very long content', async () => {
        const longContent = 'a'.repeat(10000);
        const mockResponse = {
          model: 'llama2',
          created_at: '2024-01-08T10:20:00Z',
          message: {
            role: 'assistant',
            content: 'Response to long content',
          },
          done: true,
          total_duration: 1000000,
          load_duration: 500000,
          prompt_eval_count: 10,
          prompt_eval_duration: 300000,
          eval_count: 20,
          eval_duration: 200000,
        };

        mockOllamaChat.mockResolvedValue(mockResponse);

        await request(app)
          .post('/api/chat')
          .send({
            model: 'llama2',
            content: longContent,
          })
          .expect(200);

        expect(mockOllamaChat).toHaveBeenCalledWith({
          model: 'llama2',
          messages: [
            {
              role: 'user',
              content: longContent,
            },
          ],
        });
      });

      it('should handle special characters in content', async () => {
        const specialContent = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`\n\t';
        const mockResponse = {
          model: 'llama2',
          created_at: '2024-01-08T10:25:00Z',
          message: {
            role: 'assistant',
            content: 'Response to special characters',
          },
          done: true,
          total_duration: 1000000,
          load_duration: 500000,
          prompt_eval_count: 10,
          prompt_eval_duration: 300000,
          eval_count: 20,
          eval_duration: 200000,
        };

        mockOllamaChat.mockResolvedValue(mockResponse);

        await request(app)
          .post('/api/chat')
          .send({
            model: 'llama2',
            content: specialContent,
          })
          .expect(200);
      });

      it('should handle unicode characters in content', async () => {
        const unicodeContent = '你好世界 🌍 مرحبا';
        const mockResponse = {
          model: 'llama2',
          created_at: '2024-01-08T10:30:00Z',
          message: {
            role: 'assistant',
            content: 'Response to unicode',
          },
          done: true,
          total_duration: 1000000,
          load_duration: 500000,
          prompt_eval_count: 10,
          prompt_eval_duration: 300000,
          eval_count: 20,
          eval_duration: 200000,
        };

        mockOllamaChat.mockResolvedValue(mockResponse);

        await request(app)
          .post('/api/chat')
          .send({
            model: 'llama2',
            content: unicodeContent,
          })
          .expect(200);
      });

      it('should handle large conversation history', async () => {
        const largeHistory = Array.from({ length: 100 }, (_, i) => ({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: `Message ${i}`,
        }));

        const mockResponse = {
          model: 'llama2',
          created_at: '2024-01-08T10:35:00Z',
          message: {
            role: 'assistant',
            content: 'Response after large history',
          },
          done: true,
          total_duration: 1000000,
          load_duration: 500000,
          prompt_eval_count: 10,
          prompt_eval_duration: 300000,
          eval_count: 20,
          eval_duration: 200000,
        };

        mockOllamaChat.mockResolvedValue(mockResponse);

        await request(app)
          .post('/api/chat')
          .send({
            model: 'llama2',
            content: 'New message',
            history: largeHistory,
          })
          .expect(200);

        expect(mockOllamaChat).toHaveBeenCalledWith({
          model: 'llama2',
          messages: [...largeHistory, { role: 'user', content: 'New message' }],
        });
      });
    });

    describe('CORS and middleware', () => {
      it('should handle CORS preflight requests', async () => {
        await request(app)
          .options('/api/chat')
          .expect((res) => {
            // CORS headers should be present
            expect(res.headers).toHaveProperty('access-control-allow-origin');
          });
      });

      it('should accept JSON content type', async () => {
        const mockResponse = {
          model: 'llama2',
          created_at: '2024-01-08T10:40:00Z',
          message: {
            role: 'assistant',
            content: 'Response',
          },
          done: true,
          total_duration: 1000000,
          load_duration: 500000,
          prompt_eval_count: 10,
          prompt_eval_duration: 300000,
          eval_count: 20,
          eval_duration: 200000,
        };

        mockOllamaChat.mockResolvedValue(mockResponse);

        await request(app)
          .post('/api/chat')
          .set('Content-Type', 'application/json')
          .send({
            model: 'llama2',
            content: 'Test',
          })
          .expect(200);
      });
    });
  });

  describe('Non-existent routes', () => {
    it('should return 404 for GET requests to /api/chat', async () => {
      await request(app).get('/api/chat').expect(404);
    });

    it('should return 404 for non-existent endpoints', async () => {
      await request(app).post('/api/nonexistent').expect(404);
    });

    it('should return 404 for root path', async () => {
      await request(app).get('/').expect(404);
    });
  });
});