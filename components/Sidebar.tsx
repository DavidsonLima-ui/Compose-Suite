import React from 'react';
import { LayoutGrid, Cloud } from 'lucide-react';
import { AppRoute, NavItem } from '../types';

interface SidebarProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

const navItems: NavItem[] = [
  { id: AppRoute.HUB, label: 'Home', icon: LayoutGrid, color: 'text-ios-blue' },
  { id: AppRoute.CLOUDBOX, label: 'CloudBox', icon: Cloud, color: 'text-ios-teal' },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentRoute, onNavigate }) => {
  return (
    <nav className="hidden md:flex flex-col w-24 lg:w-64 h-full pt-8 pb-4 px-4 justify-between z-50">
      <div className="space-y-6">
        {/* Logo Area */}
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 shrink-0">
             <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
               <path d="M20 0H30C35.5228 0 40 4.47715 40 10V20H20V0Z" fill="#EA4335"/>
               <path d="M20 20H40V30C40 35.5228 35.5228 40 30 40H20V20Z" fill="#FBBC04"/>
               <path d="M0 20H20V40H10C4.47715 40 0 35.5228 0 30V20Z" fill="#34A853"/>
               <path d="M0 10C0 4.47715 4.47715 0 10 0H20V10C20 15.5228 15.5228 20 10 20H0V10Z" fill="#4285F4"/>
             </svg>
          </div>
          <span className="hidden lg:block text-xl font-bold tracking-tight text-gray-900/80 dark:text-white/90">
            Compose Suite
          </span>
        </div>

        {/* Nav Items */}
        <div className="space-y-2">
          {navItems.map((item) => {
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-white/80 dark:bg-white/10 shadow-sm backdrop-blur-md' 
                    : 'hover:bg-white/40 dark:hover:bg-white/5'
                  }`}
              >
                <div className={`p-2 rounded-xl ${isActive ? 'bg-white dark:bg-black/20' : 'bg-transparent'}`}>
                  <item.icon 
                    size={20} 
                    className={`${isActive ? item.color : 'text-gray-500 dark:text-gray-400'} transition-colors`} 
                  />
                </div>
                <span className={`hidden lg:block font-medium ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export const MobileNav: React.FC<SidebarProps> = ({ currentRoute, onNavigate }) => {
    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-white/20 flex items-center justify-around px-4 pb-4 z-50">
             {navItems.map((item) => {
                 const isActive = currentRoute === item.id;
                 return (
                     <button 
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className="flex flex-col items-center gap-1 p-2"
                     >
                         <item.icon 
                            size={24} 
                            className={`${isActive ? item.color : 'text-gray-400'} transition-colors`} 
                            strokeWidth={isActive ? 2.5 : 2}
                         />
                         {isActive && <div className="w-1 h-1 rounded-full bg-current text-gray-900 dark:text-white" />}
                     </button>
                 )
             })}
        </div>
    )
}