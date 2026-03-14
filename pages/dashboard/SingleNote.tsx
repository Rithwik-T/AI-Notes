import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";
import { Edit3, Trash2, ArrowLeft, Calendar, Clock, AlertCircle, Paperclip, FileText, Download, Wand2, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { noteService } from '../../services/noteService';
import { storageService } from '../../services/storageService';
import { Note, RoutePath } from '../../types';
import { CheckoutModal } from '../../components/ui/CheckoutModal';
import { useAuth } from '../../context/AuthContext';

export const SingleNote: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchNote = async () => {
      try {
        const data = await noteService.getById(id);
        if (data) {
          setNote(data);
        } else {
          navigate(RoutePath.NOTES);
        }
      } catch (err) {
        console.error("Failed to fetch note", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id, navigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsConfirmOpen(false);
      }
    };
    
    if (isConfirmOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isConfirmOpen]);

  const initiateDelete = () => {
    setIsConfirmOpen(true);
  };

  const performDelete = async () => {
    if (!id) return;

    setIsDeleting(true);
    setError(null);

    try {
      await noteService.delete(id);
      navigate(RoutePath.NOTES);
    } catch (err) {
      console.error("Failed to delete note:", err);
      setError("Something went wrong while deleting this note. Please try again.");
      setIsDeleting(false);
      setIsConfirmOpen(false); 
    }
  };

  const handleEdit = () => {
    if (id) {
      navigate(RoutePath.EDIT_NOTE.replace(':id', id));
    }
  };

  const downloadAttachment = async (path: string) => {
    const url = await storageService.getSignedUrl(path);
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleSummarize = async () => {
    if (user?.plan !== 'pro' && user?.plan !== 'trial') {
      setIsCheckoutOpen(true);
      return;
    }
    if (!note?.content) return;
    setIsSummarizing(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      // Strip HTML tags for the prompt to save tokens and improve summary quality
      const plainTextContent = note.content.replace(/<[^>]*>?/gm, '');
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Please provide a concise, bulleted summary of the following note:\n\n${plainTextContent}`,
      });
      
      if (response.text) {
        setSummary(response.text);
      }
    } catch (err: any) {
      console.error("AI Summarize failed:", err);
      setError(`Failed to generate summary with AI: ${err.message || "Unknown error"}`);
    } finally {
      setIsSummarizing(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900"></div></div>;
  if (!note) return null;

  return (
    <>
      <div className="mx-auto max-w-3xl space-y-6 animate-in fade-in duration-300 pb-20 relative">
        {/* Sticky Header */}
        <div className="flex items-center justify-between sticky top-0 bg-[#FAFAFA]/90 dark:bg-slate-900/90 backdrop-blur-sm py-4 z-10">
          <Button variant="ghost" size="sm" onClick={() => navigate(RoutePath.NOTES)} className="-ml-3 text-zinc-500 dark:text-slate-400 hover:text-zinc-900 dark:hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleSummarize}
              disabled={isSummarizing || isDeleting}
              isLoading={isSummarizing}
              className="border-purple-100 dark:border-purple-900/50 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40"
            >
              {!isSummarizing && <Wand2 className="mr-2 h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />}
              Summarize
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleEdit}
              disabled={isDeleting || isSummarizing}
            >
              <Edit3 className="mr-2 h-3.5 w-3.5 text-zinc-500 dark:text-slate-400" />
              Edit
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={initiateDelete} 
              isLoading={isDeleting}
              disabled={isDeleting || isSummarizing}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-100 dark:hover:border-red-900/50"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 p-4 flex items-center gap-3 text-red-700 dark:text-red-400 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Note Content */}
        <article className="rounded-xl border border-zinc-200/60 dark:border-slate-700/50 bg-white dark:bg-slate-800 shadow-subtle dark:shadow-none overflow-hidden">
          {note.thumbnailUrl && (
            <div className="h-64 w-full bg-zinc-50 dark:bg-slate-900 border-b border-zinc-100 dark:border-slate-700/50">
              <StorageImage 
                path={note.thumbnailUrl} 
                alt={note.title} 
                className="h-full w-full object-cover" 
              />
            </div>
          )}
          
          <div className="p-6 sm:p-8 md:p-12">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">{note.title}</h1>
            
            <div className="mb-8 flex flex-wrap gap-4 text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-slate-400 border-b border-zinc-100 dark:border-slate-700/50 pb-6">
              <span className="flex items-center"><Calendar size={14} className="mr-1.5 opacity-70" /> {new Date(note.createdAt).toLocaleDateString()}</span>
              <span className="flex items-center"><Clock size={14} className="mr-1.5 opacity-70" /> {new Date(note.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>

            {summary && (
              <div className="mb-8 rounded-2xl border border-purple-100 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-900/20 p-6 relative animate-in fade-in slide-in-from-top-4">
                <button 
                  onClick={() => setSummary(null)}
                  className="absolute top-4 right-4 text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
                >
                  <X size={16} />
                </button>
                <div className="flex items-center gap-2 mb-3 text-purple-700 dark:text-purple-400 font-semibold">
                  <Wand2 size={18} />
                  <h3>AI Summary</h3>
                </div>
                <div className="prose prose-purple prose-sm max-w-none text-purple-900/80 dark:text-purple-300/80">
                  {summary.split('\n').map((line, i) => (
                    <p key={i} className="mb-1">{line}</p>
                  ))}
                </div>
              </div>
            )}

            <div 
              className="prose prose-zinc dark:prose-invert prose-lg max-w-none text-zinc-600 dark:text-slate-300 leading-8"
              dangerouslySetInnerHTML={{ __html: note.content }}
            />

            {/* Attachments Section */}
            {note.attachments && note.attachments.length > 0 && (
              <div className="mt-12 border-t border-zinc-100 dark:border-slate-700/50 pt-8">
                 <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                    <Paperclip size={16} className="text-zinc-400 dark:text-slate-400" />
                    Attachments
                 </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {note.attachments.map((att, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-slate-700 bg-zinc-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all group">
                         <div className="h-10 w-10 shrink-0 rounded-lg bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-700 flex items-center justify-center text-zinc-400 dark:text-slate-400 shadow-sm">
                            <FileText size={20} />
                         </div>
                         <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-zinc-700 dark:text-slate-300 truncate">{att.name}</p>
                            <p className="text-xs text-zinc-400 dark:text-slate-400">{(att.size / 1024).toFixed(1)} KB</p>
                         </div>
                         <button 
                            onClick={() => downloadAttachment(att.path)}
                            className="p-2 text-zinc-400 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                            title="Download"
                         >
                            <Download size={16} />
                         </button>
                      </div>
                    ))}
                 </div>
              </div>
            )}
          </div>
        </article>
      </div>

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md space-y-4 rounded-3xl border border-white/70 dark:border-slate-700/50 bg-white/55 dark:bg-slate-800/90 backdrop-blur-3xl px-8 py-7 shadow-[0_28px_90px_rgba(15,23,42,0.35)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/70 dark:from-slate-800/70 via-white/40 dark:via-slate-800/40 to-white/20 dark:to-slate-800/20 pointer-events-none" />
            <div className="relative z-10 space-y-2">
              <h3 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white">Delete this note?</h3>
              <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed opacity-90">
                This action cannot be undone. Are you sure you want to permanently delete this note?
              </p>
            </div>
            
            <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:justify-end pt-2">
              <button 
                onClick={() => setIsConfirmOpen(false)}
                className="rounded-full border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-slate-700 hover:shadow-sm transition-all duration-200 outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={performDelete}
                className="rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(248,113,113,0.5)] transition-all duration-200 hover:-translate-y-[1px] hover:brightness-110 active:scale-[0.97] outline-none focus:ring-2 focus:ring-red-200"
              >
                {isDeleting ? 'Deleting...' : 'Delete note'}
              </button>
            </div>
          </div>
        </div>
      )}
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        onSuccess={() => {
          // You could optionally trigger summarize here after success
        }} 
      />
    </>
  );
};