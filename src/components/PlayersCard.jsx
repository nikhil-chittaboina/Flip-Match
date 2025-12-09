import React from 'react';
import Player from './Player';
import Versus from './Versus';

const PlayersCard = ({ score, currentPlayer }) => {
  return (
    <div className="players-card">
      <Player
        name="Player 1"
        img="/player1.png"
        score={score['A']}
        active={currentPlayer === 'A'}
        variant="A"
      />
      <Versus />
      <Player
        name="Player 2"
        img="/player2.png"
        score={score['B']}
        active={currentPlayer === 'B'}
        variant="B"
      />
    </div>
  );
};

export default PlayersCard;
