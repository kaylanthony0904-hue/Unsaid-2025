
import React from 'react';
import { COLORS, BRANDING } from '../constants';
import { View } from '../types';

interface HeaderProps {
  onNavigate: (view: View) => void;
  currentView: View;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentView, theme, onToggleTheme }) => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 p-2 sm:p-4 lg:p-6 flex justify-between items-center pointer-events-none">
      {/* Brand - Scaled for mobile */}
      <div 
        className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto cursor-pointer group bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-3 py-1.5 rounded-full md:bg-transparent md:p-0 transition-all active:scale-95" 
        onClick={() => onNavigate('home')}
      >
        <span className="text-lg sm:text-xl lg:text-2xl" style={{ color: theme === 'dark' ? '#0077B6' : '#000' }}>{BRANDING.ICON}</span>
        <h1 className="font-bold text-[10px] sm:text-xs lg:text-lg tracking-tight hidden xs:block" style={{ color: theme === 'dark' ? '#FFF' : '#000' }}>
          {BRANDING.PUBLISHER}
        </h1>
      </div>
      
      {/* Centered Pill Nav */}
      <div className="flex items-center gap-1 sm:gap-2 pointer-events-auto">
        <nav className="pill-nav p-1 flex items-center gap-0.5 sm:gap-1 shadow-lg transition-all dark:bg-zinc-900/80 dark:border-zinc-800">
          <button 
            onClick={() => onNavigate('home')}
            className={`px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 rounded-full text-[9px] sm:text-[10px] lg:text-xs font-bold uppercase tracking-widest transition-all ${currentView === 'home' ? (theme === 'dark' ? 'bg-[#0077B6] text-white' : 'bg-black text-white') : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
          >
            Home
          </button>
          <button 
            onClick={() => onNavigate('wall')}
            className={`px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 rounded-full text-[9px] sm:text-[10px] lg:text-xs font-bold uppercase tracking-widest transition-all ${currentView === 'wall' ? (theme === 'dark' ? 'bg-[#0077B6] text-white' : 'bg-black text-white') : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
          >
            Gallery
          </button>
          <button 
            onClick={() => onNavigate('submit')}
            className={`px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 rounded-full text-[9px] sm:text-[10px] lg:text-xs font-bold uppercase tracking-widest transition-all ${currentView === 'submit' ? (theme === 'dark' ? 'bg-[#0077B6] text-white' : 'bg-black text-white') : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
          >
            Post
          </button>
          
          <div className="w-[1px] h-3 sm:h-4 bg-gray-200 dark:bg-zinc-700 mx-0.5 sm:mx-1"></div>
          
          <button 
            onClick={onToggleTheme}
            className="p-1.5 sm:p-2 rounded-full text-gray-500 hover:text-black dark:hover:text-white transition-all active:scale-90"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            )}
          </button>
        </nav>
      </div>

      {/* Explore Button - Hidden on small mobile */}
      <button 
        onClick={() => onNavigate('wall')}
        className={`hidden sm:block ${theme === 'dark' ? 'bg-[#0077B6] hover:bg-blue-600' : 'bg-black hover:bg-zinc-800'} text-white px-5 lg:px-8 py-2.5 lg:py-3 rounded-full text-[10px] lg:text-xs font-bold uppercase tracking-[0.2em] pointer-events-auto transition-all active:scale-95 shadow-xl`}
      >
        Explore
      </button>
      
      {/* Spacer for mobile layout balance */}
      <div className="sm:hidden w-8"></div>
    </header>
  );
};

export default Header;
