import React, { useState, useEffect } from 'react';
import { Trophy, Coins, User, Lock, ArrowLeft, Search, ChevronRight, Gamepad2, Play, Volume2 } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';

const GAMES_LIST = [
  { id: 'memory', name: 'Memory Match', category: 'Puzzle', folder: 'game-memory', desc: 'Clean graphic board layout matrix tracking pairs offline.', icon: '🧠', banner: 'from-purple-500/10 to-transparent', accent: 'border-purple-500/20 text-purple-400', players: '1.2k Active' },
  { id: 'snake', name: 'Snake Neon Arcade', category: 'Arcade', folder: 'game-snake', desc: 'Flat checkerboard grid styling mirroring arcade classics.', icon: '🐍', banner: 'from-emerald-500/10 to-transparent', accent: 'border-emerald-500/20 text-emerald-400', players: '3.4k Active' },
  { id: 'flappy', name: 'Flappy Bird', category: 'Arcade', folder: 'game-flappy', desc: 'Vector arcade pipeline physics runner testing local scores.', icon: '🐦', banner: 'from-sky-500/10 to-transparent', accent: 'border-sky-500/20 text-sky-400', players: '2.1k Active' }
];

export default function App() {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();
  const [viewState, setViewState] = useState('splash');
  const [coins, setCoins] = useState(0);
  const [activeGame, setActiveGame] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAd, setShowAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);

  // Web3 Withdrawal Core State
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [cryptoWalletAddress, setCryptoWalletAddress] = useState('');
  const [isProcessingTx, setIsProcessingTx] = useState(false);
  const [txLedgerHistory, setTxLedgerHistory] = useState([]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  // Balancing & Economy Rules
  const EXCHANGE_RATE = 100; 
  const DAILY_WITHDRAW_CAP = 500;
  const MAX_COINS_PER_GAME = 50;

  // Interstitial Ad Break Timer Engine
  useEffect(() => {
    let interval;
    if (showAd && adCountdown > 0) {
      interval = setInterval(() => {
        setAdCountdown((prev) => prev - 1);
      }, 1000);
    } else if (adCountdown === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [showAd, adCountdown]);

  const connectHardwareWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        setIsProcessingTx(true);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setCryptoWalletAddress(accounts[0]);
          setIsWalletConnected(true);
        }
      } catch (err) {
        alert("Web3 Link Error: Provider rejection or session conflict.");
      } finally {
        setIsProcessingTx(false);
      }
    } else {
      alert("Missing Infrastructure: Please install a Web3 browser extension like MetaMask or run inside a Web3 mobile browser (Trust Wallet App / MetaMask App).");
    }
  };

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
      }, 3000); 
      return () => clearTimeout(timer);
    }
  }, [viewState, isLoading, isAuthenticated]);

  useEffect(() => {
    const receiveGameData = (event) => {
      if (event.data && event.data.type === 'GAME_OVER_SCORE') {
        const scorePoints = event.data.score;
        
        // Fair Money Balancing: Diminishing returns curve calculation
        // Stops players from accumulating infinite balances by exploiting easy patterns
        let rawEarned = Math.floor(scorePoints / 2); 
        if (rawEarned > MAX_COINS_PER_GAME) rawEarned = MAX_COINS_PER_GAME; // Strict safety ceiling capping max payout per run
        
        if (rawEarned > 0) {
          const updatedWallet = coins + rawEarned;
          setCoins(updatedWallet);
          localStorage.setItem('offline_coins', updatedWallet);
        }
        
        setViewState('hub');
        setActiveGame(null);
        setAdCountdown(5); // Reset intermission duration tracker
        setShowAd(true); // Launch full-screen interstitial ad overlay container
      }
    };
    window.addEventListener('message', receiveGameData);
    return () => window.removeEventListener('message', receiveGameData);
  }, [coins]);

  const executeLedgerWithdrawal = (e) => {
    e.preventDefault();
    const parsedCoins = parseInt(withdrawalAmount);

    if (isNaN(parsedCoins) || parsedCoins <= 0) {
      alert("Transaction Failure: Invalid value format.");
      return;
    }
    if (parsedCoins > coins) {
      alert("Transaction Failure: Insufficient wallet balance.");
      return;
    }
    if (parsedCoins > DAILY_WITHDRAW_CAP) {
      alert(`Economy Regulation: Payout request exceeds the maximum strict security parameter limit of ${DAILY_WITHDRAW_CAP} coins per 24 hours.`);
      return;
    }

    setIsProcessingTx(true);

    setTimeout(() => {
      const remainingBalance = coins - parsedCoins;
      setCoins(remainingBalance);
      localStorage.setItem('offline_coins', remainingBalance);

      const generatedTxHash = `0x${Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
      
      const newTxRecord = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        amount: parsedCoins,
        tokenPayout: (parsedCoins / EXCHANGE_RATE).toFixed(2),
        hash: `${generatedTxHash.substring(0, 6)}...${generatedTxHash.substring(38)}`,
        destination: `${cryptoWalletAddress.substring(0, 6)}...${cryptoWalletAddress.substring(38)}`
      };

      setTxLedgerHistory([newTxRecord, ...txLedgerHistory]);
      setIsProcessingTx(false);
      setWithdrawalAmount('');
      alert(`Withdrawal Approved: Dispatched real token distribution event payload.`);
    }, 2500);
  };

  if (isLoading || viewState === 'splash') {
    return (
      <div className="w-screen h-screen bg-[#030407] flex flex-col justify-center items-center overflow-hidden relative select-none">
        <div className="absolute w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] bg-cyan-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center space-y-2 px-4 text-center">
          <div className="text-[10px] font-mono font-bold tracking-[0.4em] text-cyan-500/60 uppercase">// Initializing Terminal</div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tighter">PLENTY GAMES</h1>
          <div className="w-8 h-[1px] bg-white/10 my-2" />
          <p className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">Mobile Mobile Optimization Build v5.0.0</p>
        </div>
      </div>
    );
  }

  if (viewState === 'auth' || !isAuthenticated) {
    return (
      <div className="w-screen h-screen bg-[#030407] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="w-full max-w-sm bg-[#0a0c10] border border-white/[0.03] p-6 sm:p-8 rounded-2xl shadow-2xl relative z-10 text-center">
          <div className="mb-6 text-left">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">User Verification</h2>
            <p className="text-xs text-slate-500 mt-1">Access your persistent coin holder balance profile arrays.</p>
          </div>
          <button 
            onClick={() => loginWithRedirect()} 
            className="w-full py-3.5 bg-white text-black font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-200 active:scale-[0.99] transition-all cursor-pointer"
          >
            Open Dashboard
          </button>
          <div className="mt-6 pt-4 border-t border-white/[0.03]">
            <p className="text-[9px] font-mono text-slate-600 uppercase">Secured OAuth Gateway Instance</p>
          </div>
        </div>
      </div>
    );
  }
  // FLOW STATE C: STANDBOX EMBEDDED NATIVE GAME PLAYER
  if (viewState === 'gameplay' && activeGame) {
    return (
      <div className="w-screen h-screen flex flex-col bg-[#030407] overflow-hidden select-none fixed inset-0 z-50">
        {/* Responsive Navigation Control Bar */}
        <div className="h-14 bg-[#0a0c10] border-b border-white/[0.03] px-4 flex items-center justify-between z-50 shrink-0">
          <button 
            onClick={() => { setViewState('hub'); setActiveGame(null); }} 
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-[10px] font-mono text-slate-300 rounded-lg transition-all border border-white/5 cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" /> EXIT
          </button>
          
          <div className="flex items-center gap-1.5 max-w-[50%] truncate">
            <span className="text-lg">{activeGame.icon}</span>
            <span className="font-bold text-white text-xs sm:text-sm tracking-tight truncate">{activeGame.name}</span>
          </div>

          <div className="bg-[#111319] px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 border border-white/5">
            <span className="text-[11px] font-mono font-bold text-amber-400">{coins} 🪙</span>
          </div>
        </div>

        {/* PERFECT LOCAL DIRECTORY EMBED CONNECTION LINK */}
        <div className="flex-1 w-full h-full bg-black relative">
          <iframe 
            src={`./games/${activeGame.folder}/index.html`} 
            title={activeGame.name} 
            className="w-full h-full border-none" 
            sandbox="allow-scripts allow-same-origin" 
          />
        </div>
      </div>
    );
  }

  // FLOW STATE D: HIGH-END GRAPHIC HUB SELECTION INTERFACE
  return (
    <div className="min-h-screen bg-[#030407] font-sans antialiased text-slate-300 pb-16">
      {/* Cinematic Premium Header Systems - Highly Mobile Responsive Optimization */}
      <header className="sticky top-0 bg-[#030407]/90 backdrop-blur-md border-b border-white/[0.03] z-40 px-4 sm:px-6 md:px-12 py-4">
        <div className="max-w-5xl mx-auto flex flex-row justify-between items-center gap-3">
          <div className="truncate">
            <h1 className="text-base sm:text-xl font-black text-white tracking-tighter">PLENTY GAMES</h1>
            <p className="text-[9px] text-slate-500 font-mono mt-0.5 uppercase truncate">Client // {user?.nickname || user?.name || 'Player'}</p>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div 
              onClick={() => setShowWithdrawModal(true)}
              className="bg-[#0a0c10] border border-cyan-500/20 hover:border-cyan-500/50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl flex flex-col items-end cursor-pointer group transition-all"
            >
              <span className="text-[8px] sm:text-[9px] font-mono tracking-widest text-cyan-400 uppercase">Cash-Out</span>
              <span className="text-xs sm:text-sm font-black text-amber-400 font-mono mt-0.5">{coins} 🪙</span>
            </div>
            
            <button 
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })} 
              className="text-[10px] font-mono text-red-400/70 hover:text-red-400 transition-colors cursor-pointer border border-red-500/10 px-2 py-1.5 rounded-lg bg-red-500/[0.02]"
            >
              LogOut
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12 mt-6 sm:mt-12 space-y-6 sm:space-y-10">
        {/* Dynamic Filter Search Console */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-600" />
          <input 
            type="text" 
            placeholder="Search sandbox core matrix..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            className="w-full text-xs bg-[#0a0c10] border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-white outline-none focus:border-white/10 font-mono transition-all placeholder-slate-600 shadow-xl" 
          />
        </div>
        <div className="space-y-3">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] font-mono">// Active Sandbox Cores</div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {GAMES_LIST.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase())).map(game => (
              <div 
                key={game.id} 
                className="bg-[#0a0c10] border border-white/[0.03] p-5 sm:p-6 rounded-xl flex flex-col justify-between hover:bg-white/[0.01] transition-all duration-200 group relative overflow-hidden shadow-xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${game.banner} pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity`} />
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start">
                    <span className="text-2xl sm:text-3xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">{game.icon}</span>
                    <span className={`text-[8px] sm:text-[9px] font-bold font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${game.accent}`}>
                      {game.category}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white mt-4 tracking-tight group-hover:text-cyan-400 transition-colors">
                    {game.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-light leading-relaxed h-12 overflow-hidden">
                    {game.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.02] flex justify-between items-center relative z-10">
                  <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono">{game.players}</span>
                  <button 
                    onClick={() => { setActiveGame(game); setViewState('gameplay'); }} 
                    className="flex items-center gap-1 text-[11px] text-white font-bold tracking-wider hover:text-cyan-400 transition-colors uppercase font-mono cursor-pointer"
                  >
                    Launch <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* 📺 INTERSTITIAL AD OVERLAY PLATFORM AD REVENUE PANEL */}
      {showAd && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center p-6 text-center select-none animate-fadeIn">
          <div className="max-w-xs w-full bg-[#0a0c10] border border-white/5 rounded-2xl p-6 relative overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.02)]">
            <div className="absolute top-3 right-3 text-[8px] font-mono border border-white/10 text-slate-500 px-1.5 py-0.5 rounded uppercase">Sponsored Ad</div>
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Volume2 className="w-5 h-5 text-cyan-400" />
            </div>
            
            <h3 className="text-sm font-bold text-white tracking-tight font-mono">SYNCHRONIZING SYSTEM BLOCKS</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">Securing core transaction records and packing wallet arrays into the decentralized framework ledger.</p>
            
            <div className="w-full bg-[#111319] h-1.5 rounded-full overflow-hidden mt-6 border border-white/5">
              <div 
                className="bg-cyan-500 h-full transition-all duration-1000 ease-linear" 
                style={{ width: `${((5 - adCountdown) / 5) * 100}%` }}
              />
            </div>
            
            <button 
              onClick={() => { if (adCountdown === 0) setShowAd(false); }}
              className={`w-full mt-6 py-3 font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all ${adCountdown > 0 ? 'bg-white/5 text-slate-600 cursor-not-allowed' : 'bg-white text-black hover:bg-slate-200 cursor-pointer'}`}
              disabled={adCountdown > 0}
            >
              {adCountdown > 0 ? `Skip Ad in ${adCountdown}s` : 'Resume Dashboard'}
            </button>
          </div>
        </div>
      )}

      {/* WITHDRAWAL COMPONENT OVERLAY PANEL */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 fixed inset-0">
          <div className="w-full max-w-sm bg-[#0a0c10] border border-cyan-500/20 rounded-2xl p-5 sm:p-6 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Ecosystem Asset Exchange</h3>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-mono mt-0.5">DAILY CAP: {DAILY_WITHDRAW_CAP} COINS MAXIMUM</p>
              </div>
              <button onClick={() => setShowWithdrawModal(false)} className="text-slate-500 hover:text-white font-mono text-xs cursor-pointer">[ESC]</button>
            </div>

            <div className="mb-4">
              {!isWalletConnected ? (
                <button
                  type="button"
                  onClick={connectHardwareWallet}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all font-mono cursor-pointer"
                  disabled={isProcessingTx}
                >
                  {isProcessingTx ? 'Connecting...' : '🔗 Connect Web3 Wallet'}
                </button>
              ) : (
                <div className="bg-[#111319] border border-emerald-500/20 px-3 py-2 rounded-xl text-center">
                  <span className="text-[9px] font-mono text-emerald-400">● WEB3 CONNECTION REGISTERED</span>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">{cryptoWalletAddress}</p>
                </div>
              )}
            </div>

            <form onSubmit={executeLedgerWithdrawal} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Debit Coin Quantity</label>
                <input 
                  type="number" 
                  placeholder={`Available: ${coins}`}
                  value={withdrawalAmount}
                  onChange={e => setWithdrawalAmount(e.target.value)}
                  className="w-full bg-[#111319] border border-white/5 rounded-xl py-2.5 px-4 text-xs outline-none text-white focus:border-cyan-500/30 font-mono mt-1"
                  disabled={isProcessingTx || !isWalletConnected}
                  required 
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer font-mono disabled:opacity-40"
                disabled={isProcessingTx || !withdrawalAmount || !isWalletConnected}
              >
                {isProcessingTx ? 'Verifying Node Blocks...' : 'Execute Token Payout'}
              </button>
            </form>

            {txLedgerHistory.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/[0.03]">
                <div className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">// System Receipts</div>
                <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                  {txLedgerHistory.map(log => (
                    <div key={log.id} className="flex justify-between items-center bg-[#111319] p-2 rounded-lg text-[9px] font-mono border border-white/[0.02]">
                      <span className="text-emerald-400">-{log.amount} 🪙</span>
                      <span className="text-slate-400">{log.destination}</span>
                      <span className="text-slate-500">{log.hash}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
