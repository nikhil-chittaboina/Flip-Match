import React from 'react';

const GameEndOverlay = ({ winner, score, onRestart }) => {
  return (
    <div className="game-end-overlay">
      <div className="game-end-card">
        <div className="game-end-title">
          {winner === 'tie' ? 'Tie Game!' : `${winner === 'A' ? 'Player 1' : 'Player 2'} Wins 🏆 !`}
        </div>
        <div className="game-end-scores">
          <span>Player 1: {score.A}</span>
          <span>Player 2: {score.B}</span>
        </div>
        <button className="restart-btn" onClick={onRestart}>
          New Game / Change Size
        </button>
      </div>
    </div>
  );
};

export default GameEndOverlay;
