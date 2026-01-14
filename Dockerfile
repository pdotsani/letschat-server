FROM node:20-alpine

WORKDIR /app

# Install git (needed for npm to clone private repos)
RUN apk add --no-cache git openssh

# Copy package files
COPY package*.json ./

# Mount SSH key at build time and install dependencies
RUN --mount=type=ssh \
    mkdir -p ~/.ssh && \
    ssh-keyscan github.com >> ~/.ssh/known_hosts && \
    npm ci

# Copy source code
COPY . .

# Environment variables
ARG DEFAULT_MODEL=gemma3
ENV DEFAULT_MODEL=$DEFAULT_MODEL
ARG OLLAMA_HOST=http://host.docker.internal:11434
ENV OLLAMA_HOST=$OLLAMA_HOST

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 5050

# Start the server
CMD ["npm", "start"]
