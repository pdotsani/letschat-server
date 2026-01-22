# letschat-server

This is a server that allows you to leverage the message api of ollama with any of the models available. You can link this up to a frontend. For the purposes of authentication, we are using Supabase.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm (comes with Node.js)
- Ollama
- Supabase

The frontend is a Next.js app, which can be found [here](https://github.com/pdotsani/letschat-frontend). You supabase credetials for the frontend will be used to authenticate the server.

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
   - `DEFAULT_MODEL` - The default model to use (not required) 
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
docker build --ssh default=$SSH_AUTH_SOCK --secret id=dotenv,src=.env -t letschat-server .
```

Run the container:
```bash
docker run -p 3000:3000 letschat-server
```

The server will start on `http://localhost:5050`.
