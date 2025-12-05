import React, { useState } from 'react';
import './App.css';

const Player = ({ name, img }) => {
  return (
    <div className="player">
      <img src={img} alt="" />
      <h2>{name}</h2>
      <p className="score">Score : 0</p>
    </div>
  );
};

const Versus = () => {
  return <div className="versus">VS</div>;
};

const Title = () => {
  return <h1 className="title">Flip-Match</h1>;
};

const PlayersCard = () => {
  return (
    <div className="players-card">
      <Player name="Player 1" img="/player1.png" />
      <Versus />
      <Player name="Player 2" img="/player2.png" />
    </div>
  );
};

const Grid = () => {
  const emojis = ["🐶", "🐱", "🐻", "🐼", "🦁", "🐸"];
  const [cards] = useState(() => {
    let double = [...emojis, ...emojis];
    double.sort(() => Math.random() - 0.5);
    return double;
  });

  return (
    <div className="grid">
      {cards.map((emoji, index) => (
        <div
          className="card flipped"
          key={index}
          onClick={(e) => e.currentTarget.classList.toggle('flipped')}
        >
          <div className="card-inner">
            <div className="card-front">{emoji}</div>
            <div className="card-back">❓</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const App = () => {
  return (
    <div className="app">
      <Title />
      <PlayersCard />
      <Grid />
    </div>
  );
};

export default App;
