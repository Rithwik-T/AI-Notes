import React, { useState, useEffect } from 'react';
import { Sparkles, FileText, Zap, ArrowRight, CheckCircle2, Check } from 'lucide-react';
import { Button } from './Button';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { CheckoutModal } from './CheckoutModal';

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
  },
  {
    icon: <Sparkles size={32} />,
    title: "Choose Your Plan",
    description: "Select the plan that best fits your needs to get started.",
    color: "from-indigo-500 to-purple-600",
    shadow: "shadow-indigo-500/30",
    ring: "ring-indigo-50",
    isPlanSelection: true
  }
];

export const OnboardingModal: React.FC = () => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'ultra'>('pro');

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

  const handleSelectPlan = (plan: 'pro' | 'ultra') => {
    setSelectedPlan(plan);
    setIsCheckoutOpen(true);
  };

  const handleStartTrial = async () => {
    if (user?.hasHadTrial) return;
    
    try {
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 3); // 3 days from now
      
      await supabase.auth.updateUser({
        data: { 
          plan: 'trial',
          trialEndsAt: trialEndsAt.toISOString(),
          hasHadTrial: true,
          hasSeenOnboarding: true
        }
      });
      
      await refreshUser();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to start trial:', error);
    }
  };

  const handleCheckoutSuccess = async () => {
    setIsCheckoutOpen(false);
    await handleComplete();
  };

  if (!isOpen) return null;

  const step = ONBOARDING_STEPS[currentStep];

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-0" style={{ zIndex: 9998 }}>
        <div 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        />
        
        <div className={`relative w-full ${step.isPlanSelection ? 'max-w-5xl' : 'max-w-lg'} overflow-hidden rounded-[32px] bg-white shadow-2xl ring-1 ring-slate-200 animate-in zoom-in-95 duration-300 transition-all`}>
          
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
              {!step.isPlanSelection && (
                <div className={`mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br ${step.color} text-white shadow-lg ${step.shadow} ring-4 ${step.ring}`}>
                  {step.icon}
                </div>
              )}
              
              <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-slate-900">
                {step.title}
              </h2>
              <p className="mb-10 text-lg text-slate-500 leading-relaxed max-w-sm mx-auto">
                {step.description}
              </p>

              {step.isPlanSelection && (
                <div className="grid md:grid-cols-3 gap-6 text-left mb-8">
                  {/* Free Plan */}
                  <div className="rounded-3xl border border-slate-200 p-6 flex flex-col hover:border-indigo-200 hover:shadow-md transition-all">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Free</h3>
                    <p className="text-slate-500 text-sm mb-4">Perfect for getting started</p>
                    <div className="mb-6">
                      <span className="text-3xl font-extrabold text-slate-900">$0</span>
                      <span className="text-slate-500">/forever</span>
                    </div>
                    <div className="space-y-3 mb-8 flex-1">
                      {['Up to 3 notes', 'Basic formatting', 'Cloud sync'].map((f, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Check size={16} className="text-indigo-500" />
                          <span className="text-sm text-slate-600">{f}</span>
                        </div>
                      ))}
                    </div>
                    <Button variant="secondary" className="w-full" onClick={handleComplete}>
                      Continue with Free
                    </Button>
                  </div>

                  {/* Pro Plan */}
                  <div className="rounded-3xl border border-indigo-200 bg-indigo-50/50 p-6 flex flex-col relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                      Recommended
                    </div>
                    <h3 className="text-xl font-bold text-indigo-900 mb-1">Pro</h3>
                    <p className="text-indigo-700/70 text-sm mb-4">For active users</p>
                    <div className="mb-6">
                      <span className="text-3xl font-extrabold text-indigo-900">$9.99</span>
                      <span className="text-indigo-700/70">/month</span>
                    </div>
                    <div className="space-y-3 mb-8 flex-1">
                      {['Up to 10 notes', 'Up to 6 image uploads', 'Advanced AI features', 'Priority support'].map((f, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Check size={16} className="text-indigo-600" />
                          <span className="text-sm text-indigo-900/80">{f}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col gap-2 mt-auto">
                      <Button variant="primary" className="w-full shadow-md shadow-indigo-500/20" onClick={() => handleSelectPlan('pro')}>
                        Upgrade to Pro
                      </Button>
                      {!user?.hasHadTrial && (
                        <Button variant="outline" className="w-full border-indigo-200 text-indigo-600 hover:bg-indigo-100" onClick={handleStartTrial}>
                          Start 3-Day Trial
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Ultra Plan */}
                  <div className="rounded-3xl border border-purple-200 bg-gradient-to-b from-purple-50 to-white p-6 flex flex-col relative overflow-hidden shadow-md">
                    <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                      Best Value
                    </div>
                    <h3 className="text-xl font-bold text-purple-900 mb-1">Ultra</h3>
                    <p className="text-purple-700/70 text-sm mb-4">For power users</p>
                    <div className="mb-6">
                      <span className="text-3xl font-extrabold text-purple-900">$19.99</span>
                      <span className="text-purple-700/70">/month</span>
                    </div>
                    <div className="space-y-3 mb-8 flex-1">
                      {['Unlimited notes', 'Unlimited image uploads', 'Priority AI processing', '24/7 Premium support'].map((f, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Check size={16} className="text-purple-600" />
                          <span className="text-sm text-purple-900/80">{f}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col gap-2 mt-auto">
                      <Button variant="primary" className="w-full bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-500/20" onClick={() => handleSelectPlan('ultra')}>
                        Upgrade to Ultra
                      </Button>
                      {!user?.hasHadTrial && (
                        <Button variant="outline" className="w-full border-purple-200 text-purple-600 hover:bg-purple-100" onClick={handleStartTrial}>
                          Start 3-Day Trial
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!step.isPlanSelection && (
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleNext}
                  variant="primary"
                  size="lg"
                  className="w-full h-14 rounded-2xl text-lg shadow-xl shadow-indigo-500/20 group"
                >
                  Continue
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <button 
                  onClick={() => setCurrentStep(ONBOARDING_STEPS.length - 1)}
                  className="text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors py-2"
                >
                  Skip to plans
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        onSuccess={handleCheckoutSuccess} 
        plan={selectedPlan}
      />
    </>
  );
};
