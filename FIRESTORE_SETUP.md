# Firestore Database Setup Guide

This guide will help you set up Firebase Firestore for your College Chatting App.

## 📋 Prerequisites

- A Firebase account (create one at [firebase.google.com](https://firebase.google.com))
- Node.js and npm/pnpm installed
- Your project dependencies installed (`npm install` or `pnpm install`)

## 🚀 Step-by-Step Setup

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select an existing project
3. Enter your project name (e.g., "College Chatting App")
4. Follow the setup wizard (Google Analytics is optional)
5. Click **"Create project"**

### Step 2: Enable Firestore Database

1. In your Firebase project, click on **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Choose **"Start in production mode"** (we'll set up security rules later)
4. Select a location for your database (choose the closest to your users)
5. Click **"Enable"**

### Step 3: Get Service Account Credentials (Required)

This is needed for server-side operations (API routes):

1. In Firebase Console, click the **gear icon** ⚙️ next to "Project Overview"
2. Select **"Project settings"**
3. Go to the **"Service accounts"** tab
4. Click **"Generate new private key"**
5. A JSON file will download - **keep this secure!**
6. Open the JSON file and copy its entire contents

### Step 4: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```

2. Open `.env.local` in your editor

3. Paste your service account JSON as a **single-line string**:
   ```env
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project-id",...}
   ```
   
   **Important:** 
   - Remove all line breaks from the JSON
   - The entire JSON must be on one line
   - Keep all quotes and escape characters as they are

4. Set your JWT secret:
   ```env
   JWT_SECRET=your_secure_random_string_here
   ```
   Generate a secure random string (you can use: `openssl rand -base64 32`)

5. (Optional) Set Google Perspective API key for toxicity detection:
   ```env
   GOOGLE_PERSPECTIVE_API_KEY=your_api_key_here
   ```

### Step 5: Verify Your Setup

Run the verification script to check if everything is configured correctly:

```bash
npm run verify-firebase
```

Or if you don't have the script set up:
```bash
npx tsx scripts/verify-firebase-setup.ts
```

You should see:
```
✅ Firebase setup is complete and ready to use!
```

### Step 6: (Optional) Set Up Client-Side Firebase

If you want to use Firebase features directly in client components (e.g., real-time listeners):

1. In Firebase Console, go to **Project Settings** > **General**
2. Scroll down to **"Your apps"** section
3. If you don't have a web app, click **"Add app"** > **Web** (</> icon)
4. Register your app (you can skip hosting setup)
5. Copy the Firebase configuration object

6. Add these to your `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

**Note:** Client-side Firebase is optional. Your app works fine with just the Admin SDK on the server.

## 🗄️ Database Collections

Your app uses these Firestore collections:

### 1. `students_auth` (Protected)
- Stores user authentication data
- Fields: `email`, `hashed_password`, `user_id`
- **Never exposed** to client-side queries

### 2. `queries`
- Stores user questions/queries
- Fields: `section`, `title`, `description`, `anonymous_name`, `student_id`, `created_at`
- Auto-deletes after 7 days

### 3. `comments`
- Stores replies to queries
- Fields: `query_id`, `student_id`, `content`, `anonymous_name`, `created_at`
- Automatically deleted when parent query is deleted

## 🔒 Security Rules (Recommended)

Set up Firestore security rules in Firebase Console:

1. Go to **Firestore Database** > **Rules** tab
2. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // students_auth collection - completely private
    match /students_auth/{document=**} {
      allow read, write: if false; // Only accessible via Admin SDK
    }
    
    // queries collection - read all, write authenticated only
    match /queries/{queryId} {
      allow read: if true;
      allow create: if request.auth != null; // If using Firebase Auth
      allow update, delete: if false; // Only via Admin SDK
    }
    
    // comments collection - read all, write authenticated only
    match /comments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null; // If using Firebase Auth
      allow update, delete: if false; // Only via Admin SDK
    }
  }
}
```

**Note:** Since your app uses JWT authentication (not Firebase Auth), these rules ensure all writes go through your API routes with Admin SDK.

## 🧪 Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Try signing up a new user at `/auth/signup`

3. Check Firebase Console > Firestore Database to see if the `students_auth` collection was created

4. Try creating a query and verify it appears in the `queries` collection

## 🐛 Troubleshooting

### Error: "FIREBASE_SERVICE_ACCOUNT environment variable is not set"
- Make sure you created `.env.local` (not `.env`)
- Restart your development server after adding environment variables
- Check that the JSON is on a single line

### Error: "FIREBASE_SERVICE_ACCOUNT must be valid JSON"
- Verify your JSON is properly formatted
- Make sure all quotes are escaped if needed
- Try using a JSON validator online

### Error: "Firebase connection verification failed"
- Check your internet connection
- Verify your service account key is valid and not expired
- Make sure Firestore is enabled in your Firebase project

### Collections not appearing
- Collections are created automatically when you write the first document
- Check Firebase Console > Firestore Database
- Make sure you're looking at the correct Firebase project

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)

## ✅ Next Steps

Once your setup is verified:

1. ✅ Your Firestore database is ready to use
2. ✅ All API routes will automatically use the database
3. ✅ Collections will be created automatically on first use
4. ✅ You can monitor your database in Firebase Console

Happy coding! 🎉

