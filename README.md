# Let's Chat Server

A basic Node.js Express server with TypeScript, featuring a test route and chat API.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm (comes with Node.js)

## Setup

1. Gain access to common library:
   - Ask administrator for access to `letschat-types` library
   - add ssh key from `letschat-types` to your ssh-agent
   ```bash
      # Start SSH agent if needed
      eval "$(ssh-agent -s)"

      # Add your GitHub SSH key
      ssh-add ~/.ssh/id_rsa  # or whatever key you use for GitHub
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set your configuration:
   - `NODE_ENV` - Set to `production` for production deployment (default: `development`)
   - `DEFAULT_MODEL` - The default model to use (default: `llama2`)
   - `PORT` - Server port (default: `3000`)
   - `OLLAMA_HOST` - Only needed for Docker deployment. URL for Ollama host (default: `http://localhost:11434`)
   - `FRONTEND_DOMAIN` - Only needed for Docker deployment. Frontend domain (default: `http://localhost:3000`)
   - `SUPABASE_URL` - Supabase URL for authentication (default: `undefined`)
   - `SUPABASE_PUBLISHABLE_KEY` - Supabase publishable key for authentication (default: `undefined`)

## Running the Service

### Development Mode

Run the server in development mode with hot reload:
```bash
npm run dev
```

### Docker Deployment

Build the Docker image:
```bash
docker build --ssh default -t letschat-server .
```

Run the container:
```bash
docker run -p 5050:5050 --env-file .env letschat-server:latest
```

The server will start on `http://localhost:5050`.
