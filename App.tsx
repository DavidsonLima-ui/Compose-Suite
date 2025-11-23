
import React, { useState } from 'react';
import { Sidebar, MobileNav } from './components/Sidebar';
import { Hub } from './components/apps/Hub';
import { Compose } from './components/apps/Compose';
import { Gridly } from './components/apps/Gridly';
import { Stage } from './components/apps/Stage';
import { AppRoute, FileItem } from './types';
import { GlassPane } from './components/GlassPane';
import { FileText, Cloud, Trash2, Table, Presentation } from 'lucide-react';

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.HUB);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [activeFile, setActiveFile] = useState<FileItem | null>(null);

  const handleSaveDoc = (name: string, content: string) => {
    // Determine type based on current route
    let type: 'doc' | 'sheet' | 'slide' = 'doc';
    let color = 'bg-blue-500';

    if (currentRoute === AppRoute.GRIDLY) {
        type = 'sheet';
        color = 'bg-ios-green';
    } else if (currentRoute === AppRoute.STAGE) {
        type = 'slide';
        color = 'bg-ios-orange';
    }

    if (activeFile) {
        // Update existing file
        const updatedFile = { ...activeFile, name, content, date: new Date().toLocaleDateString() };
        setFiles(prev => prev.map(f => f.id === activeFile.id ? updatedFile : f));
        setActiveFile(updatedFile);
    } else {
        // Create new file
        const newFile: FileItem = {
            id: Date.now().toString(),
            name: name,
            type: type,
            date: new Date().toLocaleDateString(),
            shared: false,
            color: color,
            content: content
        };
        setFiles(prev => [newFile, ...prev]);
        setActiveFile(newFile);
    }
  };

  const handleOpenFile = (file: FileItem) => {
    setActiveFile(file);
    if (file.type === 'doc') {
        setCurrentRoute(AppRoute.COMPOSE);
    } else if (file.type === 'sheet') {
        setCurrentRoute(AppRoute.GRIDLY);
    } else if (file.type === 'slide') {
        setCurrentRoute(AppRoute.STAGE);
    } else {
        alert("This file type is not supported yet.");
    }
  };

  const handleDeleteFile = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent opening the file when clicking delete
    // Removed confirmation for instant deletion
    setFiles(prev => prev.filter(f => f.id !== id));
    if (activeFile?.id === id) {
        setActiveFile(null);
    }
  };

  const navigateTo = (route: AppRoute) => {
      // If navigating to New app from Hub, clear active file
      if ((route === AppRoute.COMPOSE || route === AppRoute.GRIDLY || route === AppRoute.STAGE) && currentRoute === AppRoute.HUB) {
          setActiveFile(null);
      }
      setCurrentRoute(route);
  };

  // Gradient Background
  const backgroundStyle = {
    background: `
      radial-gradient(at 0% 0%, rgba(255, 200, 200, 0.4) 0px, transparent 50%),
      radial-gradient(at 100% 0%, rgba(200, 220, 255, 0.4) 0px, transparent 50%),
      radial-gradient(at 100% 100%, rgba(255, 255, 200, 0.3) 0px, transparent 50%),
      radial-gradient(at 0% 100%, rgba(200, 255, 255, 0.3) 0px, transparent 50%),
      #F2F2F7
    `
  };

  const renderContent = () => {
    switch (currentRoute) {
      case AppRoute.HUB:
        return <Hub key="hub" onNavigate={navigateTo} />;
      case AppRoute.COMPOSE:
        return (
          <Compose 
            onBack={() => setCurrentRoute(AppRoute.HUB)} 
            onSave={handleSaveDoc}
            initialContent={activeFile?.content}
            initialName={activeFile?.name}
            key={activeFile?.id || 'new-doc'} // Force remount on file change
          />
        );
      case AppRoute.GRIDLY:
        return (
            <Gridly 
                onBack={() => setCurrentRoute(AppRoute.HUB)} 
                onSave={handleSaveDoc}
                initialContent={activeFile?.content}
                initialName={activeFile?.name}
                key={activeFile?.id || 'new-sheet'} // Force remount
            />
        );
      case AppRoute.STAGE:
        return (
            <Stage
                onBack={() => setCurrentRoute(AppRoute.HUB)}
                onSave={handleSaveDoc}
                initialContent={activeFile?.content}
                initialName={activeFile?.name}
                key={activeFile?.id || 'new-slide'} // Force remount
            />
        );
      case AppRoute.CLOUDBOX:
        return (
             <div key="cloudbox" className="h-full flex flex-col p-6 animate-slide-up">
                 <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-ios-teal/10 rounded-xl">
                          <Cloud className="text-ios-teal" size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">CloudBox</h2>
                     </div>
                 </div>
                 
                 {files.length === 0 ? (
                   <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                     <Cloud size={48} className="mb-4 opacity-20" />
                     <p>No files yet.</p>
                     <p className="text-sm">Documents you create will appear here.</p>
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pb-20">
                       {files.map(file => (
                           <GlassPane 
                                key={file.id} 
                                className="h-40 p-4 flex flex-col justify-between hover:bg-white/60 transition-colors group cursor-pointer relative active:scale-95"
                                onClick={() => handleOpenFile(file)}
                            >
                               <div className="flex justify-between items-start">
                                 <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${file.color} text-white shadow-md`}>
                                   {file.type === 'sheet' ? <Table size={20}/> : file.type === 'slide' ? <Presentation size={20}/> : <FileText size={20} />}
                                 </div>
                                 
                                 <div className="flex items-center gap-2">
                                     <span className="text-xs text-gray-400">{file.date}</span>
                                     <button 
                                        onClick={(e) => handleDeleteFile(e, file.id)}
                                        className="relative z-10 p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                        title="Delete file"
                                     >
                                        <Trash2 size={18} />
                                     </button>
                                 </div>
                               </div>
                               <div>
                                 <h3 className="font-semibold text-gray-800 line-clamp-1 group-hover:text-ios-blue transition-colors">{file.name}</h3>
                                 <p className="text-xs text-gray-500 mt-1 capitalize">{file.type} File</p>
                               </div>
                           </GlassPane>
                       ))}
                   </div>
                 )}
             </div>
        );
      default:
        return <Hub onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="flex h-screen w-screen font-sans text-gray-900 relative overflow-hidden" style={backgroundStyle}>
      
      {/* Decorative Abstract Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-300/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-300/30 rounded-full blur-3xl animate-float animation-delay-2000" />
      
      <Sidebar currentRoute={currentRoute} onNavigate={navigateTo} />
      
      <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden bg-white/30 backdrop-blur-xl md:m-4 md:rounded-[2.5rem] border border-white/40 shadow-2xl">
        {renderContent()}
      </main>

      <MobileNav currentRoute={currentRoute} onNavigate={navigateTo} />
    </div>
  );
};

export default App;
