import React, { useState, useEffect } from 'react';
import { Sparkles, FileText, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';

const ONBOARDING_STEPS = [
  {
    icon: <Sparkles size={32} />,
    title: "Welcome to AURA Ai",
    description: "Your intelligent workspace for taking notes, organizing thoughts, and boosting productivity with AI.",
    color: "from-indigo-500 to-purple-600",
    shadow: "shadow-indigo-500/30",
    ring: "ring-indigo-50"
  },
  {
    icon: <Zap size={32} />,
    title: "AI-Powered Enhancements",
    description: "Use our built-in AI to summarize, expand, or rewrite your notes instantly. Just click the 'AI Enhance' button.",
    color: "from-amber-400 to-orange-500",
    shadow: "shadow-orange-500/30",
    ring: "ring-orange-50"
  },
  {
    icon: <FileText size={32} />,
    title: "Organize Everything",
    description: "Attach files, add cover images, and use tags to keep your workspace perfectly organized and searchable.",
    color: "from-emerald-400 to-teal-500",
    shadow: "shadow-emerald-500/30",
    ring: "ring-emerald-50"
  }
];

export const OnboardingModal: React.FC = () => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const checkEligibility = async () => {
      if (!isAuthenticated || !user) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      const metadata = session?.user?.user_metadata;
      
      if (!metadata?.hasSeenOnboarding) {
        setIsOpen(true);
      }
    };

    checkEligibility();
  }, [user, isAuthenticated]);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsOpen(false);
    try {
      await supabase.auth.updateUser({
        data: { hasSeenOnboarding: true }
      });
      await refreshUser();
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  if (!isOpen) return null;

  const step = ONBOARDING_STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-0">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />
      
      <div className="relative w-full max-w-lg overflow-hidden rounded-[32px] bg-white shadow-2xl ring-1 ring-slate-200 animate-in zoom-in-95 duration-300">
        
        {/* Ambient Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[250px] h-[250px] bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none transition-all duration-500" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[250px] h-[250px] bg-purple-500/10 blur-[60px] rounded-full pointer-events-none transition-all duration-500" />

        <div className="relative z-10 px-8 pt-12 pb-8 text-center">
          <div className="flex justify-center mb-8">
            <div className="flex gap-2">
              {ONBOARDING_STEPS.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-2 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200'}`}
                />
              ))}
            </div>
          </div>

          <div className="animate-in slide-in-from-right-4 fade-in duration-300" key={currentStep}>
            <div className={`mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br ${step.color} text-white shadow-lg ${step.shadow} ring-4 ${step.ring}`}>
              {step.icon}
            </div>
            
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-slate-900">
              {step.title}
            </h2>
            <p className="mb-10 text-lg text-slate-500 leading-relaxed max-w-sm mx-auto">
              {step.description}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleNext}
              variant="primary"
              size="lg"
              className="w-full h-14 rounded-2xl text-lg shadow-xl shadow-indigo-500/20 group"
            >
              {currentStep < ONBOARDING_STEPS.length - 1 ? (
                <>
                  Continue
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              ) : (
                <>
                  Get Started
                  <CheckCircle2 size={20} className="ml-2" />
                </>
              )}
            </Button>
            
            {currentStep < ONBOARDING_STEPS.length - 1 && (
              <button 
                onClick={handleComplete}
                className="text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors py-2"
              >
                Skip tutorial
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
