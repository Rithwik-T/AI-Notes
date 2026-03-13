import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Image as ImageIcon, Wand2, X, Calendar, Loader2, Paperclip, File as FileIcon, FileText, Zap, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Editor } from '../../components/ui/Editor';
import { noteService } from '../../services/noteService';
import { storageService } from '../../services/storageService';
import { RoutePath, NoteAttachment } from '../../types';
import { supabase } from '../../supabaseClient';
import { StorageImage } from '../../components/ui/StorageImage';

export const CreateNote: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); 
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLimitReached, setIsLimitReached] = useState(false);
  
  // Image preview can be a Blob URL (new) or Storage Path (existing)
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Attachments: Mixed list of new Files and existing NoteAttachments
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<NoteAttachment[]>([]);

  useEffect(() => {
    const checkLimitAndFetch = async () => {
      setLoading(true);
      try {
        if (!id) {
          // If creating a NEW note, check count
          const count = await noteService.getCount();
          if (count >= 3) {
            setIsLimitReached(true);
            setLoading(false);
            return;
          }
        } else {
          // If editing an EXISTING note
          const note = await noteService.getById(id);
          if (note) {
            setTitle(note.title);
            setContent(note.content);
            setImagePreview(note.thumbnailUrl || null);
            setExistingAttachments(note.attachments || []);
          } else {
             navigate(RoutePath.NOTES);
          }
        }
      } catch (error) {
        console.error("Failed to initialize note view", error);
      } finally {
        setLoading(false);
      }
    };

    checkLimitAndFetch();
  }, [id, navigate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setNewAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  const removeNewAttachment = (index: number) => {
    setNewAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingAttachment = async (attachment: NoteAttachment) => {
    setExistingAttachments((prev) => prev.filter(a => a.path !== attachment.path));
    try {
      await storageService.deleteFile(attachment.path);
    } catch (err) {
      console.error("Error deleting file", err);
    }
  };

  const handleRemoveCover = () => {
    setImagePreview(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return;
    setSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let noteId = id;
      let noteData: any = { title, content, tags: [] };
      
      if (!noteId) {
        const newNote = await noteService.create(noteData);
        noteId = newNote.id;
      }

      let finalThumbnailUrl = imagePreview;
      
      if (imagePreview && imagePreview.startsWith('blob:')) {
        const response = await fetch(imagePreview);
        const blob = await response.blob();
        const file = new File([blob], "cover.jpg", { type: blob.type });
        
        finalThumbnailUrl = await storageService.uploadFile(
          file, 
          user.id, 
          `notes/${noteId}/cover`
        );
      } 
      else if (!imagePreview) {
        finalThumbnailUrl = undefined;
      }

      const uploadedAttachments: NoteAttachment[] = [];
      for (const file of newAttachments) {
        const path = await storageService.uploadFile(
          file, 
          user.id, 
          `notes/${noteId}/attachments`,
          `${Date.now()}-${file.name}`
        );
        uploadedAttachments.push({
          name: file.name,
          size: file.size,
          type: file.type,
          path: path,
          id: path
        });
      }

      const finalAttachments = [...existingAttachments, ...uploadedAttachments];

      await noteService.update(noteId, {
        title,
        content,
        thumbnailUrl: finalThumbnailUrl || undefined,
        attachments: finalAttachments
      });

      navigate(RoutePath.NOTE_DETAIL.replace(':id', noteId));
      
    } catch (error: any) {
      if (error.message === 'FREE_LIMIT_REACHED') {
        setIsLimitReached(true);
      } else {
        console.error("Error saving note:", error);
        alert("Failed to save note.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
     return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>;
  }

  // LIMIT REACHED UI
  if (isLimitReached) {
    return (
      <div className="mx-auto max-w-2xl animate-in fade-in zoom-in-95 duration-500 py-12 md:py-20">
        <div className="relative overflow-hidden rounded-[40px] border border-white/80 bg-white/40 backdrop-blur-3xl shadow-[0_40px_100px_-15px_rgba(0,0,0,0.05)] p-10 md:p-14 text-center ring-1 ring-white/50">
          
          {/* Ambient Glows */}
          <div className="absolute top-[-20%] left-[-10%] w-[300px] h-[300px] bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center gap-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 shadow-inner ring-1 ring-indigo-100/50">
              <Zap size={36} fill="currentColor" className="opacity-80" />
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Plan Limit Reached
              </h2>
              <p className="text-slate-600 text-lg font-medium leading-relaxed max-w-sm mx-auto">
                Free users can create a maximum of <span className="text-indigo-600 font-bold">3 notes</span>. Upgrade to Pro for unlimited creative space.
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full sm:flex-row sm:justify-center pt-4">
              <Button 
                variant="primary" 
                size="lg" 
                className="rounded-full shadow-lg shadow-indigo-500/20 group h-14"
                onClick={() => {}} // Placeholder for upgrade
              >
                <Sparkles size={18} className="mr-2 group-hover:rotate-12 transition-transform" />
                <span>Upgrade to Pro</span>
                <ChevronRight size={16} className="ml-1 opacity-60" />
              </Button>
              <Button 
                variant="secondary" 
                size="lg" 
                className="rounded-full h-14"
                onClick={() => navigate(RoutePath.NOTES)}
              >
                Back to My Notes
              </Button>
            </div>
            
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Join 2,000+ users on Pro
            </p>
          </div>
        </div>
      </div>
    );
  }

  const hasContent = content && content !== '<p><br></p>';
  const canSave = title.trim().length > 0 || hasContent;
  const canEnhance = hasContent;

  return (
    <div className="mx-auto max-w-4xl animate-in fade-in duration-500 pb-20">
      <nav className="sticky top-4 z-50 mb-8 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-2xl transition-all">
        <div className="flex items-center gap-3">
           <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-900">
             <ArrowLeft className="mr-2 h-4 w-4" />
             Back
           </Button>
           <div className="h-4 w-px bg-slate-200"></div>
           <span className="text-sm font-medium text-slate-500">
              {id ? 'Edit Note' : 'New Draft'}
           </span>
        </div>
        
        <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              className="hidden sm:flex border-purple-100 bg-purple-50 text-purple-700 hover:bg-purple-100" 
              disabled={!canEnhance}
            >
                <Wand2 className="mr-2 h-3.5 w-3.5 text-purple-600" />
                <span>AI Enhance</span>
            </Button>
            <Button 
              onClick={handleSave} 
              size="sm" 
              variant="primary"
              isLoading={saving} 
              disabled={!canSave}
            >
              <Save className="mr-2 h-3.5 w-3.5" />
              Save Note
            </Button>
        </div>
      </nav>

      <div className="relative min-h-[70vh] rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col">
        {imagePreview && (
          <div className="relative aspect-[21/9] w-full group bg-slate-50 border-b border-slate-100">
              <StorageImage 
                path={imagePreview} 
                alt="Cover" 
                className="h-full w-full object-cover" 
              />
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <label className="cursor-pointer rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-md backdrop-blur-md border border-slate-200 hover:bg-white transition-colors">
                      Change
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                  <button 
                      onClick={handleRemoveCover}
                      className="rounded-lg bg-white/90 p-1.5 text-slate-700 shadow-md backdrop-blur-md border border-slate-200 hover:text-red-600 transition-colors"
                  >
                      <X size={16} />
                  </button>
              </div>
          </div>
        )}

        <div className="flex-1 px-8 py-10 md:px-16 md:py-12">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    <Calendar size={13} />
                    <span>{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>

                <div className="flex items-center gap-3">
                   <label className="group flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500 transition-all hover:bg-white hover:text-indigo-600 hover:border-indigo-200 hover:shadow-sm">
                      <Paperclip size={14} className="text-slate-400 group-hover:text-indigo-500" />
                      <span>Attach File</span>
                      <input type="file" multiple className="hidden" onChange={handleAttachmentUpload} />
                   </label>
                   {!imagePreview && (
                      <label className="group flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500 transition-all hover:bg-white hover:text-slate-800 hover:border-slate-300 hover:shadow-sm">
                         <ImageIcon size={14} className="text-slate-400 group-hover:text-slate-600" />
                         <span>Add Cover</span>
                         <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                   )}
                </div>
            </div>

            <input
                type="text"
                placeholder="Untitled Note"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border-none bg-transparent text-4xl sm:text-5xl font-extrabold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-0 p-0 mb-8 tracking-tight leading-tight"
                autoFocus
            />
            
            <div className="relative min-h-[400px]">
                <Editor 
                    value={content} 
                    onChange={setContent} 
                    placeholder="Press '/' for commands..."
                    className="text-lg text-slate-700 leading-relaxed min-h-[400px]"
                />
            </div>

            {(newAttachments.length > 0 || existingAttachments.length > 0) && (
              <div className="mt-12 border-t border-slate-100 pt-8 animate-in fade-in duration-300">
                <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Paperclip size={16} className="text-slate-400" />
                  Attachments ({newAttachments.length + existingAttachments.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {existingAttachments.map((att) => (
                    <div key={att.path} className="group relative flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-md transition-all duration-200">
                      <div className="h-10 w-10 shrink-0 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm overflow-hidden">
                         <FileText size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-700 truncate">{att.name}</p>
                        <p className="text-xs text-slate-400">{formatFileSize(att.size)}</p>
                      </div>
                      <button 
                        onClick={() => removeExistingAttachment(att)}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white text-slate-400 border border-slate-200 shadow-sm flex items-center justify-center opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 hover:text-red-500 hover:border-red-200 transition-all duration-200"
                        title="Remove attachment"
                      >
                        <X size={12} strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}
                  {newAttachments.map((file, index) => (
                    <div key={`new-${index}`} className="group relative flex items-center gap-3 p-3 rounded-xl border border-indigo-100 bg-indigo-50/30 hover:bg-white hover:border-indigo-200 hover:shadow-md transition-all duration-200">
                      <div className="h-10 w-10 shrink-0 rounded-lg bg-white border border-indigo-100 flex items-center justify-center text-indigo-400 shadow-sm overflow-hidden">
                        {file.type.startsWith('image/') ? (
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt="preview" 
                            className="h-full w-full object-cover"
                            onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                          />
                        ) : (
                          <FileIcon size={20} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                        <p className="text-xs text-indigo-400 font-medium">Ready to upload</p>
                      </div>
                      <button 
                        onClick={() => removeNewAttachment(index)}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white text-slate-400 border border-slate-200 shadow-sm flex items-center justify-center opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 hover:text-red-500 hover:border-red-200 transition-all duration-200"
                      >
                        <X size={12} strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        <div className="border-t border-slate-100 bg-slate-50 px-8 py-3 text-center">
            <p className="text-xs text-slate-400">
               Your note will be saved securely.
            </p>
        </div>
      </div>
    </div>
  );
};