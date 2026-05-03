import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Ingredient, GameState, FloatingText, ConfettiParticle } from './types';
import { COLORS, INGREDIENTS, CUSTOMERS, getRoundConfig } from './constants';
import { audio } from './services/audio';

// --- Custom Styles ---
const GlobalStyles = () => (
  <style>{`
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-4px); }
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-5px) rotate(-2deg); }
      40% { transform: translateX(5px) rotate(2deg); }
      60% { transform: translateX(-5px) rotate(-2deg); }
      80% { transform: translateX(5px) rotate(2deg); }
    }
    @keyframes pop {
      0% { transform: scale(1); }
      50% { transform: scale(1.15); }
      100% { transform: scale(1); }
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(-100%); opacity: 0; }
    }
    @keyframes floatUpFade {
      0% { transform: translateY(0) scale(1); opacity: 1; }
      100% { transform: translateY(-60px) scale(1.2); opacity: 0; }
    }
    @keyframes pulse-fast {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.05); }
    }
    @keyframes rainbow-text {
      0% { color: #F4A829; }
      33% { color: #34C759; }
      66% { color: #C0392B; }
      100% { color: #F4A829; }
    }
    .animate-float { animation: float 3s ease-in-out infinite; }
    .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
    .animate-pop { animation: pop 0.3s ease-out; }
    .animate-slide-in { animation: slideIn 0.4s ease-out forwards; }
    .animate-slide-out { animation: slideOut 0.4s ease-in forwards; }
    .animate-float-up { animation: floatUpFade 1s ease-out forwards; }
    .animate-pulse-fast { animation: pulse-fast 0.5s ease-in-out infinite; }
    .animate-rainbow { animation: rainbow-text 2s linear infinite; }
    
    /* Dhaba texture pattern */
    .dhaba-bg {
      background-color: ${COLORS.bg};
      background-image: radial-gradient(#3a2216 1px, transparent 1px);
      background-size: 20px 20px;
    }
  `}</style>
);

// --- Helper Functions ---
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const getRandomCustomer = () => CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];

const generateOrder = (count: number): Ingredient[] => {
  const shuffled = shuffleArray(INGREDIENTS);
  return shuffled.slice(0, count);
};

