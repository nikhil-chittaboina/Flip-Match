import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { shootConfetti } from "./lib/confetti"; // Assuming this utility is available
import Title from './components/Title';
import PlayersCard from './components/PlayersCard';
import Grid from './components/Grid';
import GameSettings from './components/GameSettings';
import Toast from './components/Toast';
import GameEndOverlay from './components/GameEndOverlay';
import Leaderboard from './components/Leaderboard';
import { submitScore } from './lib/api';










// =========================================================
// 3. App Component (Game Control and Flow)
// =========================================================

const App = () => {
  
  // 3.1. CONFIGURATION STATE
	const [config, setConfig] = useState({
		gridSize: '4x3',
		isStarted: false,
		mode: 'classic', // 'classic' | 'secret'
		secretCount: 0, // 0,2,4
	});

  // 3.2. GAME STATES
  const [currentPlayer, setCurrentPlayer] = useState('A');
  const [score, setScore] = useState({ A: 0, B: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [gameKey, setGameKey] = useState(0); 

  // 3.3. AUDIO REFS AND SOUNDS
  const audioRef = useRef(new Audio("/changeTurn.wav"));
  audioRef.current.volume = 0.3;
  const congratsAudioRef = useRef(new Audio("/congrats.mp3"));
  
  const playTurnSound = () => {
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch((err) => console.log(err));
  };
  
  const finishGame = (finalScores) => {
    if (finalScores.A === finalScores.B) {
      setWinner('tie');
    } else if (finalScores.A > finalScores.B) {
      setWinner('A');
    } else {
      setWinner('B');
    }
    setGameOver(true);
  };

	const onMatch = (isFinalMatch = false) => {
		setScore((prevScore) => {
			const updated = {
				...prevScore,
				[currentPlayer]: prevScore[currentPlayer] + 1,
			};
			if (isFinalMatch) {
				setTimeout(() => {
					congratsAudioRef.current.currentTime = 0;
					congratsAudioRef.current.play().catch((err) => console.log(err));
					shootConfetti();
				}, 100);
				finishGame(updated);

				// Submit final scores to Supabase (fire-and-forget)
				try {
					submitScore({ playerName: 'Player 1', score: updated.A, mode: config.mode, gridSize: config.gridSize })
						.catch(err => showToast('Score submit failed'));
					submitScore({ playerName: 'Player 2', score: updated.B, mode: config.mode, gridSize: config.gridSize })
						.catch(err => showToast('Score submit failed'));
					showToast('Scores submitted');
				} catch (e) {
					showToast('Score submit failed');
				}
			}
			return updated;
		});
		playTurnSound(); 
	};

  const onMismatch = () => {
    setCurrentPlayer((prevPlayer) => (prevPlayer === 'A' ? 'B' : 'A'));
  };

  // 3.4. FLOW CONTROL FUNCTIONS (UPDATED)
  const handleRestart = () => {
    setScore({ A: 0, B: 0 });
    setCurrentPlayer('A');
    setGameOver(false);
    setWinner(null);
    setGameKey((k) => k + 1); 

    // Return to Settings Screen
    setConfig(prevConfig => ({
      ...prevConfig,
      isStarted: false, 
    }));
  };

	const handleStartGame = (selectedGridSize, selectedMode = 'classic', selectedSecretCount = 0) => {
		setConfig({
			gridSize: selectedGridSize,
			isStarted: true,
			mode: selectedMode,
			secretCount: selectedSecretCount,
		});

		// Ensure all game states are perfectly reset
		setScore({ A: 0, B: 0 });
		setCurrentPlayer('A');
		setGameOver(false);
		setWinner(null);
		setGameKey((k) => k + 1);
	};

	// called when a bomb special is triggered: apply penalty and switch turn
	const handleBomb = () => {
		setScore(prev => ({
			...prev,
			[currentPlayer]: Math.max(0, prev[currentPlayer] - 1),
		}));
		// switch turn
		setCurrentPlayer(prev => (prev === 'A' ? 'B' : 'A'));
		showToast('-1 point!');
	};

	// called when a swap special is triggered: swap players' scores
	const handleSwap = () => {
		setScore(prev => {
			return { A: prev.B, B: prev.A };
		});
		// keep the same currentPlayer (or optionally switch) — we'll keep the turn as-is
		showToast('Scores swapped!');
	};

	// Toast notification state
	const [toast, setToast] = useState(null);
	const toastTimer = useRef(null);
	const showToast = (msg, ms = 1400) => {
		setToast(msg);
		if (toastTimer.current) clearTimeout(toastTimer.current);
		toastTimer.current = setTimeout(() => setToast(null), ms);
	};
  

// `GameSettings` moved to `src/components/GameSettings.jsx` and is imported above.


	return (
		<div className="app">
			<Title />

			{/* CONDITIONAL RENDERING: Settings vs. Game */}
			{!config.isStarted ? (
				<GameSettings onStart={handleStartGame} defaultConfig={config} /> // Show settings if not started
			) : (
				<>
					<PlayersCard score={score} currentPlayer={currentPlayer} />
					<div className="grid-panel">
						<Grid
							onMatch={onMatch}
							onMismatch={onMismatch}
							gameOver={gameOver}
							gameKey={gameKey}
							gridSize={config.gridSize} // Pass the selected size
							mode={config.mode}
							secretCount={config.secretCount}
							onBomb={handleBomb}
							onSwap={handleSwap}
						/>
					</div>
				</>
			)}
      
			{/* GAME OVER OVERLAY */}
			{gameOver && (
				<GameEndOverlay winner={winner} score={score} onRestart={handleRestart} />
			)}
      
			{/* Toast */}
			<Toast message={toast} />
		</div>
	);
};

export default App;