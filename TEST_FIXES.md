# Test Fixes Summary - Jest Configuration

## ✅ Issues Fixed

### Problem:
Test files (`student.test.ts` and `teacher.test.ts`) were trying to connect to MongoDB on port **27017** instead of **27018**.

### Root Cause:
Your Docker Compose maps MongoDB:
- Internal container port: `27017`
- Host machine port: `27018`

Tests run on your host machine, so they need to use port **27018**.

### Files Updated:
1. ✅ `__tests__/student.test.ts` - Changed port from 27017 to 27018
2. ✅ `__tests__/teacher.test.ts` - Changed port from 27017 to 27018

### Other Test Files (Already Correct):
- ✅ `__tests__/auth.test.ts` - Using 27018
- ✅ `__tests__/course.test.ts` - Using 27018
- ✅ `__tests__/integration.test.ts` - Using 27018
- ✅ `__tests__/full-flow.test.ts` - Using 27018
- ✅ `__tests__/validation.test.ts` - Using 27018

---

## 🚀 How to Run Tests

### Option 1: Using Docker (Recommended)

```bash
# Start MongoDB container
sudo docker-compose up -d mongo

# Wait 2-3 seconds for MongoDB to start
sleep 3

# Run tests
npm test
```

### Option 2: Using Local MongoDB

If you have MongoDB installed locally:

```bash
# Start MongoDB on port 27018
mongod --port 27018 --dbpath /path/to/data

# In another terminal, run tests
npm test
```

### Option 3: Start Full Stack with Docker

```bash
# This starts both API and MongoDB
sudo docker-compose up --build

# In another terminal, run tests
npm test
```

---

## 🧪 Verify Tests Work

### Run Specific Test Files:

```bash
# Test authentication
npm test -- auth.test.ts

# Test courses
npm test -- course.test.ts

# Test students
npm test -- student.test.ts

# Test teachers
npm test -- teacher.test.ts

# Test integration
npm test -- integration.test.ts

# Test full flow
npm test -- full-flow.test.ts

# Test validation
npm test -- validation.test.ts
```

### Run All Tests:

```bash
npm test
```

---

## 🔧 Troubleshooting

### Error: "connect ECONNREFUSED 127.0.0.1:27018"

**Solution:** MongoDB is not running. Start it:

```bash
sudo docker-compose up -d mongo
```

### Error: "connect ECONNREFUSED 127.0.0.1:27017"

**Solution:** Old test cache. Clear Jest cache:

```bash
# Clear Jest cache
npx jest --clearCache

# Run tests again
npm test
```

### Error: "MongooseServerSelectionError"

**Solution:** MongoDB container not ready. Wait and retry:

```bash
# Stop all containers
sudo docker-compose down

# Start MongoDB only
sudo docker-compose up -d mongo

# Wait for it to be ready
sleep 5

# Run tests
npm test
```

### MongoDB Connection in Tests vs App

**Important:** Tests and app use DIFFERENT MongoDB connections:

```
┌─────────────────────────────────────────┐
│  Docker Compose Setup                   │
├─────────────────────────────────────────┤
│  Container: mongo                       │
│  Internal Port: 27017                   │
│  External Port: 27018                   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  API Container (docker-compose up)      │
├─────────────────────────────────────────┤
│  Connects to: mongodb://mongo:27017     │
│  (Uses internal Docker network)         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Tests (npm test)                       │
├─────────────────────────────────────────┤
│  Run on: Your host machine              │
│  Connects to: localhost:27018           │
│  (Uses exposed port)                    │
└─────────────────────────────────────────┘
```

---

## ✅ Test Configuration Summary

### All Test Files Use:
```typescript
process.env.MONGO_URI = 'mongodb://localhost:27018/school_db_test';
```

### Production/Development Uses:
```typescript
// In docker-compose.yml
MONGO_URI=mongodb://mongo:27017/school_db
```

### Port Mapping:
```yaml
# docker-compose.yml
mongo:
  ports:
    - "27018:27017"  # host:container
```

---

## 📊 Expected Test Results

When tests run successfully, you should see:

```
PASS  __tests__/auth.test.ts
PASS  __tests__/course.test.ts
PASS  __tests__/student.test.ts
PASS  __tests__/teacher.test.ts
PASS  __tests__/integration.test.ts
PASS  __tests__/full-flow.test.ts
PASS  __tests__/validation.test.ts

Test Suites: 7 passed, 7 total
Tests:       XXX passed, XXX total
Snapshots:   0 total
Time:        XX.XXXs
```

---

## 🎯 Quick Test Command

```bash
# One-liner to start MongoDB and run tests
sudo docker-compose up -d mongo && sleep 3 && npm test
```

---

## 📝 Jest Version Note

Your tests are compatible with the latest Jest version (30.x). No changes needed for Jest itself. The only issue was the MongoDB port configuration, which is now fixed.

---

## ✅ All Fixed!

Your test configuration is now correct and follows best practices:

1. ✅ Tests use correct MongoDB port (27018)
2. ✅ All test files configured consistently
3. ✅ Docker Compose properly set up
4. ✅ Environment variables correctly set
5. ✅ Tests isolated from production database

Run `npm test` and enjoy! 🚀
