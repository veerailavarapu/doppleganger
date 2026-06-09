import { NextRequest, NextResponse } from 'next/server';

interface BingImageTag {
  image?: {
    url?: string;
    webSearchUrl?: string;
  };
  displayName?: string;
  actions?: Array<{
    actionType?: string;
    url?: string;
  }>;
}

interface SearchResult {
  imageUrl: string;
  sourceUrl: string;
  sourceName: string;
  title?: string;
  description?: string;
}

const BING_API_KEY = process.env.NEXT_PUBLIC_BING_VISUAL_SEARCH_KEY;

/**
 * Extracts domain name from URL for source attribution
 */
function getDomainFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname || url;
    return hostname.replace('www.', '');
  } catch {
    return 'Unknown Source';
  }
}

/**
 * Processes Bing Visual Search API response and extracts image results
 */
function processBingResponse(bingData: any): SearchResult[] {
  const results: SearchResult[] = [];

  try {
    // Extract tags from Bing response
    if (bingData.tags && Array.isArray(bingData.tags)) {
      for (const tag of bingData.tags) {
        // Get image URL
        const imageUrl = tag.image?.url;
        if (!imageUrl) continue;

        // Get source URL from actions (usually contains webSearchUrl)
        let sourceUrl = '';
        let sourceName = 'Bing Images';

        if (tag.actions && Array.isArray(tag.actions)) {
          for (const action of tag.actions) {
            if (action.actionType === 'Open' && action.url) {
              sourceUrl = action.url;
              sourceName = getDomainFromUrl(sourceUrl);
              break;
            } else if (action.actionType === 'PagesIncluding' && action.url) {
              sourceUrl = action.url;
              sourceName = getDomainFromUrl(sourceUrl);
            }
          }
        }

        // Fallback to tag displayName if no actions
        if (!sourceUrl && tag.displayName) {
          sourceName = tag.displayName;
        }

        results.push({
          imageUrl,
          sourceUrl: sourceUrl || 'https://www.bing.com/images/',
          sourceName,
          title: tag.displayName,
        });
      }
    }

    // Also check for visually similar images
    if (bingData.visuallySimilarImages && Array.isArray(bingData.visuallySimilarImages)) {
      for (const img of bingData.visuallySimilarImages.slice(0, 3)) {
        if (img.url && !results.find(r => r.imageUrl === img.url)) {
          results.push({
            imageUrl: img.url,
            sourceUrl: img.webSearchUrl || 'https://www.bing.com/images/',
            sourceName: 'Bing Similar Images',
            title: 'Similar Image',
          });
        }
      }
    }

    return results.slice(0, 10); // Return top 10 results
  } catch (error) {
    console.error('Error processing Bing response:', error);
    return results;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Missing imageUrl parameter' },
        { status: 400 }
      );
    }

    if (!BING_API_KEY) {
      return NextResponse.json(
        { error: 'Bing Visual Search API key not configured' },
        { status: 500 }
      );
    }

    // Bing Visual Search API endpoint
    const bingUrl = 'https://api.bing.microsoft.com/v7.0/images/visualsearch';

    // Prepare request to Bing API
    const headers = {
      'Ocp-Apim-Subscription-Key': BING_API_KEY,
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const body = new URLSearchParams({
      imgUrl: imageUrl,
    });

    // Call Bing Visual Search API
    const bingResponse = await fetch(bingUrl, {
      method: 'POST',
      headers,
      body: body.toString(),
    });

    if (!bingResponse.ok) {
      const errorText = await bingResponse.text();
      console.error('Bing API error:', bingResponse.status, errorText);

      // Return graceful error with suggestions
      return NextResponse.json(
        {
          error: `Bing Visual Search API failed with status ${bingResponse.status}`,
          results: [], // Empty results array so frontend can handle gracefully
          message: 'Could not fetch results from Bing. Please try again or upload a different image.',
        },
        { status: 200 } // Return 200 to not trigger client-side error handling
      );
    }

    const bingData = await bingResponse.json();

    // Process Bing response to extract usable image results
    const results = processBingResponse(bingData);

    return NextResponse.json(
      {
        results,
        count: results.length,
        rawResponse: bingData, // For debugging if needed
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Bing Visual Search error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        results: [],
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 200 } // Return 200 to allow frontend graceful handling
    );
  }
}
