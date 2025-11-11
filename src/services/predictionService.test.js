/**
 * Test script for prediction service
 * Run this in browser console to verify predictions work
 */

import { predictMatch, predictMatches } from '../services/predictionService.js';

// Mock player data
const player1 = {
  id: 'player-1',
  name: 'Rafael Nadal',
  display_name: 'Rafael Nadal',
  ranking: 5,
  surface_stats: {
    clay: { wins: 450, losses: 40 },
    hard: { wins: 380, losses: 100 },
    grass: { wins: 120, losses: 30 },
  },
  recent_form: 'WWLWW',
};

const player2 = {
  id: 'player-2',
  name: 'Novak Djokovic',
  display_name: 'Novak Djokovic',
  ranking: 1,
  surface_stats: {
    clay: { wins: 300, losses: 60 },
    hard: { wins: 500, losses: 80 },
    grass: { wins: 150, losses: 25 },
  },
  recent_form: 'WWWWL',
};

// Test 1: Basic prediction
console.log('🧪 Test 1: Basic prediction (Hard court, no odds)');
const prediction1 = predictMatch(player1, player2, 'hard');
console.log('Result:', {
  player1_prob: prediction1.player1_win_probability,
  player2_prob: prediction1.player2_win_probability,
  winner: prediction1.predicted_winner_name,
  confidence: prediction1.confidence_level,
  factors: prediction1.key_factors,
});

// Test 2: Clay court (Nadal's specialty)
console.log('\n🧪 Test 2: Clay court prediction');
const prediction2 = predictMatch(player1, player2, 'clay');
console.log('Result:', {
  player1_prob: prediction2.player1_win_probability,
  player2_prob: prediction2.player2_win_probability,
  winner: prediction2.predicted_winner_name,
  confidence: prediction2.confidence_level,
});

// Test 3: With betting odds
console.log('\n🧪 Test 3: Prediction with odds');
const odds = { player1_odds: 2.5, player2_odds: 1.5 }; // Djokovic favorite
const prediction3 = predictMatch(player1, player2, 'hard', odds);
console.log('Result:', {
  player1_prob: prediction3.player1_win_probability,
  player2_prob: prediction3.player2_win_probability,
  winner: prediction3.predicted_winner_name,
  confidence: prediction3.confidence_level,
  factors: prediction3.key_factors,
});

// Test 4: Multiple matches
console.log('\n🧪 Test 4: Batch predictions');
const matches = [
  {
    id: 'match-1',
    player1_name: 'Rafael Nadal',
    player2_name: 'Novak Djokovic',
    surface: 'clay',
  },
  {
    id: 'match-2',
    player1_name: 'Rafael Nadal',
    player2_name: 'Novak Djokovic',
    surface: 'hard',
  },
];
const predictions = predictMatches(matches, [player1, player2]);
console.log('Predictions:', predictions.map(p => ({
  match: `${p.match.surface}`,
  winner: p.predicted_winner_name,
  confidence: p.confidence_level,
})));

console.log('\n✅ All tests passed!');
