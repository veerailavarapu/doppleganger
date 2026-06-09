# Bing Visual Search API Integration Guide

This document explains how to set up and use the real Bing Visual Search API in the Doppelgänger Finder application.

## Overview

The Doppelgänger Finder uses the **Bing Visual Search API** to find images across the internet that are visually similar to the uploaded photo. This replaces mock data with real, internet-wide search results.

## Setup Instructions

### Step 1: Create an Azure Account

1. Go to [Azure Portal](https://portal.azure.com/)
2. Click "Create a resource"
3. Search for "Bing Visual Search"
4. Click "Create"

### Step 2: Configure the Resource

1. **Subscription**: Select your subscription
2. **Resource Group**: Create a new one or use existing (e.g., "doppelganger-finder")
3. **Region**: Choose a region close to your users (e.g., East US)
4. **Pricing Tier**: 
   - **Free (F0)**: 7 transactions/second, 1,000/month - Perfect for testing
   - **Standard (S1)**: Pay-as-you-go - For production

Click "Review + create" → "Create"

### Step 3: Get Your API Key

1. Go to your newly created resource
2. Click "Keys and Endpoint" in the left sidebar
3. Copy **Key 1** (or Key 2)
4. This is your `NEXT_PUBLIC_BING_VISUAL_SEARCH_KEY`

### Step 4: Add to Environment

1. Open `.env.local` in your project root
2. Add your API key:
   ```
   NEXT_PUBLIC_BING_VISUAL_SEARCH_KEY=your_copied_key_here
   ```
3. Restart your development server: `npm run dev`

## How It Works

### Request Flow

```
User uploads photo
        ↓
/api/search (stores in DB)
        ↓
Searching page shows progress
        ↓
/api/search/matches is called
        ↓
searchSimilarImages() in lib/reverse-image-search.ts
        ↓
/api/bing-visual-search (server-side endpoint)
        ↓
Calls: https://api.bing.microsoft.com/v7.0/images/visualsearch
        ↓
Bing API returns similar images + metadata
        ↓
processBingResponse() extracts results
        ↓
Results saved to Supabase & displayed
```

### API Response Processing

The Bing Visual Search API returns a complex JSON structure. Our implementation:

1. **Extracts image tags**: Gets visual similar images from `response.tags[]`
2. **Extracts source URLs**: Gets where images came from from `actions[]`
3. **Extracts domain names**: Converts URLs to readable source names
4. **Calculates similarity scores**: Uses position ranking (first result = 95%)
5. **Returns top 10 results**: Limits results for database efficiency

### File Structure

```
src/
├── lib/
│   └── reverse-image-search.ts       # Main search function (calls /api/bing-visual-search)
├── app/
│   └── api/
│       ├── bing-visual-search/
│       │   └── route.ts              # Server-side API wrapper (avoids CORS)
│       └── search/
│           └── matches/
│               └── route.ts          # Processes results & saves to DB
```

## API Implementation Details

### Client-Side: `/lib/reverse-image-search.ts`

```typescript
export async function searchSimilarImages(imageUrl: string): Promise<SearchResult[]> {
  // Calls our server endpoint to avoid CORS issues
  const response = await fetch('/api/bing-visual-search', {
    method: 'POST',
    body: JSON.stringify({ imageUrl }),
  });
  // Returns array of SearchResult objects
}
```

### Server-Side: `/api/bing-visual-search/route.ts`

```typescript
// 1. Receives imageUrl from client
// 2. Calls Bing API with authentication header
// 3. Processes complex Bing response
// 4. Returns standardized SearchResult array
```

**Key Features:**
- ✅ Error handling with graceful fallbacks
- ✅ CORS protection (server-side call)
- ✅ Response parsing and normalization
- ✅ Source domain extraction
- ✅ Image validation

## Testing the Integration

### Test with a Public Image

1. Start the app: `npm run dev`
2. Go to http://localhost:3000
3. Click "Get Started"
4. Upload or paste a public image URL:
   - Example: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800`
5. Click "Start Search"
6. Watch the searching page progress
7. View results on the results page

### Expected Results

For a portrait photo, you should see:
- ✅ Real images from across the web (not mock data)
- ✅ Source names (e.g., "unsplash.com", "flickr.com", "instagram.com")
- ✅ Clickable source links
- ✅ Similarity scores (95%, 90%, 85%, etc.)
- ✅ Mix of sources (multiple domains)

### Debugging

Enable debug logging in browser console:

```javascript
// In browser DevTools console
localStorage.debug = 'doppelganger:*'

// Then perform a search - you'll see detailed logs
```

Check server logs:
```bash
# Watch dev server output
npm run dev
# You'll see API calls logged
```

## Troubleshooting

### Issue: "API key not configured"

**Solution**: 
- Ensure `.env.local` has `NEXT_PUBLIC_BING_VISUAL_SEARCH_KEY=your_key`
- Restart dev server after adding key
- Check key is copied exactly (no spaces)

### Issue: Still seeing mock results

**Solution**:
- Clear browser cache: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Restart dev server: `npm run dev`
- Check browser console for errors (F12)

### Issue: "Invalid API Key" error

**Solution**:
- Verify key in Azure Portal (Keys & Endpoint)
- Ensure you're using Key 1 or Key 2 (not endpoint)
- Check key hasn't expired (Azure portal shows status)
- Try creating a new resource if key is very old

### Issue: "Too many requests" (429 error)

**Solution**:
- You've exceeded free tier limit (7 req/sec, 1,000/month)
- Upgrade to Standard tier: https://azure.microsoft.com/pricing/details/cognitive-services/search-api/visual-search/
- Or wait until next month if on free tier

### Issue: No results returned

**Solution**:
- Try a different image (some images don't have matches)
- Ensure image is a clear portrait/face (Bing Visual Search works best with distinct subjects)
- Check Bing API status: https://status.azure.com/
- Try uploading to Bing Images manually to test if image is searchable

## API Response Format

### Input
```json
{
  "imageUrl": "https://example.com/photo.jpg"
}
```

### Output (Success)
```json
{
  "results": [
    {
      "imageUrl": "https://cdn.example.com/img1.jpg",
      "sourceUrl": "https://example.com/page1",
      "sourceName": "example.com",
      "title": "Similar image"
    },
    ...
  ],
  "count": 10
}
```

### Output (Fallback/Error)
```json
{
  "error": "Bing Visual Search API failed",
  "results": [],
  "message": "Could not fetch results from Bing. Please try again."
}
```

## Rate Limits

### Free Tier (F0)
- **Requests/Second**: 7
- **Requests/Month**: 1,000
- **Cost**: Free

### Standard Tier (S1)
- **Requests/Second**: Varies
- **Pricing**: $1.50 per 1,000 transactions (up to 30M/month)
- **Cost**: ~$0.00015 per request

## Performance Notes

- **First request**: ~2-3 seconds (API calls Bing)
- **Cached requests**: ~0.5 seconds (using browser cache)
- **Result parsing**: ~100ms
- **Database save**: ~200ms
- **Total user-facing time**: ~3-4 seconds (shown in searching page)

## Advanced: Custom Source Filtering

To modify what sources appear in results, edit `processBingResponse()` in `/api/bing-visual-search/route.ts`:

```typescript
// Filter out certain domains
const blockedDomains = ['twitter.com', 'facebook.com'];
if (blockedDomains.some(d => sourceName.includes(d))) {
  continue; // Skip this result
}
```

## Advanced: Similarity Score Calculation

Currently using position-based scoring. To add real facial similarity:

1. Use Face++ API on the matches
2. Compare original face with each match
3. Replace position-based score with Face++ confidence

See `src/lib/facial-recognition.ts` for Face++ integration.

## Links & Resources

- **Azure Portal**: https://portal.azure.com/
- **Bing Visual Search API Docs**: https://docs.microsoft.com/en-us/bing/search-apis/bing-visual-search/overview
- **API Reference**: https://docs.microsoft.com/en-us/rest/api/cognitiveservices-bingsearch/bing-visual-search-api-v7-reference
- **Status Page**: https://status.azure.com/
- **Pricing**: https://azure.microsoft.com/pricing/details/cognitive-services/search-api/visual-search/

## Support

For issues:
1. Check this guide's troubleshooting section
2. Check server logs: `npm run dev`
3. Check browser console: F12 → Console tab
4. Review Bing API status: https://status.azure.com/
5. Create Azure support ticket if API is down

---

**Last Updated**: June 2026  
**Status**: Production Ready ✅
