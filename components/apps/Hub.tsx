
import React from 'react';
import { FileText, Table, Presentation } from 'lucide-react';
import { AppRoute } from '../../types';

interface HubProps {
    onNavigate: (route: AppRoute) => void;
}

export const Hub: React.FC<HubProps> = ({ onNavigate }) => {
  return (
    <div className="h-full p-6 md:p-10 overflow-y-auto animate-slide-up">
      <header className="mb-10 flex justify-between items-end">
        <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-1 tracking-tight">Home</h1>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
         <button 
            onClick={() => onNavigate(AppRoute.COMPOSE)}
            className="group relative h-32 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 flex flex-col justify-between shadow-lg shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95"
        >
            <div className="p-2 bg-white/20 w-fit rounded-xl backdrop-blur-sm"><FileText size={20}/></div>
            <span className="font-medium text-left">New Doc</span>
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors rounded-3xl"></div>
         </button>

         <button 
            onClick={() => onNavigate(AppRoute.GRIDLY)}
            className="group relative h-32 rounded-3xl bg-gradient-to-br from-green-500 to-green-600 text-white p-4 flex flex-col justify-between shadow-lg shadow-green-500/20 transition-transform hover:scale-[1.02] active:scale-95"
        >
            <div className="p-2 bg-white/20 w-fit rounded-xl backdrop-blur-sm"><Table size={20}/></div>
            <span className="font-medium text-left">New Sheet</span>
         </button>

         <button 
            onClick={() => onNavigate(AppRoute.STAGE)}
            className="group relative h-32 rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 flex flex-col justify-between shadow-lg shadow-orange-500/20 transition-transform hover:scale-[1.02] active:scale-95"
        >
            <div className="p-2 bg-white/20 w-fit rounded-xl backdrop-blur-sm"><Presentation size={20}/></div>
            <span className="font-medium text-left">New Slide</span>
         </button>
      </div>
    </div>
  );
};
