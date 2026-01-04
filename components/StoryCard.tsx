
import React, { useState, useEffect, useRef } from 'react';
import { Story } from '../types.ts';
import { BRANDING } from '../constants.ts';

interface StoryCardProps {
  story: Story;
  onMark: (id: string) => void;
  onReport: (id: string) => void;
}

const StoryCard: React.FC<StoryCardProps> = ({ story, onMark, onReport }) => {
  const [isPopping, setIsPopping] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isConfirmingReport, setIsConfirmingReport] = useState(false);
  const [hasReported, setHasReported] = useState(false);
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (story.reaction_count > 0) {
      setIsPopping(true);
      const timer = setTimeout(() => setIsPopping(false), 400);
      return () => clearTimeout(timer);
    }
  }, [story.reaction_count]);

  const togglePreview = (e: React.MouseEvent) => {
    if (story.image_url) {
      e.stopPropagation();
      setIsPreviewOpen(!isPreviewOpen);
    }
  };

  const handleReportClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasReported) return;
    if (!isConfirmingReport) {
      setIsConfirmingReport(true);
      setTimeout(() => setIsConfirmingReport(false), 3000);
    } else {
      onReport(story.id);
      setHasReported(true);
      setIsConfirmingReport(false);
    }
  };

  const generateStoryImage = async (): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas) return resolve('');

      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve('');

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = story.image_url || 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1080';

      img.onload = () => {
        canvas.width = 1080;
        canvas.height = 1920;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.font = 'italic 70px "Noto Serif", serif';
        ctx.fillStyle = 'white';
        const words = story.message_body.split(' ');
        let line = '';
        let y = canvas.height / 2 - 100;
        const maxWidth = 800;
        const lineHeight = 100;

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(`“${line.trim()}”`, canvas.width / 2, y);
            line = words[n] + ' ';
            y += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(`“${line.trim()}”`, canvas.width / 2, y);

        ctx.font = 'bold 30px "Helvetica", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillText(BRANDING.TITLE.toUpperCase(), canvas.width / 2, canvas.height - 150);
        ctx.font = '40px "Cormorant Upright", serif';
        ctx.fillText(BRANDING.ICON, canvas.width / 2, canvas.height - 220);

        if (story.nickname) {
          ctx.font = 'bold 24px "Helvetica", sans-serif';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.fillText(story.nickname.toUpperCase(), canvas.width / 2, canvas.height / 2 - 400);
        }

        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve('');
    });
  };

  const handleShareToStory = async (platform: 'ig' | 'fb') => {
    setIsGenerating(true);
    const dataUrl = await generateStoryImage();
    
    if (dataUrl) {
      const link = document.createElement('a');
      link.download = `unsaid-2025-story-${story.id}.png`;
      link.href = dataUrl;
      link.click();
      
      setTimeout(() => {
        alert(`Image saved. You can now upload it to your ${platform === 'ig' ? 'Instagram' : 'Facebook'} Story!`);
      }, 500);
    }
    
    setIsGenerating(false);
    setIsShareSheetOpen(false);
  };

  const handleNativeShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: BRANDING.TITLE,
          text: `"${story.message_body}" — Read more on Unsaid: 2025`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      setIsShareSheetOpen(true);
    }
  };

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />
      <div 
        onClick={togglePreview}
        className={`relative group w-full h-full bg-black overflow-hidden shadow-xl md:hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] flex flex-col transition-all duration-700 hover:scale-[1.01] sm:hover:scale-[1.02] ${story.image_url ? 'cursor-zoom-in' : 'cursor-default'} active:scale-[0.98] rounded-xl sm:rounded-2xl`}
      >
        <div className="absolute inset-0 z-0">
          <img 
            src={story.image_url || 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800'} 
            alt="Memory" 
            className="w-full h-full object-cover filter grayscale brightness-[0.35] sm:brightness-[0.4] md:group-hover:grayscale-0 md:group-hover:brightness-[0.6] md:group-hover:scale-110 transition-all duration-[2.5s] ease-out"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700" />
          
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex flex-col gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-500 translate-y-0 sm:translate-y-2 sm:group-hover:translate-y-0">
               {story.image_url && (
                 <div className="bg-white/10 backdrop-blur-md p-2 sm:p-2.5 rounded-full border border-white/20 shadow-lg cursor-zoom-in">
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
                 </div>
               )}
               <button 
                  onClick={handleNativeShare}
                  className="bg-white/10 backdrop-blur-md p-2 sm:p-2.5 rounded-full border border-white/20 shadow-lg hover:bg-white/20 transition-colors pointer-events-auto"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
               </button>
          </div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-end p-4 xs:p-5 sm:p-6 md:p-8 text-left transition-transform duration-700 md:group-hover:-translate-y-2 pointer-events-none">
          {story.nickname && (
            <div className="mb-2 sm:mb-4 transform transition-transform duration-500 group-hover:-translate-x-1">
              <span className="text-[8px] xs:text-[10px] sm:text-[11px] font-bold tracking-[0.3em] uppercase text-white/50 border-b border-white/10 pb-1">
                {story.nickname}
              </span>
            </div>
          )}
          
          <p className="text-white text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-serif-italic leading-snug xs:leading-tight mb-4 sm:mb-6 text-shadow max-w-[95%] opacity-90 line-clamp-5 xs:line-clamp-6 transition-all duration-700 group-hover:opacity-100">
            “{story.message_body}”
          </p>
          
          <div className="flex justify-between items-center w-full border-t border-white/10 pt-3 xs:pt-4 sm:pt-6 pointer-events-auto">
            <div className="flex flex-col gap-1">
              <span className="text-[7px] xs:text-[9px] md:text-[10px] tracking-[0.2em] text-white/40 uppercase font-bold">
                {new Date(story.timestamp).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
              </span>
              
              <button 
                onClick={handleReportClick}
                className={`text-[7px] xs:text-[8px] uppercase tracking-widest font-bold transition-all p-1 -ml-1 ${hasReported ? 'text-green-400 opacity-60 cursor-default' : isConfirmingReport ? 'text-red-400 scale-105 sm:scale-110' : 'text-white/20 hover:text-white/60'}`}
                aria-label="Report story"
              >
                {hasReported ? 'Reported' : isConfirmingReport ? 'Confirm?' : 'Report'}
              </button>
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onMark(story.id);
              }}
              className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 group/btn touch-manipulation p-2 -m-2"
              aria-label="Give a hug"
            >
              <div className="flex flex-col items-end">
                <span className={`text-[7px] xs:text-[8px] sm:text-[10px] font-bold tracking-widest text-white/50 uppercase transition-colors ${isPopping ? 'text-white' : 'group-hover/btn:text-white/80'}`}>
                  Hug
                </span>
                <span className={`text-xs sm:text-sm font-bold text-white transition-all ${isPopping ? 'scale-125' : ''}`}>
                  {story.reaction_count}
                </span>
              </div>
              <span className={`text-xl xs:text-2xl sm:text-3xl transition-transform ${isPopping ? 'animate-hug' : 'md:group-hover/btn:scale-125 md:group-hover/btn:rotate-6'} active:scale-90`}>
                {BRANDING.ICON}
              </span>
            </button>
          </div>
        </div>
      </div>

      {isShareSheetOpen && (
        <div 
          className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsShareSheetOpen(false)}
        >
          <div 
            className="bg-white dark:bg-zinc-900 w-full max-w-md p-6 xs:p-8 sm:p-10 sm:rounded-3xl shadow-2xl animate-slide-up-sheet"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-gray-200 dark:bg-zinc-800 rounded-full mx-auto mb-6 sm:hidden" />
            
            <h4 className="text-[9px] xs:text-[10px] font-bold tracking-[0.4em] uppercase opacity-40 mb-6 xs:mb-8 text-center">Share This Moment</h4>
            
            <div className="grid grid-cols-2 gap-3 xs:gap-4 mb-6 xs:mb-8">
              <button 
                onClick={() => handleShareToStory('ig')}
                disabled={isGenerating}
                className="flex flex-col items-center gap-2 xs:gap-3 p-3 xs:p-4 rounded-xl xs:rounded-2xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="w-12 h-12 xs:w-14 xs:h-14 rounded-xl xs:rounded-2xl bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="xs:w-7 xs:h-7"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </div>
                <span className="text-[8px] xs:text-[9px] font-bold uppercase tracking-widest text-zinc-500">{isGenerating ? 'Rendering...' : 'IG Story'}</span>
              </button>

              <button 
                onClick={() => handleShareToStory('fb')}
                disabled={isGenerating}
                className="flex flex-col items-center gap-2 xs:gap-3 p-3 xs:p-4 rounded-xl xs:rounded-2xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="w-12 h-12 xs:w-14 xs:h-14 rounded-xl xs:rounded-2xl bg-[#1877F2] flex items-center justify-center shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="xs:w-7 xs:h-7"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </div>
                <span className="text-[8px] xs:text-[9px] font-bold uppercase tracking-widest text-zinc-500">FB Story</span>
              </button>
            </div>

            <button 
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/story/${story.id}`);
                alert("Link copied to clipboard!");
              }}
              className="w-full py-3.5 xs:py-4 border border-gray-100 dark:border-zinc-800 rounded-lg xs:rounded-xl flex items-center justify-center gap-2 xs:gap-3 text-[9px] xs:text-[10px] font-bold tracking-widest uppercase text-zinc-400 hover:text-black dark:hover:text-white hover:border-black transition-all mb-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="xs:w-3.5 xs:h-3.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
              Copy Secret Link
            </button>

            <button 
              onClick={() => setIsShareSheetOpen(false)}
              className="w-full py-3 xs:py-4 text-[8px] xs:text-[9px] font-bold tracking-widest uppercase opacity-30 hover:opacity-100 transition-opacity"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isPreviewOpen && story.image_url && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in cursor-zoom-out p-4 md:p-12"
          onClick={() => setIsPreviewOpen(false)}
        >
          <button 
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/50 hover:text-white transition-colors p-2.5 xs:p-3 bg-white/5 rounded-full"
            onClick={() => setIsPreviewOpen(false)}
            aria-label="Close preview"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-7 sm:h-7"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          
          <div className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center gap-6 sm:gap-10">
            <img 
              src={story.image_url} 
              alt="Memory Full Preview" 
              className="max-w-full max-h-[60vh] xs:max-h-[70vh] sm:max-h-[75vh] object-contain shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-scale-up rounded-sm"
              onClick={(e) => e.stopPropagation()}
            />
            
            <div className="text-center max-w-2xl px-4 animate-slide-up-subtle">
               {story.nickname && (
                  <p className="text-white/40 text-[8px] xs:text-[10px] tracking-[0.4em] uppercase font-bold mb-3 xs:mb-4">{story.nickname}</p>
               )}
               <p className="text-white/80 font-serif-italic text-sm xs:text-base sm:text-lg md:text-xl leading-relaxed mb-4 xs:mb-6">
                 “{story.message_body}”
               </p>
               <div className="flex items-center justify-center gap-3 xs:gap-4 text-white/30 text-[8px] xs:text-[9px] sm:text-[10px] tracking-[0.3em] uppercase font-bold">
                 <span>{new Date(story.timestamp).toLocaleDateString()}</span>
                 <span className="w-1 h-1 bg-white/10 rounded-full" />
                 <span>{story.reaction_count} Hugs</span>
               </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes hug-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.4); }
          100% { transform: scale(1); }
        }
        .animate-hug {
          animation: hug-pulse 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes scale-up {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slide-up-subtle {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slide-up-sheet {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-scale-up {
          animation: scale-up 0.6s cubic-bezier(0.19, 1, 0.22, 1) forwards;
        }
        .animate-slide-up-subtle {
          animation: slide-up-subtle 0.8s cubic-bezier(0.19, 1, 0.22, 1) 0.1s forwards;
          opacity: 0;
        }
        .animate-slide-up-sheet {
          animation: slide-up-sheet 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards;
        }
      `}</style>
    </>
  );
};

export default StoryCard;
