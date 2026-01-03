# Development Setup Guide

## 🚀 Quick Start

### Option 1: Docker (Recommended for Production-like Environment)

```bash
# Start everything (API + MongoDB)
npm run docker:up

# Or manually:
sudo docker-compose up --build

# Stop everything
npm run docker:down
```

**Access:**
- API: http://localhost:3000
- Swagger Docs: http://localhost:3000/api-docs
- MongoDB: localhost:27018

---

### Option 2: Local Development (Faster Iteration)

**Prerequisites:**
- MongoDB Docker container running OR local MongoDB on port 27018

#### Step 1: Start MongoDB Only

```bash
# Start just MongoDB container
sudo docker-compose up -d mongo

# Verify it's running
sudo docker ps | grep mongo
```

#### Step 2: Run API Locally

```bash
# Run in development mode (connects to localhost:27018)
npm run dev
```

**Benefits:**
- ✅ Faster startup (no Docker build)
- ✅ Instant code reload with nodemon
- ✅ Better debugging experience
- ✅ IDE integrations work better

---

## 🔧 Fixes Applied

### Issue 1: Node Version Mismatch ✅ FIXED

**Problem:**
```
npm warn EBADENGINE package: 'mongoose@9.0.1'
npm warn EBADENGINE required: { node: '>=20.19.0' }
npm warn EBADENGINE current: { node: 'v18.20.8' }
```

**Solution:**
Updated `Dockerfile` from `node:18-alpine` to `node:20-alpine`

### Issue 2: MongoDB Connection Error ✅ FIXED

**Problem:**
```
MongooseServerSelectionError: getaddrinfo EAI_AGAIN mongo
```

**Root Cause:**
- `npm run dev` runs on your **host machine**
- It tries to connect to `mongo:27017` (Docker hostname)
- Docker hostnames only work **inside Docker containers**

**Solution:**
Updated `src/app.ts` to detect environment:

```typescript
// Docker environment
mongodb://mongo:27017/school_db

// Local development
mongodb://localhost:27018/school_db
```

### Issue 3: Docker Compose ContainerConfig Error ✅ FIXED

**Problem:**
```
KeyError: 'ContainerConfig'
```

**Root Cause:**
Corrupted Docker container state from interrupted builds

**Solution:**
Ran `sudo docker-compose down -v` to clean up

---

## 📊 Environment Detection

The app now automatically detects where it's running:

| Environment | MONGO_URI | When Used |
|-------------|-----------|-----------|
| Docker Container | `mongodb://mongo:27017/school_db` | `docker-compose up` |
| Local Development | `mongodb://localhost:27018/school_db` | `npm run dev` |
| Testing | `mongodb://localhost:27018/school_db_test` | `npm test` |

---

## 🎯 Common Workflows

### Development Workflow (Recommended)

```bash
# Terminal 1: Start MongoDB
sudo docker-compose up -d mongo

# Terminal 2: Run API locally
npm run dev

# Make changes to code → Auto-reload happens

# When done
sudo docker-compose down
```

### Full Docker Workflow

```bash
# Start everything
npm run docker:up

# Make changes to code → Need to rebuild
sudo docker-compose up --build

# When done
npm run docker:down
```

### Testing Workflow

```bash
# Start MongoDB (if not running)
sudo docker-compose up -d mongo

# Wait for MongoDB to be ready
sleep 3

# Run tests
npm test
```

---

## 🔍 Troubleshooting

### "getaddrinfo EAI_AGAIN mongo"

**Cause:** Running locally but trying to connect to Docker hostname

**Solution:**
```bash
# Make sure NODE_ENV is set
NODE_ENV=development npm run dev

# Or use the updated npm script
npm run dev
```

### "connect ECONNREFUSED 127.0.0.1:27018"

**Cause:** MongoDB container not running

**Solution:**
```bash
# Start MongoDB
sudo docker-compose up -d mongo

# Verify it's running
sudo docker ps
```

### "ContainerConfig" Docker Error

**Cause:** Corrupted container state

**Solution:**
```bash
# Clean everything
sudo docker-compose down -v

# Rebuild from scratch
sudo docker-compose up --build
```

### Node Version Warnings

**Cause:** Using old Node version in Docker

**Solution:**
✅ Already fixed in Dockerfile (now uses Node 20)

Rebuild:
```bash
sudo docker-compose up --build
```

---

## 🛠️ New NPM Scripts

```json
{
  "dev": "NODE_ENV=development npm run dev",  // Local development
  "docker:up": "sudo docker-compose up --build",  // Start Docker
  "docker:down": "sudo docker-compose down"       // Stop Docker
}
```

---

## 📝 Environment Variables

### Default Values (No .env file needed)

```bash
# Development (local)
NODE_ENV=development
MONGO_URI=mongodb://localhost:27018/school_db

# Docker
NODE_ENV=production
MONGO_URI=mongodb://mongo:27017/school_db

# Testing
NODE_ENV=test
MONGO_URI=mongodb://localhost:27018/school_db_test
```

### Custom Configuration (Optional)

Create `.env` file:
```bash
NODE_ENV=development
MONGO_URI=mongodb://localhost:27018/school_db
JWT_SECRET=your-secret-key
PORT=3000
```

---

## ✅ Verification

### 1. Check MongoDB is Running

```bash
sudo docker ps

# Should see:
# school-management-api_mongo_1  mongo:latest  Up  0.0.0.0:27018->27017/tcp
```

### 2. Test API Connection

```bash
# Start API
npm run dev

# In another terminal
curl http://localhost:3000/

# Should return:
# {"message":"School Management API is ready.","version":"1.0.0",...}
```

### 3. Test Swagger

Open: http://localhost:3000/api-docs

Should see interactive API documentation

---

## 🎯 Best Practices

### ✅ For Active Development:
```bash
sudo docker-compose up -d mongo  # Start MongoDB only
npm run dev                       # Run API locally
```

**Why:**
- Faster startup
- Instant reload
- Better debugging
- No Docker build delays

### ✅ For Testing Before Deployment:
```bash
npm run docker:up  # Test full Docker setup
```

**Why:**
- Tests production-like environment
- Verifies Dockerfile works
- Ensures Docker Compose config is correct

### ✅ For Running Tests:
```bash
sudo docker-compose up -d mongo
npm test
```

---

## 🚀 Next Steps

1. **Start Development:**
   ```bash
   sudo docker-compose up -d mongo
   npm run dev
   ```

2. **Access Swagger:**
   http://localhost:3000/api-docs

3. **Generate Postman Collection:**
   ```bash
   npm run generate:postman
   ```

4. **Run Tests:**
   ```bash
   npm test
   ```

---

## 📖 Related Documentation

- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Swagger & Postman guide
- [TEST_FIXES.md](TEST_FIXES.md) - Testing setup
- [VALIDATION_BEST_PRACTICES.md](VALIDATION_BEST_PRACTICES.md) - Architecture guide

---

## 🎉 All Fixed!

Your development environment is now properly configured:

✅ Node 20 in Docker (fixes package warnings)
✅ Smart MongoDB connection (works locally & in Docker)
✅ Clean Docker state (ContainerConfig error fixed)
✅ Proper npm scripts for different workflows
✅ Environment-aware configuration

**Run this now:**
```bash
sudo docker-compose up -d mongo && npm run dev
```

Then open: http://localhost:3000/api-docs 🚀
