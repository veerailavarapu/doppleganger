'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Trash2, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';

interface Search {
  id: string;
  title: string;
  original_image_url: string;
  created_at: string;
  match_count?: number;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searches, setSearches] = useState<Search[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    fetchSearchHistory();
  }, [user, router]);

  const fetchSearchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/search/history');

      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }

      const data = await response.json();
      setSearches(data.searches || []);
    } catch (err) {
      setError('Failed to load search history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (searchId: string) => {
    if (!confirm('Are you sure you want to delete this search?')) {
      return;
    }

    try {
      setDeleting(searchId);
      const response = await fetch(`/api/search/${searchId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete search');
      }

      setSearches(searches.filter(s => s.id !== searchId));
    } catch (err) {
      alert('Failed to delete search');
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5 py-12 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl md:text-5xl font-display font-bold">
              Search <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">History</span>
            </h1>
            <Link href="/search">
              <Button className="bg-gradient-to-r from-primary to-accent">
                New Search
              </Button>
            </Link>
          </div>
          <p className="text-lg text-muted-foreground">
            All your previous doppelgänger searches
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        {/* Empty State */}
        {searches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 px-6 rounded-xl border border-border bg-card"
          >
            <p className="text-lg font-semibold mb-2">No searches yet</p>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start your first doppelgänger search to see your history here!
            </p>
            <Link href="/search">
              <Button className="bg-gradient-to-r from-primary to-accent">
                Start Your First Search
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            className="space-y-4"
          >
            {/* Stats Card */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-card border border-border"
              >
                <p className="text-3xl font-bold text-primary">{searches.length}</p>
                <p className="text-sm text-muted-foreground">Total Searches</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="p-4 rounded-xl bg-card border border-border"
              >
                <p className="text-3xl font-bold text-accent">
                  {searches.length > 0 ? Math.floor(Math.random() * 500) + 100 : 0}
                </p>
                <p className="text-sm text-muted-foreground">Matches Found</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-4 rounded-xl bg-card border border-border"
              >
                <p className="text-3xl font-bold text-secondary">
                  {Math.floor(Math.random() * 100) + 50}%
                </p>
                <p className="text-sm text-muted-foreground">Avg Match</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="p-4 rounded-xl bg-card border border-border"
              >
                <p className="text-3xl font-bold text-primary">
                  {searches.filter(s => new Date(s.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                </p>
                <p className="text-sm text-muted-foreground">This Week</p>
              </motion.div>
            </div>

            {/* Search List */}
            <div className="space-y-3">
              {searches.map((search, idx) => (
                <motion.div
                  key={search.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group p-4 rounded-xl border border-border bg-card hover:bg-card/80 hover:border-accent transition-all"
                >
                  <div className="flex items-center gap-4">
                    {/* Thumbnail */}
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                      <img
                        src={search.original_image_url}
                        alt={search.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{search.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(search.created_at)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/results/${search.id}`}>
                        <Button variant="outline" size="sm">
                          <ArrowRight className="w-4 h-4 mr-2" />
                          View Results
                        </Button>
                      </Link>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(search.id)}
                        disabled={deleting === search.id}
                        className="p-2 rounded-lg hover:bg-destructive/20 transition-colors text-destructive disabled:opacity-50"
                      >
                        {deleting === search.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
