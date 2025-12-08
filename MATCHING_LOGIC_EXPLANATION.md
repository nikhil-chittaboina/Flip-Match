# Matching Logic - State Variables Explanation

## The 4 State Variables

### 1. `flippedCards` - Temporary Visibility
**Purpose**: Tracks cards currently showing emoji (temporarily visible)

**Why separate?** 
- We need to know which cards to flip BACK if they don't match
- Matched cards stay visible, but we don't want to track them here

**Example Flow:**
```
Click card 0: flippedCards = [0]
Click card 5: flippedCards = [0, 5]
If match: flippedCards stays [0, 5] (but cards move to matchedCards)
If no match: flippedCards = [] (both flip back)
```

---

### 2. `matchedCards` - Permanent Matches
**Purpose**: Tracks cards that are permanently matched and visible

**Why separate?**
- These cards should NEVER flip back
- These cards should NEVER be clickable
- We need to know which cards are "done"

**Example Flow:**
```
Cards 0 and 5 match: matchedCards = [0, 5]
These cards stay visible forever (green background)
```

---

### 3. `cardsToCompare` - Current Comparison Pair
**Purpose**: Tracks exactly which 2 cards we're comparing RIGHT NOW

**Why separate?**
- `flippedCards` might include matched cards (we don't want to compare those)
- We need exact indices to compare: `cards[firstIndex] === cards[secondIndex]`
- We need to know which 2 cards to remove from `flippedCards` if no match

**Example Flow:**
```
Click card 0: cardsToCompare = [0]
Click card 5: cardsToCompare = [0, 5]
Compare: cards[0] === cards[5]? 
If match: cardsToCompare = [] (clear for next pair)
If no match: cardsToCompare = [] (clear after flipping back)
```

---

### 4. `isProcessing` - Lock During Delay
**Purpose**: Prevents clicking during the 1-second delay after mismatch

**Why needed?**
- Without it: User could click 10 cards while waiting for flip-back
- Prevents race conditions
- Ensures only 2 cards compared at a time

**Example Flow:**
```
2 cards flipped, checking match: isProcessing = true
User tries to click → blocked (early return)
After 1 second delay: isProcessing = false
User can now click again
```

---

## Complete Flow Example

### Scenario: User clicks card 0 (🐶), then card 3 (🐱) - NO MATCH

**Initial State:**
```
flippedCards = []
matchedCards = []
cardsToCompare = []
isProcessing = false
```

**Step 1: Click card 0**
```
flippedCards = [0]        // Card 0 shows emoji
cardsToCompare = [0]      // Waiting for second card
matchedCards = []
isProcessing = false
```

**Step 2: Click card 3**
```
flippedCards = [0, 3]     // Both cards show emoji
cardsToCompare = [0, 3]   // Now have 2 cards to compare
matchedCards = []
isProcessing = true        // LOCK - prevent more clicks
```

**Step 3: Check match**
```
cards[0] = "🐶"
cards[3] = "🐱"
"🐶" !== "🐱" → NO MATCH
```

**Step 4: After 1 second delay**
```
flippedCards = []         // Remove both cards (flip back to ❓)
cardsToCompare = []       // Clear comparison queue
matchedCards = []         // No matches
isProcessing = false      // UNLOCK - user can click again
```

---

### Scenario: User clicks card 0 (🐶), then card 5 (🐶) - MATCH!

**Step 1-2: Same as above**

**Step 3: Check match**
```
cards[0] = "🐶"
cards[5] = "🐶"
"🐶" === "🐶" → MATCH!
```

**Step 4: Match found**
```
flippedCards = [0, 5]     // Stay visible
cardsToCompare = []       // Clear for next pair
matchedCards = [0, 5]     // Mark as permanently matched
isProcessing = false      // UNLOCK
```

**Step 5: User clicks card 1**
```
flippedCards = [0, 5, 1]  // Card 1 shows emoji
cardsToCompare = [1]      // Waiting for second card
matchedCards = [0, 5]     // Cards 0 and 5 stay matched
isProcessing = false
```

---

## Why We Can't Simplify

### ❌ Can't combine `flippedCards` and `matchedCards`
**Problem**: When flipping back unmatched cards, we'd also remove matched ones
```javascript
// BAD: If we only had one array
flippedCards = [0, 5, 1, 3]  // 0,5 are matched, 1,3 are not
// How do we flip back only 1 and 3?
```

### ❌ Can't use only `flippedCards` without `cardsToCompare`
**Problem**: We'd compare wrong cards or can't identify which 2 to flip back
```javascript
// BAD: If matchedCards = [0, 5] and flippedCards = [0, 5, 1, 3]
// Which 2 cards are we comparing? We don't know!
```

### ❌ Can't remove `isProcessing`
**Problem**: User could click 10 cards during the 1-second delay
```javascript
// BAD: Without isProcessing
// User clicks card 0, then 1 (no match, waiting 1 second)
// User quickly clicks cards 2, 3, 4, 5, 6, 7... → BUG!
```

---

## Summary

Each state variable has a **specific responsibility**:

1. **`flippedCards`** → Temporary visibility (can be removed)
2. **`matchedCards`** → Permanent matches (never removed)
3. **`cardsToCompare`** → Exact pair being compared (for logic)
4. **`isProcessing`** → Prevents race conditions (for safety)

Together, they create a **robust matching system** that handles all edge cases!

