import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';

export const WelcomeTrialModal: React.FC = () => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const checkEligibility = async () => {
      if (!isAuthenticated || !user) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      const metadata = session?.user?.user_metadata;
      const plan = metadata?.plan || 'free';
      
      // Only show if they are on free plan and have NEVER seen the trial offer, and HAVE seen onboarding
      if (plan === 'free' && !metadata?.hasSeenTrialOffer && metadata?.hasSeenOnboarding) {
        setIsOpen(true);
      }
    };

    checkEligibility();
  }, [user, isAuthenticated]);

  const handleStartTrial = async () => {
    setLoading(true);
    try {
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 3); // 3 days from now

      const { error } = await supabase.auth.updateUser({
        data: { 
          plan: 'trial',
          trialEndsAt: trialEndsAt.toISOString(),
          hasSeenTrialOffer: true 
        }
      });

      if (error) throw error;
      
      await refreshUser();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to start trial:', error);
      setErrorMsg('Failed to start trial. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async () => {
    setIsOpen(false);
    try {
      // Mark as seen so we don't bother them again
      await supabase.auth.updateUser({
        data: { hasSeenTrialOffer: true }
      });
      await refreshUser();
    } catch (error) {
      console.error('Failed to dismiss trial:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={handleDismiss}
      />
      
      <div className="relative w-full max-w-lg overflow-hidden rounded-[32px] bg-white shadow-2xl ring-1 ring-slate-200 animate-in zoom-in-95 duration-300">
        
        {/* Ambient Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[250px] h-[250px] bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[250px] h-[250px] bg-purple-500/10 blur-[60px] rounded-full pointer-events-none" />

        <button 
          onClick={handleDismiss}
          className="absolute right-4 top-4 z-10 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="relative z-10 px-8 pt-12 pb-8 text-center">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm font-medium border border-red-200">
              {errorMsg}
            </div>
          )}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 ring-4 ring-indigo-50">
            <Sparkles size={36} />
          </div>
          
          <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-slate-900">
            Unlock AURA Pro
          </h2>
          <p className="mb-8 text-lg text-slate-500">
            Experience the full power of AI-enhanced note-taking with a free 3-day trial.
          </p>

          <div className="mb-8 space-y-4 text-left">
            {[
              'Unlimited cloud storage for notes',
              'Upload images and attachments',
              'Advanced AI note enhancement',
              'Priority support & early access'
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <Check size={14} strokeWidth={3} />
                </div>
                <span className="text-slate-700 font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          <Button 
            onClick={handleStartTrial}
            variant="primary"
            size="lg"
            className="w-full h-14 rounded-2xl text-lg shadow-xl shadow-indigo-500/20 group"
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <>
                Start 3-Day Free Trial
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
          
          <p className="mt-4 text-xs font-medium text-slate-400">
            No credit card required. Automatically downgrades to Free after 3 days.
          </p>
        </div>
      </div>
    </div>
  );
};
