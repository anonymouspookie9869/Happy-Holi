import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, Share2, Palette, Music, Volume2, VolumeX, Loader2, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { HoliCanvas } from './components/HoliCanvas';
import { FestiveElements } from './components/FestiveElements';
import { cn } from './lib/utils';

const WISHES = [
  "May your life be as colorful as the festival of Holi!",
  "Wishing you a Holi filled with sweet moments and colorful memories.",
  "Let the colors of Holi spread the message of peace and happiness.",
  "May the fire of Holi purify your heart and the colors brighten your life.",
  "Splashing you with love, joy, and vibrant colors this Holi!"
];

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
  console.log(">>> [TOAST] Rendering toast:", message);
  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className={cn(
        "fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-xl min-w-[300px] max-w-[90vw]",
        type === 'success' ? "bg-emerald-500/90 text-white border-emerald-400" : "bg-rose-500/90 text-white border-rose-400"
      )}
    >
      {type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
      <p className="font-bold text-sm">{message}</p>
      <button onClick={onClose} className="ml-auto opacity-70 hover:opacity-100">✕</button>
    </motion.div>
  );
};

export default function App() {
  const [currentWish, setCurrentWish] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const confettiSfxRef = useRef<HTMLAudioElement | null>(null);
  const splashSfxRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize background music
    bgMusicRef.current = new Audio('https://raw.githubusercontent.com/anonymouspookie9869/Happy-Holi/main/audio.mp3');
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = 0.5;

    // Initialize confetti SFX
    confettiSfxRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
    confettiSfxRef.current.volume = 0.4;

    // Initialize splash SFX
    splashSfxRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/1118/1118-preview.mp3');
    splashSfxRef.current.volume = 0.3;

    const interval = setInterval(() => {
      setCurrentWish((prev) => (prev + 1) % WISHES.length);
    }, 5000);

    // Test server connectivity
    fetch('/api/test')
      .then(r => r.json())
      .then(d => console.log(">>> [CLIENT] Server test:", d))
      .catch(e => console.error(">>> [CLIENT] Server test failed:", e));

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (bgMusicRef.current) {
      bgMusicRef.current.muted = isMuted;
      if (!isMuted && !showIntro) {
        bgMusicRef.current.play().catch(e => console.log("Audio play blocked:", e));
      }
    }
  }, [isMuted, showIntro]);

  const triggerConfetti = () => {
    if (confettiSfxRef.current) {
      confettiSfxRef.current.currentTime = 0;
      confettiSfxRef.current.play().catch(e => console.log("SFX play blocked:", e));
    }
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const handleSplash = () => {
    if (!isMuted && splashSfxRef.current) {
      splashSfxRef.current.currentTime = 0;
      splashSfxRef.current.play().catch(e => console.log("Splash SFX play blocked:", e));
    }
  };

  if (showIntro) {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center z-50 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center px-6"
        >
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="mb-8 inline-block"
          >
            <Palette className="w-20 h-20 text-pink-500 mx-auto" />
          </motion.div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter leading-none">
            READY TO <br className="md:hidden" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500">CELEBRATE?</span>
          </h1>
          <p className="text-zinc-400 text-lg mb-8 max-w-md mx-auto">
            Experience the digital festival of colors. Click anywhere to splash!
          </p>
          <button
            onClick={() => {
              setShowIntro(false);
              setIsMuted(false);
              triggerConfetti();
              if (bgMusicRef.current) {
                bgMusicRef.current.play().catch(e => console.log("Initial audio play blocked:", e));
              }
            }}
            className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-pink-500 hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-pink-500/20"
          >
            ENTER THE FESTIVAL
          </button>
        </motion.div>
        
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-500 rounded-full blur-[120px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-zinc-900 font-sans selection:bg-pink-200 overflow-x-hidden">
      {/* Interactive Backgrounds */}
      <FestiveElements />
      <HoliCanvas onSplash={handleSplash} />

      {/* Floating Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              scale: Math.random() * 0.5 + 0.5,
              opacity: 0.1 + Math.random() * 0.2
            }}
            animate={{ 
              y: [null, "-20%", "120%"],
              x: [null, (Math.random() - 0.5) * 20 + "%"],
              rotate: [0, 360]
            }}
            transition={{ 
              duration: 15 + Math.random() * 20, 
              repeat: Infinity, 
              ease: "linear",
              delay: Math.random() * 10
            }}
            className="absolute w-4 h-4 rounded-full"
            style={{ 
              backgroundColor: ['#FF1493', '#FF4500', '#FFD700', '#32CD32', '#00BFFF'][i % 5],
              filter: 'blur(8px)'
            }}
          />
        ))}
      </div>

      {/* Navigation / Header */}
      <nav className="fixed top-0 left-0 w-full p-4 md:p-6 flex justify-between items-center z-30 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-pink-500 to-orange-500 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="text-white w-5 h-5 md:w-6 md:h-6" />
          </div>
          <span className="font-black text-lg md:text-xl tracking-tighter uppercase">Holi 2026</span>
        </div>
        
        <div className="flex gap-2 md:gap-4 pointer-events-auto">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5 md:p-3 bg-white/80 backdrop-blur-md rounded-full border border-zinc-200 hover:bg-white transition-colors shadow-sm"
          >
            {isMuted ? <VolumeX className="w-4 h-4 md:w-5 md:h-5" /> : <Volume2 className="w-4 h-4 md:w-5 md:h-5" />}
          </button>
          <button className="p-2.5 md:p-3 bg-white/80 backdrop-blur-md rounded-full border border-zinc-200 hover:bg-white transition-colors shadow-sm">
            <Share2 className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-[20] pt-24 md:pt-32 pb-20 px-6 max-w-7xl mx-auto pointer-events-none">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-pink-100 text-pink-600 rounded-full text-xs md:text-sm font-bold mb-4 md:mb-6">
              <Heart className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current" />
              FESTIVAL OF COLORS
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-9xl font-black leading-[0.85] tracking-tighter mb-6 md:mb-8">
              HAPPY <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500">HOLI</span>
            </h1>
            
            <div className="h-24 sm:h-20 md:h-24">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentWish}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-xl md:text-3xl font-medium text-zinc-600 max-w-lg italic serif"
                >
                  "{WISHES[currentWish]}"
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="mt-8 md:mt-12 flex flex-col sm:flex-row gap-3 md:gap-4 pointer-events-auto">
              <button 
                onClick={triggerConfetti}
                className="w-full sm:w-auto px-8 py-4 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-pink-600 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-zinc-900/10"
              >
                Celebrate Now
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </button>
            </div>

            {/* Scroll Indicator */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="mt-16 flex items-center gap-3 text-zinc-400 font-bold text-sm"
            >
              <div className="w-px h-12 bg-gradient-to-b from-zinc-200 to-transparent" />
              <span>Scroll down to send wishes</span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative z-10 aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
              <img 
                src="https://images.unsplash.com/photo-1590054036457-a5a6ed763b8b?auto=format&fit=crop&q=80&w=1000" 
                alt="Holi Celebration"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                <div className="text-white">
                  <p className="text-sm font-bold uppercase tracking-widest mb-1">Tradition</p>
                  <h3 className="text-2xl font-bold">The Joy of Togetherness</h3>
                </div>
              </div>
            </div>
            
            {/* Decorative floating elements */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-8 -right-8 w-32 h-32 bg-yellow-400 rounded-full blur-2xl opacity-50"
            />
            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute -bottom-8 -left-8 w-40 h-40 bg-pink-500 rounded-full blur-3xl opacity-40"
            />
          </motion.div>
        </div>
      </main>

      {/* Footer / Info Section */}
      <section className="relative z-10 bg-white border-t border-zinc-100 py-16 md:py-24 px-6 pointer-events-auto">
        <div className="max-w-7xl mx-auto">
          {/* New Send Wishes Section */}
          <div className="mb-20 p-12 bg-gradient-to-br from-pink-50 to-orange-50 rounded-[3rem] border-2 border-pink-100 text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <Sparkles className="absolute top-10 left-10 w-20 h-20 text-pink-500 animate-pulse" />
              <Heart className="absolute bottom-10 right-10 w-20 h-20 text-orange-500 animate-bounce" />
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">
                WANT TO SEND <br />
                <span className="text-pink-500">SOME LOVE?</span>
              </h2>
              <p className="text-zinc-600 text-lg mb-8 max-w-md mx-auto">
                Enter your name below to send a special Holi wish to me and my family.
              </p>
              
              <div className="max-w-md mx-auto mb-8">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-6 py-4 bg-white border-2 border-pink-100 rounded-2xl focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition-all text-lg font-medium text-center"
                />
              </div>
              
              <button 
                disabled={isSending}
                onClick={async (e) => {
                  console.log(">>> [CLIENT] Send Wishes (Bottom) clicked");
                  setIsSending(true);
                  try {
                    const res = await fetch('/api/send-wish', { 
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name: senderName })
                    });
                    const data = await res.json();
                    if (data.message) {
                      setToast({ message: data.message, type: 'success' });
                    } else {
                      setToast({ message: "Thank you and same to you and your family from me", type: 'success' });
                    }
                    setSenderName('');
                  } catch (err) {
                    console.error(">>> [CLIENT] Fetch error:", err);
                    alert("Thank you and same to you and your family from me");
                    setToast({ message: "Thank you and same to you and your family from me", type: 'success' });
                  } finally {
                    setIsSending(false);
                    setTimeout(() => setToast(null), 6000);
                  }
                }}
                className={cn(
                  "px-12 py-6 bg-pink-500 text-white font-black text-xl rounded-3xl hover:bg-pink-600 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-pink-500/30 flex items-center justify-center gap-3 mx-auto",
                  isSending && "opacity-70 cursor-not-allowed"
                )}
              >
                {isSending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Heart className="w-6 h-6 fill-current" />}
                {isSending ? "SENDING..." : "SEND WISHES NOW"}
              </button>
            </motion.div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-16 gap-8">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4 md:mb-6">
                SPREAD THE <span className="text-pink-500 italic serif">COLORS</span>
              </h2>
              <p className="text-zinc-500 text-base md:text-lg">
                Holi is more than just colors. It's about forgiveness, new beginnings, and the triumph of good over evil. Join us in celebrating this vibrant tradition.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-xs md:text-sm font-bold text-zinc-400 uppercase tracking-widest">Next Festival</p>
                <p className="text-xl md:text-2xl font-black">MARCH 2026</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Gulal", desc: "Traditional colored powder used to splash friends and family.", icon: Palette },
              { title: "Gujiya", desc: "Sweet dumplings filled with khoya and dried fruits.", icon: Music },
              { title: "Thandai", desc: "Refreshing festive drink made with milk and spices.", icon: Sparkles }
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="p-8 bg-zinc-50 rounded-[2rem] border border-zinc-100 transition-colors hover:bg-white hover:shadow-xl"
              >
                <item.icon className="w-10 h-10 text-pink-500 mb-6" />
                <h4 className="text-xl font-bold mb-3">{item.title}</h4>
                <p className="text-zinc-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Hint */}
      <div className="fixed bottom-28 md:bottom-8 right-6 md:right-8 z-30 pointer-events-none">
        <motion.div
          animate={{ 
            x: [0, 5, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="bg-zinc-900/90 backdrop-blur-md text-white px-4 py-2 md:px-6 md:py-3 rounded-full text-[10px] md:text-sm font-bold flex items-center gap-2 md:gap-3 shadow-2xl border border-white/10"
        >
          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-pink-500 rounded-full animate-pulse" />
          TAP TO SPLASH
        </motion.div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

