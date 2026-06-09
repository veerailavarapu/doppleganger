# Testing the Bing Visual Search API Integration

This guide explains how to test and verify the real Bing Visual Search API integration in the Doppelgänger Finder application.

## Quick Test (No API Key Required - Will Use Mock Data)

If you don't have a Bing API key yet, the app falls back to mock data gracefully:

1. Go to http://localhost:3000
2. Click "Get Started"
3. Upload any image
4. Click "Start Search"
5. Results will show mock data with this message in the console: `"Bing Visual Search API key not configured, using mock data"`

## Full Test with Real API (Requires Bing API Key)

### Prerequisites

1. **Azure Account**: Create free at https://azure.microsoft.com/free/
2. **Bing Visual Search API Key**: Get from Azure Portal (see `BING_API_SETUP.md`)
3. **Updated .env file**: Add your API key to `.env.local`

### Step 1: Add API Key

```bash
# Open .env.local in your project root
echo "NEXT_PUBLIC_BING_VISUAL_SEARCH_KEY=your_key_here" >> .env.local

# Replace your_key_here with actual key from Azure Portal
```

### Step 2: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
# Then restart
npm run dev
```

### Step 3: Test the Endpoint Directly

Use curl or Postman to test the backend endpoint:

```bash
# Test endpoint with a public image URL
curl -X POST http://localhost:3000/api/bing-visual-search \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800"
  }'
```

**Expected Response** (with real API):
```json
{
  "results": [
    {
      "imageUrl": "https://real-image-from-bing.com/img1.jpg",
      "sourceUrl": "https://example.com/gallery",
      "sourceName": "example.com",
      "title": "Similar image"
    },
    ...
  ],
  "count": 10
}
```

**Expected Response** (without API key):
```json
{
  "error": "Bing Visual Search API key not configured",
  "results": []
}
```

### Step 4: Test Full User Flow

1. Go to http://localhost:3000/search (or sign in and click "New Search")
2. Upload a portrait image (clear face is ideal):
   - Use your own photo, or
   - Use a public image: https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800
3. Click "Start Search"
4. Watch the animated progress page for ~3-4 seconds
5. View results on the results page

**What to verify:**
- ✅ Results come from real internet sources (not just unsplash/pexels)
- ✅ Source domains are varied (instagram.com, flickr.com, etc.)
- ✅ Image URLs are real and load in browser
- ✅ Source links are clickable
- ✅ Similarity scores decrease progressively (95% → 90% → 85%)

## Debugging Tips

### Check Browser Console

Open DevTools (F12) → Console tab and look for:

```javascript
// Success log (real API)
"Reverse image search successful: 10 results"

// Warning log (API key missing)
"Bing Visual Search API key not configured, using mock data"

// Error logs (API failure)
"Reverse image search error: [error details]"
```

### Check Server Logs

Watch the terminal running `npm run dev`:

```
GET /api/bing-visual-search 200 in 2523ms
POST /api/search/matches 201 in 3421ms
```

### Enable Verbose Logging

Add debug logging to `/api/bing-visual-search/route.ts`:

```typescript
// Add before return statement
console.log('Bing Response:', JSON.stringify(bingData, null, 2));
console.log('Processed Results:', JSON.stringify(results, null, 2));
```

### Test with Different Images

Try these public images to see different results:

```javascript
// Portrait - good for doppelgänger finding
https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800

// Landscape - may return fewer face matches
https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800

// Object - will find visually similar objects
https://images.unsplash.com/photo-1505857671763-a42f53f36632?w=800
```

## Common Testing Scenarios

### Scenario 1: Test Without API Key

**Setup**: Make sure `NEXT_PUBLIC_BING_VISUAL_SEARCH_KEY` is NOT set in `.env.local`

**Test**:
1. Upload image
2. Check console for: `"Bing Visual Search API key not configured"`
3. Results should show mock data

**Expected**: ✅ Graceful fallback to mock data

### Scenario 2: Test with Invalid API Key

**Setup**: Set `NEXT_PUBLIC_BING_VISUAL_SEARCH_KEY=invalid_key_12345`

**Test**:
1. Upload image
2. Check server logs for 401/403 error
3. Check frontend for error message

**Expected**: ✅ Shows user-friendly error, falls back to mock data

### Scenario 3: Test with Valid API Key

**Setup**: Set `NEXT_PUBLIC_BING_VISUAL_SEARCH_KEY=your_real_key`

**Test**:
1. Upload image
2. Check server logs for 200 response
3. Check results page for real images

**Expected**: ✅ Real results from Bing Visual Search

### Scenario 4: Test Rate Limiting

**Setup**: Free tier limits to 1,000 requests/month

**Test**:
1. Upload multiple images rapidly
2. After ~1,000 requests, you should see 429 error
3. Check Azure Portal for usage stats

**Expected**: ✅ Graceful error handling when limit exceeded

## API Response Inspection

To see the raw Bing API response, add this temporarily to `/api/bing-visual-search/route.ts`:

```typescript
// After fetching from Bing
const bingData = await bingResponse.json();
console.log('RAW BING RESPONSE:', JSON.stringify(bingData, null, 2));

// Return will show rawResponse in output
return NextResponse.json({
  results,
  count: results.length,
  rawResponse: bingData, // For debugging
});
```

Then check the API response in browser DevTools → Network tab → Response.

## Performance Benchmarks

Expected performance times:

| Operation | Time | Notes |
|-----------|------|-------|
| Upload image | ~500ms | File upload to Supabase |
| Bing API call | ~2000ms | Network + Bing processing |
| Response parsing | ~100ms | Convert Bing format to our format |
| Database save | ~200ms | Insert matches into Supabase |
| **Total** | **~3-4 seconds** | Shown in searching page progress |

If significantly slower, check:
- Internet connection speed
- Azure region latency (change to closer region)
- API rate limits (check Azure Portal)

## Troubleshooting Checklist

- [ ] API key is set in `.env.local`
- [ ] Dev server restarted after adding key
- [ ] API key is valid (test in Azure Portal)
- [ ] Image URL is accessible (not private/behind auth)
- [ ] Image has recognizable content (Bing works best with distinct subjects)
- [ ] Browser cache cleared (Cmd+Shift+R or Ctrl+Shift+R)
- [ ] No CORS errors in browser console
- [ ] Server logs show successful API calls

## Monitoring in Production

When deployed to production, monitor:

1. **API Success Rate**: Track successful vs failed Bing calls
2. **Response Times**: Average time for Bing API calls
3. **Error Rate**: Track 401/429/500 errors
4. **Monthly Quota**: Monitor usage against 1,000 limit (free tier)

Add to `/api/bing-visual-search/route.ts`:

```typescript
// Log metrics
const startTime = Date.now();
const duration = Date.now() - startTime;

console.log(`Bing API call: ${duration}ms, ${results.length} results`);
```

## Next Steps

Once verified:
1. Deploy to production
2. Monitor Bing API usage
3. Upgrade to Standard tier if needed (see `BING_API_SETUP.md`)
4. Consider caching results to reduce API calls
5. Add rate limiting to backend

---

**Last Updated**: June 2026  
**Status**: Ready for Testing ✅
