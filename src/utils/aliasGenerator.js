/**
 * Create a URL-safe slug for a player's display name
 */
export const createPlayerSlug = (fullName) => {
return removeDiacritics(String(fullName || ''))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '');
};

/**
 * Generate alias objects for a player
 * Returns array of objects suitable for Alias.create({ alias_text, ... })
 */
export const generatePlayerAliases = (player) => {
const name = player?.display_name || player?.name || player?.full_name || '';
  if (!name) return [];
  const variants = new Set();
  const cleaned = name.trim();
  variants.add(cleaned);
  variants.add(cleaned.toLowerCase());
  variants.add(cleaned.toUpperCase());
  const noDiacritics = removeDiacritics(cleaned);
  variants.add(noDiacritics);
  variants.add(noDiacritics.toLowerCase());
  const parts = cleaned.split(/\s+/);
  if (parts.length >= 2) {
    const first = parts[0];
    const last = parts[parts.length - 1];
    variants.add(`${last}, ${first}`);
    variants.add(`${first[0]}. ${last}`);
    variants.add(`${first} ${last[0]}.`);
    variants.add(`${first} ${last}`);
variants.add(cleaned.replace(/\s+/g, '-'));
    variants.add(cleaned.replace(/-/g, ' '));
  }
  variants.delete('');
  return Array.from(variants).map((alias) => ({ alias_text: alias }));
};

const removeDiacritics = (text) =>
String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
