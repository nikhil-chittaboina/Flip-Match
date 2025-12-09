const allEmojis = [
  "🐶", "🐱", "🐻", "🐼", "🦁", "🐸", "🐔", "🐧", "🐵", "🦊", "🐯",
  "🦓", "🦉", "🦒", "🐘", "🦔",
];

const specialEmojis = [
  { emoji: '🔍', kind: 'reveal' },
  { emoji: '🔀', kind: 'swap' },
  { emoji: '💣', kind: 'bomb' },
];

export function shuffle(arr) {
  return arr.slice().sort(() => Math.random() - 0.5);
}

// buildDeck(cols, rows, mode, secretCount)
export function buildDeck(cols, rows, mode = 'classic', secretCount = 0) {
  const total = cols * rows;
  const pairs = total / 2;

  if (pairs > allEmojis.length) {
    console.error('Not enough unique emojis for this grid size!');
    return [];
  }

  if (mode !== 'secret' || !secretCount) {
    const selected = allEmojis.slice(0, pairs);
    const double = shuffle([...selected, ...selected]);
    return double.map((emoji, i) => ({ id: `${emoji}-${i}-${Math.random().toString(36).slice(2,6)}`, emoji, kind: 'normal', matched: false, used: false, flipped: false }));
  }

  const nSpecial = Math.min(secretCount, total);
  const nNormalCards = total - nSpecial;
  const normalPairs = Math.floor(nNormalCards / 2);

  const selected = allEmojis.slice(0, normalPairs);
  const normalDouble = shuffle([...selected, ...selected]);
  const normalCards = normalDouble.map((emoji, i) => ({ id: `${emoji}-n-${i}-${Math.random().toString(36).slice(2,6)}`, emoji, kind: 'normal', matched: false, used: false, flipped: false }));

  const specialCards = [];
  for (let i = 0; i < nSpecial; i++) {
    const spec = specialEmojis[i % specialEmojis.length];
    specialCards.push({ id: `spec-${i}-${Math.random().toString(36).slice(2,6)}`, emoji: spec.emoji, kind: spec.kind, matched: false, used: false, flipped: false });
  }

  const combined = shuffle([...normalCards, ...specialCards]);
  return combined;
}

export { allEmojis, specialEmojis };
