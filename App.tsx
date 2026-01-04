
import React, { useState, useEffect, useRef } from 'react';
import { View, Story, FilterType } from './types.ts';
import { COLORS, BRANDING } from './constants.ts';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import StoryCard from './components/StoryCard.tsx';
import { moderateContent } from './services/moderationService.ts';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [stories, setStories] = useState<Story[]>([]);
  const [filter, setFilter] = useState<FilterType>('latest');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingStory, setPendingStory] = useState<{ text: string; nickname?: string; image?: string } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('unsaid_theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }

    try {
      const saved = localStorage.getItem('unsaid_stories');
      if (saved) {
        setStories(JSON.parse(saved));
      } else {
        const mock: Story[] = [
          { id: '1', message_body: "I wish I told you how much your smile saved me this year.", nickname: "From: Secret Admirer", reaction_count: 42, report_count: 0, timestamp: Date.now() - 86400000, image_url: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?q=80&w=1200' },
          { id: '2', message_body: "To the person in the library, I was always rooting for you.", nickname: "Anonymous", reaction_count: 15, report_count: 0, timestamp: Date.now() - 172800000, image_url: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=1200' },
          { id: '3', message_body: "Leaving 2025 with no regrets, finally.", nickname: "To: My 2024 Self", reaction_count: 89, report_count: 0, timestamp: Date.now() - 3600000, image_url: 'https://images.unsplash.com/photo-1528698851218-472061269324?q=80&w=1200' },
        ];
        setStories(mock);
        localStorage.setItem('unsaid_stories', JSON.stringify(mock));
      }
    } catch (err) {
      setStories([]);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('unsaid_theme', newTheme);
  };

  const handleLeaveMark = (id: string) => {
    setStories(prevStories => {
      const updated = prevStories.map(s => s.id === id ? { ...s, reaction_count: s.reaction_count + 1 } : s);
      localStorage.setItem('unsaid_stories', JSON.stringify(updated));
      return updated;
    });
  };

  const handleReport = (id: string) => {
    setStories(prevStories => {
      const updated = prevStories.map(s => s.id === id ? { ...s, report_count: s.report_count + 1 } : s);
      localStorage.setItem('unsaid_stories', JSON.stringify(updated));
      return updated;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const text = (formData.get('message') as string)?.trim();
    const nickname = (formData.get('nickname') as string)?.trim();
    if (!text) return;

    setIsSubmitting(true);
    try {
      setPendingStory({ text, nickname, image: imagePreview || undefined });
      setShowConfirm(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmSubmit = async () => {
    if (!pendingStory) return;
    setIsSubmitting(true);
    try {
      const moderation = await moderateContent(pendingStory.text);
      if (!moderation.safe) {
        alert(moderation.reason || "Content flagged.");
        setIsSubmitting(false);
        return;
      }
      const newStory: Story = {
        id: Math.random().toString(36).substring(2, 11),
        message_body: pendingStory.text,
        nickname: pendingStory.nickname || undefined,
        image_url: pendingStory.image,
        reaction_count: 0,
        report_count: 0,
        timestamp: Date.now(),
      };
      setStories(prev => {
        const updated = [newStory, ...prev];
        localStorage.setItem('unsaid_stories', JSON.stringify(updated));
        return updated;
      });
      setPendingStory(null);
      setImagePreview(null);
      setShowConfirm(false);
      setCurrentView('wall');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const visibleStories = stories.filter(s => s.report_count < 5);
  const sortedStories = [...visibleStories].sort((a, b) => {
    if (filter === 'trending') return b.reaction_count - a.reaction_count;
    return b.timestamp - a.timestamp;
  });

  return (
    <div className={`${theme} transition-colors duration-500`}>
      <div className="min-h-screen flex flex-col selection:bg-blue-100 dark:selection:bg-blue-900 overflow-x-hidden bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <Header onNavigate={setCurrentView} currentView={currentView} theme={theme} onToggleTheme={toggleTheme} />

        <main className="flex-1 pt-20 xs:pt-24 sm:pt-28 lg:pt-32">
          {currentView === 'home' && (
            <div className="animate-fade-in">
              <section className="relative grid-bg dark:grid-bg-dark min-h-[70vh] xs:min-h-[85vh] flex flex-col items-center justify-center text-center px-4 sm:px-8 hero-curve">
                <div className="max-w-5xl w-full space-y-8 xs:space-y-10 pb-20 xs:pb-32 sm:pb-40 pt-10 sm:pt-0">
                  <div className="space-y-2 sm:space-y-4 px-2">
                    <h2 className="text-3xl xs:text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-heading tracking-tight leading-[1.1] sm:leading-[0.9] text-zinc-900 dark:text-zinc-100 max-w-4xl mx-auto">
                      Things I <span className="font-script italic text-5xl xs:text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] xl:text-[12rem] lowercase opacity-80 block sm:inline mt-1 sm:mt-0">Didn’t Say</span>
                    </h2>
                    <h3 className="text-xl xs:text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-heading text-zinc-900 dark:text-zinc-100 opacity-70">
                      This 2025
                    </h3>
                  </div>
                  
                  <p className="text-zinc-500 dark:text-zinc-400 max-w-xs xs:max-w-sm sm:max-w-xl mx-auto text-xs xs:text-sm sm:text-lg md:text-xl leading-relaxed tracking-wide opacity-80 pt-2 font-serif-italic px-4">
                    Release the words you’ve kept hidden. Leave the weight of the year behind.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 xs:pt-6 px-6">
                    <button 
                      onClick={() => setCurrentView('wall')}
                      className="w-full sm:w-auto bg-black dark:bg-[#0077B6] text-white px-8 sm:px-12 py-3.5 xs:py-4 rounded-full font-bold text-[9px] xs:text-[10px] sm:text-xs tracking-[0.3em] uppercase hover:bg-zinc-800 dark:hover:bg-blue-600 transition-all shadow-xl active:scale-95"
                    >
                      Explore the Gallery
                    </button>
                    <button 
                      onClick={() => setCurrentView('submit')}
                      className="w-full sm:w-auto border border-black/10 dark:border-white/10 text-black dark:text-white px-8 sm:px-12 py-3.5 xs:py-4 rounded-full font-bold text-[9px] xs:text-[10px] sm:text-xs tracking-[0.3em] uppercase hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-95"
                    >
                      Share Your Story
                    </button>
                  </div>
                </div>
              </section>

              <section className="relative -mt-12 xs:-mt-16 sm:-mt-24 md:-mt-32 px-4 xs:px-6 md:px-12 pb-16 md:pb-32 max-w-[1600px] mx-auto">
                <div className="flex flex-col md:flex-row gap-4 xs:gap-6 lg:h-[500px] xl:h-[600px]">
                  {sortedStories.slice(0, 3).map((story) => (
                    <div key={story.id} className="flex-none w-full md:flex-1 h-[320px] xs:h-[380px] sm:h-[450px] md:h-full transition-all duration-700 md:hover:flex-[1.5]">
                      <StoryCard story={story} onMark={handleLeaveMark} onReport={handleReport} />
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {currentView === 'submit' && (
            <div className="px-5 xs:px-6 sm:px-10 md:px-16 py-8 xs:py-12 sm:py-20 lg:py-28 max-w-5xl mx-auto animate-slide-up">
              <div className="mb-10 xs:mb-12 sm:mb-20 text-center space-y-2">
                <h2 className="text-2xl xs:text-3xl sm:text-5xl lg:text-7xl font-heading tracking-tight text-black dark:text-zinc-100">Release Your Story</h2>
                <p className="text-xs xs:text-sm sm:text-lg lg:text-xl font-serif-italic opacity-40">“The words you wanted to say, but never did.”</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-10 xs:space-y-12 sm:space-y-20">
                <div className="space-y-3 xs:space-y-4">
                  <label htmlFor="nickname" className="block text-[8px] xs:text-[9px] sm:text-[11px] uppercase tracking-[0.4em] opacity-30 font-bold">
                    Identity / Recipient (Optional)
                  </label>
                  <input 
                    id="nickname"
                    name="nickname"
                    type="text"
                    placeholder="e.g. From: Anonymous, To: Someone..."
                    className="w-full p-0 py-2 text-base xs:text-lg sm:text-2xl font-serif-italic font-light rounded-none border-0 focus:ring-0 outline-none transition-all placeholder:opacity-20 bg-transparent border-b border-gray-100 dark:border-zinc-800 focus:border-black dark:focus:border-[#0077B6]"
                  />
                </div>

                <div className="space-y-3 xs:space-y-4">
                  <label htmlFor="message" className="block text-[8px] xs:text-[9px] sm:text-[11px] uppercase tracking-[0.4em] opacity-30 font-bold">
                    The Narrative <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    id="message"
                    name="message"
                    required
                    aria-required="true"
                    placeholder="Type the things you never said..."
                    className="w-full min-h-[180px] xs:min-h-[220px] sm:min-h-[300px] lg:min-h-[400px] p-0 py-2 text-lg xs:text-xl sm:text-3xl lg:text-4xl font-serif-italic font-light rounded-none border-0 focus:ring-0 outline-none transition-all resize-none placeholder:opacity-20 bg-transparent border-b border-gray-100 dark:border-zinc-800 focus:border-black dark:focus:border-[#0077B6]"
                  />
                </div>

                <div className="space-y-3 xs:space-y-4">
                  <label className="block text-[8px] xs:text-[9px] sm:text-[11px] uppercase tracking-[0.4em] opacity-30 font-bold">Visual Context</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative group flex items-center justify-center w-full h-32 xs:h-40 sm:h-64 lg:h-80 border-2 border-dashed border-gray-100 dark:border-zinc-800 rounded-xl xs:rounded-2xl hover:border-black dark:hover:border-[#0077B6] transition-all cursor-pointer bg-gray-50/20 dark:bg-zinc-900/20 overflow-hidden"
                  >
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      name="photo" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                    
                    {imagePreview ? (
                      <div className="absolute inset-0 animate-fade-in">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-[9px] xs:text-[10px] tracking-[0.4em] font-bold uppercase mb-2">Change Image</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center px-6">
                        <span className="block text-2xl xs:text-3xl sm:text-5xl mb-3 xs:mb-4 opacity-20 group-hover:scale-110 transition-transform">{BRANDING.ICON}</span>
                        <span className="text-[8px] xs:text-[10px] sm:text-xs tracking-[0.2em] uppercase opacity-40 font-bold block mb-1">Attach a memory</span>
                        <span className="text-[8px] xs:text-[9px] opacity-30 lowercase italic">(Optional • Max 5MB)</span>
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 xs:py-5 sm:py-8 font-bold text-[10px] xs:text-xs sm:text-sm tracking-[0.5em] uppercase bg-black dark:bg-[#0077B6] text-white hover:bg-zinc-800 dark:hover:bg-blue-600 transition-all shadow-2xl active:scale-[0.99] focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none rounded-xl"
                >
                  {isSubmitting ? 'Submitting...' : 'Release to the Universe'}
                </button>
              </form>
            </div>
          )}

          {currentView === 'wall' && (
            <div className="px-4 xs:px-6 sm:px-10 lg:px-16 py-8 xs:py-12 sm:py-24 max-w-[1800px] mx-auto animate-fade-in">
              <header className="mb-10 xs:mb-16 sm:mb-28 text-center space-y-4 xs:space-y-6">
                <span className="text-[8px] xs:text-[10px] tracking-[0.6em] uppercase opacity-30 block font-bold">The Digital Archive</span>
                <h2 className="text-2xl xs:text-3xl sm:text-6xl lg:text-8xl font-heading tracking-tight text-black dark:text-zinc-100">The 2025 Collection</h2>
                
                <div className="flex flex-col items-center gap-6 xs:gap-8">
                  <p className="text-xs xs:text-sm sm:text-xl font-serif-italic opacity-40 px-6 max-w-2xl leading-relaxed">“A sanctuary of whispers and unspoken truths.”</p>
                  
                  <div className="flex items-center gap-1 bg-gray-50 dark:bg-zinc-900/50 p-1 rounded-full border border-gray-100 dark:border-zinc-800 shadow-inner">
                    <button 
                      onClick={() => setFilter('latest')}
                      className={`px-5 xs:px-6 sm:px-10 py-2 xs:py-2.5 rounded-full text-[8px] xs:text-[10px] font-bold uppercase tracking-widest transition-all ${filter === 'latest' ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-md' : 'text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200'}`}
                    >
                      Latest
                    </button>
                    <button 
                      onClick={() => setFilter('trending')}
                      className={`px-5 xs:px-6 sm:px-10 py-2 xs:py-2.5 rounded-full text-[8px] xs:text-[10px] font-bold uppercase tracking-widest transition-all ${filter === 'trending' ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-md' : 'text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200'}`}
                    >
                      Trending
                    </button>
                  </div>
                </div>
              </header>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 xs:gap-6 sm:gap-8 lg:gap-10">
                {sortedStories.map(story => (
                  <div key={story.id} className="h-[300px] xs:h-[360px] sm:h-[450px] lg:h-[500px]">
                    <StoryCard story={story} onMark={handleLeaveMark} onReport={handleReport} />
                  </div>
                ))}
              </div>
              
              {sortedStories.length === 0 && (
                <div className="text-center py-32 xs:py-40 opacity-20 uppercase tracking-[0.5em] text-[8px] xs:text-xs">
                  The archive is currently empty.
                </div>
              )}
            </div>
          )}
        </main>

        <Footer />

        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/70 backdrop-blur-lg animate-fade-in" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-zinc-900 max-w-lg w-full p-6 xs:p-8 sm:p-14 space-y-6 xs:space-y-8 sm:space-y-12 shadow-2xl text-center border border-zinc-100 dark:border-zinc-800 relative rounded-2xl xs:rounded-3xl animate-modal-pop">
              <div className="space-y-3 xs:space-y-4 sm:space-y-6">
                <div className="text-4xl xs:text-5xl sm:text-7xl animate-bounce-subtle">{BRANDING.ICON}</div>
                <h3 className="text-xl xs:text-2xl sm:text-4xl font-heading tracking-tight text-slate-900 dark:text-zinc-100 leading-tight">Ready to release?</h3>
                <p className="text-xs xs:text-sm sm:text-lg lg:text-xl font-serif-italic text-slate-500 dark:text-zinc-400 leading-relaxed px-2">
                  “Once shared, these words belong to the universe. Are you ready to let go?”
                </p>
              </div>
              <div className="flex flex-col gap-2 xs:gap-3 sm:gap-4">
                <button 
                  onClick={confirmSubmit} 
                  disabled={isSubmitting} 
                  className="w-full py-3.5 xs:py-4 sm:py-5 bg-black dark:bg-[#0077B6] text-white font-bold text-[9px] xs:text-[10px] sm:text-xs tracking-[0.4em] uppercase transition-all active:scale-95 rounded-xl xs:rounded-2xl shadow-xl"
                >
                  {isSubmitting ? 'Processing...' : 'Confirm & Release'}
                </button>
                <button 
                  onClick={() => setShowConfirm(false)} 
                  className="w-full py-3 text-gray-400 font-bold text-[8px] xs:text-[9px] sm:text-[10px] tracking-[0.4em] uppercase hover:text-black dark:hover:text-white transition-colors"
                >
                  Stay Silent
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slide-up { from { opacity: 0; transform: translateY(60px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes modal-pop {
            0% { opacity: 0; transform: scale(0.92) translateY(30px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes bounce-subtle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
          }
          
          .animate-fade-in { animation: fade-in 0.7s ease-out forwards; }
          .animate-slide-up { animation: slide-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-modal-pop { animation: modal-pop 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-bounce-subtle { animation: bounce-subtle 4s ease-in-out infinite; }
        `}</style>
      </div>
    </div>
  );
};

export default App;
