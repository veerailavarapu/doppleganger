# Doppelgänger Finder - Deployment & Setup Guide

## Overview

The Doppelgänger Finder is a full-stack SaaS application that helps users find their look-alikes across the internet using reverse image search and facial recognition AI.

**Live Preview:** https://found-etched-puma.3000.dev.raccoonai.tech

## Technology Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend:** Supabase (PostgreSQL), Node.js
- **APIs:** Bing Visual Search, Face++ Facial Recognition
- **Authentication:** Supabase Auth (Email + Google OAuth)
- **Storage:** Supabase Storage

## Features

✅ **User Authentication**
- Email/password signup and login
- Google OAuth integration
- Password recovery
- Secure session management

✅ **Image Upload & Search**
- Drag-and-drop file upload
- Image validation (type, size: 10MB max)
- Supabase storage integration
- Real-time progress tracking

✅ **Internet-Wide Reverse Image Search**
- Bing Visual Search API integration
- Real image results from across the web
- Source attribution and links
- Top 10 matches per search

✅ **Facial Recognition & Similarity Scoring**
- Face++ API integration for facial detection
- Real facial similarity scoring (0-100)
- Face quality analysis
- Multiple face detection and comparison

✅ **Search History**
- Complete search history with thumbnails
- Quick access to previous results
- Delete functionality
- Statistics dashboard

✅ **Results Gallery**
- Grid-based match display
- Similarity score badges
- Source attribution with clickable links
- Download and share functionality

✅ **Responsive Design**
- Mobile-optimized interface
- Dark/light theme support
- Accessible components (Radix UI)
- Fast, production-ready

## Setup Instructions

### Prerequisites

1. **Supabase Project**
   - Create account at https://supabase.com
   - Create new project
   - Get your project URL and API keys

2. **Bing Visual Search API**
   - Get API key from Azure Portal
   - See `BING_API_SETUP.md` for detailed instructions

3. **Face++ API (Optional for mock data fallback)**
   - Get API key from https://www.faceplusplus.com
   - See `FACEPP_API_SETUP.md` for detailed instructions

### Environment Setup

1. Create `.env` file in project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Bing Visual Search API
NEXT_PUBLIC_BING_VISUAL_SEARCH_KEY=your_bing_api_key

# Face++ API (Optional)
NEXT_PUBLIC_FACEPP_API_KEY=your_facepp_api_key
FACEPP_API_SECRET=your_facepp_api_secret
```

2. Alternative: Connect Supabase account through UI
   - Click ☁️ (Cloud) button in preview panel
   - Select Supabase and authenticate
   - Credentials auto-populated in `.env`

### Database Setup

Tables are auto-created via Supabase schema:

**searches table:**
- Stores user search history
- Links to user via RLS policies

**matches table:**
- Stores facial matches from reverse image search
- Links to searches table
- Contains similarity scores

Row Level Security (RLS) policies ensure users only access their own data.

### Deployment

#### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

#### Self-Hosted (Docker)

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t doppelganger-finder .
docker run -p 3000:3000 --env-file .env doppelganger-finder
```

#### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

## API Reference

### Search Endpoints

**POST /api/search** - Create new search
```javascript
{
  image: File,        // Image file
  title?: string      // Optional search title
}

// Response
{
  searchId: "uuid",
  imageUrl: "...",
  createdAt: "2026-06-09T..."
}
```

**GET /api/search/history** - Get user's searches
```javascript
// Response
[
  {
    id: "uuid",
    title: "My search",
    original_image_url: "...",
    created_at: "2026-06-09T...",
    match_count: 10
  }
]
```

**POST /api/search/matches** - Process matches
```javascript
{
  searchId: "uuid",
  imageUrl: "storage-url"
}

// Response
{
  matches: [
    {
      id: "uuid",
      image_url: "...",
      source_url: "...",
      source_name: "website.com",
      similarity_score: 0.87
    }
  ],
  count: 10
}
```

