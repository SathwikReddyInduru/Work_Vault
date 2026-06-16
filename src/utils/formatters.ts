// src/utils/formatters.ts

/**
 * Format an ISO date string to a readable local date.
 * e.g. "2024-03-15T10:30:00.000Z" → "Mar 15, 2024"
 */
export function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return '—';
  try {
    return new Date(isoString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

/**
 * Format an ISO date string to a readable local datetime.
 * e.g. "2024-03-15T10:30:00.000Z" → "Mar 15, 2024, 10:30 AM"
 */
export function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return '—';
  try {
    return new Date(isoString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

/**
 * Format a date as relative time.
 * e.g. "2 hours ago", "3 days ago", "just now"
 */
export function formatRelativeTime(isoString: string | null | undefined): string {
  if (!isoString) return '—';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    const diffWk = Math.floor(diffDay / 7);
    const diffMo = Math.floor(diffDay / 30);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    if (diffWk < 5) return `${diffWk}w ago`;
    if (diffMo < 12) return `${diffMo}mo ago`;
    return formatDate(isoString);
  } catch {
    return '—';
  }
}

/**
 * Extract hostname from a URL for display.
 * e.g. "https://github.com/user/repo" → "github.com"
 */
export function extractHostname(url: string | null | undefined): string {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * Get the favicon URL for a given website URL.
 */
export function getFaviconUrl(url: string | null | undefined): string {
  if (!url) return '';
  try {
    const { origin } = new URL(url);
    return `${origin}/favicon.ico`;
  } catch {
    return '';
  }
}

/**
 * Truncate a string to a maximum length, appending "…" if truncated.
 */
export function truncate(text: string | null | undefined, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + '…';
}

/**
 * Mask a password for display: show first and last char, rest as dots.
 * e.g. "mysecret" → "m••••••t"
 */
export function maskPassword(password: string | null | undefined): string {
  if (!password) return '';
  if (password.length <= 2) return '••••••••';
  return password[0] + '•'.repeat(Math.min(password.length - 2, 8)) + password[password.length - 1];
}

/**
 * Format a file size in bytes to a human-readable string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Capitalize the first letter of a string.
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert snake_case to Title Case.
 * e.g. "in_progress" → "In Progress"
 */
export function snakeToTitle(str: string): string {
  return str
    .split('_')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Format a count with a label, handling singular/plural.
 * e.g. formatCount(1, 'item') → "1 item", formatCount(3, 'item') → "3 items"
 */
export function formatCount(count: number, singular: string, plural?: string): string {
  const label = count === 1 ? singular : (plural ?? singular + 's');
  return `${count} ${label}`;
}
