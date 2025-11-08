export const getValidationError = (field, value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  switch (field) {
    case 'percentage': {
      const pct = parseFloat(value);
      if (isNaN(pct) || pct < 0 || pct > 100) {
        return 'Must be between 0 and 100';
      }
      return null;
    }

    case 'ranking': {
      const rank = parseInt(value);
      if (isNaN(rank) || rank < 1 || rank > 5000) {
        return 'Must be between 1 and 5000';
      }
      return null;
    }

    case 'elo_rating': {
      const elo = parseInt(value);
      if (isNaN(elo) || elo < 1000 || elo > 3000) {
        return 'Must be between 1000 and 3000';
      }
      return null;
    }

    case 'birth_year': {
      const year = parseInt(value);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1950 || year > currentYear) {
        return 'Must be between 1950 and ' + currentYear;
      }
      return null;
    }

    case 'height_cm': {
      const height = parseInt(value);
      if (isNaN(height) || height < 140 || height > 230) {
        return 'Must be between 140 and 230 cm';
      }
      return null;
    }

    case 'momentum_rating': {
      const momentum = parseFloat(value);
      if (isNaN(momentum) || momentum < -1 || momentum > 1) {
        return 'Must be between -1 and 1';
      }
      return null;
    }

    default:
      return null;
  }
};

const isEmpty = (value) => value === null || value === undefined || value === '';

export const validateBirthYear = (value) => {
  if (isEmpty(value)) return true;
  const year = parseInt(value, 10);
  const currentYear = new Date().getFullYear();
  return Number.isInteger(year) && year >= 1950 && year <= currentYear;
};

export const validateHeight = (height) => {
  if (isEmpty(height)) return true;
  const h = parseInt(height, 10);
  return Number.isInteger(h) && h >= 140 && h <= 230;
};

export const validateMomentum = (momentum) => {
  if (isEmpty(momentum)) return true;
  const m = parseFloat(momentum);
  return Number.isFinite(m) && m >= -1 && m <= 1;
};

export const generateSlug = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const validatePlayer = (playerData) => {
  const errors = {};
  return errors;
};

// 0–100 % field
export const validatePercentage = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return 'Enter a number';
  if (n < 0 || n > 100) return 'Enter a value between 0 and 100';
  return true;
};

// Tennis ranking (sane bounds; adjust if your app uses others)
export const validateRanking = (v) => {
  const n = Number(v);
  if (!Number.isInteger(n)) return 'Rank must be an integer';
  if (n < 1 || n > 5000) return 'Rank must be between 1 and 5000';
  return true;
};

// Elo rating (typical tennis ELO ranges)
export const validateEloRating = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return 'Enter a number';
  if (n < 200 || n > 3000) return 'Elo must be between 200 and 3000';
  return true;
};
