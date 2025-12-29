# Anonymous Campus Q&A Backend

A secure, anonymous Q&A platform for college students with proper authentication and data isolation.

## 🔥 Key Features

- **College Email Only**: Only students with valid `.edu` or `.ac.in` emails can register
- **Anonymous Identity**: Random names like "Curious Panda" or "Silent Falcon" protect user identity
- **Section-based Queries**: Organized by subjects (DSA, DBMS, OS, CN, Math, etc.)
- **Comments System**: Students can reply to queries anonymously
- **Auto-delete**: Queries automatically deleted after 7 days
- **Secure Authentication**: JWT-based auth with bcrypt password hashing
- **Data Isolation**: Auth data separated from query data for security

## 🏗 Architecture

### Database Tables

1. **students_auth** (Protected)
   - Stores email and hashed password only
   - Never exposed to query endpoints

2. **queries**
   - Stores questions with anonymous names
   - Links to student_id but never returns it

3. **comments**
   - Stores replies with anonymous names
   - Links to both query and student

## 🚀 API Endpoints

### Authentication

- `POST /api/auth/signup` - Register with college email
- `POST /api/auth/login` - Login and get JWT token

### Queries

- `GET /api/queries?section=DSA` - Get all queries (optional section filter)
- `POST /api/queries` - Create new query (requires auth)
- `GET /api/queries/[id]` - Get single query with comments
- `DELETE /api/queries/[id]` - Delete query (only by creator)

### Comments

- `POST /api/comments` - Add comment to query (requires auth)

### Cleanup

- `POST /api/cleanup` - Delete queries older than 7 days (cron job)

## 🔐 Environment Variables

```env
DATABASE_URL=your_neon_database_url
JWT_SECRET=your_jwt_secret_key
CRON_SECRET=your_cron_secret (optional)
```

## 📦 Setup Instructions

1. Add a Neon database integration
2. Run the SQL migration scripts in the `/scripts` folder
3. Set up environment variables
4. Deploy to Vercel (cron job will auto-run daily)

## 🛡 Security Features

- Password hashing with bcrypt
- JWT authentication with 7-day expiry
- College email validation
- Owner-only query deletion
- SQL injection protection via parameterized queries
- Anonymous identity on all public-facing data
