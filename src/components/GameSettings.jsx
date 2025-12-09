import React, { useState, useEffect } from 'react';

const GameSettings = ({ onStart, defaultConfig = { gridSize: '4x3', mode: 'classic', secretCount: 0 } }) => {
  const [selSize, setSelSize] = useState(defaultConfig.gridSize);
  const [selMode, setSelMode] = useState(defaultConfig.mode);
  const [selSecret, setSelSecret] = useState(defaultConfig.secretCount);

  useEffect(() => {
    const [c, r] = selSize.split('x').map(Number);
    const N = c * r;
    if ((N - selSecret) % 2 !== 0) {
      setSelSecret(prev => Math.max(0, prev - 1));
    }
  }, [selSize]);

  return (
    <div className="game-end-overlay">
      <div className="game-end-card">
        <h2 className="game-end-title">Select Grid Size & Mode</h2>
        <p style={{ margin: '8px 0 10px 0', fontSize: '14px', color: '#aaa' }}>
          Total Cards: {selSize.split('x').reduce((a, b) => a * b)}
        </p>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
          {['4x3', '4x4', '6x4'].map(size => (
            <button
              key={size}
              className="restart-btn"
              onClick={() => setSelSize(size)}
              style={{ padding: '8px 14px', background: selSize === size ? '#2e8b57' : '#4caf50' }}
            >{size}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 12 }}>
          <button
            className="restart-btn"
            onClick={() => setSelMode('classic')}
            style={{ background: selMode === 'classic' ? '#ffd36b' : '#777', color: selMode === 'classic' ? '#1b0b00' : '#fff' }}
          >Classic</button>
          <button
            className="restart-btn"
            onClick={() => setSelMode('secret')}
            style={{ background: selMode === 'secret' ? '#ff8a3a' : '#777', color: selMode === 'secret' ? '#1b0b00' : '#fff' }}
          >Secret Cards</button>
        </div>

        {selMode === 'secret' && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ marginBottom: 8, color: '#ddd' }}>Secret cards:</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {[0,2,4].map(n => (
                <button
                  key={n}
                  className="restart-btn"
                  onClick={() => setSelSecret(n)}
                  style={{ padding: '8px 12px', background: selSecret === n ? '#2e8b57' : '#4caf50' }}
                >{n}</button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          <button
            className="restart-btn"
            onClick={() => onStart(selSize, selMode, selSecret)}
            style={{ padding: '10px 18px' }}
          >Start Game</button>
        </div>
      </div>
    </div>
  );
};

export default GameSettings;
