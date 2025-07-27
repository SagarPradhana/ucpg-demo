# 🚀 Netlify Deployment Guide - CORS Solutions

## 🔴 Problem: CORS Error on Netlify Deployment

When you deploy your React app to Netlify, API calls that work locally start failing with CORS errors. This happens because:

1. **Local Development**: Your frontend and API run on the same domain (localhost)
2. **Production**: Your frontend is on Netlify's domain, but your API is on a different domain
3. **Browser Security**: Browsers block cross-origin requests unless the server explicitly allows them

## ✅ Solutions Implemented

### Solution 1: API Server CORS Configuration (Recommended)

Configure your backend API server to allow requests from your Netlify domain:

**For Express.js/Node.js:**
```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',                    // Local development
    'https://your-app-name.netlify.app',       // Netlify domain
    'https://your-custom-domain.com'           // Custom domain (if any)
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**For Flask/Python:**
```python
from flask_cors import CORS

CORS(app, origins=[
    "http://localhost:3000",
    "https://your-app-name.netlify.app",
    "https://your-custom-domain.com"
])
```

### Solution 2: Netlify Redirects (Proxy)

The `_redirects` file in your `public` folder proxies API calls:

```
# Proxy API calls to your backend
/api/*  https://your-api-server.com/api/:splat  200

# SPA fallback
/*    /index.html   200
```

### Solution 3: Environment Configuration

Created environment files for different deployment stages:

- `.env.local` - Local development
- `.env.production` - Production deployment
- `netlify.toml` - Netlify-specific configuration

### Solution 4: API Utility with Error Handling

Created `src/utils/api.ts` with:
- Environment-aware API base URLs
- Proper error handling
- Authentication token management
- CORS-friendly request configuration

## 🛠️ Deployment Steps

### 1. Update Your API Server URLs

Replace placeholder URLs in these files with your actual API server URL:

```bash
# Files to update:
- .env.production
- netlify.toml
- public/_redirects
```

**Example:**
```bash
# Replace "https://your-api-server.com" with your actual API URL
# Example: "https://api.yourapp.com" or "https://yourapp-api.herokuapp.com"
```

### 2. Set Environment Variables in Netlify

In your Netlify dashboard:
1. Go to **Site settings** → **Environment variables**
2. Add these variables:

```
VITE_API_BASE_URL = https://your-actual-api-server.com
VITE_ENVIRONMENT = production
```

### 3. Deploy to Netlify

#### Option A: Git-based Deployment (Recommended)
1. Push your code to GitHub/GitLab
2. Connect your repository to Netlify
3. Netlify will auto-deploy on git pushes

#### Option B: Manual Deployment
```bash
# Build your project
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

## 🔧 Troubleshooting

### 1. CORS Still Not Working?

**Check your API server logs:**
- Are OPTIONS requests being handled?
- Is your API server actually allowing the Netlify domain?

**Test with curl:**
```bash
curl -H "Origin: https://your-app.netlify.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://your-api-server.com/api/test
```

### 2. Environment Variables Not Working?

**In Netlify dashboard:**
1. Check that variables are set correctly
2. Redeploy your site after adding variables
3. Check build logs for environment variable values

### 3. API Proxy Not Working?

**Check your `_redirects` file:**
- Must be in the `public` folder
- Must be deployed with your app
- Check Netlify function logs for proxy errors

### 4. Still Getting Errors?

**Enable debug mode:**
```javascript
// Add to your component for debugging
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
console.log('Environment:', import.meta.env.VITE_ENVIRONMENT);
```

## 📋 Checklist Before Deployment

- [ ] API server CORS configured for Netlify domain
- [ ] Environment variables set in Netlify dashboard
- [ ] API URLs updated in configuration files
- [ ] Build command works locally (`npm run build`)
- [ ] `_redirects` file in `public` folder
- [ ] Test API endpoints manually with correct URLs

## 🌐 Testing Your Deployment

After deployment, test these scenarios:

1. **Direct API calls** - Check browser network tab
2. **Authentication flow** - Login/logout functionality
3. **Service access** - Try accessing different services
4. **Error handling** - Test with invalid requests

## 📞 Need Help?

If you're still experiencing issues:

1. **Check Netlify build logs** for any errors
2. **Check browser console** for specific error messages
3. **Check API server logs** for incoming requests
4. **Test API directly** with tools like Postman

Common error patterns:
- `Access to fetch at '...' from origin '...' has been blocked by CORS policy`
- `TypeError: Failed to fetch`
- `Network Error`

All of these usually indicate CORS configuration issues.