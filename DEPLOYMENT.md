# Deployment Guide for CabMate

This guide covers deploying CabMate to various hosting platforms.

## 🌐 Vercel (Recommended)

Vercel is perfect for React applications and offers seamless deployment.

### Steps:

1. **Push your code to GitHub**
2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect it's a Vite project

3. **Configure Environment Variables**:
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add your environment variables:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_key
     VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
     ```

4. **Deploy**: Vercel will automatically build and deploy

### Custom Domain:
- In Vercel dashboard, go to Settings → Domains
- Add your custom domain

---

## 🔥 Netlify

### Steps:

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   - Option A: Drag and drop the `dist` folder to [netlify.com/drop](https://netlify.com/drop)
   - Option B: Connect your GitHub repository for automatic deployments

3. **Configure Environment Variables**:
   - In Netlify dashboard, go to Site Settings → Environment Variables
   - Add your environment variables

4. **Configure Build Settings** (if using Git):
   - Build command: `npm run build`
   - Publish directory: `dist`

---

## 🐙 GitHub Pages

### Steps:

1. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json**:
   ```json
   {
     "homepage": "https://yourusername.github.io/CabMate",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Update vite.config.js**:
   ```javascript
   export default defineConfig({
     base: '/CabMate/',
     // ... other config
   })
   ```

4. **Deploy**:
   ```bash
   npm run deploy
   ```

---

## 🐳 Docker Deployment

### Dockerfile:
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Build and Run:
```bash
docker build -t cabmate .
docker run -p 3000:80 cabmate
```

---

## ☁️ Other Platforms

### Heroku:
- Use a static build pack or Express server
- Configure environment variables in Heroku dashboard

### AWS S3 + CloudFront:
- Upload built files to S3 bucket
- Configure CloudFront for CDN

### DigitalOcean:
- Use App Platform for easy deployment
- Connect GitHub repository

---

## 🔧 Environment Configuration

For all platforms, ensure you set these environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps JavaScript API key | Yes |

---

## 🚀 Production Optimizations

### Performance:
- Enable gzip compression
- Use a CDN for static assets
- Configure caching headers
- Monitor bundle size

### Security:
- Use HTTPS
- Configure Content Security Policy
- Secure API keys
- Regular dependency updates

### Monitoring:
- Set up error tracking (Sentry)
- Analytics (Google Analytics)
- Performance monitoring

---

## 🔍 Troubleshooting

### Common Issues:

1. **Blank page after deployment**:
   - Check browser console for errors
   - Verify environment variables are set
   - Check network requests in dev tools

2. **Maps not loading**:
   - Verify Google Maps API key
   - Check API restrictions in Google Cloud Console
   - Ensure Places API is enabled

3. **Supabase connection issues**:
   - Verify Supabase URL and key
   - Check CORS settings in Supabase dashboard
   - Verify database policies

4. **Build failures**:
   - Check Node.js version compatibility
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall

---

Need help? Check the [Issues](https://github.com/EmperorsReign05/CabMate/issues) or open a new one!