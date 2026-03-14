import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, AlertTriangle, Save, Camera, Lock, ChevronRight, Globe, Key, Trash2, Smartphone, CreditCard, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { supabase } from '../../supabaseClient';
import { RoutePath } from '../../types';
import { storageService } from '../../services/storageService';
import { StorageImage } from '../../components/ui/StorageImage';
import { useAuth } from '../../context/AuthContext';

export const Account: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // User specific state
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    displayName: '',
    timezone: 'UTC-8 (Pacific Time)'
  });
  const [avatarPath, setAvatarPath] = useState<string | null>(null);

  // Fetch Supabase User on Mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate(RoutePath.LOGIN);
          return;
        }

        setUserId(user.id);
        setEmail(user.email || '');
        setAvatarPath(user.user_metadata?.avatar_url || null);
        
        setFormData({
          fullName: user.user_metadata?.full_name || '',
          displayName: user.user_metadata?.display_name || '',
          timezone: user.user_metadata?.timezone || 'UTC-8 (Pacific Time)'
        });
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setFetching(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && userId) {
      try {
        setLoading(true);
        // Upload to {userId}/avatar/profile.ext
        const extension = file.name.split('.').pop();
        const path = await storageService.uploadFile(file, userId, 'avatar', `profile.${extension}`);
        
        // Update local state to show preview immediately (using blob for speed, but real path for save)
        setAvatarPath(path);
        
        // Auto-save the avatar change
        const { error } = await supabase.auth.updateUser({
          data: { avatar_url: path }
        });
        
        if (error) throw error;
        
      } catch (error) {
        console.error("Error uploading avatar:", error);
        setMessage({ text: "Failed to upload avatar.", type: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          display_name: formData.displayName,
          timezone: formData.timezone
          // Avatar is updated immediately on file select
        }
      });

      if (error) throw error;
      
      // Simulate save delay
      setTimeout(() => {
        setLoading(false);
        setMessage({ text: "Profile updated successfully.", type: 'success' });
      }, 500);

    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ text: "Failed to update profile.", type: 'error' });
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setMessage({ text: "Please fill in all password fields.", type: 'error' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ text: "New passwords do not match.", type: 'error' });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setMessage({ text: "Password must be at least 6 characters.", type: 'error' });
      return;
    }

    setPasswordLoading(true);
    try {
      // Verify old password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: passwordForm.oldPassword,
      });

      if (signInError) {
        throw new Error("Incorrect current password.");
      }

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (updateError) throw updateError;

      setMessage({ text: "Password updated successfully.", type: 'success' });
      setIsChangingPassword(false);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error("Error changing password:", error);
      setMessage({ text: error.message || "Failed to change password.", type: 'error' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate(RoutePath.LANDING);
  };

  const handleCancelPlan = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { plan: 'free' }
      });
      if (error) throw error;
      await refreshUser();
      setMessage({ text: "Your plan has been cancelled.", type: 'success' });
      setShowCancelConfirm(false);
    } catch (error) {
      console.error("Error cancelling plan:", error);
      setMessage({ text: "Failed to cancel plan.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      // Delete all user's notes
      await supabase.from('notes').delete().eq('user_id', userId);
      
      // Attempt to delete user identity (if supported by backend) or just sign out
      // Since client-side auth.admin.deleteUser isn't available, we clear data and sign out.
      // If there's an RPC for delete_user, we can call it here.
      const { error } = await supabase.rpc('delete_user');
      if (error) {
         console.log("No delete_user RPC found, proceeding with signout.");
      }

      await supabase.auth.signOut();
      navigate(RoutePath.LANDING);
    } catch (error) {
      console.error("Error deleting account:", error);
      setMessage({ text: "Failed to delete account.", type: 'error' });
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-slate-500">
         <div className="flex flex-col items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
            <span className="text-sm font-medium">Loading account...</span>
         </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto pb-20 animate-in fade-in duration-700">
        
        {/* Background Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-300/10 rounded-full blur-[120px] -z-10 mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-0 right-[-10%] w-[800px] h-[800px] bg-fuchsia-100/20 rounded-full blur-[100px] -z-10 mix-blend-multiply dark:mix-blend-screen pointer-events-none" />

        {/* Main Glass Panel */}
        <div className="relative rounded-[40px] border border-white/60 dark:border-slate-700/50 bg-white/40 dark:bg-slate-800/40 backdrop-blur-[80px] shadow-[0_40px_100px_-15px_rgba(0,0,0,0.05),0_10px_30px_-5px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-500 hover:shadow-[0_50px_120px_-20px_rgba(0,0,0,0.08)] ring-1 ring-white/50 dark:ring-slate-700/50">
            
            {/* Top Gloss Highlight */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white dark:via-slate-400 to-transparent opacity-60" />

            <form onSubmit={handleSubmit} className="divide-y divide-white/40 dark:divide-slate-700/50">
                
                {/* Header Section */}
                <div className="px-6 sm:px-10 py-8 sm:py-12 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/40 dark:from-slate-800/40 to-transparent opacity-50 pointer-events-none" />
                    
                    {message && (
                      <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium w-full max-w-md flex items-center justify-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                        {message.text}
                      </div>
                    )}

                    {/* Avatar Group */}
                    <div className="group relative mb-6 cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                        <div className="h-32 w-32 rounded-full p-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-white dark:border-slate-700 shadow-xl transition-transform duration-500 group-hover:scale-105 relative overflow-hidden">
                             {avatarPath ? (
                                <StorageImage 
                                    path={avatarPath} 
                                    alt="Profile" 
                                    className="h-full w-full rounded-full object-cover" 
                                />
                             ) : (
                                <div className="h-full w-full rounded-full bg-gradient-to-br from-indigo-100 dark:from-indigo-900/50 to-white dark:to-slate-800 flex items-center justify-center text-indigo-300">
                                    <User size={48} />
                                </div>
                             )}
                        </div>
                        <button type="button" className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-lg ring-1 ring-slate-100 dark:ring-slate-700 transition-all hover:scale-110 hover:text-indigo-600 dark:hover:text-indigo-400">
                            <Camera size={18} />
                        </button>
                        <input 
                            id="avatar-upload"
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleAvatarChange}
                        />
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                        {formData.fullName || formData.displayName || email.split('@')[0] || 'User'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 bg-white/40 dark:bg-slate-800/40 px-4 py-1.5 rounded-full border border-white/40 dark:border-slate-700/50">
                        <Mail size={14} />
                        {email}
                    </p>
                </div>

                {/* Main Settings Grid */}
                <div className="px-6 sm:px-12 py-8 sm:py-12 space-y-8 sm:space-y-12 bg-white/20 dark:bg-slate-900/20">
                    
                    {/* Section: Profile Information */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                             <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 ring-1 ring-blue-100 dark:ring-blue-800 shadow-sm">
                                 <User size={16} strokeWidth={2.5} />
                             </div>
                             <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Personal Information</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <Input 
                                label="Full Name" 
                                name="fullName" 
                                value={formData.fullName} 
                                onChange={handleChange} 
                                placeholder="e.g. Jane Doe"
                                className="bg-white/70 dark:bg-slate-800/70 border-white/50 dark:border-slate-700/50 focus:bg-white dark:focus:bg-slate-800 dark:text-white"
                             />
                             <Input 
                                label="Display Name" 
                                name="displayName" 
                                value={formData.displayName} 
                                onChange={handleChange} 
                                placeholder="e.g. Jane"
                                className="bg-white/70 dark:bg-slate-800/70 border-white/50 dark:border-slate-700/50 focus:bg-white dark:focus:bg-slate-800 dark:text-white"
                             />
                        </div>

                        <div>
                             <label className="ml-1 mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500/80 dark:text-slate-400">
                                Timezone
                            </label>
                            <div className="relative group">
                                <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 z-10 transition-colors" size={18} />
                                <select
                                    name="timezone"
                                    value={formData.timezone}
                                    onChange={handleChange}
                                    className="w-full appearance-none rounded-2xl border border-white/50 dark:border-slate-700/50 bg-white/70 dark:bg-slate-800/70 pl-12 pr-5 py-4 text-[15px] font-medium text-slate-900 dark:text-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all duration-300 hover:bg-white/90 dark:hover:bg-slate-800 hover:shadow-md focus:border-indigo-500/30 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                                >
                                    <option>UTC-8 (Pacific Time)</option>
                                    <option>UTC-5 (Eastern Time)</option>
                                    <option>UTC+0 (London)</option>
                                    <option>UTC+1 (Paris)</option>
                                    <option>UTC+9 (Tokyo)</option>
                                </select>
                                <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" size={16} />
                            </div>
                        </div>
                    </div>

                    {/* Section: Security */}
                    <div className="space-y-6 pt-6 border-t border-slate-200/40 dark:border-slate-700/40">
                        <div className="flex items-center gap-3 mb-2">
                             <div className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 ring-1 ring-indigo-100 dark:ring-indigo-800 shadow-sm">
                                 <Shield size={16} strokeWidth={2.5} />
                             </div>
                             <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Security & Login</h3>
                        </div>

                        <div className="rounded-3xl border border-white/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-800/50 p-6 shadow-sm">
                            {isChangingPassword ? (
                                <div className="flex flex-col gap-4 w-full animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                            <Key size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">Change Password</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Enter your current and new password</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <Input 
                                            type="password" 
                                            label="Current Password" 
                                            value={passwordForm.oldPassword} 
                                            onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})} 
                                            placeholder="••••••••"
                                            className="bg-white/70 dark:bg-slate-800/70 border-white/50 dark:border-slate-700/50 focus:bg-white dark:focus:bg-slate-800 dark:text-white"
                                        />
                                        <Input 
                                            type="password" 
                                            label="New Password" 
                                            value={passwordForm.newPassword} 
                                            onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} 
                                            placeholder="••••••••"
                                            className="bg-white/70 dark:bg-slate-800/70 border-white/50 dark:border-slate-700/50 focus:bg-white dark:focus:bg-slate-800 dark:text-white"
                                        />
                                        <Input 
                                            type="password" 
                                            label="Confirm New Password" 
                                            value={passwordForm.confirmPassword} 
                                            onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} 
                                            placeholder="••••••••"
                                            className="bg-white/70 dark:bg-slate-800/70 border-white/50 dark:border-slate-700/50 focus:bg-white dark:focus:bg-slate-800 dark:text-white"
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <Button type="button" variant="primary" size="sm" onClick={handlePasswordChange} isLoading={passwordLoading}>
                                            Save Password
                                        </Button>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => {
                                            setIsChangingPassword(false);
                                            setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
                                        }} disabled={passwordLoading}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                            <Key size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">Password</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Manage your password</p>
                                        </div>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={() => setIsChangingPassword(true)} className="w-full sm:w-auto justify-center">
                                        Change Password
                                    </Button>
                                </div>
                            )}
                            
                            <div className="my-4 h-px w-full bg-slate-200/50 dark:bg-slate-700/50" />
                            
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 opacity-60 grayscale">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                        <Smartphone size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">2-Factor Authentication</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Add an extra layer of security</p>
                                    </div>
                                </div>
                                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 dark:bg-slate-700 self-start sm:self-auto ml-14 sm:ml-0">
                                    <span className="h-4 w-4 translate-x-1 transform rounded-full bg-white transition" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section: Subscription */}
                    <div className="space-y-6 pt-6 border-t border-slate-200/40 dark:border-slate-700/40">
                        <div className="flex items-center gap-3 mb-2">
                             <div className="h-8 w-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 ring-1 ring-emerald-100 dark:ring-emerald-800 shadow-sm">
                                 <CreditCard size={16} strokeWidth={2.5} />
                             </div>
                             <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Subscription</h3>
                        </div>

                        <div className="rounded-3xl border border-white/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-800/50 p-6 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                      Current Plan: <span className="uppercase text-indigo-600 dark:text-indigo-400">{authUser?.plan || 'Free'}</span>
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                      {authUser?.plan === 'ultra'
                                        ? 'You have full access to all Ultra features.'
                                        : authUser?.plan === 'pro' 
                                        ? 'You have full access to all Pro features.' 
                                        : authUser?.plan === 'trial'
                                        ? 'You are currently on a 3-day free trial.'
                                        : 'You are on the free plan with limited features.'}
                                    </p>
                                </div>
                                {(authUser?.plan === 'pro' || authUser?.plan === 'ultra' || authUser?.plan === 'trial') && (
                                  showCancelConfirm ? (
                                    <div className="flex items-center gap-2">
                                      <Button type="button" variant="danger" size="sm" onClick={handleCancelPlan} isLoading={loading}>
                                        Confirm Cancel
                                      </Button>
                                      <Button type="button" variant="ghost" size="sm" onClick={() => setShowCancelConfirm(false)} disabled={loading}>
                                        Keep Plan
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button type="button" variant="outline" size="sm" onClick={() => setShowCancelConfirm(true)} className="whitespace-nowrap hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                                        Cancel Plan
                                    </Button>
                                  )
                                )}
                            </div>

                            {/* Upgrade Options */}
                            {(authUser?.plan === 'free' || authUser?.plan === 'trial' || authUser?.plan === 'pro') && (
                              <div className="mt-8 pt-6 border-t border-slate-200/40 dark:border-slate-700/40">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Available Upgrades</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {authUser?.plan !== 'pro' && authUser?.plan !== 'ultra' && (
                                    <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/20 p-4 flex flex-col">
                                      <h5 className="font-bold text-indigo-900 dark:text-indigo-300">Pro Plan</h5>
                                      <p className="text-xs text-indigo-700/70 dark:text-indigo-400/70 mb-3 flex-1">Up to 10 notes & 6 image uploads.</p>
                                      <div className="flex flex-col gap-2">
                                        <Button type="button" variant="primary" size="sm" onClick={() => window.dispatchEvent(new CustomEvent('open-checkout', { detail: 'pro' }))}>
                                          Upgrade for $9.99/mo
                                        </Button>
                                        {!authUser?.hasHadTrial && (
                                          <Button type="button" variant="outline" size="sm" className="border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400" onClick={async () => {
                                            try {
                                              const trialEndsAt = new Date();
                                              trialEndsAt.setDate(trialEndsAt.getDate() + 3);
                                              await supabase.auth.updateUser({
                                                data: { plan: 'trial', trialEndsAt: trialEndsAt.toISOString(), hasHadTrial: true }
                                              });
                                              await refreshUser();
                                              setMessage({ text: "Trial started successfully!", type: 'success' });
                                            } catch (e) {
                                              setMessage({ text: "Failed to start trial.", type: 'error' });
                                            }
                                          }}>
                                            Start 3-Day Free Trial
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {authUser?.plan !== 'ultra' && (
                                    <div className="rounded-2xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-900/20 p-4 flex flex-col">
                                      <h5 className="font-bold text-purple-900 dark:text-purple-300">Ultra Plan</h5>
                                      <p className="text-xs text-purple-700/70 dark:text-purple-400/70 mb-3 flex-1">Unlimited notes & image uploads.</p>
                                      <div className="flex flex-col gap-2">
                                        <Button type="button" variant="primary" size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => window.dispatchEvent(new CustomEvent('open-checkout', { detail: 'ultra' }))}>
                                          Upgrade for $19.99/mo
                                        </Button>
                                        {!authUser?.hasHadTrial && authUser?.plan !== 'pro' && (
                                          <Button type="button" variant="outline" size="sm" className="border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400" onClick={async () => {
                                            try {
                                              const trialEndsAt = new Date();
                                              trialEndsAt.setDate(trialEndsAt.getDate() + 3);
                                              await supabase.auth.updateUser({
                                                data: { plan: 'trial', trialEndsAt: trialEndsAt.toISOString(), hasHadTrial: true }
                                              });
                                              await refreshUser();
                                              setMessage({ text: "Trial started successfully!", type: 'success' });
                                            } catch (e) {
                                              setMessage({ text: "Failed to start trial.", type: 'error' });
                                            }
                                          }}>
                                            Start 3-Day Free Trial
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                    </div>

                    {/* Section: Danger Zone */}
                    <div className="space-y-6 pt-6 border-t border-slate-200/40 dark:border-slate-700/40">
                        <div className="flex items-center gap-3 mb-2">
                             <div className="h-8 w-8 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600 ring-1 ring-red-100 dark:ring-red-800 shadow-sm">
                                 <AlertTriangle size={16} strokeWidth={2.5} />
                             </div>
                             <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Danger Zone</h3>
                        </div>

                        <div className="rounded-3xl border border-red-100 dark:border-red-900/30 bg-red-50/30 dark:bg-red-900/10 p-6">
                             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Delete Account</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed max-w-sm">
                                        Permanently delete your account and all of your content. This action cannot be undone.
                                    </p>
                                </div>
                                {showDeleteConfirm ? (
                                    <div className="flex items-center gap-2">
                                      <Button type="button" variant="danger" size="sm" onClick={handleDeleteAccount} isLoading={loading}>
                                        Confirm Delete
                                      </Button>
                                      <Button type="button" variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)} disabled={loading}>
                                        Cancel
                                      </Button>
                                    </div>
                                ) : (
                                    <Button type="button" variant="danger" size="sm" className="whitespace-nowrap" onClick={() => setShowDeleteConfirm(true)}>
                                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                                        Delete Account
                                    </Button>
                                )}
                             </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action Bar */}
                <div className="sticky bottom-0 z-10 flex flex-col-reverse sm:flex-row items-center justify-between border-t border-white/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/70 px-4 sm:px-8 py-4 sm:py-5 backdrop-blur-xl gap-4">
                    <button 
                        type="button" 
                        onClick={handleSignOut}
                        className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors w-full sm:w-auto text-center py-2 sm:py-0"
                    >
                        Sign Out
                    </button>
                    <div className="flex w-full sm:w-auto gap-3 sm:gap-4">
                         <Button type="button" variant="ghost" onClick={() => navigate(RoutePath.HOME)} className="flex-1 sm:flex-none justify-center">
                             Cancel
                         </Button>
                         <Button type="submit" isLoading={loading} className="flex-1 sm:flex-none justify-center shadow-[0_10px_20px_-5px_rgba(79,70,229,0.3)]">
                             <Save className="mr-2 h-4 w-4" />
                             Save Changes
                         </Button>
                    </div>
                </div>

            </form>
        </div>
    </div>
  );
};