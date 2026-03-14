import React, { useEffect, useRef, useState } from 'react';
import { Heading1, Heading2, Heading3, List, ListOrdered, Quote, Code, Link, Image as ImageIcon, Bold, Italic } from 'lucide-react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Access the global Quill object from CDN
declare const Quill: any;

interface SlashCommand {
  label: string;
  icon: React.ReactNode;
  action: (quill: any, index: number, length: number) => void;
}

const COMMANDS: SlashCommand[] = [
  { label: 'Heading 1', icon: <Heading1 size={16} />, action: (q, i, l) => { q.deleteText(i, l); q.formatLine(i, 1, 'header', 1); } },
  { label: 'Heading 2', icon: <Heading2 size={16} />, action: (q, i, l) => { q.deleteText(i, l); q.formatLine(i, 1, 'header', 2); } },
  { label: 'Heading 3', icon: <Heading3 size={16} />, action: (q, i, l) => { q.deleteText(i, l); q.formatLine(i, 1, 'header', 3); } },
  { label: 'Bold', icon: <Bold size={16} />, action: (q, i, l) => { q.deleteText(i, l); q.formatText(i, 1, 'bold', true); } },
  { label: 'Italic', icon: <Italic size={16} />, action: (q, i, l) => { q.deleteText(i, l); q.formatText(i, 1, 'italic', true); } },
  { label: 'Bullet List', icon: <List size={16} />, action: (q, i, l) => { q.deleteText(i, l); q.formatLine(i, 1, 'list', 'bullet'); } },
  { label: 'Numbered List', icon: <ListOrdered size={16} />, action: (q, i, l) => { q.deleteText(i, l); q.formatLine(i, 1, 'list', 'ordered'); } },
  { label: 'Quote', icon: <Quote size={16} />, action: (q, i, l) => { q.deleteText(i, l); q.formatLine(i, 1, 'blockquote', true); } },
  { label: 'Code Block', icon: <Code size={16} />, action: (q, i, l) => { q.deleteText(i, l); q.formatLine(i, 1, 'code-block', true); } },
  { label: 'Link', icon: <Link size={16} />, action: (q, i, l) => { 
      q.deleteText(i, l);
      const url = prompt('Enter link URL:');
      if (url) {
        const text = prompt('Enter link text:') || url;
        q.insertText(i, text, 'link', url);
      }
  } },
  { label: 'Image', icon: <ImageIcon size={16} />, action: (q, i, l) => {
      q.deleteText(i, l);
      const url = prompt('Enter image URL:');
      if (url) q.insertEmbed(i, 'image', url);
  } },
];

export const Editor: React.FC<EditorProps> = ({ value, onChange, placeholder, className = '' }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<any>(null);
  
  const [menuState, setMenuState] = useState<{ show: boolean, x: number, y: number, startIndex: number, filter: string }>({ show: false, x: 0, y: 0, startIndex: 0, filter: '' });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCommands = COMMANDS.filter(c => c.label.toLowerCase().includes(menuState.filter.toLowerCase()));

  useEffect(() => {
    if (editorRef.current && !quillInstance.current) {
      // Initialize Quill
      quillInstance.current = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder: placeholder || 'Start typing...',
        modules: {
          toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'image', 'blockquote', 'code-block'],
            ['clean']
          ]
        }
      });

      // Handle changes
      quillInstance.current.on('text-change', (delta: any, oldDelta: any, source: string) => {
        const html = quillInstance.current.root.innerHTML;
        onChange(html === '<p><br></p>' ? '' : html);

        if (source === 'user') {
          const selection = quillInstance.current.getSelection();
          if (!selection) return;

          const cursorPosition = selection.index;
          const textBeforeCursor = quillInstance.current.getText(0, cursorPosition);
          
          const lastSlashIndex = textBeforeCursor.lastIndexOf('/');
          
          if (lastSlashIndex !== -1) {
            const textAfterSlash = textBeforeCursor.slice(lastSlashIndex + 1);
            if (!textAfterSlash.includes(' ') && !textAfterSlash.includes('\n')) {
              const bounds = quillInstance.current.getBounds(lastSlashIndex);
              setMenuState({
                show: true,
                x: bounds.left,
                y: bounds.bottom,
                startIndex: lastSlashIndex,
                filter: textAfterSlash
              });
              return;
            }
          }
          
          setMenuState(prev => prev.show ? { ...prev, show: false } : prev);
        }
      });
      
      // Initial value
      if (value) {
         quillInstance.current.root.innerHTML = value;
      }
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!menuState.show) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const command = filteredCommands[selectedIndex];
        if (command) {
          command.action(quillInstance.current, menuState.startIndex, menuState.filter.length + 1);
          setMenuState(prev => ({ ...prev, show: false }));
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setMenuState(prev => ({ ...prev, show: false }));
      }
    };

    const editorElement = editorRef.current?.querySelector('.ql-editor');
    if (editorElement) {
      editorElement.addEventListener('keydown', handleKeyDown as any);
      return () => editorElement.removeEventListener('keydown', handleKeyDown as any);
    }
  }, [menuState, filteredCommands, selectedIndex]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [menuState.filter]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuState.show) {
        setMenuState(prev => ({ ...prev, show: false }));
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuState.show]);

  const executeCommand = (command: SlashCommand) => {
    command.action(quillInstance.current, menuState.startIndex, menuState.filter.length + 1);
    setMenuState(prev => ({ ...prev, show: false }));
    quillInstance.current.focus();
  };

  return (
    <div className={`relative prose prose-zinc dark:prose-invert max-w-none ${className}`}>
      <div ref={editorRef} />
      
      {menuState.show && filteredCommands.length > 0 && (
        <div 
          className="absolute z-50 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden py-2"
          style={{ top: menuState.y + 10, left: menuState.x }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="px-3 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 mb-1">
            Commands
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filteredCommands.map((command, idx) => (
              <button
                key={command.label}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors ${
                  idx === selectedIndex ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent editor from losing focus
                  executeCommand(command);
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <div className={`p-1 rounded-md ${idx === selectedIndex ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                  {command.icon}
                </div>
                {command.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};