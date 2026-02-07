# Phase 2 Setup Guide

## Quick Answer to Your Questions:

### 1. **JWT_AUTH Secret Key**
You DON'T need to get JWT from anywhere! It's just a secret string you generate yourself.

**Generated JWT_AUTH for you:**
```
XiZoxQg1uKgfOcM2ZWJkQJm50GR8_eKLrsndu_DI_Bo
```

Copy this and use it in your `.env` file.

### 2. **Database Migration Scripts**
✅ **YES! I just created them!** 

The migration scripts will automatically create tables in your Neon database:
- `backend/alembic/versions/001_create_users_table.py` - Creates users table
- `backend/alembic/versions/002_create_tasks_table.py` - Creates tasks table

---

## Complete Setup Instructions

### Step 1: Get Neon Database Connection String

1. Go to https://neon.tech
2. Sign up / Sign in (free tier is fine)
3. Create a new project (e.g., "todo-app")
4. Copy the connection string - it looks like:
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

### Step 2: Setup Backend Environment

1. Create `.env` file in `backend/` folder:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Edit `backend/.env` with your values:
   ```env
   # Paste your Neon connection string here
   DATABASE_URL=postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
   
   # Use the JWT secret I generated for you
   JWT_AUTH=XiZoxQg1uKgfOcM2ZWJkQJm50GR8_eKLrsndu_DI_Bo
   ```

### Step 3: Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 4: Run Database Migrations (Create Tables)

This will automatically create the `users` and `tasks` tables in your Neon database:

```bash
cd backend
alembic upgrade head
```

You should see:
```
INFO  [alembic.runtime.migration] Running upgrade  -> 001, create users table
INFO  [alembic.runtime.migration] Running upgrade 001 -> 002, create tasks table
```

### Step 5: Start Backend Server

```bash
cd backend
uvicorn src.main:app --reload --port 8000
```

Backend will run at: http://localhost:8000

### Step 6: Setup Frontend Environment

1. Create `.env.local` file in `frontend/` folder:
   ```bash
   cd frontend
   cp .env.local.example .env.local
   ```

2. Edit `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

### Step 7: Install Frontend Dependencies

```bash
cd frontend
npm install
```

### Step 8: Start Frontend Server

```bash
cd frontend
npm run dev
```

Frontend will run at: http://localhost:3000

---

## Test Everything Works

1. Open http://localhost:3000
2. Click "Sign Up"
3. Create an account with email and password
4. Sign in
5. Start creating tasks!

---

## Summary

**What the migration scripts do:**
- ✅ Automatically create `users` table with proper columns and indexes
- ✅ Automatically create `tasks` table with foreign key to users
- ✅ Set up indexes for performance
- ✅ Configure cascade delete (when user deleted, their tasks are deleted)

**No manual SQL needed!** Just run `alembic upgrade head` and tables are created automatically.

---

## Troubleshooting

**Problem: "alembic: command not found"**
- Solution: Make sure you installed requirements: `pip install -r requirements.txt`

**Problem: "Can't connect to database"**
- Check your DATABASE_URL is correct in `.env`
- Make sure Neon project is active (not suspended)
- Check if connection string includes `?sslmode=require` at the end

**Problem: "JWT_AUTH not found"**
- Make sure `.env` file exists in `backend/` folder
- Make sure JWT_AUTH line is uncommented (no # at start)

**Problem: Frontend can't connect to backend**
- Make sure backend is running on port 8000
- Check NEXT_PUBLIC_API_URL in frontend `.env.local` is correct

---

## Environment Variables Summary

**Backend (.env):**
```env
DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require
JWT_AUTH=XiZoxQg1uKgfOcM2ZWJkQJm50GR8_eKLrsndu_DI_Bo
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

That's it! You're ready to go! 🚀
