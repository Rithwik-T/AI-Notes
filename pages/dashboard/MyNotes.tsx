import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, ArrowUpRight, Calendar, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Note, RoutePath } from '../../types';
import { noteService } from '../../services/noteService';
import { StorageImage } from '../../components/ui/StorageImage';

export const MyNotes: React.FC = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await noteService.getAll();
        setNotes(data);
      } catch (error) {
        console.error("Failed to fetch notes", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  const getPreviewText = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12">
      <div className="flex items-end justify-between border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Notes</h1>
          <p className="text-slate-500 mt-2 text-base">
            Manage your personal knowledge base.
          </p>
        </div>
        <Button onClick={() => navigate(RoutePath.CREATE_NOTE)} size="lg" className="rounded-full shadow-lg shadow-indigo-500/20">
          <Plus className="mr-2 h-5 w-5" />
          Create Note
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
             <div key={n} className="h-72 animate-pulse rounded-2xl bg-white border border-slate-200"></div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
          {notes.map((note) => (
            <div 
              key={note.id} 
              onClick={() => navigate(RoutePath.NOTE_DETAIL.replace(':id', note.id))}
              className="group cursor-pointer flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300"
            >
              {/* Image / Header */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-50 border-b border-slate-100">
                {note.thumbnailUrl ? (
                   <>
                    <div className="absolute inset-0 bg-indigo-900/0 transition-colors duration-500 group-hover:bg-indigo-900/10 z-10" />
                    <StorageImage 
                        path={note.thumbnailUrl} 
                        alt={note.title} 
                        className="h-full w-full object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-110" 
                    />
                   </>
                ) : (
                   <div className="h-full w-full bg-slate-100 flex items-center justify-center">
                      <FileText className="text-slate-300 transition-colors group-hover:text-slate-400" size={48} strokeWidth={1} />
                   </div>
                )}
                
                {/* Date Badge */}
                <div className="absolute top-4 right-4 z-20">
                     <div className="flex items-center gap-1.5 rounded-full bg-white/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-600 shadow-sm ring-1 ring-slate-200">
                        <Calendar size={11} className="text-slate-400" />
                        <span>{new Date(note.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                     </div>
                </div>
              </div>
              
              <div className="flex flex-1 flex-col p-6">
                <h3 className="mb-2 text-lg font-bold tracking-tight text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                  {note.title}
                </h3>
                
                <p className="text-slate-500 line-clamp-3 leading-relaxed text-sm mb-5 font-light">
                  {getPreviewText(note.content) || <span className="italic opacity-50">Empty note</span>}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                   <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-[9px] font-bold text-white shadow-sm">
                        ME
                      </div>
                      <span className="text-xs text-slate-500">Edited just now</span>
                   </div>
                   <div className="flex items-center text-xs font-medium text-slate-400 group-hover:text-indigo-600 transition-colors">
                      <span>Open</span>
                      <ArrowUpRight size={14} className="ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && notes.length === 0 && (
          <div className="flex h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/50 text-center px-4">
             <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-md border border-slate-200 mb-5">
                 <FileText size={28} className="text-slate-400" />
             </div>
             <h3 className="text-lg font-semibold text-slate-900">No notes yet</h3>
             <p className="text-slate-500 mb-6 max-w-sm">Create your first note to get started.</p>
             <Button onClick={() => navigate(RoutePath.CREATE_NOTE)} variant="primary" className="rounded-full">Create your first note</Button>
          </div>
      )}
    </div>
  );
};