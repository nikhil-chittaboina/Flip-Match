import React from 'react';

export const Player = ({ name, img, score, active, variant }) => {
  return (
    <div className={`player ${variant ? `player--${variant}` : ''} ${active ? 'active' : ''}`}>
      {active && <div className="turn-badge">Your turn</div>}
      <div className="avatar">
        <img src={img} alt="Player" />
      </div>
      <h2>{name}</h2>
      <div className="score">{score}</div>
      <div className="points-label">POINTS</div>
    </div>
  );
};

export default Player;
