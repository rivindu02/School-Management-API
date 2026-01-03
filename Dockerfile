# Use a light version of Node.js (updated to 20 for mongoose 9.x compatibility)
FROM node:20-alpine

## 2. Add the AWS Lambda Web Adapter (This makes your app run on Lambda)
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.1 /lambda-adapter /opt/extensions/lambda-adapter

# Create a work directory inside the container
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of your code
COPY . .

# # Open port 3000
# EXPOSE 3000

# # Command to run the app
# # We use nodemon for development so it restarts when you save files
# CMD ["npx", "nodemon", "src/server.ts"]



# 5. Build your TypeScript (if you haven't already in a previous step)
# Assuming you have a 'build' script in package.json that runs 'tsc'
RUN npm run build

# 6. Set Environment Variables for Lambda Web Adapter
ENV PORT=3000
# Lambda's filesystem is read-only; redirect npm cache to /tmp
ENV NPM_CONFIG_CACHE=/tmp/.npm 

EXPOSE 3000

# 7. Start the compiled JavaScript directly (Standard Node, NO nodemon)
CMD ["node", "dist/server.js"]