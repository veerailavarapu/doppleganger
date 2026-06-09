import { NextRequest, NextResponse } from 'next/server';
import { detectFaces, analyzeImageQuality } from '@/lib/facial-recognition';

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Missing imageUrl' },
        { status: 400 }
      );
    }

    // Analyze the image quality
    const qualityAnalysis = await analyzeImageQuality(imageUrl);

    // Detect faces in the image
    const faceDetection = await detectFaces(imageUrl);

    return NextResponse.json(
      {
        quality: qualityAnalysis.quality,
        recommendations: qualityAnalysis.recommendations,
        faceCount: faceDetection.faceCount,
        confidence: faceDetection.confidence,
        faceTokens: faceDetection.faceTokens,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Facial analysis error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
