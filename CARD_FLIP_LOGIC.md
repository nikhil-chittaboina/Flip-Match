# Card Flip Logic - How Matched Cards Stay & Unmatched Flip Back

## Overview

The game uses **two separate arrays** to control card visibility:
- `flippedCards` - Temporary cards (can be removed)
- `matchedCards` - Permanent matches (never removed)

---

## 🟢 How Matched Cards Stay Flipped with Green Border

### Step 1: User Clicks Two Matching Cards

```javascript
// User clicks card 0 (🐶), then card 5 (🐶)
flippedCards = [0, 5]  // Both cards showing emoji
matchedCards = []
```

### Step 2: Match Detection

```javascript
// Line 84-88 in App.jsx
if (cards[firstIndex] === cards[secondIndex]) {
  // Match found! Move to matchedCards and clear flippedCards
  setMatchedCards([...matchedCards, firstIndex, secondIndex]);
  setFlippedCards([]); // Clear - matched cards are now in matchedCards
  setIsProcessing(false);
}
```

**What happens:**
- Cards 0 and 5 are added to `matchedCards = [0, 5]`
- `flippedCards` is cleared to `[]` (ready for next pair)

### Step 3: Rendering Logic Keeps Cards Visible

```javascript
// Line 107 in App.jsx
const isFlipped = flippedCards.includes(index) || matchedCards.includes(index);
```

**Key Logic:**
- A card is "flipped" (visible) if it's in **EITHER** array:
  - `flippedCards.includes(index)` OR
  - `matchedCards.includes(index)`

**For matched cards:**
- Even though `flippedCards = []` (empty)
- `matchedCards = [0, 5]` contains the indices
- So `isFlipped = true` for cards 0 and 5
- Cards stay visible! ✅

### Step 4: Green Border Applied via CSS

```javascript
// Line 108 & 112 in App.jsx
const isMatched = matchedCards.includes(index);

className={`card ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
```

**CSS Classes Applied:**
- `card` - Base class
- `flipped` - Makes card show emoji (via CSS transform)
- `matched` - Adds green border and background

**CSS Styling (App.css lines 65-74):**
```css
.card.matched {
  cursor: default;        /* Can't click */
  opacity: 0.8;          /* Slightly faded */
}

.card.matched .card-front {
  background-color: #90ee90;  /* Light green background */
  border: 3px solid #228b22;  /* Dark green border */
}
```

**Result:** Matched cards stay flipped with green border! 🟢

---

## ❌ How Unmatched Cards Flip Back

### Step 1: User Clicks Two Non-Matching Cards

```javascript
// User clicks card 0 (🐶), then card 3 (🐱)
flippedCards = [0, 3]  // Both cards showing emoji
matchedCards = []
```

### Step 2: No Match Detection

```javascript
// Line 84 in App.jsx
if (cards[firstIndex] === cards[secondIndex]) {
  // Match logic...
} else {
  // No match - flip cards back after delay
  // Line 95-99
  timeoutRef.current = setTimeout(() => {
    setFlippedCards([]); // Clear both cards
    setIsProcessing(false);
    timeoutRef.current = null;
  }, 1000); // 1 second delay
}
```

**What happens:**
- Cards don't match: `cards[0] !== cards[3]`
- `setTimeout` is set for 1 second delay
- After 1 second: `setFlippedCards([])` clears the array

### Step 3: Rendering Logic Hides Cards

```javascript
// Line 107 in App.jsx
const isFlipped = flippedCards.includes(index) || matchedCards.includes(index);
```

**After timeout:**
- `flippedCards = []` (empty)
- `matchedCards = []` (empty)
- `isFlipped = false` for cards 0 and 3
- Cards flip back to show ❓! ✅

### Step 4: CSS Flip Animation

**CSS (App.css lines 85-88):**
```css
.card.flipped .card-inner {
  transform: rotateY(180deg);  /* Rotate to show front (emoji) */
}
```

**When `flipped` class is removed:**
- `.card-inner` rotates back to 0deg
- Card shows back face (❓) instead of front face (emoji)
- Smooth 0.6s transition (line 82)

**Result:** Unmatched cards flip back to ❓ after 1 second! ❌

---

## 🔄 Complete Flow Example

### Scenario: Match Found

```
1. User clicks card 0 → flippedCards = [0]
2. User clicks card 5 → flippedCards = [0, 5]
3. Check: cards[0] === cards[5]? YES! 🎉
4. Update: matchedCards = [0, 5], flippedCards = []
5. Render: isFlipped = true (from matchedCards), isMatched = true
6. CSS: Green border applied, card stays visible
```

### Scenario: No Match

```
1. User clicks card 0 → flippedCards = [0]
2. User clicks card 3 → flippedCards = [0, 3]
3. Check: cards[0] === cards[3]? NO! ❌
4. Wait 1 second...
5. Update: flippedCards = []
6. Render: isFlipped = false (not in either array)
7. CSS: `flipped` class removed, card rotates back to ❓
```

---

## 🎯 Key Points

### Why Two Arrays?

1. **`flippedCards`** - Temporary state
   - Can be cleared when no match
   - Max 2 items (current pair being compared)

2. **`matchedCards`** - Permanent state
   - Never cleared (cards stay matched forever)
   - Grows as pairs are found

### The Magic Formula

```javascript
isFlipped = flippedCards.includes(index) || matchedCards.includes(index)
```

**This single line handles both cases:**
- ✅ Matched cards: Stay visible via `matchedCards`
- ✅ Temporary cards: Visible via `flippedCards`
- ✅ Unmatched cards: Hidden when `flippedCards` is cleared

### Visual States

| State | flippedCards | matchedCards | isFlipped | isMatched | Result |
|-------|-------------|-------------|-----------|-----------|--------|
| Initial | [] | [] | false | false | Shows ❓ |
| Clicked | [0] | [] | true | false | Shows 🐶 |
| Matched | [] | [0, 5] | true | true | Shows 🐶 (green) |
| No Match | [] | [] | false | false | Shows ❓ |

---

## Summary

**Matched Cards Stay Flipped:**
1. Moved from `flippedCards` → `matchedCards`
2. `isFlipped` checks both arrays → stays true
3. `isMatched` adds green border via CSS

**Unmatched Cards Flip Back:**
1. `flippedCards` cleared after 1 second
2. `isFlipped` becomes false
3. `flipped` class removed → CSS animation flips back

The beauty is in the **dual-array system** - one for temporary, one for permanent! 🎨

