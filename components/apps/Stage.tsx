
import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  Save, ChevronLeft, Cloud, Monitor, X, Plus, Trash2, LayoutTemplate, Palette, Image as ImageIcon
} from 'lucide-react';
import { GlassPane, GlassButton } from '../GlassPane';

interface StageProps {
    onBack: () => void;
    onSave: (name: string, content: string) => void;
    initialContent?: string;
    initialName?: string;
}

export const Stage: React.FC<StageProps> = ({ onBack, onSave, initialContent, initialName }) => {
  const parseInitialSlides = () => {
      if (initialContent) {
          try {
              return JSON.parse(initialContent);
          } catch (e) {
              console.error("Failed to parse slides", e);
          }
      }
      // Default: Completely blank slide
      return ['<div style="padding: 40px;"></div>'];
  };

  const [slides, setSlides] = useState<string[]>(parseInitialSlides());
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [saveTarget, setSaveTarget] = useState<'cloud' | 'pc' | null>(null);
  const [fileName, setFileName] = useState(initialName || 'Untitled Presentation');
  
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current) {
        // When slide changes, update innerHTML
        if (editorRef.current.innerHTML !== slides[currentSlideIndex]) {
            editorRef.current.innerHTML = slides[currentSlideIndex];
        }
    }
  }, [currentSlideIndex]);

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
    // Basic unsaved check logic could go here
    onBack();
  };

  const updateSlideContent = (html: string) => {
      setSlides(prev => {
          const newSlides = [...prev];
          newSlides[currentSlideIndex] = html;
          return newSlides;
      });
  };

  const addNewSlide = () => {
      // Add completely blank slide
      setSlides(prev => [...prev, '<div style="padding: 40px;"></div>']);
      setCurrentSlideIndex(slides.length);
  };

  const deleteSlide = (e: React.MouseEvent, index: number) => {
      e.stopPropagation();
      if (slides.length === 1) return;
      const newSlides = slides.filter((_, i) => i !== index);
      setSlides(newSlides);
      if (currentSlideIndex >= index && currentSlideIndex > 0) {
          setCurrentSlideIndex(currentSlideIndex - 1);
      }
  };

  const initiateSave = (target: 'cloud' | 'pc') => {
    setSaveTarget(target);
    setShowSaveMenu(false);
    setShowNameModal(true);
  };

  const performSave = () => {
    if (saveTarget === 'cloud') {
        onSave(fileName, JSON.stringify(slides));
        alert(`Saved "${fileName}" to CloudBox!`);
    } else if (saveTarget === 'pc') {
        // Basic HTML export for slides
        const slidesHtml = slides.map((slide, i) => 
            `<div class="slide" style="page-break-after: always; height: 100vh; display: flex; flex-direction: column; justify-content: center; padding: 2rem;">${slide}</div>`
        ).join('');
        
        const header = "<html><head><title>" + fileName + "</title><style>body{margin:0; font-family: sans-serif;}</style></head><body>";
        const footer = "</body></html>";
        const sourceHTML = header + slidesHtml + footer;

        const blob = new Blob([sourceHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.html`;
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
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Name your presentation</h3>
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
            <button onClick={handleBack} className="p-2 hover:bg-black/5 rounded-lg md:hidden">
                <ChevronLeft size={20} />
            </button>
            <button onClick={handleBack} className="hidden md:flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors px-2 font-medium">
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
                        <span>To PC (.html)</span>
                    </button>
                </div>
            )}
        </div>
      </GlassPane>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden px-4 pb-20 md:px-8 py-4 gap-6">
        
        {/* Slides Sidebar */}
        <div className="w-48 shrink-0 flex flex-col gap-4 overflow-y-auto pb-20 pr-2">
            {slides.map((slide, index) => (
                <div 
                    key={index}
                    onClick={() => setCurrentSlideIndex(index)}
                    className={`relative aspect-video rounded-lg border-2 transition-all cursor-pointer bg-white shadow-sm overflow-hidden group
                        ${currentSlideIndex === index ? 'border-ios-orange ring-2 ring-ios-orange/30' : 'border-transparent hover:border-gray-300'}
                    `}
                >
                    <div className="scale-[0.25] origin-top-left w-[400%] h-[400%] p-8 pointer-events-none select-none" dangerouslySetInnerHTML={{__html: slide}}></div>
                    <div className="absolute bottom-1 left-2 text-[10px] font-bold text-gray-400">{index + 1}</div>
                    
                    {slides.length > 1 && (
                        <button 
                            onClick={(e) => deleteSlide(e, index)}
                            className="absolute top-1 right-1 p-1 bg-red-100 text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                        >
                            <Trash2 size={10} />
                        </button>
                    )}
                </div>
            ))}
            <button 
                onClick={addNewSlide}
                className="aspect-video rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-ios-orange hover:text-ios-orange transition-colors"
            >
                <Plus size={24} />
            </button>
        </div>

        {/* Active Slide Editor */}
        <div className="flex-1 flex justify-center overflow-y-auto">
            <div className="w-full max-w-5xl aspect-video">
                <GlassPane className="w-full h-full !bg-white shadow-2xl relative overflow-hidden">
                    <div 
                        ref={editorRef}
                        className="w-full h-full p-12 outline-none prose max-w-none"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => updateSlideContent(e.currentTarget.innerHTML)}
                    />
                </GlassPane>
            </div>
        </div>

      </div>
    </div>
  );
};
