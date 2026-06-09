'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Upload, Search, Zap, History, Share2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const features = [
    {
      id: 'upload',
      icon: Upload,
      title: 'Upload Your Photo',
      description: 'Drag and drop or select an image to get started'
    },
    {
      id: 'search',
      icon: Search,
      title: 'Internet-Wide Search',
      description: 'We search across multiple sources for your doppelgänger'
    },
    {
      id: 'match',
      icon: Zap,
      title: 'Smart Matching',
      description: 'AI-powered facial recognition finds the closest matches'
    },
    {
      id: 'history',
      icon: History,
      title: 'Save Your Searches',
      description: 'Keep a record of all your doppelgänger discoveries'
    },
    {
      id: 'share',
      icon: Share2,
      title: 'Share Results',
      description: 'Easily share your findings with friends on social media'
    },
    {
      id: 'privacy',
      icon: Shield,
      title: 'Privacy Protected',
      description: 'Your photos and data are secure and private'
    }
  ];

  const handleGetStarted = () => {
    if (user) {
      router.push('/search');
    } else {
      router.push('/auth/sign-up');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-display text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
          >
            👥 Doppelgänger
          </motion.div>
          <div className="flex gap-3">
            {user ? (
              <>
                <Link href="/search">
                  <Button variant="outline">New Search</Button>
                </Link>
                <Link href="/history">
                  <Button variant="outline">History</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-6">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-30" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30" />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <div className="inline-block">
              <span className="px-4 py-2 rounded-full bg-accent/20 text-accent font-medium text-sm">
                ✨ Find Your Digital Twin
              </span>
            </div>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-6xl md:text-7xl font-display font-bold mb-6 leading-tight"
          >
            Discover Your <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Doppelgänger</span> Across the Internet
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Ever wondered who looks like you on the internet? Upload a photo and let our AI search the entire web to find people who share your appearance.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-accent/20 transition-all"
              onClick={handleGetStarted}
            >
              Get Started Now
            </Button>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Learn More
              </Button>
            </Link>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-12 p-8 rounded-xl bg-card border border-border overflow-hidden relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <p className="text-sm text-muted-foreground mb-4">🎯 Featured Match Result</p>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-lg opacity-20" />
                <div className="text-left flex-1">
                  <p className="font-semibold">97% Similarity Match</p>
                  <p className="text-sm text-muted-foreground">Found across 3 sources - Celebrity lookalike detected</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to find your internet twin
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.slice(0, 3).map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  onMouseEnter={() => setHoveredFeature(feature.id)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  className="p-6 rounded-xl border border-border bg-background hover:bg-card hover:border-accent transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent mb-4 flex items-center justify-center text-white">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                    <div className="mt-4 text-accent font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      Step {idx + 1} →
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to find your doppelgänger
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.slice(3).map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 rounded-xl border border-border bg-card hover:border-accent transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-accent mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Ready to Find Your Doppelgänger?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Upload your photo today and discover who looks like you across the entire internet.
          </p>
          <Button
            size="lg"
            className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-accent/20 transition-all"
            onClick={handleGetStarted}
          >
            Start Searching Now
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6 bg-card/30">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>© 2026 Doppelgänger Finder. Find your twin responsibly.</p>
        </div>
      </footer>
    </div>
  );
}
