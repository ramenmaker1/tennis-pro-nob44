/**
 * Create a URL-safe slug for a player's display name
 */
export const createPlayerSlug = (fullName) => {
<<<<<<< HEAD
  return removeDiacritics(String(fullName || ''))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '');
=======
  return removeDiacritics(String(fullName || ""))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
>>>>>>> 93b199770ad6bdfb6dd2756c9afae9a1983d3fde
};

/**
 * Generate alias objects for a player
 * Returns array of objects suitable for Alias.create({ alias_text, ... })
 */
export const generatePlayerAliases = (player) => {
<<<<<<< HEAD
  const name = player?.display_name || player?.name || player?.full_name || '';
=======
  const name = player?.display_name || player?.name || player?.full_name || "";
>>>>>>> 93b199770ad6bdfb6dd2756c9afae9a1983d3fde
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
<<<<<<< HEAD
    variants.add(cleaned.replace(/\s+/g, '-'));
    variants.add(cleaned.replace(/-/g, ' '));
  }
  variants.delete('');
=======
    variants.add(cleaned.replace(/\s+/g, "-"));
    variants.add(cleaned.replace(/-/g, " "));
  }
  variants.delete("");
>>>>>>> 93b199770ad6bdfb6dd2756c9afae9a1983d3fde
  return Array.from(variants).map((alias) => ({ alias_text: alias }));
};

const removeDiacritics = (text) =>
<<<<<<< HEAD
  String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
=======
  String(text || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");

>>>>>>> 93b199770ad6bdfb6dd2756c9afae9a1983d3fde
