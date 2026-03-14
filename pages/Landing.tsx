import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Check, Zap, ShieldCheck, PenTool, Layers, Cpu, Globe } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { RoutePath } from '../types';
import { useAuth } from '../context/AuthContext';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(RoutePath.HOME);
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-[#F4F6F9] font-sans selection:bg-indigo-500/20 overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
              <Sparkles size={20} />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">AURA Ai</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to={RoutePath.LOGIN} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
              Sign In
            </Link>
            <Button variant="primary" size="sm" className="rounded-full shadow-md shadow-indigo-500/20" onClick={() => navigate(RoutePath.SIGNUP)}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Ambient Background */}
        <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-indigo-200/40 blur-[120px] rounded-full pointer-events-none mix-blend-multiply animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-fuchsia-200/40 blur-[100px] rounded-full pointer-events-none mix-blend-multiply animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/60 border border-white/80 px-4 py-1.5 text-xs font-bold tracking-wide text-indigo-600 uppercase shadow-sm backdrop-blur-md mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles size={14} className="text-indigo-500" />
            <span>The Future of Note-Taking</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Your thoughts, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">amplified by AI.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Aura AI is a beautifully designed workspace that helps you capture, organize, and enhance your ideas with the power of artificial intelligence.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Button variant="primary" size="lg" className="h-14 px-8 rounded-full text-lg shadow-xl shadow-indigo-500/25 group w-full sm:w-auto" onClick={() => navigate(RoutePath.SIGNUP)}>
              Start for free
              <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="secondary" size="lg" className="h-14 px-8 rounded-full text-lg bg-white/80 border-white shadow-sm hover:bg-white w-full sm:w-auto" onClick={() => {
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              Explore features
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
              Everything you need to do your best work.
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
              We've built a workspace that gets out of your way and helps you focus on what matters most: your ideas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Cpu size={28} />, title: 'AI Enhancement', desc: 'Instantly format, expand, or summarize your notes with a single click using advanced AI models.' },
              { icon: <Layers size={28} />, title: 'Rich Media', desc: 'Embed images, attach files, and organize everything visually with beautiful cover photos.' },
              { icon: <Globe size={28} />, title: 'Cloud Synced', desc: 'Your notes are securely stored in the cloud and instantly available across all your devices.' }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="h-14 w-14 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900 z-0" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none z-0" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-6">
              Simple, transparent pricing.
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium">
              Start for free, upgrade when you need more power.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="rounded-[2.5rem] bg-white/10 border border-white/10 p-10 backdrop-blur-xl flex flex-col">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
                <p className="text-slate-400 mb-6">Perfect for getting started.</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold text-white">$0</span>
                  <span className="text-slate-400 font-medium">/forever</span>
                </div>
              </div>
              
              <div className="space-y-4 mb-10 flex-1">
                {[
                  'Up to 3 notes',
                  'Basic text formatting',
                  'Cloud synchronization',
                  'Standard support'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <span className="text-slate-300 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button variant="secondary" size="lg" className="w-full h-14 rounded-2xl font-bold border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }} onClick={() => navigate(RoutePath.SIGNUP)}>
                Get Started Free
              </Button>
            </div>

            {/* Pro Plan */}
            <div className="rounded-[2.5rem] bg-gradient-to-b from-indigo-500 to-purple-600 p-10 shadow-2xl shadow-indigo-500/20 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold tracking-wide text-white uppercase backdrop-blur-md">
                  <Sparkles size={12} />
                  <span>Most Popular</span>
                </div>
              </div>
              
              <div className="mb-8 relative z-10">
                <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                <p className="text-indigo-100 mb-6">For power users and professionals.</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold text-white">$9</span>
                  <span className="text-indigo-200 font-medium">/month</span>
                </div>
              </div>
              
              <div className="space-y-4 mb-10 flex-1 relative z-10">
                {[
                  'Up to 10 notes',
                  'Up to 6 images per note',
                  'Advanced AI Enhancement',
                  'Priority support'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <span className="text-white font-medium">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button variant="secondary" size="lg" className="w-full h-14 rounded-2xl shadow-xl relative z-10 border-none font-bold" style={{ backgroundColor: 'white', color: '#4f46e5' }} onClick={() => navigate(RoutePath.SIGNUP)}>
                Start Free Trial
              </Button>
            </div>

            {/* Ultra Plan */}
            <div className="rounded-[2.5rem] bg-slate-900 border border-slate-800 p-10 shadow-2xl flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold tracking-wide text-amber-400 uppercase backdrop-blur-md border border-amber-500/30">
                  <Zap size={12} />
                  <span>Ultimate</span>
                </div>
              </div>
              
              <div className="mb-8 relative z-10">
                <h3 className="text-2xl font-bold text-white mb-2">Ultra</h3>
                <p className="text-slate-400 mb-6">For teams and heavy creators.</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold text-white">$29</span>
                  <span className="text-slate-500 font-medium">/month</span>
                </div>
              </div>
              
              <div className="space-y-4 mb-10 flex-1 relative z-10">
                {[
                  'Unlimited notes',
                  'Unlimited image uploads',
                  'Advanced AI Enhancement',
                  '24/7 Dedicated support'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <span className="text-slate-300 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button variant="secondary" size="lg" className="w-full h-14 rounded-2xl shadow-xl relative z-10 border-none font-bold" style={{ backgroundColor: '#f59e0b', color: '#0f172a' }} onClick={() => navigate(RoutePath.SIGNUP)}>
                Get Ultra
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-slate-950 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-indigo-500" />
            <span className="text-xl font-extrabold tracking-tight text-white">AURA Ai</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            © {new Date().getFullYear()} AURA Ai. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
