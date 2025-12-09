import { useState, useEffect, useRef, useCallback } from 'react';
import { buildDeck } from '../utils/deck';

// useGame encapsulates the game logic and exposes state + actions
export default function useGame({ gridSize = '4x3', mode = 'classic', secretCount = 0, gameKey = 0, gameOver = false, onMatch, onMismatch, onBomb, onSwap }) {
  const [cols, rows] = gridSize.split('x').map(Number);
  const totalCards = cols * rows;

  const [cards, setCards] = useState(() => buildDeck(cols, rows, mode, secretCount));
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [mismatchCards, setMismatchCards] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Rebuild deck when keys/config change
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setCards(buildDeck(cols, rows, mode, secretCount));
    setFlippedCards([]);
    setMatchedCards([]);
    setMismatchCards([]);
    setIsProcessing(false);
  }, [gameKey, cols, rows, mode, secretCount]);

  const handleCardClick = useCallback((index, gameOverFlag) => {
    if (isProcessing || gameOverFlag) return;

    const card = cards[index];
    if (!card || card.matched || card.flipped) return;

    if (card.kind !== 'normal' && !card.used) {
      if (card.kind === 'reveal') {
        setIsProcessing(true);
        setCards(prev => prev.map((c, i) => i === index ? { ...c, used: true, flipped: true, matched: true } : c));

        const candidateIndices = [];
        cards.forEach((c, i) => {
          if (i === index) return;
          if (c.kind === 'normal' && !c.matched && !c.flipped) candidateIndices.push(i);
        });

        const revealCount = Math.min(3, candidateIndices.length);
        const chosen = [];
        while (chosen.length < revealCount && candidateIndices.length) {
          const ridx = Math.floor(Math.random() * candidateIndices.length);
          chosen.push(candidateIndices[ridx]);
          candidateIndices.splice(ridx, 1);
        }

        setCards(prev => prev.map((c, i) => chosen.includes(i) ? { ...c, flipped: true } : c));

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setCards(prev => prev.map((c, i) => {
            if (chosen.includes(i)) return { ...c, flipped: false };
            if (i === index) return { ...c, flipped: true, used: true, matched: true };
            return c;
          }));
          setIsProcessing(false);
          timeoutRef.current = null;
        }, 900);
        return;
      }

      if (card.kind === 'swap') {
        setIsProcessing(true);
        setCards(prev => prev.map((c, i) => i === index ? { ...c, used: true, flipped: true, matched: true } : c));
        if (onSwap) onSwap();
        setTimeout(() => setIsProcessing(false), 600);
        return;
      }

      if (card.kind === 'bomb') {
        setIsProcessing(true);
        setCards(prev => prev.map((c, i) => i === index ? { ...c, used: true, flipped: true, matched: true } : c));
        if (onBomb) onBomb();
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setCards(prev => prev.map((c, i) => i === index ? { ...c, flipped: true, used: true, matched: true } : c));
          setIsProcessing(false);
          timeoutRef.current = null;
        }, 700);
        return;
      }
      return;
    }

    setCards(prev => prev.map((c, i) => i === index ? { ...c, flipped: true } : c));
    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setIsProcessing(true);
      const [firstIndex, secondIndex] = newFlipped;
      const first = cards[firstIndex];
      const second = cards[secondIndex];

      if (first && second && first.kind === 'normal' && second.kind === 'normal' && first.emoji === second.emoji) {
        setCards(prev => prev.map((c, i) => (i === firstIndex || i === secondIndex) ? { ...c, matched: true } : c));
        setFlippedCards([]);
        setMatchedCards(prev => {
          const merged = [...prev, firstIndex, secondIndex];
          const matchedNormalCount = merged.filter(idx => {
            const c = cards[idx];
            return c && c.kind === 'normal';
          }).length;
          const totalNormalCards = cards.filter(c => c.kind === 'normal').length;
          const isFinalMatch = matchedNormalCount === totalNormalCards;
          setIsProcessing(false);
          if (onMatch) onMatch(isFinalMatch);
          return merged;
        });
      } else {
        setMismatchCards(newFlipped);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setCards(prev => prev.map((c, i) => (i === firstIndex || i === secondIndex) ? { ...c, flipped: false } : c));
          setFlippedCards([]);
          setMismatchCards([]);
          setIsProcessing(false);
          timeoutRef.current = null;
          if (onMismatch) onMismatch();
        }, 1000);
      }
    }
  }, [cards, flippedCards, isProcessing, onBomb, onMatch, onMismatch, onSwap]);

  const restart = useCallback(() => {
    setCards(buildDeck(cols, rows, mode, secretCount));
    setFlippedCards([]);
    setMatchedCards([]);
    setMismatchCards([]);
    setIsProcessing(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [cols, rows, mode, secretCount]);

  return {
    cards,
    cols,
    rows,
    flippedCards,
    matchedCards,
    mismatchCards,
    isProcessing,
    handleCardClick,
    restart,
  };
}
