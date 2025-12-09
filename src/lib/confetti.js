import confetti from "canvas-confetti";

export const shootConfetti = () => {
  confetti({
    particleCount: 1000,
    spread: 160,
    origin: { y: 0.6 }
  });
};
