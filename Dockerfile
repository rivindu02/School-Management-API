# Use a light version of Node.js (updated to 20 for mongoose 9.x compatibility)
FROM node:20-alpine

# Create a work directory inside the container
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of your code
COPY . .

# Open port 3000
EXPOSE 3000

# Command to run the app
# We use nodemon for development so it restarts when you save files
CMD ["npx", "nodemon", "src/server.ts"]

