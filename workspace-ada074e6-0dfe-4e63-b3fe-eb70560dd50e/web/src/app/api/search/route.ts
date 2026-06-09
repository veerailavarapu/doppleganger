import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const preview = formData.get('preview') as string;

    if (!file || !preview) {
      return NextResponse.json(
        { error: 'Missing file or preview' },
        { status: 400 }
      );
    }

    // Upload image to Supabase storage
    const fileName = `${Date.now()}-${file.name}`;
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('okxwmoasvyaaquudbrkt-storage-7111')
      .upload(`searches/${user.id}/${fileName}`, file);

    if (uploadError) {
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 400 }
      );
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from('okxwmoasvyaaquudbrkt-storage-7111')
      .getPublicUrl(`searches/${user.id}/${fileName}`);

    // Create search record
    const { data: searchData, error: searchError } = await supabase
      .from('searches')
      .insert({
        user_id: user.id,
        original_image_url: publicData.publicUrl,
        title: `Search - ${new Date().toLocaleDateString()}`,
      })
      .select()
      .single();

    if (searchError) {
      return NextResponse.json(
        { error: 'Failed to create search record' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { searchId: searchData.id, imageUrl: publicData.publicUrl },
      { status: 201 }
    );
  } catch (err) {
    console.error('Search error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
