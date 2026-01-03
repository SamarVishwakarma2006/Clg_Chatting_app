# Deployment Guide

This guide will help you deploy your College Chatting App to production.

## 🚀 Recommended: Deploy to Vercel

Vercel is the recommended platform for Next.js applications. It offers:
- Automatic deployments from Git
- Built-in CI/CD
- Edge network for fast performance
- Easy environment variable management
- Free tier available

### Prerequisites

1. A GitHub, GitLab, or Bitbucket account
2. Your code pushed to a Git repository
3. A Vercel account (sign up at [vercel.com](https://vercel.com))

### Step 1: Push Your Code to Git

If you haven't already, initialize a Git repository and push your code:

```bash
# Initialize git (if not already done)
git init

# Add all files (make sure .env.local is in .gitignore)
git add .

# Commit your changes
git commit -m "Initial commit"

# Create a repository on GitHub/GitLab/Bitbucket, then:
git remote add origin <your-repository-url>
git push -u origin main
```

**Important:** Make sure `.env.local` is in your `.gitignore` file (it should be by default).

### Step 2: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign in
2. Click **"Add New Project"**
3. **Import your Git repository** (GitHub/GitLab/Bitbucket)
4. Vercel will auto-detect Next.js - click **"Deploy"**

### Step 3: Configure Environment Variables

After the initial deployment, you need to add your environment variables:

1. Go to your project dashboard on Vercel
2. Click on **"Settings"** → **"Environment Variables"**
3. Add the following variables:

#### Required Variables:

```
FIREBASE_SERVICE_ACCOUNT
```
**Value:** Your entire Firebase service account JSON as a single-line string (same as in `.env.local`)

```
JWT_SECRET
```
**Value:** Your JWT secret (same as in `.env.local`)

#### Optional Variables:

```
GOOGLE_PERSPECTIVE_API_KEY
```
**Value:** Your Google Perspective API key (if using toxicity detection)

```
CRON_SECRET
```
**Value:** A secret string for protecting your cleanup cron endpoint

#### Important Notes:
- **FIREBASE_SERVICE_ACCOUNT**: Paste the entire JSON object as a single line. Make sure to escape quotes properly or use Vercel's JSON editor if available.
- For each variable, select **"Production"**, **"Preview"**, and **"Development"** environments as needed
- After adding variables, **redeploy** your application for changes to take effect

### Step 4: Redeploy

After adding environment variables:
1. Go to **"Deployments"** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**

Or simply push a new commit to trigger a new deployment.

### Step 5: Verify Deployment

1. Visit your deployed URL (e.g., `your-app.vercel.app`)
2. Test the application:
   - Sign up a new user
   - Create a query
   - Post a comment
3. Check Vercel logs if there are any issues

### Step 6: Configure Custom Domain (Optional)

1. Go to **"Settings"** → **"Domains"**
2. Add your custom domain
3. Follow the DNS configuration instructions

## 🔄 Automatic Deployments

Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every push to other branches (creates preview URLs)

## 📋 Cron Job Configuration

Your `vercel.json` already includes a cron job that runs daily at midnight UTC to clean up old queries:

```json
{
  "crons": [
    {
      "path": "/api/cleanup",
      "schedule": "0 0 * * *"
    }
  ]
}
```

**Note:** Cron jobs are only available on Vercel Pro plan. For free tier, you can:
- Use an external cron service (e.g., cron-job.org) to call your cleanup endpoint
- Or manually trigger cleanup via the API

## 🛠️ Alternative Deployment Options

### Option 2: Deploy to Netlify

1. Sign up at [netlify.com](https://netlify.com)
2. Connect your Git repository
3. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
4. Add environment variables in Netlify dashboard
5. Deploy

**Note:** Netlify doesn't support Next.js API routes by default. You may need to use Netlify Functions or consider Vercel.

### Option 3: Deploy to Railway

1. Sign up at [railway.app](https://railway.app)
2. Create a new project from Git
3. Add environment variables
4. Railway will auto-detect and deploy

### Option 4: Self-Hosted (VPS/Docker)

#### Using Docker:

1. Create a `Dockerfile`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

2. Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - FIREBASE_SERVICE_ACCOUNT=${FIREBASE_SERVICE_ACCOUNT}
      - JWT_SECRET=${JWT_SECRET}
      - GOOGLE_PERSPECTIVE_API_KEY=${GOOGLE_PERSPECTIVE_API_KEY}
    restart: unless-stopped
```

3. Deploy:
```bash
docker-compose up -d
```

## 🔐 Security Checklist

Before deploying to production:

- [ ] All environment variables are set in your hosting platform
- [ ] `.env.local` is in `.gitignore` (never commit secrets!)
- [ ] JWT_SECRET is a strong, random string
- [ ] Firebase service account has appropriate permissions
- [ ] Firestore security rules are configured
- [ ] CORS is properly configured (if needed)
- [ ] Rate limiting is considered (for production)

## 🐛 Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Environment Variables Not Working

- Make sure variables are set for the correct environment (Production/Preview/Development)
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)
- For `FIREBASE_SERVICE_ACCOUNT`, ensure JSON is properly formatted as a single line

### Database Connection Issues

- Verify `FIREBASE_SERVICE_ACCOUNT` is correctly formatted
- Check Firebase project is active
- Ensure Firestore is enabled in Firebase Console
- Check Firebase service account has proper permissions

### API Routes Not Working

- Verify you're using a platform that supports Next.js API routes (Vercel recommended)
- Check API route logs in your hosting platform
- Verify environment variables are accessible to API routes

## 📊 Monitoring

After deployment:

1. **Vercel Analytics**: Enable in project settings for performance monitoring
2. **Firebase Console**: Monitor Firestore usage and performance
3. **Error Tracking**: Consider adding Sentry or similar for error monitoring

## 🔄 Updating Your Deployment

To update your deployed app:

1. Make changes locally
2. Commit and push to Git:
   ```bash
   git add .
   git commit -m "Your update message"
   git push
   ```
3. Vercel will automatically build and deploy

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Firebase Hosting](https://firebase.google.com/docs/hosting) (for static assets)

---

**Need Help?** Check the logs in your hosting platform's dashboard for detailed error messages.

