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

# Copy .env file
COPY .env .env

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 5050

# Start the server
CMD ["npm", "start"]
