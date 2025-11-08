<<<<<<< HEAD
import { createPlayerSlug } from './aliasGenerator';
=======
import { createPlayerSlug } from "./aliasGenerator";
>>>>>>> 93b199770ad6bdfb6dd2756c9afae9a1983d3fde

/**
 * Parses CSV text into array of row objects
 * Signature aligned with BulkImport usage: parseCSV(text) -> rows[]
 */
export const parseCSV = (text) => {
<<<<<<< HEAD
  const lines = String(text || '')
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0);
=======
  const lines = String(text || "").split(/\r?\n/).filter((l) => l.trim().length > 0);
>>>>>>> 93b199770ad6bdfb6dd2756c9afae9a1983d3fde
  if (lines.length === 0) return [];
  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map((line, idx) => {
    const values = parseCSVLine(line);
    const row = { _rowNumber: idx + 2 };
    headers.forEach((h, i) => {
<<<<<<< HEAD
      row[h] = values[i] ?? '';
=======
      row[h] = values[i] ?? "";
>>>>>>> 93b199770ad6bdfb6dd2756c9afae9a1983d3fde
    });
    return row;
  });
  return rows;
};

/** parse a CSV line handling quotes */
const parseCSVLine = (line) => {
  const res = [];
<<<<<<< HEAD
  let cur = '';
=======
  let cur = "";
>>>>>>> 93b199770ad6bdfb6dd2756c9afae9a1983d3fde
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const next = line[i + 1];
    if (ch === '"') {
      if (inQuotes && next === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
<<<<<<< HEAD
    } else if (ch === ',' && !inQuotes) {
      res.push(cur.trim());
      cur = '';
=======
    } else if (ch === "," && !inQuotes) {
      res.push(cur.trim());
      cur = "";
>>>>>>> 93b199770ad6bdfb6dd2756c9afae9a1983d3fde
    } else {
      cur += ch;
    }
  }
  res.push(cur.trim());
  return res;
};

/**
 * Validates and normalizes a player row into payload for creation
 * Throws Error with message when invalid.
 */
export const validatePlayerImportRow = (row) => {
<<<<<<< HEAD
  const display = (row.display_name || row.full_name || '').trim();
  if (!display) throw new Error('Full name is required');

  const current_rank = row.ranking ? Number.parseInt(String(row.ranking), 10) : undefined;
  if (row.ranking && (!Number.isFinite(current_rank) || current_rank < 1)) {
    throw new Error('Ranking must be a positive number');
  }

  const pct = (v) => (v === undefined || v === '' ? undefined : Number.parseFloat(String(v)));
  const clamp01 = (n, field) => {
    if (n === undefined) return undefined;
    if (!Number.isFinite(n) || n < 0 || n > 100)
      throw new Error(`${field} must be between 0 and 100`);
=======
  const display = (row.display_name || row.full_name || "").trim();
  if (!display) throw new Error("Full name is required");

  const current_rank = row.ranking ? Number.parseInt(String(row.ranking), 10) : undefined;
  if (row.ranking && (!Number.isFinite(current_rank) || current_rank < 1)) {
    throw new Error("Ranking must be a positive number");
  }

  const pct = (v) => (v === undefined || v === "" ? undefined : Number.parseFloat(String(v)));
  const clamp01 = (n, field) => {
    if (n === undefined) return undefined;
    if (!Number.isFinite(n) || n < 0 || n > 100) throw new Error(`${field} must be between 0 and 100`);
>>>>>>> 93b199770ad6bdfb6dd2756c9afae9a1983d3fde
    return n;
  };

  const payload = {
    display_name: display,
    slug: createPlayerSlug(display),
    nationality: row.country || row.nationality || undefined,
    plays: row.plays || undefined,
    current_rank,
<<<<<<< HEAD
    first_serve_pct: clamp01(pct(row.first_serve_pct ?? row.serve_percentage), 'first_serve_pct'),
    first_serve_win_pct: clamp01(pct(row.first_serve_points_won), 'first_serve_win_pct'),
    second_serve_win_pct: clamp01(pct(row.second_serve_points_won), 'second_serve_win_pct'),
    first_return_win_pct: clamp01(
      pct(row.first_return_win_pct ?? row.return_points_won),
      'first_return_win_pct'
    ),
    break_points_converted_pct: clamp01(
      pct(row.break_points_converted),
      'break_points_converted_pct'
    ),
    hard_court_win_pct: clamp01(pct(row.hard_court_win_pct), 'hard_court_win_pct'),
    clay_court_win_pct: clamp01(pct(row.clay_court_win_pct), 'clay_court_win_pct'),
    grass_court_win_pct: clamp01(pct(row.grass_court_win_pct), 'grass_court_win_pct'),
    data_source: row.data_source || 'import',
=======
    first_serve_pct: clamp01(pct(row.first_serve_pct ?? row.serve_percentage), "first_serve_pct"),
    first_serve_win_pct: clamp01(pct(row.first_serve_points_won), "first_serve_win_pct"),
    second_serve_win_pct: clamp01(pct(row.second_serve_points_won), "second_serve_win_pct"),
    first_return_win_pct: clamp01(pct(row.first_return_win_pct ?? row.return_points_won), "first_return_win_pct"),
    break_points_converted_pct: clamp01(pct(row.break_points_converted), "break_points_converted_pct"),
    hard_court_win_pct: clamp01(pct(row.hard_court_win_pct), "hard_court_win_pct"),
    clay_court_win_pct: clamp01(pct(row.clay_court_win_pct), "clay_court_win_pct"),
    grass_court_win_pct: clamp01(pct(row.grass_court_win_pct), "grass_court_win_pct"),
    data_source: row.data_source || "import",
>>>>>>> 93b199770ad6bdfb6dd2756c9afae9a1983d3fde
  };

  return payload;
};

/** CSV template content for user download */
export const generateCSVTemplate = () => {
  const headers = [
<<<<<<< HEAD
    'display_name',
    'ranking',
    'country',
    'plays',
    'first_serve_pct',
    'first_serve_points_won',
    'second_serve_points_won',
    'first_return_win_pct',
    'break_points_converted',
    'hard_court_win_pct',
    'clay_court_win_pct',
    'grass_court_win_pct',
    'data_source',
  ];
  const example = [
    'Rafael Nadal',
    '2',
    'ESP',
    'left',
    '68',
    '74',
    '58',
    '48',
    '42',
    '78',
    '91',
    '75',
    'atp',
  ];
  return [headers.join(','), example.join(',')].join('\n');
};
=======
    "display_name",
    "ranking",
    "country",
    "plays",
    "first_serve_pct",
    "first_serve_points_won",
    "second_serve_points_won",
    "first_return_win_pct",
    "break_points_converted",
    "hard_court_win_pct",
    "clay_court_win_pct",
    "grass_court_win_pct",
    "data_source",
  ];
  const example = [
    "Rafael Nadal",
    "2",
    "ESP",
    "left",
    "68",
    "74",
    "58",
    "48",
    "42",
    "78",
    "91",
    "75",
    "atp",
  ];
  return [headers.join(","), example.join(",")].join("\n");
};

>>>>>>> 93b199770ad6bdfb6dd2756c9afae9a1983d3fde
