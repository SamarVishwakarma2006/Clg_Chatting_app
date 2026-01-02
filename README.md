# Anonymous Campus Q&A Backend

A secure, anonymous Q&A platform for college students with proper authentication and data isolation.

## 🔥 Key Features

- **College Email Only**: Only students with valid `.edu` or `.ac.in` emails can register
- **Anonymous Identity**: Random names like "Curious Panda" or "Silent Falcon" protect user identity
- **Section-based Queries**: Organized by subjects (DSA, DBMS, OS, CN, Math, etc.)
- **Comments System**: Students can reply to queries anonymously
- **Toxicity Detection**: Google Perspective API integration to filter inappropriate content
- **Auto-delete**: Queries automatically deleted after 7 days
- **Secure Authentication**: JWT-based auth with bcrypt password hashing
- **Data Isolation**: Auth data separated from query data for security

## 🏗 Architecture

### Database Collections (Firebase Firestore)

1. **students_auth** (Protected)
   - Stores email and hashed password only
   - Never exposed to query endpoints
   - Uses Firestore document IDs

2. **queries**
   - Stores questions with anonymous names
   - Links to student_id but never returns it
   - Auto-deletes after 7 days

3. **comments**
   - Stores replies with anonymous names
   - Links to both query and student
   - Automatically deleted when parent query is deleted

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
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project-id",...}
JWT_SECRET=your_jwt_secret_key
GOOGLE_PERSPECTIVE_API_KEY=your_google_perspective_api_key (optional)
CRON_SECRET=your_cron_secret (optional)
```

**Note**: 
- `FIREBASE_SERVICE_ACCOUNT` is required. Get your service account JSON from [Firebase Console](https://console.firebase.google.com/) > Project Settings > Service Accounts > Generate New Private Key. Copy the entire JSON object and paste it as a single-line string in your `.env.local` file.
- The `GOOGLE_PERSPECTIVE_API_KEY` is optional. If not provided, toxicity checking will be skipped and all messages will be allowed. Get your API key from [Google Cloud Console](https://console.cloud.google.com/).

## 📦 Setup Instructions

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database in your Firebase project
3. Generate a service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Copy the JSON content and set it as `FIREBASE_SERVICE_ACCOUNT` in your `.env.local` file (as a single-line string)
4. Set up environment variables in `.env.local`
5. Deploy to Vercel (cron job will auto-run daily)

## 🛡 Security Features

- Password hashing with bcrypt
- JWT authentication with 7-day expiry
- College email validation
- Toxicity detection via Google Perspective API (rejects messages with toxicity score ≥ 0.7)
- Owner-only query deletion
- Firestore security rules (configure in Firebase Console)
- Anonymous identity on all public-facing data
