# Let's Chat Server

A basic Node.js Express server with a test route.

## Prerequisites

- Node.js (v14 or higher recommended)
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
   - `PORT` - Server port (default: `3000`)

## Running the Service

Start the server:
```bash
npm start
```

The server will start on `http://localhost:3000` by default. You can change the port by setting the `PORT` environment variable:

```bash
PORT=8080 npm start
```

