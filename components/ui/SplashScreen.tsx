import React from 'react';
import { Sparkles } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-gradient-to-br from-sky-50 via-slate-50 to-indigo-50">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-1000">
        <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-2xl shadow-indigo-500/30 ring-8 ring-white/50 mb-8 animate-pulse">
          <Sparkles size={48} />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
          AURA Ai
        </h1>
        <p className="text-lg font-medium text-slate-500">
          Your intelligent workspace
        </p>
        
        <div className="mt-12 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};
