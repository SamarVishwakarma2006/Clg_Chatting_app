# Quick Deployment Guide

## 🚀 Deploy to Vercel in 5 Minutes

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Ready to deploy"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Click **"Deploy"** (Vercel auto-detects Next.js)

### Step 3: Add Environment Variables
In Vercel dashboard → Your Project → Settings → Environment Variables:

**Add these 2 required variables:**

1. **FIREBASE_SERVICE_ACCOUNT**
   - Copy the entire JSON from your `.env.local` file
   - Paste as a single-line string
   - Select: Production, Preview, Development

2. **JWT_SECRET**
   - Copy from your `.env.local` file
   - Select: Production, Preview, Development

**Optional:**
- `GOOGLE_PERSPECTIVE_API_KEY` (if using toxicity detection)
- `CRON_SECRET` (for cleanup endpoint protection)

### Step 4: Redeploy
After adding variables:
- Go to **Deployments** tab
- Click **"..."** on latest deployment
- Click **"Redeploy"**

### ✅ Done!
Your app is now live at `your-app.vercel.app`

---

**Need more details?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive instructions.

