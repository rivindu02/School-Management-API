# Use a light version of Node.js
FROM node:18-alpine

# Create a work directory inside the container
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your code
COPY . .

# Open port 3000
EXPOSE 3000

# Command to run the app
# We use nodemon for development so it restarts when you save files
CMD ["npx", "nodemon", "src/index.ts"]