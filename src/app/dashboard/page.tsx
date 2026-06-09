'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5 py-12 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">Welcome back, {user.email}</h1>
            <p className="text-muted-foreground">Ready to find your doppelgänger?</p>
          </div>
          <Link href="/search">
            <Button className="bg-gradient-to-r from-primary to-accent text-lg px-8 py-6">
              Start New Search
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-8 rounded-xl bg-card border border-border hover:border-accent transition-colors"
          >
            <h3 className="text-2xl font-bold mb-4">🔍 New Search</h3>
            <p className="text-muted-foreground mb-6">
              Upload a new photo and discover who looks like you across the internet.
            </p>
            <Link href="/search">
              <Button variant="outline" className="w-full">
                Search Now
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-xl bg-card border border-border hover:border-accent transition-colors"
          >
            <h3 className="text-2xl font-bold mb-4">📋 View History</h3>
            <p className="text-muted-foreground mb-6">
              See all your previous searches and results in one place.
            </p>
            <Link href="/history">
              <Button variant="outline" className="w-full">
                View History
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
