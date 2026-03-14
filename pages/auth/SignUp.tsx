import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Command, Mail, Lock, User, Smile, Sparkles } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { RoutePath } from '../../types';
import { supabase } from '../../supabaseClient';

export const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const fullName = formData.get('fullName') as string;
    const displayName = formData.get('displayName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    try {
      setAuthError(null);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            display_name: displayName,
          }
        }
      });

      if (error) {
        setAuthError(error.message);
      } else {
        navigate(RoutePath.LOGIN, { 
          state: { 
            email,
            successMessage: 'Your account has been created. Please check your email and verify your address before logging in.'
          } 
        });
      }
    } catch (err) {
      console.error('Signup error:', err);
      setAuthError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        setAuthError(error.message);
        setLoading(false);
      }
    } catch (err) {
      console.error("Google login error:", err);
      setAuthError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full font-sans selection:bg-indigo-500/20 bg-white">
      
      {/* Left Pane - Form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-6 py-12 sm:px-12 relative z-10">
        <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Header Icon */}
          <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
             <Command size={28} strokeWidth={2} />
          </div>

          {/* Typography */}
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
            Create Account
          </h1>
          <p className="text-base font-medium text-slate-500 mb-8">
            Join the future of note-taking.
          </p>
        
          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-5">
            <div className="space-y-4">
              <Input 
                id="fullName"
                name="fullName"
                type="text" 
                required
                placeholder="Full Name" 
                icon={User}
                className="bg-slate-50 border-slate-200 focus:bg-white"
              />
              <Input 
                id="displayName"
                name="displayName"
                type="text" 
                required
                placeholder="Display Name (e.g. Jane)" 
                icon={Smile}
                className="bg-slate-50 border-slate-200 focus:bg-white"
              />
              <Input 
                id="email"
                name="email"
                type="email" 
                autoComplete="email" 
                required
                placeholder="name@example.com" 
                icon={Mail}
                className="bg-slate-50 border-slate-200 focus:bg-white"
              />
              <Input 
                id="password" 
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Create a password" 
                icon={Lock}
                className="bg-slate-50 border-slate-200 focus:bg-white"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl text-base shadow-lg shadow-indigo-500/20 mt-2" 
              isLoading={loading}
            >
              Create Account
            </Button>
            {authError && (
              <p className="text-sm text-red-500 text-center mt-2 font-medium">{authError}</p>
            )}
          </form>

          {/* Divider */}
          <div className="my-8 flex w-full items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Or continue with</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Social Button */}
          <Button 
            variant="secondary" 
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-12 rounded-xl gap-3 bg-white border-slate-200 shadow-sm hover:bg-slate-50"
          >
            <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                <path d="M12.0003 20.45c-4.6667 0-8.45-3.7833-8.45-8.45 0-4.6667 3.7833-8.45 8.45-8.45 2.1333 0 4.0833.7333 5.6333 1.95L15.4 8.0167c-1.0833-.8667-2.2833-1.3-3.4-1.3-3.05 0-5.5167 2.4667-5.5167 5.2833s2.4667 5.2833 5.5167 5.2833c2.6167 0 4.4333-1.5833 4.8833-4.0833h-4.8833v-2.8h7.95c.1.5167.15 1.05.15 1.6167 0 4.6333-3.1667 8.4333-8.1 8.4333z" fill="currentColor" />
            </svg>
            <span className="text-slate-700 font-semibold">Google</span>
          </Button>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-slate-500 font-medium">
            Already have an account? <Link to={RoutePath.LOGIN} className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors hover:underline decoration-2 underline-offset-2">Sign in</Link>
          </p>

        </div>
      </div>

      {/* Right Pane - Visual */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center p-12">
        {/* Ambient Gradients */}
        <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] rounded-full bg-indigo-600/30 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full bg-purple-600/30 blur-[120px] mix-blend-screen" />
        
        {/* Content */}
        <div className="relative z-10 max-w-lg text-center animate-in fade-in zoom-in-95 duration-1000 delay-300">
          <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 mb-8 shadow-2xl">
            <Sparkles size={48} className="text-indigo-300" />
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-6 leading-tight">
            Start your journey <br/>with AURA Ai.
          </h2>
          <p className="text-lg text-indigo-200/80 font-medium leading-relaxed">
            Create an account today to experience the next generation of note-taking, powered by advanced artificial intelligence.
          </p>
        </div>

        {/* Decorative UI Elements */}
        <div className="absolute top-1/4 right-10 p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl animate-pulse" style={{ animationDuration: '4s' }}>
          <div className="w-32 h-2 bg-white/20 rounded-full mb-3" />
          <div className="w-24 h-2 bg-white/20 rounded-full" />
        </div>
        <div className="absolute bottom-1/4 left-10 p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }}>
          <div className="w-40 h-2 bg-white/20 rounded-full mb-3" />
          <div className="w-20 h-2 bg-white/20 rounded-full" />
        </div>
      </div>

    </div>
  );
};