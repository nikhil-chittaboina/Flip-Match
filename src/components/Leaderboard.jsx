import React, { useEffect, useState } from 'react';
import { getLeaderboard, subscribeLeaderboard } from '../lib/api';

export default function Leaderboard({ mode, gridSize }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    getLeaderboard({ mode, gridSize, limit: 10 })
      .then((data) => {
        if (mounted) setItems(data || []);
      })
      .catch((err) => {
        console.error('Leaderboard load error', err);
        if (mounted) setError(err.message || String(err));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    const channel = subscribeLeaderboard((row) => {
      setItems(prev => {
        const next = [row, ...prev];
        // dedupe by id if possible
        const seen = new Set();
        const deduped = [];
        for (const it of next) {
          const id = it.id ?? `${it.player_name}-${it.created_at}`;
          if (!seen.has(id)) { seen.add(id); deduped.push(it); }
        }
        return deduped.slice(0, 10);
      });
    });

    return () => {
      mounted = false;
      try { channel.unsubscribe?.(); } catch (e) { /* ignore */ }
    };
  }, [mode, gridSize]);

  return (
    <div className="leaderboard" style={{ padding: 12, textAlign: 'center' }}>
      <h3 style={{ margin: '6px 0' }}>Leaderboard</h3>
      {loading && <div style={{ color: '#bbb' }}>Loading...</div>}
      {error && <div style={{ color: '#f88' }}>Error loading leaderboard: {error}</div>}
      {!loading && !error && items.length === 0 && (
        <div style={{ color: '#bbb' }}>No scores yet — play a game to add one.</div>
      )}
      {!loading && !error && items.length > 0 && (
        <ol style={{ textAlign: 'left', display: 'inline-block', marginTop: 8 }}>
          {items.map((r, i) => (
            <li key={r.id ?? i} style={{ padding: '4px 0' }}>
              <strong style={{ color: '#ffd36b' }}>{r.player_name}</strong>
              <span style={{ marginLeft: 8, color: '#ddd' }}>— {r.score}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
