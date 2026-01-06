# Let's Chat Server

A basic Node.js Express server with TypeScript, featuring a test route and chat API.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm (comes with Node.js)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set your configuration:
   - `DEFAULT_MODEL` - The default model to use (default: `llama2`)
   - `PORT` - Server port (default: `5000`)

## Running the Service

### Development Mode

Run the server in development mode with hot reload:
```bash
npm run dev
```

### Production Mode

Build the TypeScript code:
```bash
npm run build
```

Start the server:
```bash
npm start
```

The server will start on `http://localhost:5000` by default. You can change the port by setting the `PORT` environment variable:

```bash
PORT=8080 npm start
```