// --- Main Component ---
export default function App() {
  // Game State
  const [state, setState] = useState<GameState>({
    screen: 'START',
    score: 0,
    highScore: parseInt(localStorage.getItem('biryaniBossHighScore') || '0', 10),
    round: 1,
    timeLeft: 20,
    maxTime: 20,
    currentOrder: [],
    orderProgress: 0,
    combo: 0,
    customerEmoji: getRandomCustomer(),
    isTransitioning: false,
  });

  // UI State
  const [gridIngredients, setGridIngredients] = useState<Ingredient[]>(INGREDIENTS);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);
  const [wrongButtonId, setWrongButtonId] = useState<string | null>(null);
  const [correctButtonId, setCorrectButtonId] = useState<string | null>(null);
  const [customerAnimClass, setCustomerAnimClass] = useState('animate-slide-in');
  const [showAwesomeBoss, setShowAwesomeBoss] = useState(false);

  const timerRef = useRef<number | null>(null);
  const textIdCounter = useRef(0);
  const confettiFrameRef = useRef<number | null>(null);

  // --- Game Loop & Timer ---
  useEffect(() => {
    if (state.screen === 'PLAY' && !state.isTransitioning) {
      timerRef.current = window.setInterval(() => {
        setState(prev => {
          if (prev.timeLeft <= 0.1) {
            handleGameOver();
            return prev;
          }
          const newTime = prev.timeLeft - 0.1;
          // Play tick sound when time is low
          if (newTime <= 5 && Math.floor(newTime) !== Math.floor(prev.timeLeft)) {
            audio.playTick();
          }
          return { ...prev, timeLeft: newTime };
        });
      }, 100);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.screen, state.isTransitioning]);

  // Cleanup BGM on unmount
  useEffect(() => {
    return () => {
      audio.stopBGM();
    };
  }, []);

  // --- Actions ---
  const startGame = useCallback(() => {
    audio.init();
    audio.startBGM();
    const config = getRoundConfig(1);
    setState(prev => ({
      ...prev,
      screen: 'PLAY',
      score: 0,
      round: 1,
      timeLeft: config.time,
      maxTime: config.time,
      currentOrder: generateOrder(config.count),
      orderProgress: 0,
      combo: 0,
      customerEmoji: getRandomCustomer(),
      isTransitioning: false,
    }));
    setGridIngredients(INGREDIENTS); // Initial grid
    setCustomerAnimClass('animate-slide-in');
    setShowAwesomeBoss(false);
  }, []);

  const handleGameOver = useCallback(() => {
    audio.stopBGM();
    audio.playLose();
    setCustomerAnimClass('animate-shake');
    setTimeout(() => {
      setState(prev => {
        const newHighScore = Math.max(prev.score, prev.highScore);
        localStorage.setItem('biryaniBossHighScore', newHighScore.toString());
        return { ...prev, screen: 'OVER', highScore: newHighScore };
      });
    }, 1000);
  }, []);

  const spawnFloatingText = (text: string, color: string, x: number, y: number) => {
    const id = textIdCounter.current++;
    setFloatingTexts(prev => [...prev, { id, text, color, x, y }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
    }, 1000);
  };

  const spawnConfetti = () => {
    const particles: ConfettiParticle[] = [];
    const emojis = ['🍚', '🌶️', '🥩', '✨', '🔥'];
    for (let i = 0; i < 40; i++) {
      particles.push({
        id: i,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20 - 5,
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 20,
      });
    }
    setConfetti(particles);

    let frameCount = 0;
    const animateConfetti = () => {
      setConfetti(prev => prev.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        vy: p.vy + 0.5, // gravity
        rotation: p.rotation + p.vr,
      })));
      frameCount++;
      if (frameCount < 60) {
        confettiFrameRef.current = requestAnimationFrame(animateConfetti);
      } else {
        setConfetti([]);
      }
    };
    confettiFrameRef.current = requestAnimationFrame(animateConfetti);
  };

  const handleNextRound = useCallback(() => {
    audio.playWin();
    audio.playDegTakTak();
    spawnConfetti();
    setCustomerAnimClass('animate-slide-out');
    
    setState(prev => ({ ...prev, isTransitioning: true }));

    // Check for Awesome Biryani Boss milestone (every 3 rounds)
    if (state.round % 3 === 0) {
      setTimeout(() => {
        audio.playAwesomeBiryaniBoss();
        setShowAwesomeBoss(true);
        setTimeout(() => setShowAwesomeBoss(false), 2500);
      }, 500);
    } else {
      audio.playHappy();
    }

    setTimeout(() => {
      setState(prev => {
        const nextRound = prev.round + 1;
        const config = getRoundConfig(nextRound);
        const timeBonus = Math.floor(prev.timeLeft) * 5;
        const newScore = prev.score + 50 + timeBonus;
        
        if (timeBonus > 0) {
          spawnFloatingText(`+${timeBonus} Time Bonus!`, COLORS.primary, window.innerWidth/2, 100);
        }

        return {
          ...prev,
          round: nextRound,
          score: newScore,
          timeLeft: config.time,
          maxTime: config.time,
          currentOrder: generateOrder(config.count),
          orderProgress: 0,
          customerEmoji: getRandomCustomer(),
          isTransitioning: false,
        };
      });
      setCustomerAnimClass('animate-slide-in');
      // Shuffle grid from round 4 onwards
      if (state.round + 1 >= 4) {
        setGridIngredients(shuffleArray(INGREDIENTS));
      }
    }, 1500); // Slightly longer transition to allow sounds to play
  }, [state.round]);

  const handleIngredientTap = useCallback((ingredient: Ingredient, event: React.MouseEvent | React.TouchEvent) => {
    if (state.screen !== 'PLAY' || state.isTransitioning) return;

    const expectedIngredient = state.currentOrder[state.orderProgress];
    
    // Get tap coordinates for floating text
    let clientX = window.innerWidth / 2;
    let clientY = window.innerHeight / 2;
    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = (event as React.MouseEvent).clientX;
      clientY = (event as React.MouseEvent).clientY;
    }

    if (ingredient.id === expectedIngredient.id) {
      // Correct Tap
      audio.playTing();
      setCorrectButtonId(ingredient.id);
      setTimeout(() => setCorrectButtonId(null), 200);

      setState(prev => {
        const newProgress = prev.orderProgress + 1;
        const newCombo = prev.combo + 1;
        const isCombo = newCombo >= 3;
        const points = 10 * (isCombo ? 2 : 1);
        
        spawnFloatingText(`+${points}`, isCombo ? COLORS.primary : COLORS.success, clientX, clientY - 40);

        if (newProgress >= prev.currentOrder.length) {
          // Order Complete
          setTimeout(handleNextRound, 100);
          return { ...prev, score: prev.score + points, combo: newCombo, orderProgress: newProgress };
        }

        return { ...prev, score: prev.score + points, combo: newCombo, orderProgress: newProgress };
      });
    } else {
      // Wrong Tap
      audio.playBzzzt();
      setWrongButtonId(ingredient.id);
      setTimeout(() => setWrongButtonId(null), 400);
      
      setState(prev => ({
        ...prev,
        combo: 0,
        timeLeft: Math.max(0, prev.timeLeft - 2) // Penalty
      }));
      spawnFloatingText("Galat!", COLORS.fail, clientX, clientY - 40);
    }
  }, [state, handleNextRound]);

  // --- Render Helpers ---
  const getCustomerMood = () => {
    const ratio = state.timeLeft / state.maxTime;
    if (ratio > 0.5) return { color: COLORS.success, glow: 'shadow-[0_0_20px_rgba(52,199,89,0.6)]' };
    if (ratio > 0.25) return { color: COLORS.primary, glow: 'shadow-[0_0_20px_rgba(244,168,41,0.6)]' };
    return { color: COLORS.fail, glow: 'shadow-[0_0_30px_rgba(255,59,48,0.8)]', shake: true };
  };

  const getGameOverMessage = (score: number) => {
    if (score < 100) return "Bhai hath dho ke aa 🧼";
    if (score < 300) return "Theek hai, practice karo 👨‍🍳";
    if (score < 600) return "Wah ustaad, maza aa gaya 🔥";
    return "Biryani Boss confirmed 🏆";
  };

  // --- Screens ---
  if (state.screen === 'START') {
    return (
      <div className="dhaba-bg w-full h-full flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
        <GlobalStyles />
        <div className="animate-float mb-8">
          <div className="text-8xl">🍲</div>
        </div>
        <h1 className="text-5xl font-black text-[#F4A829] mb-2 tracking-tight drop-shadow-lg">Biryani Boss</h1>
        <p className="text-[#FDF3E3] text-xl mb-12 font-medium opacity-90">Asli dhabe ka asli hisaab</p>
        
        <button 
          onClick={startGame}
          className="bg-[#F4A829] text-[#1C1C1E] text-2xl font-bold py-4 px-12 rounded-full shadow-[0_6px_0_#b37a1d] active:shadow-[0_0px_0_#b37a1d] active:translate-y-[6px] transition-all animate-pulse-fast"
        >
          Tap to Start
        </button>
        
        <div className="mt-12 text-[#FDF3E3] text-sm opacity-70 max-w-xs">
          Customer ka order dekho<br/>Sahi ingredients tap karo<br/>Jaldi karo!
        </div>
      </div>
    );
  }

  if (state.screen === 'OVER') {
    return (
      <div className="dhaba-bg w-full h-full flex flex-col items-center justify-center text-center p-6 relative">
        <GlobalStyles />
        <h2 className="text-4xl font-bold text-[#FF3B30] mb-4">Game Over!</h2>
        <div className="text-7xl mb-6 animate-shake">😡</div>
        
        <div className="bg-[#FDF3E3] rounded-2xl p-6 w-full max-w-sm mb-8 shadow-xl">
          <p className="text-[#1C1C1E] text-lg mb-2">Final Score</p>
          <p className="text-5xl font-black text-[#F4A829] mb-4">{state.score}</p>
          <div className="h-px bg-gray-300 w-full mb-4"></div>
          <p className="text-[#1C1C1E] font-medium text-xl">{getGameOverMessage(state.score)}</p>
          <p className="text-sm text-gray-500 mt-4">High Score: {state.highScore}</p>
        </div>

        <button 
          onClick={startGame}
          className="bg-[#F4A829] text-[#1C1C1E] text-xl font-bold py-4 px-10 rounded-full shadow-[0_6px_0_#b37a1d] active:shadow-[0_0px_0_#b37a1d] active:translate-y-[6px] transition-all"
        >
          Play Again
        </button>
      </div>
    );
  }

  // --- PLAY SCREEN ---
  const mood = getCustomerMood();
  const timerRatio = Math.max(0, state.timeLeft / state.maxTime);

  return (
    <div className="dhaba-bg w-full h-full max-w-[480px] mx-auto flex flex-col relative overflow-hidden shadow-2xl">
      <GlobalStyles />
      
      {/* Top Section: Customer & Order */}
      <div className="h-[30%] p-4 flex flex-col justify-between bg-black/20">
        <div className="flex items-center justify-between h-full">
          {/* Customer */}
          <div className={`relative w-24 h-24 flex items-center justify-center bg-[#FDF3E3] rounded-full ${mood.glow} ${mood.shake ? 'animate-shake' : ''} ${customerAnimClass}`}>
            <span className="text-6xl">{state.customerEmoji}</span>
          </div>
          
          {/* Order Sequence */}
          <div className="flex-1 ml-4 flex flex-wrap justify-end gap-2">
            {state.currentOrder.map((ing, idx) => {
              const isCompleted = idx < state.orderProgress;
              const isCurrent = idx === state.orderProgress;
              return (
                <div 
                  key={idx} 
                  className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl relative transition-all duration-300
                    ${isCompleted ? 'bg-green-500/20 scale-90 opacity-50' : 'bg-[#FDF3E3] shadow-md'}
                    ${isCurrent ? 'ring-4 ring-[#F4A829] animate-pulse-fast scale-110 z-10' : ''}
                  `}
                >
                  {ing.emoji}
                  {isCompleted && (
                    <div className="absolute inset-0 flex items-center justify-center text-green-500 text-3xl drop-shadow-md">
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Timer Bar */}
        <div className="w-full h-3 bg-black/40 rounded-full mt-4 overflow-hidden">
          <div 
            className="h-full transition-all duration-100 ease-linear"
            style={{ 
              width: `${timerRatio * 100}%`,
              backgroundColor: mood.color
            }}
          />
        </div>
      </div>

      {/* Middle Section: Score & Combo */}
      <div className="h-[10%] px-6 flex items-center justify-between bg-gradient-to-b from-black/20 to-transparent">
        <div className="flex flex-col">
          <span className="text-[#FDF3E3] text-sm opacity-80">Round {state.round}</span>
          <span className="text-[#F4A829] text-2xl font-black tracking-wide">Score: {state.score}</span>
        </div>
        {state.combo >= 3 && (
          <div className="text-[#C0392B] font-bold text-xl animate-pop flex items-center drop-shadow-md">
            🔥 Combo x{state.combo}
          </div>
        )}
      </div>

      {/* Bottom Section: Ingredient Grid */}
      <div className="h-[60%] p-4 pb-8">
        <div className="grid grid-cols-2 gap-3 h-full">
          {gridIngredients.map((ing, idx) => {
            const isWrong = wrongButtonId === ing.id;
            const isCorrect = correctButtonId === ing.id;
            
            // Calculate a slight animation delay for the idle float to make them feel organic
            const floatDelay = `${(idx % 5) * 0.2}s`;

            return (
              <button
                key={ing.id}
                onPointerDown={(e) => handleIngredientTap(ing, e)}
                className={`
                  relative flex flex-col items-center justify-center rounded-2xl bg-[#FDF3E3] shadow-[0_4px_0_#d4c5b0]
                  active:shadow-[0_0px_0_#d4c5b0] active:translate-y-[4px] transition-all select-none
                  ${isWrong ? 'bg-red-200 animate-shake' : ''}
                  ${isCorrect ? 'bg-green-200 animate-pop' : ''}
                  ${!isWrong && !isCorrect ? 'animate-float' : ''}
                `}
                style={{ animationDelay: !isWrong && !isCorrect ? floatDelay : '0s' }}
              >
                <span className="text-4xl mb-1 pointer-events-none">{ing.emoji}</span>
                <span className="text-[#1C1C1E] font-bold text-sm pointer-events-none">{ing.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Round Transition Overlay */}
      {state.isTransitioning && !showAwesomeBoss && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 animate-pop">
          <h2 className="text-5xl font-black text-[#F4A829]">Round {state.round + 1}</h2>
        </div>
      )}

      {/* Awesome Biryani Boss Overlay */}
      {showAwesomeBoss && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50 animate-pop">
          <div className="text-8xl mb-4 animate-float">🌟</div>
          <h2 className="text-4xl font-black text-center px-4 animate-rainbow drop-shadow-[0_0_15px_rgba(244,168,41,0.8)]">
            AWESOME<br/>BIRYANI BOSS!
          </h2>
          <div className="text-8xl mt-4 animate-float" style={{ animationDelay: '0.5s' }}>🍲</div>
        </div>
      )}

      {/* Floating Texts */}
      {floatingTexts.map(ft => (
        <div 
          key={ft.id}
          className="absolute pointer-events-none font-black text-2xl animate-float-up z-40 drop-shadow-md"
          style={{ left: ft.x, top: ft.y, color: ft.color, transform: 'translate(-50%, -50%)' }}
        >
          {ft.text}
        </div>
      ))}

      {/* Confetti Canvas (DOM based for simplicity without external libs) */}
      {confetti.map(p => (
        <div
          key={p.id}
          className="absolute pointer-events-none text-2xl z-50"
          style={{
            left: p.x,
            top: p.y,
            transform: `translate(-50%, -50%) rotate(${p.rotation}deg)`,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
}
