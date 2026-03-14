import React, { useState } from 'react';
import { X, CreditCard, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  plan?: 'pro' | 'ultra';
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onSuccess, plan = 'pro' }) => {
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate network request for payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update user metadata in Supabase
      const { error } = await supabase.auth.updateUser({
        data: { plan: plan }
      });

      if (error) throw error;

      // Refresh user context
      await refreshUser();
      
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Payment failed:', error);
      setErrorMsg('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const planDetails = plan === 'ultra' 
    ? { 
        name: 'Ultra Plan', 
        desc: 'Unlimited everything & priority AI', 
        price: '$19.99',
        features: [
          'Unlimited Notes', 'Unlimited Image Uploads', 'Collaborative Editing (Real-time)',
          'Dark Mode / Light Mode Toggle', 'Priority AI Enhancement', 'Custom Note Themes',
          'Export to PDF/Word', 'Advanced Search & Filters', 'Version History (30 days)',
          'Custom Domain Support', 'API Access', 'Webhooks Integration',
          'Team Workspaces', 'Granular Permissions', 'Analytics Dashboard',
          'Priority 24/7 Support', 'Custom Fonts', 'Audio Notes Transcription',
          'Video Attachments', 'End-to-End Encryption'
        ]
      }
    : { 
        name: 'Pro Plan', 
        desc: 'Unlimited notes & premium features', 
        price: '$9.99',
        features: [
          'Up to 10 Notes', 'Up to 6 Images per Note', 'AI Enhancement (Standard)',
          'Basic Search', 'Email Support'
        ]
      };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-0" style={{ zIndex: 9999 }}>
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white dark:bg-slate-800 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-700/50 animate-in zoom-in-95 duration-200">
        {success ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 dark:text-emerald-400">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">Payment Successful!</h3>
            <p className="text-slate-500 dark:text-slate-400">Welcome to {plan === 'ultra' ? 'Ultra' : 'Pro'}. You can now enjoy premium features.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upgrade to {plan === 'ultra' ? 'Ultra' : 'Pro'}</h3>
              <button 
                onClick={onClose}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCheckout} className="p-6">
              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm font-medium border border-red-200 dark:border-red-900/50">
                  {errorMsg}
                </div>
              )}
              <div className="mb-6 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 p-4 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">{planDetails.name}</p>
                  <p className="text-xs text-indigo-700/70 dark:text-indigo-400/70">{planDetails.desc}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{planDetails.price}</p>
                  <p className="text-xs text-indigo-700/70 dark:text-indigo-400/70">per month</p>
                </div>
              </div>

              {plan === 'ultra' && (
                <div className="mb-6">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Ultra Exclusive Features</p>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                    {planDetails.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-tight">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Card Information</label>
                  <div className="relative">
                    <CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Expiry Date</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">CVC</label>
                    <input
                      type="text"
                      required
                      placeholder="123"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Name on Card</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="mt-8">
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-full rounded-xl py-3 text-base shadow-lg shadow-indigo-500/20"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    `Pay ${planDetails.price}`
                  )}
                </Button>
                <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500"></span>
                  </span>
                  Secure encrypted payment
                </p>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
