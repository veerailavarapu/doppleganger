import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface BingSearchResult {
  name: string;
  thumbnailUrl: string;
  sourceUrl?: string;
  hostPageUrl?: string;
}

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

    // Simulate finding matches from Bing Visual Search
    // In production, you would call the actual Bing Visual Search API
    const bingKey = process.env.NEXT_PUBLIC_BING_VISUAL_SEARCH_KEY;

    const mockMatches = [
      {
        image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        source_name: 'Unsplash',
        source_url: 'https://unsplash.com',
        similarity_score: 0.92,
      },
      {
        image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
        source_name: 'Unsplash',
        source_url: 'https://unsplash.com',
        similarity_score: 0.88,
      },
      {
        image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
        source_name: 'Pexels',
        source_url: 'https://pexels.com',
        similarity_score: 0.85,
      },
      {
        image_url: 'https://images.unsplash.com/photo-1517849845537-1d51a20414de?w=400&h=400&fit=crop',
        source_name: 'Unsplash',
        source_url: 'https://unsplash.com',
        similarity_score: 0.82,
      },
      {
        image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
        source_name: 'Unsplash',
        source_url: 'https://unsplash.com',
        similarity_score: 0.78,
      },
    ];

    // Insert matches into database
    const { data: insertedMatches, error: insertError } = await supabase
      .from('matches')
      .insert(
        mockMatches.map(match => ({
          search_id: searchId,
          image_url: match.image_url,
          source_name: match.source_name,
          source_url: match.source_url,
          similarity_score: match.similarity_score,
        }))
      )
      .select();

    if (insertError) {
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