**DELETE /api/search/[id]** - Delete search
```javascript
// Response
{ success: true }
```

### Face Detection Endpoints

**POST /api/facepp-detect** - Detect faces in image
```javascript
{
  imageUrl: "https://..."
}

// Response (mock or real)
{
  faces: [
    {
      face_token: "token123",
      attributes: {
        gender: "male",
        age: 28,
        face_quality: 0.95
      }
    }
  ]
}
```

**POST /api/facepp-compare** - Compare two faces
```javascript
{
  faceToken1: "token1",
  faceToken2: "token2"
}

// Response
{
  confidence: 82.5,          // 0-100 score
  thresholds: {
    "1%": 65.3,              // 1% false positive rate
    "0.1%": 72.8,            // 0.1% false positive rate
    "0.01%": 80.5            // 0.01% false positive rate
  }
}
```

## Testing

### Manual Testing

1. **Authentication Flow**
   - Sign up with email
   - Login with credentials
   - Test Google OAuth
   - Test password recovery

2. **Search Flow**
   - Upload image from local device
   - Drag-drop image
   - View progress indicators
   - Check results gallery

3. **Results Display**
   - Verify similarity scores
   - Check source attributions
   - Test clickable links
   - Download images

4. **History Management**
   - View search history
   - Delete searches
   - Check statistics

### API Testing

Use curl or Postman:

```bash
# Detect faces
curl -X POST http://localhost:3000/api/facepp-detect \
  -H "Content-Type: application/json" \
  -d '{"imageUrl":"https://..."}'

# Compare faces
curl -X POST http://localhost:3000/api/facepp-compare \
  -H "Content-Type: application/json" \
  -d '{"faceToken1":"token1","faceToken2":"token2"}'

# Get search history
curl http://localhost:3000/api/search/history \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

## Troubleshooting

### "Unauthorized" on Protected Routes
- Check Supabase auth session
- Verify user is logged in
- Check browser cookies

### Bing API Returns 403
- Verify API key is set in `.env`
- Check API key is valid and active
- Confirm API subscription tier allows image search

### Face++ API Not Detecting Faces
- Ensure image quality is good (lighting, resolution)
- Try different image with multiple faces
- Check API key and secrets are correct
- App falls back to position-based scoring if Face++ unavailable

### Storage Upload Fails
- Check file size (max 10MB)
- Verify file type is image (jpg, png, webp, gif)
- Confirm Supabase storage bucket exists
- Check storage RLS policies allow uploads

## Performance Optimization

- **CDN:** Supabase Storage uses Cloudflare CDN
- **Database:** PostgreSQL with indexes on user_id, search_id
- **Images:** Automatic optimization by browser
- **Code Splitting:** Dynamic imports for heavy components
- **Caching:** Next.js static generation for pages

## Security

- **Authentication:** Supabase handles session management
- **RLS Policies:** User data isolated at database level
- **API Keys:** Server-side only (Face++ secret, service role key)
- **CORS:** Server-side API wrappers prevent direct API calls
- **File Validation:** File type and size checked on server

## Monitoring

### Key Metrics
- Search completion time
- Facial match accuracy
- API response times
- Storage usage
- Active users

### Logging
- API request/response logs in `/tmp/dev.log`
- Console errors logged to browser dev tools
- Database query logs available in Supabase dashboard

## Support & Resources

- **Bing Visual Search:** https://learn.microsoft.com/en-us/bing/search-apis/bing-visual-search/
- **Face++ API:** https://www.faceplusplus.com/api-overview/
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs

## License

MIT License - See LICENSE file for details

## Changelog

**v1.0.0** (2026-06-09)
- Initial release
- Bing Visual Search integration
- Face++ facial recognition
- Supabase backend with auth
- Full search history and results gallery

---

**Questions?** Email support@doppelganger-finder.com or check GitHub issues.
