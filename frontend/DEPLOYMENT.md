# 🚀 Frontend Deployment Guide

## Quick Deploy Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**

   ```bash
   npm install -g vercel
   ```

2. **Deploy from frontend directory:**

   ```bash
   cd frontend
   vercel
   ```

3. **Follow the prompts:**

   - Link to existing project: No
   - Project name: astroloji-frontend
   - Directory: ./
   - Override settings: No

4. **Your app will be live at:** `https://your-project.vercel.app`

### Option 2: Netlify

1. **Build your app:**

   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Drag & drop the `dist` folder
   - Your app will be live instantly

### Option 3: GitHub Pages

1. **Add GitHub Pages dependency:**

   ```bash
   cd frontend
   npm install --save-dev gh-pages
   ```

2. **Add to package.json scripts:**

   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

## Environment Variables

If you need to configure API endpoints, create a `.env` file:

```env
VITE_API_URL=https://your-gateway-url.com
```

## Custom Domain

All platforms support custom domains:

- **Vercel**: Settings → Domains
- **Netlify**: Site settings → Domain management
- **GitHub Pages**: Repository settings → Pages

## Automatic Deployments

Connect your GitHub repository for automatic deployments on every push!
