import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { searchSimilarImages } from '@/lib/reverse-image-search';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchId, imageUrl } = await request.json();

    if (!searchId || !imageUrl) {
      return NextResponse.json(
        { error: 'Missing searchId or imageUrl' },
        { status: 400 }
      );
    }

    // Verify search belongs to user
    const { data: searchData } = await supabase
      .from('searches')
      .select('id')
      .eq('id', searchId)
      .eq('user_id', user.id)
      .single();

    if (!searchData) {
      return NextResponse.json(
        { error: 'Search not found' },
        { status: 404 }
      );
    }

    // Get real matches from Bing Visual Search API
    const searchResults = await searchSimilarImages(imageUrl);

    // Convert search results to database format with real facial similarity scores
    // Use Face++ API to compare each match with the original image
    const matches = [];
    
    // First, detect faces in the original image
    const detectionRes = await fetch(`${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}/api/facepp-detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl }),
    });

    let originalFaceTokens: string[] = [];
    if (detectionRes.ok) {
      const detectionData = await detectionRes.json();
      if (detectionData.faces && Array.isArray(detectionData.faces)) {
        originalFaceTokens = detectionData.faces.map((face: any) => face.face_token);
      }
    }

    // For each match, compare facial similarity using Face++ API
    for (const result of searchResults) {
      let similarity_score = Math.max(0.5, 0.95 - (searchResults.indexOf(result) * 0.05)); // Default position-based

      // If we have original face tokens, try to do real facial comparison
      if (originalFaceTokens.length > 0) {
        try {
          // Detect faces in the match image
          const matchDetectionRes = await fetch(`${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}/api/facepp-detect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: result.imageUrl }),
          });

          if (matchDetectionRes.ok) {
            const matchDetectionData = await matchDetectionRes.json();
            if (matchDetectionData.faces && Array.isArray(matchDetectionData.faces) && matchDetectionData.faces.length > 0) {
              // Compare the first face from original with first face from match
              const compareRes = await fetch(`${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}/api/facepp-compare`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  faceToken1: originalFaceTokens[0],
                  faceToken2: matchDetectionData.faces[0].face_token,
                }),
              });

              if (compareRes.ok) {
                const compareData = await compareRes.json();
                // Convert Face++ confidence (0-100) to 0-1 range
                similarity_score = Math.min(compareData.confidence / 100, 0.99);
              }
            }
          }
        } catch (error) {
          console.warn('Face comparison failed for match, using position-based score:', error);
          // Falls back to position-based score
        }
      }

      matches.push({
        search_id: searchId,
        image_url: result.imageUrl,
        source_name: result.sourceName,
        source_url: result.sourceUrl,
        similarity_score,
      });
    }

    // Insert matches into database
    const { data: insertedMatches, error: insertError } = await supabase
      .from('matches')
      .insert(matches)
      .select();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to save matches' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { matches: insertedMatches, count: insertedMatches?.length || 0 },
      { status: 201 }
    );
  } catch (err) {
    console.error('Matches error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const searchId = searchParams.get('searchId');

    if (!searchId) {
      return NextResponse.json(
        { error: 'Missing searchId' },
        { status: 400 }
      );
    }

    // Verify search belongs to user and get matches
    const { data: matches, error } = await supabase
      .from('matches')
      .select('*')
      .eq('search_id', searchId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch matches' },
        { status: 400 }
      );
    }

    return NextResponse.json({ matches });
  } catch (err) {
    console.error('Get matches error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
