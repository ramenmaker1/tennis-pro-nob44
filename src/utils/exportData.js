/**
 * Export predictions as JSON (denormalized for convenience)
 * Signature aligned with current callers
 */
export const exportPredictionsToJSON = (predictions, matches, players) => {
  if (!Array.isArray(predictions) || predictions.length === 0) {
    throw new Error('No predictions to export');
  }
  const matchMap = new Map((matches || []).map((m) => [m.id, m]));
  const playerMap = new Map((players || []).map((p) => [p.id, p]));

  const enriched = predictions.map((pred) => {
    const match = matchMap.get(pred.match_id) || {};
    const p1 = playerMap.get(match.player1_id) || {};
    const p2 = playerMap.get(match.player2_id) || {};
    const winner = playerMap.get(pred.predicted_winner_id) || {};
    const actual = pred.actual_winner_id ? playerMap.get(pred.actual_winner_id) : null;
    return {
      id: pred.id,
      model_type: pred.model_type,
      confidence_level: pred.confidence_level,
      match: {
        tournament: match.tournament_name || 'Unknown',
        surface: match.surface || 'Unknown',
        best_of: match.best_of || 3,
        date: match.utc_start || pred.created_date || pred.created_at,
      },
      players: {
        player1: {
          name: p1.display_name || p1.name || p1.full_name || 'Unknown',
          ranking: p1.current_rank || p1.ranking,
          win_probability: pred.player1_win_probability,
        },
        player2: {
          name: p2.display_name || p2.name || p2.full_name || 'Unknown',
          ranking: p2.current_rank || p2.ranking,
          win_probability: pred.player2_win_probability,
        },
      },
      predicted_winner: winner.display_name || winner.name || winner.full_name || 'Unknown',
      actual_winner: actual ? (actual.display_name || actual.name || actual.full_name) : 'Pending',
      correct: pred.actual_winner_id == null ? 'Pending' : pred.predicted_winner_id === pred.actual_winner_id ? 'Yes' : 'No',
      created_at: pred.created_date || pred.created_at,
    };
  });

  const jsonString = JSON.stringify(enriched, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `predictions_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Export predictions as CSV
 */
export const exportPredictionsToCSV = (predictions, matches, players) => {
  if (!Array.isArray(predictions) || predictions.length === 0) {
    throw new Error('No predictions to export');
  }
  const matchMap = new Map((matches || []).map((m) => [m.id, m]));
  const playerMap = new Map((players || []).map((p) => [p.id, p]));

  const headers = [
    'Prediction ID',
    'Model Type',
    'Confidence',
    'Tournament',
    'Surface',
    'Best Of',
    'Player 1',
    'Player 1 Ranking',
    'Player 1 Win %',
    'Player 2',
    'Player 2 Ranking',
    'Player 2 Win %',
    'Predicted Winner',
    'Actual Winner',
    'Correct',
    'Date',
  ];

  const rows = predictions.map((pred) => {
    const match = matchMap.get(pred.match_id) || {};
    const p1 = playerMap.get(match.player1_id) || {};
    const p2 = playerMap.get(match.player2_id) || {};
    const winner = playerMap.get(pred.predicted_winner_id) || {};
    const actual = pred.actual_winner_id ? playerMap.get(pred.actual_winner_id) : null;
    const correct = pred.actual_winner_id == null ? 'Pending' : pred.predicted_winner_id === pred.actual_winner_id ? 'Yes' : 'No';
    return [
      pred.id || '',
      pred.model_type || '',
      pred.confidence_level || '',
      match.tournament_name || '',
      match.surface || '',
      match.best_of || 3,
      p1.display_name || p1.name || p1.full_name || '',
      p1.current_rank || p1.ranking || '',
      ((pred.player1_win_probability || 0) * 100).toFixed(1),
      p2.display_name || p2.name || p2.full_name || '',
      p2.current_rank || p2.ranking || '',
      ((pred.player2_win_probability || 0) * 100).toFixed(1),
      winner.display_name || winner.name || winner.full_name || '',
      actual ? (actual.display_name || actual.name || actual.full_name) : 'Pending',
      correct,
      pred.created_date || pred.created_at || '',
    ];
  });

  const escapeCSV = (value) => {
    if (value === null || value === undefined) return '';
    const s = String(value);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };

  const csv = [headers.map(escapeCSV).join(','), ...rows.map((r) => r.map(escapeCSV).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `predictions_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
