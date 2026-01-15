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

# Mount .env file at build time and export environment variables
RUN --mount=type=secret,id=dotenv,dst=/tmp/.env \
    export $(cat /tmp/.env | xargs)

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 5050

# Start the server
CMD ["npm", "start"]
