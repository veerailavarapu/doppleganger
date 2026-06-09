'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

const searchSteps = [
  { id: 'upload', label: 'Uploading Image', emoji: '📤' },
  { id: 'analyze', label: 'Analyzing Face', emoji: '🔍' },
  { id: 'bing', label: 'Searching Bing Images', emoji: '🌐' },
  { id: 'face', label: 'Running Facial Recognition', emoji: '🤖' },
  { id: 'match', label: 'Finding Matches', emoji: '✨' },
  { id: 'save', label: 'Saving Results', emoji: '💾' },
];

export default function SearchingPage() {
  const params = useParams();
  const router = useRouter();
  const searchId = params.id as string;

  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate progressive search steps
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        const next = prev + 1;
        if (next > 0) {
          setCompleted(prev => [...prev, searchSteps[next - 1].id]);
        }
        return next;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentStep >= searchSteps.length) {
      // Search complete - trigger match fetching and redirect
      const fetchMatches = async () => {
        try {
          const response = await fetch('/api/search/matches', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ searchId, imageUrl: '' }),
          });

          if (response.ok) {
            // Add small delay for better UX
            setTimeout(() => {
              router.push(`/results/${searchId}`);
            }, 500);
          } else {
            setError('Failed to fetch matches');
          }
        } catch (err) {
          setError('An error occurred during search');
          console.error(err);
        }
      };

      fetchMatches();
    }
  }, [currentStep, searchId, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5 flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block mb-4"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 className="w-10 h-10 text-white" />
              </motion.div>
            </div>
          </motion.div>

          <h1 className="text-3xl font-display font-bold mb-2">Finding Your Twin</h1>
          <p className="text-muted-foreground">
            Searching the internet for your doppelgänger...
          </p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-3 mb-12">
          {searchSteps.map((step, idx) => {
            const isActive = currentStep === idx;
            const isCompleted = completed.includes(step.id);

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-4 rounded-lg border transition-all ${
                  isActive
                    ? 'border-accent bg-accent/10'
                    : isCompleted
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Status Icon */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-bold">
                    {isCompleted ? '✓' : isActive ? step.emoji : step.emoji}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium transition-opacity ${
                      isActive || isCompleted ? 'opacity-100' : 'opacity-50'
                    }`}>
                      {step.label}
                    </p>
                  </div>

                  {/* Indicator */}
                  {isActive && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <Loader2 className="w-4 h-4 text-accent" />
                    </motion.div>
                  )}
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-primary text-lg"
                    >
                      ✓
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-muted-foreground font-medium">Progress</span>
            <span className="text-xs text-muted-foreground font-medium">
              {Math.min(Math.round((currentStep / searchSteps.length) * 100), 100)}%
            </span>
          </div>
          <motion.div
            className="w-full h-2 rounded-full bg-border overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: '0%' }}
              animate={{
                width: `${Math.min((currentStep / searchSteps.length) * 100, 100)}%`,
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </motion.div>
        </div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-muted-foreground"
        >
          <p className="mb-2">💡 This usually takes 30-60 seconds</p>
          <p>Feel free to step away - we'll have your results soon!</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
