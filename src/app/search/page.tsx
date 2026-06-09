'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Upload, X, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';
import Link from 'next/link';

export default function SearchPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <h1 className="text-3xl font-bold mb-4">Sign in Required</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to search for your doppelgänger.
          </p>
          <Link href="/auth/login">
            <Button className="w-full">Sign In</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleSearch = async () => {
    if (!file || !preview) {
      setError('Please select an image');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('preview', preview);

      const response = await fetch('/api/search', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      router.push(`/searching/${data.searchId}`);
    } catch (err) {
      setError('Failed to start search. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    setFile(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5 py-12 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="mb-12 text-center">
          <Link href="/">
            <motion.div
              whileHover={{ x: -4 }}
              className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors cursor-pointer mb-6"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Home
            </motion.div>
          </Link>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Find Your <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Twin</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Upload a photo to search the internet for your doppelgänger
          </p>
        </div>

        {/* Upload Area or Preview */}
        {!preview ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative p-12 rounded-2xl border-2 transition-all cursor-pointer ${
              dragActive
                ? 'border-accent bg-accent/10'
                : 'border-dashed border-border hover:border-accent/50 bg-card/50'
            }`}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold mb-2">
                  {dragActive ? 'Drop your photo here' : 'Drag your photo here'}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse your computer
                </p>
                <p className="text-xs text-muted-foreground">
                  Supported formats: JPG, PNG, GIF • Max 10MB
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Preview */}
            <div className="relative rounded-2xl overflow-hidden border border-border bg-card p-4">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-auto rounded-xl max-h-96 object-cover"
              />
              {!loading && (
                <button
                  onClick={clearPreview}
                  className="absolute top-6 right-6 p-2 rounded-lg bg-destructive/20 hover:bg-destructive/30 transition-colors"
                >
                  <X className="w-5 h-5 text-destructive" />
                </button>
              )}
            </div>

            {/* Search Info */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-card border border-border text-center">
                <p className="text-2xl font-bold text-primary">🌐</p>
                <p className="text-xs text-muted-foreground mt-2">Multi-Source Search</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border text-center">
                <p className="text-2xl font-bold text-accent">🤖</p>
                <p className="text-xs text-muted-foreground mt-2">AI Matching</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border text-center">
                <p className="text-2xl font-bold text-secondary">💾</p>
                <p className="text-xs text-muted-foreground mt-2">Save History</p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={clearPreview}
                disabled={loading}
                className="flex-1"
              >
                Choose Different Photo
              </Button>
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-accent/20 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Start Search
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 grid md:grid-cols-2 gap-6"
        >
          <div className="p-6 rounded-xl bg-card border border-border">
            <p className="font-semibold mb-2">💡 Pro Tips</p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Use clear, well-lit photos for best results</li>
              <li>• Front-facing photos work best</li>
              <li>• Include your full face in the frame</li>
              <li>• Avoid filters or heavy makeup for accuracy</li>
            </ul>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border">
            <p className="font-semibold mb-2">🔍 How We Search</p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Bing Visual Search API</li>
              <li>• Face++ Facial Recognition</li>
              <li>• Multiple source aggregation</li>
              <li>• Similarity confidence scoring</li>
            </ul>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
