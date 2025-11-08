export const getUserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
};

export const formatMatchTime = (utcDateString, userTimezone = null) => {
  if (!utcDateString) return '';
  const tz = userTimezone || getUserTimezone();
  const date = new Date(utcDateString);
  try {
    const fmt = new Intl.DateTimeFormat(undefined, {
      timeZone: tz,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    });
    return fmt.format(date);
  } catch {
    return date.toISOString();
  }
};
<<<<<<< HEAD
=======

>>>>>>> 93b199770ad6bdfb6dd2756c9afae9a1983d3fde
