import React from 'react';
import useGame from '../hooks/useGame';

const Grid = ({ onMatch, onMismatch, gameOver, gameKey, gridSize, mode = 'classic', secretCount = 0, onBomb, onSwap }) => {
  const { cards, cols, flippedCards, matchedCards, mismatchCards, isProcessing, handleCardClick } = useGame({ gridSize, mode, secretCount, gameKey, gameOver, onMatch, onMismatch, onBomb, onSwap });

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${cols}, 100px)`,
      }}
    >
      {cards.map((card, index) => {
        const isFlipped = card.flipped || card.matched || flippedCards.includes(index) || card.used;
        const isMatched = card.matched || matchedCards.includes(index);
        const isMismatch = mismatchCards.includes(index);
        const isUsedSpecial = card.used && card.kind !== 'normal';

        if (isUsedSpecial) {
          return (
            <div className={`card used-special matched`} key={card.id}>
              <div className="card-front static-front">{card.emoji}</div>
            </div>
          );
        }

        return (
          <div
            className={`card ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''} ${isMismatch ? 'mismatch' : ''}`}
            key={card.id}
            onClick={() => handleCardClick(index, gameOver)}
          >
            <div className="card-inner">
              <div className="card-front">{card.emoji}</div>
              <div className="card-back">❓</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Grid;
