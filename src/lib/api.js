import { supabase } from './supabaseClient';

export async function submitScore({ playerName, score, mode, gridSize }) {
  const payload = { player_name: playerName, score, mode, grid_size: gridSize };
  const { data, error } = await supabase.from('scores').insert([payload]);
  if (error) throw error;
  return data;
}

export async function getLeaderboard({ mode, gridSize, limit = 10 } = {}) {
  let q = supabase.from('scores').select('player_name,score,created_at').order('score', { ascending: false }).limit(limit);
  if (mode) q = q.eq('mode', mode);
  if (gridSize) q = q.eq('grid_size', gridSize);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export function subscribeLeaderboard(cb) {
  // using the channels/postgres_changes API
  const channel = supabase
    .channel('public:scores')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'scores' }, (payload) => {
      cb(payload.new);
    })
    .subscribe();

  return channel;
}
