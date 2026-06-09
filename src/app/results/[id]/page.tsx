'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Download, Share2, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';

interface Match {
  id: string;
  image_url: string;
  source_name: string;
  source_url: string;
  similarity_score: number;
}

export default function ResultsPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const searchId = params.id as string;

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const fetchResults = async () => {
      try {
        setLoading(true);

        // Fetch matches
        const matchesRes = await fetch(`/api/search/matches?searchId=${searchId}`);
        if (!matchesRes.ok) {
          throw new Error('Failed to fetch matches');
        }
        const matchesData = await matchesRes.json();
        setMatches(matchesData.matches || []);

        // Fetch search details including original image
        const searchRes = await fetch(`/api/search/details?searchId=${searchId}`);
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          setOriginalImage(searchData.search.original_image_url);
        }
      } catch (err) {
        setError('Failed to load results');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [user, searchId, router]);

  const handleShare = (matchId: string) => {
    const url = `${window.location.origin}/results/${searchId}`;
    const text = `Check out this doppelgänger match I found on Doppelgänger Finder!`;

    if (navigator.share) {
      navigator.share({
        title: 'Doppelgänger Match',
        text: text,
        url: url,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const handleDownloadResults = () => {
    const resultText = `Doppelgänger Finder Results
============================

Matches Found: ${matches.length}

${matches
  .map(
    (match, idx) => `
${idx + 1}. ${match.source_name}
   Similarity: ${(match.similarity_score * 100).toFixed(1)}%
   Source: ${match.source_url}
`
  )
  .join('\n')}

Found on Doppelgänger Finder
    `;

    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(resultText)
    );
    element.setAttribute('download', `doppelganger-results-${searchId}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-8 h-8 text-accent" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Error</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link href="/search">
            <Button>Try Another Search</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5 py-12 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/search">
            <motion.button
              whileHover={{ x: -4 }}
              className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </motion.button>
          </Link>

          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={handleDownloadResults}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              size="sm"
              onClick={() => handleShare('')}
              className="bg-gradient-to-r from-primary to-accent"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="inline-block mb-4">
            <span className="px-4 py-2 rounded-full bg-accent/20 text-accent font-medium text-sm">
              ✨ {matches.length} Matches Found
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Your Doppelgänger Results
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            We found {matches.length} potential matches across the internet. Browse through the
            results and discover who looks like you!
          </p>
        </motion.div>

        {/* Original Image Preview */}
        {originalImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-12 p-6 rounded-xl bg-card border border-border"
          >
            <p className="text-sm text-muted-foreground mb-3 font-medium">Your Photo</p>
            <img
              src={originalImage}
              alt="Original search photo"
              className="w-full max-w-md h-auto rounded-lg"
            />
          </motion.div>
        )}

        {/* Matches Grid */}
        {matches.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, staggerChildren: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
          >
            {matches
              .sort((a, b) => b.similarity_score - a.similarity_score)
              .map((match, idx) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group rounded-xl overflow-hidden border border-border bg-card hover:border-accent transition-all duration-300"
                >
                  {/* Image Container */}
                  <div className="relative overflow-hidden bg-muted h-64">
                    <img
                      src={match.image_url}
                      alt={`Match ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Similarity Score Badge - Enhanced */}
                    <motion.div
                      className="absolute top-4 right-4 z-10"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: idx * 0.05 + 0.2, duration: 0.3 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <div className="relative">
                        {/* Glowing background effect */}
                        <div
                          className="absolute inset-0 rounded-full blur-md opacity-60"
                          style={{
                            background: `linear-gradient(135deg, rgb(79, 205, 196), rgb(255, 107, 107))`,
                          }}
                        />
                        {/* Badge */}
                        <div className="relative px-4 py-2 rounded-full bg-gradient-to-r from-primary to-accent backdrop-blur-md text-white font-bold text-sm shadow-lg border border-white/20">
                          <div className="flex items-center gap-1.5">
                            <span className="text-lg">🎯</span>
                            <span>{(match.similarity_score * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <div className="w-full">
                        <p className="text-white text-sm font-semibold mb-3">
                          Similarity Score
                        </p>
                        <div className="w-full bg-white/20 rounded-full h-2 mb-3">
                          <div
                            className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all"
                            style={{
                              width: `${match.similarity_score * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-muted-foreground">
                        {match.source_name}
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleShare(match.id)}
                        className="p-2 rounded-lg hover:bg-accent/20 transition-colors"
                      >
                        <Share2 className="w-4 h-4 text-accent" />
                      </motion.button>
                    </div>

                    <a
                      href={match.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:text-accent transition-colors truncate block"
                    >
                      View Source
                    </a>
                  </div>
                </motion.div>
              ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 px-6 rounded-xl border border-border bg-card"
          >
            <p className="text-lg font-semibold mb-2">No Matches Found</p>
            <p className="text-muted-foreground mb-6">
              Try uploading a different photo with better lighting or a clearer view of your face.
            </p>
            <Link href="/search">
              <Button>Try Another Search</Button>
            </Link>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/search" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full">
              Search Again
            </Button>
          </Link>
          <Link href="/history" className="flex-1 sm:flex-none">
            <Button className="w-full bg-gradient-to-r from-primary to-accent">
              View All Searches
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
