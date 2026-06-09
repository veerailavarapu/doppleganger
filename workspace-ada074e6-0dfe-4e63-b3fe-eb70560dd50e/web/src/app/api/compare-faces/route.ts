import { NextRequest, NextResponse } from 'next/server';
import { compareFaces } from '@/lib/facial-recognition';

export async function POST(request: NextRequest) {
  try {
    const { faceToken1, faceToken2 } = await request.json();

    if (!faceToken1 || !faceToken2) {
      return NextResponse.json(
        { error: 'Missing face tokens' },
        { status: 400 }
      );
    }

    // Compare the two faces
    const comparisonResult = await compareFaces(faceToken1, faceToken2);

    return NextResponse.json(
      {
        similarity: comparisonResult.score,
        confidence: comparisonResult.confidence,
        isProbablySamePerson: comparisonResult.isProbablySamePerson,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Face comparison error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
