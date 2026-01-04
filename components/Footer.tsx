
import React from 'react';
import { COLORS, BRANDING } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-zinc-950 py-16 sm:py-24 px-6 border-t border-gray-50 dark:border-zinc-900 transition-colors">
      <div className="max-w-5xl mx-auto text-center space-y-6 sm:space-y-10">
        <div className="flex justify-center text-2xl sm:text-3xl mb-2 text-[#0077B6] animate-pulse-slow">{BRANDING.ICON}</div>
        
        <div className="space-y-4">
          <p className="text-[#64748b] dark:text-zinc-400 text-xs sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto italic font-light px-2">
            A Digital Year-end Folio project by <strong className="text-[#0077B6] dark:text-white font-bold">The Footprints / Ang Bakas</strong>. 
            Capturing the things we wanted to say but never did. Inspired by the works of Geloy Concepcion.
          </p>
          
          <div className="pt-2">
            <a 
              href="https://www.facebook.com/ctethefootprints" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] sm:text-xs font-bold tracking-[0.4em] uppercase hover:underline inline-block p-2 text-[#0077B6] transition-all hover:scale-105 active:scale-95"
            >
              Connect with us
            </a>
          </div>
        </div>

        <div className="pt-8 sm:pt-16 border-t border-gray-100 dark:border-zinc-900/50">
          <p className="text-[8px] sm:text-[10px] text-gray-400 dark:text-zinc-600 uppercase tracking-[0.5em] opacity-60">
            &copy; {new Date().getFullYear()} Ang Bakas Student Publication.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
