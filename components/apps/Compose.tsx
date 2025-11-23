
import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  Save, ChevronLeft, Cloud, Monitor, X, Palette, Image as ImageIcon
} from 'lucide-react';
import { GlassPane, GlassButton } from '../GlassPane';

interface ComposeProps {
    onBack: () => void;
    onSave: (name: string, content: string) => void;
    initialContent?: string;
    initialName?: string;
}

export const Compose: React.FC<ComposeProps> = ({ onBack, onSave, initialContent = '', initialName = '' }) => {
  const [content, setContent] = useState(initialContent);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [saveTarget, setSaveTarget] = useState<'cloud' | 'pc' | null>(null);
  const [fileName, setFileName] = useState(initialName || 'Untitled Document');
  
  const editorRef = useRef<HTMLDivElement>(null);

  // Focus editor on mount if empty
  useEffect(() => {
    if (!content && editorRef.current) {
        editorRef.current.focus();
    }
  }, []);

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        if (event.target?.result) {
            editorRef.current?.focus();
            document.execCommand('insertImage', false, event.target.result as string);
        }
    };
    reader.readAsDataURL(file);
  };

  const handleBack = () => {
    // Check if there is content to save? For now just go back.
    // In a real app we might prompt to save if dirty.
    if (content && content !== '<br>' && !initialContent) {
        initiateSave('cloud');
        return;
    }
    onBack();
  };

  const initiateSave = (target: 'cloud' | 'pc') => {
    setSaveTarget(target);
    setShowSaveMenu(false);
    setShowNameModal(true);
  };

  const performSave = () => {
    if (saveTarget === 'cloud') {
        onSave(fileName, content);
        alert(`Saved "${fileName}" to CloudBox!`);
    } else if (saveTarget === 'pc') {
        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
            "xmlns:w='urn:schemas-microsoft-com:office:word' " +
            "xmlns='http://www.w3.org/TR/REC-html40'>" +
            "<head><meta charset='utf-8'><title>" + fileName + "</title></head><body>";
        const footer = "</body></html>";
        const sourceHTML = header + content + footer;

        const blob = new Blob([sourceHTML], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    setShowNameModal(false);
    if (saveTarget === 'cloud') {
        onBack();
    }
  };

  return (
    <div className="h-full flex flex-col relative animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Name Input Modal */}
      {showNameModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
            <GlassPane className="w-full max-w-md p-6 !bg-white dark:!bg-gray-900 shadow-2xl animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Name your document</h3>
                    <button onClick={() => setShowNameModal(false)} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>
                <input 
                    type="text" 
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-ios-blue mb-6 text-gray-900 dark:text-white"
                    placeholder="Enter file name..."
                    autoFocus
                />
                <div className="flex justify-end gap-2">
                    <GlassButton variant="ghost" onClick={() => setShowNameModal(false)}>Cancel</GlassButton>
                    <GlassButton variant="primary" onClick={performSave}>Save</GlassButton>
                </div>
            </GlassPane>
        </div>
      )}

      {/* Toolbar */}
      <GlassPane className="mx-4 mt-4 mb-2 p-2 flex items-center justify-between shrink-0 z-20 !rounded-2xl relative overflow-visible !bg-transparent !shadow-none !border-none !backdrop-blur-none">
        <div className="flex items-center gap-2">
            <button onClick={onBack} className="p-2 hover:bg-black/5 rounded-lg md:hidden">
                <ChevronLeft size={20} />
            </button>
            <button onClick={onBack} className="hidden md:flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors px-2 font-medium">
               <ChevronLeft size={18} /> Back
            </button>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-white p-1 rounded-xl overflow-x-auto shadow-sm">
           {/* Font Family Selector */}
           <div className="flex items-center gap-1 bg-white rounded-lg px-2 py-1">
               <select 
                  onChange={(e) => formatText('fontName', e.target.value)}
                  className="bg-transparent text-sm font-medium text-gray-900 outline-none w-32 cursor-pointer"
                  defaultValue="Inter"
               >
                   <option value="Inter" style={{fontFamily: 'Inter'}}>Inter</option>
                   <option value="Times New Roman" style={{fontFamily: 'Times New Roman'}}>Times New Roman</option>
                   <option value="Arial" style={{fontFamily: 'Arial'}}>Arial</option>
                   <option value="Courier New" style={{fontFamily: 'Courier New'}}>Courier New</option>
                   <option value="Georgia" style={{fontFamily: 'Georgia'}}>Georgia</option>
                   <option value="Verdana" style={{fontFamily: 'Verdana'}}>Verdana</option>
               </select>
           </div>

           <div className="w-px h-4 bg-gray-300 mx-1"></div>

           <button onClick={() => formatText('bold')} className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-700 active:scale-95"><Bold size={18} /></button>
           <button onClick={() => formatText('italic')} className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-700 active:scale-95"><Italic size={18} /></button>
           <button onClick={() => formatText('underline')} className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-700 active:scale-95"><Underline size={18} /></button>
           
           <div className="w-px h-4 bg-gray-300 mx-1"></div>
           
            {/* Text Color Picker */}
           <div className="flex items-center justify-center relative w-8 h-8 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group" title="Text Color">
                <div className="absolute pointer-events-none">
                    <Palette size={18} className="text-gray-700" />
                </div>
                <input
                    type="color"
                    onChange={(e) => formatText('foreColor', e.target.value)}
                    className="w-8 h-8 opacity-0 cursor-pointer"
                />
            </div>

           <div className="w-px h-4 bg-gray-300 mx-1"></div>

           {/* Image Upload */}
            <div className="flex items-center justify-center relative w-8 h-8 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group" title="Insert Image">
                <div className="absolute pointer-events-none">
                    <ImageIcon size={18} className="text-gray-700" />
                </div>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-8 h-8 opacity-0 cursor-pointer"
                />
            </div>

           <div className="w-px h-4 bg-gray-300 mx-1"></div>

           <button onClick={() => formatText('justifyLeft')} className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-700 active:scale-95"><AlignLeft size={18} /></button>
           <button onClick={() => formatText('justifyCenter')} className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-700 active:scale-95"><AlignCenter size={18} /></button>
           <button onClick={() => formatText('justifyRight')} className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-700 active:scale-95"><AlignRight size={18} /></button>
        </div>

        <div className="flex items-center gap-2 relative">
            <GlassButton 
                variant="primary" 
                className="!px-3 !py-1.5 text-sm" 
                onClick={() => setShowSaveMenu(!showSaveMenu)}
            >
                <Save size={16} className="mr-1" /> Save
            </GlassButton>

            {showSaveMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-1 flex flex-col gap-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <button 
                        onClick={() => initiateSave('cloud')}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-white/50 rounded-lg transition-colors text-left"
                    >
                        <Cloud size={16} className="text-ios-blue"/>
                        <span>To CloudBox</span>
                    </button>
                    <button 
                        onClick={() => initiateSave('pc')}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-white/50 rounded-lg transition-colors text-left"
                    >
                        <Monitor size={16} className="text-ios-green"/>
                        <span>To PC (.doc)</span>
                    </button>
                </div>
            )}
        </div>
      </GlassPane>

      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-20 md:px-12 lg:px-32 py-6 z-0">
        <GlassPane 
            className="min-h-[800px] p-8 md:p-16 !bg-white shadow-xl cursor-text"
            onClick={() => editorRef.current?.focus()}
        >
            <div 
                ref={editorRef}
                className="prose prose-lg max-w-none focus:outline-none min-h-[700px]"
                contentEditable
                dangerouslySetInnerHTML={{ __html: content }}
                onBlur={(e) => setContent(e.currentTarget.innerHTML)}
            />
        </GlassPane>
      </div>
    </div>
  );
};
