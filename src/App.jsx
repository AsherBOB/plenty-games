import React, { useState, useEffect } from 'react';
import { Trophy, Coins, User, Lock, ArrowLeft, Search, ChevronRight, Gamepad2 } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';

const GAMES_LIST = [
  { id: 'memory', name: 'Memory Match', category: 'Puzzle', folder: 'game-memory', desc: 'Clean graphic board layout matrix tracking pairs offline.', icon: '🧠', banner: 'from-purple-500/10 to-transparent', accent: 'border-purple-500/20 text-purple-400' },
  { id: 'snake', name: 'Snake Neon Arcade', category: 'Arcade', folder: 'game-snake', desc: 'Flat checkerboard grid styling mirroring arcade classics.', icon: '🐍', banner: 'from-emerald-500/10 to-transparent', accent: 'border-emerald-500/20 text-emerald-400' },
  { id: 'flappy', name: 'Flappy Bird', category: 'Arcade', folder: 'game-flappy', desc: 'Vector arcade pipeline physics runner testing local scores.', icon: '🐦', banner: 'from-sky-500/10 to-transparent', accent: 'border-sky-500/20 text-sky-400' }
];

export default function App() {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();
  const [viewState, setViewState] = useState('splash');
  const [coins, setCoins] = useState(0);
  const [activeGame, setActiveGame] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    if (viewState === 'splash' && !isLoading) {
      const timer = setTimeout(() => {
        const savedCoins = localStorage.getItem('offline_coins');
        if (savedCoins) setCoins(parseInt(savedCoins) || 0);

        if (isAuthenticated) {
          setViewState('hub');
        } else {
          setViewState('auth');
        }
      }, 3000); // Strict 3-Second branding delay loop execution
      return () => clearTimeout(timer);
    }
  }, [viewState, isLoading, isAuthenticated]);

  useEffect(() => {
    const receiveGameData = (event) => {
      if (event.data && event.data.type === 'GAME_OVER_SCORE') {
        const scorePoints = event.data.score;
        const processedCoins = Math.floor(scorePoints / 2); // 50% Point-to-coin calculation

        if (processedCoins > 0) {
          const updatedWallet = coins + processedCoins;
          setCoins(updatedWallet);
          localStorage.setItem('offline_coins', updatedWallet);
        }
        setViewState('hub');
        setActiveGame(null);
        setShowAd(true); // Fire pre-cached ad break view state container
      }
    };
    window.addEventListener('message', receiveGameData);
    return () => window.removeEventListener('message', receiveGameData);
  }, [coins]);

  if (isLoading || viewState === 'splash') {
    return (
      <div className="w-screen h-screen bg-[#030407] flex flex-col justify-center items-center overflow-hidden relative select-none">
        <div className="absolute w-[450px] h-[450px] bg-cyan-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center space-y-2">
          <div className="text-xs font-mono font-bold tracking-[0.4em] text-cyan-500/60 uppercase">// Initializing Terminal</div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">PLENTY GAMES</h1>
          <div className="w-8 h-[1px] bg-white/10 my-2" />
          <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Matured Arcade Sandbox Build v4.2.1</p>
        </div>
      </div>
    );
  }

  if (viewState === 'auth' || !isAuthenticated) {
    return (
      <div className="w-screen h-screen bg-[#030407] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="w-full max-w-sm bg-[#0a0c10] border border-white/[0.03] p-8 rounded-2xl shadow-2xl relative z-10 text-center">
          <div className="mb-6 text-left">
            <h2 className="text-xl font-bold text-white tracking-tight">User Verification</h2>
            <p className="text-xs text-slate-500 mt-1">Access your persistent coin holder balance profile arrays.</p>
          </div>
          <button 
            onClick={() => loginWithRedirect()} 
            className="w-full py-3 bg-white text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-200 active:scale-[0.99] transition-all"
          >
            Open Dashboard
          </button>
          <div className="mt-6 pt-4 border-t border-white/[0.03]">
            <p className="text-[10px] font-mono text-slate-600 uppercase">
              Secured OAuth Gateway Instance
            </p>
          </div>
        </div>
      </div>
    );
  }
  // FLOW STATE C: STANDBOX EMBEDDED NATIVE GAME PLAYER
  if (viewState === 'gameplay' && activeGame) {
    return (
      <div className="w-screen h-screen flex flex-col bg-[#030407] overflow-hidden select-none">
        {/* Navigation Control Bar */}
        <div className="h-14 bg-[#0a0c10] border-b border-white/[0.03] px-6 flex items-center justify-between z-50">
          <button 
            onClick={() => { setViewState('hub'); setActiveGame(null); setShowAd(true); }} 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 rounded-lg transition-all border border-white/5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> EXIT_CLIENT
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-xl">{activeGame.icon}</span>
            <span className="font-bold text-white text-sm tracking-tight">{activeGame.name}</span>
          </div>

          <div className="bg-[#111319] px-3 py-1.5 rounded-xl flex items-center gap-2 border border-white/5">
            <span className="w-2 h-2 bg-amber-400 rounded-full" />
            <span className="text-xs font-mono font-bold text-amber-400">{coins} 🪙</span>
          </div>
        </div>

        {/* PERFECT LOCAL DIRECTORY EMBED CONNECTION LINK */}
        <iframe 
          src={`./games/${activeGame.folder}/index.html`} 
          title={activeGame.name} 
          className="flex-1 w-full h-full border-none bg-black" 
          sandbox="allow-scripts allow-same-origin" 
        />
      </div>
    );
  }

  // FLOW STATE D: HIGH-END GRAPHIC HUB SELECTION INTERFACE
  return (
    <div className="min-h-screen bg-[#030407] font-sans antialiased text-slate-300 pb-16">
      {/* Cinematic Premium Header Systems */}
      <header className="sticky top-0 bg-[#030407]/90 backdrop-blur-md border-b border-white/[0.03] z-40 px-6 md:px-12 py-5">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tighter">PLENTY GAMES</h1>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase">Ecosystem client // {user?.nickname || user?.name || 'Player'}</p>
          </div>
          <div className="flex items-center gap-4">
            {user?.picture && (
              <img src={user.picture} alt="Profile" className="w-8 h-8 rounded-full border border-white/10 hidden sm:block" />
            )}
            <div className="bg-[#0a0c10] border border-white/5 px-4 py-2 rounded-xl flex flex-col items-end">
              <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase">Coin Holder Wallet</span>
              <span className="text-sm font-black text-amber-400 font-mono mt-0.5">{coins} 🪙</span>
            </div>
            <button 
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })} 
              className="text-xs font-mono text-red-400/70 hover:text-red-400 transition-colors cursor-pointer"
            >
              Terminate
            </button>
          </div>
        </div>
      </header>

      {/* Main Catalog View Controller Stack */}
      <main className="max-w-5xl mx-auto px-6 md:px-12 mt-12 space-y-10">
        {/* Dynamic Filter Search Console */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-600" />
          <input 
            type="text" 
            placeholder="Search sandbox core matrix..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            className="w-full text-xs bg-[#0a0c10] border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-white outline-none focus:border-white/10 font-mono transition-all placeholder-slate-600" 
          />
        </div>

        {/* Primary Product Card Matrix Grid */}
        <div className="space-y-3">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] font-mono">// Active Sandbox Cores</div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {GAMES_LIST.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase())).map(game => (
              <div 
                key={game.id} 
                className="glass-panel p-6 rounded-xl flex flex-col justify-between hover:scale-[1.01] hover:bg-white/[0.01] transition-all duration-200 group relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${game.banner} pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity`} />
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start">
                    <span className="text-3xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">{game.icon}</span>
                    <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${game.accent}`}>
                      {game.category}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-4 tracking-tight group-hover:text-cyan-400 transition-colors">
                    {game.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-light leading-relaxed h-12 overflow-hidden">
                    {game.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.02] flex justify-between items-center relative z-10">
                  <span className="text-[10px] text-slate-500 font-mono">{game.players}</span>
                  <button 
                    onClick={() => { setActiveGame(game); setViewState('gameplay'); }} 
                    className="flex items-center gap-1 text-xs text-white font-bold tracking-wider hover:text-cyan-400 transition-colors uppercase font-mono cursor-pointer"
                  >
                    Launch Client <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
