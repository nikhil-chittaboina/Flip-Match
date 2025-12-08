import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const Player = ({ name, img, score, active }) => {
  return (
    <div className={`player ${active ? 'active' : ''}`}>
      <div className="turn-badge">Your turn</div>
      <img src={img} alt="Player" />
      <h2>{name}</h2>
      <p className="score">Score : {score}</p>
    </div>
  );
};

const Versus = () => {
  return <div className="versus">VS</div>;
};

const Title = () => {
  return <h1 className="title">Flip-Match</h1>;
};

const PlayersCard = ({ score, currentPlayer }) => {
  return (
    <div className="players-card">
      <Player
        name="Player 1"
        img="/player1.png"
        score={score["A"]}
        active={currentPlayer === 'A'}
      />
      <Versus />
      <Player
        name="Player 2"
        img="/player2.png"
        score={score["B"]}
        active={currentPlayer === 'B'}
      />
    </div>
  );
};

const Grid = ({ onMatch, onMismatch, gameOver, gameKey }) => {
  const emojis = ["🐶", "🐱", "🐻", "🐼", "🦁", "🐸"];
  const shuffleCards = () => {
    let double = [...emojis, ...emojis];
    double.sort(() => Math.random() - 0.5);
    return double;
  };

  const [cards, setCards] = useState(shuffleCards);

  // Track which cards are currently flipped (temporary, max 2 cards)
  // Also used directly for comparison - no need for separate cardsToCompare!
  const [flippedCards, setFlippedCards] = useState([]);
  // Track which cards are matched (permanently visible)
  const [matchedCards, setMatchedCards] = useState([]);
  // Track the last mismatched pair for a brief UI effect
  const [mismatchCards, setMismatchCards] = useState([]);
  // Prevent clicking during flip animation
  const [isProcessing, setIsProcessing] = useState(false);
  // Store timeout ID for cleanup
  const timeoutRef = useRef(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Reset grid state when gameKey changes (new game)
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setCards(shuffleCards());
    setFlippedCards([]);
    setMatchedCards([]);
    setMismatchCards([]);
    setIsProcessing(false);
  }, [gameKey]);

  const handleCardClick = (index) => {
    // Prevent clicking if:
    // - Card is already matched
    // - Card is already flipped
    // - Already have 2 cards flipped
    // - Currently processing a match
    if (
      matchedCards.includes(index) ||
      flippedCards.includes(index) ||
      flippedCards.length >= 2 ||
      isProcessing ||
      gameOver
    ) {
      return;
    }

    // Add card to flipped cards (this is also our comparison array!)
    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    // If we have 2 cards, check for match
    if (newFlipped.length === 2) {
      setIsProcessing(true);
      const [firstIndex, secondIndex] = newFlipped;
      
      // Check if cards match
      if (cards[firstIndex] === cards[secondIndex]) {
        // Match found! Move to matchedCards and clear flippedCards
        const newMatched = [...matchedCards, firstIndex, secondIndex];
        const isFinalMatch = newMatched.length === cards.length;
        setMatchedCards(newMatched);
        setFlippedCards([]); // Clear - matched cards are now in matchedCards
        setIsProcessing(false);
        onMatch(isFinalMatch); // Notify parent of a match (and if game ended)
      } else {
        // Mark mismatched cards for a brief visual cue
        setMismatchCards(newFlipped);
        // No match - flip cards back after delay
        // Clear any existing timeout first
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          setFlippedCards([]); // Clear both cards
          setMismatchCards([]); // Clear mismatch highlight
          setIsProcessing(false);
          timeoutRef.current = null;
          onMismatch(); // Notify parent of a mismatch
        }, 1000); // 1 second delay
      }
    }
  };

  return (
    <div className="grid">
      {cards.map((emoji, index) => {
        const isFlipped = flippedCards.includes(index) || matchedCards.includes(index);
        const isMatched = matchedCards.includes(index);
        const isMismatch = mismatchCards.includes(index);
        
        return (
          <div
            className={`card ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''} ${isMismatch ? 'mismatch' : ''}`}
            key={index}
            onClick={() => handleCardClick(index)}
          >
            <div className="card-inner">
              <div className="card-front">{emoji}</div>
              <div className="card-back">❓</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const App = () => {
  const [currentPlayer, setCurrentPlayer] = useState('A');
  const [score, setScore] = useState({ A: 0, B: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null); // 'A' | 'B' | 'tie' | null
  const [gameKey, setGameKey] = useState(0); // triggers grid reset

  const audioRef = useRef(new Audio("/changeTurn.wav"));
  audioRef.current.volume = 0.3;

  const playTurnSound = () => {
    audioRef.current.currentTime = 0; // reset to start
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
        finishGame(updated);
      }
      return updated;
    });
    playTurnSound();
    // currentPlayer stays the same on a match
  };

  const onMismatch = () => {
    // Switch to the other player on mismatch
    setCurrentPlayer((prevPlayer) => (prevPlayer === 'A' ? 'B' : 'A'));
  };

  const handleRestart = () => {
    setScore({ A: 0, B: 0 });
    setCurrentPlayer('A');
    setGameOver(false);
    setWinner(null);
    setGameKey((k) => k + 1); // triggers grid reshuffle/reset
  };

  return (
    <div className="app">
      <Title />
      <PlayersCard score={score} currentPlayer={currentPlayer} />
      <Grid
        onMatch={onMatch}
        onMismatch={onMismatch}
        gameOver={gameOver}
        gameKey={gameKey}
      />
      {gameOver && (
        <div className="game-end-overlay">
          <div className="game-end-card">
            <div className="game-end-title">
              {winner === 'tie' ? 'Tie Game!' : `${winner === 'A' ? 'Player 1' : 'Player 2'} Wins!`}
            </div>
            <div className="game-end-scores">
              <span>Player 1: {score.A}</span>
              <span>Player 2: {score.B}</span>
            </div>
            <button className="restart-btn" onClick={handleRestart}>
              Restart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
