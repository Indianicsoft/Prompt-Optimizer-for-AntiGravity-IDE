// Shared Utility Functions — single source of truth for common helpers

/**
 * Safely escape user-supplied text before injecting into HTML template literals.
 * Prevents stored XSS from prompt titles, AI output, user display names, etc.
 */
export function escapeHtml(text) {
  if (text == null) return '';
  const div = document.createElement('div');
  div.innerText = String(text);
  return div.innerHTML;
}

/**
 * Format an ISO date string into a human-readable label.
 * @param {string} isoString
 * @param {object} [options] — Intl.DateTimeFormat options
 * @returns {string}
 */
export function formatDate(isoString, options = { month: 'short', day: 'numeric' }) {
  if (!isoString) return 'Recent';
  try {
    return new Date(isoString).toLocaleDateString(undefined, options);
  } catch {
    return 'Recent';
  }
}

/**
 * Generate a unique ID with a given prefix.
 * @param {string} prefix - e.g. 'p', 'v', 't'
 * @returns {string}
 */
export function generateId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

/**
 * Return the correct CSS badge class name based on a numeric score (0–100).
 * @param {number} score
 * @returns {string} CSS class name
 */
export function getScoreClass(score) {
  if (score < 55) return 'badge-danger';
  if (score < 80) return 'badge-warning';
  return 'badge-success';
}

/**
 * Sanitize a string for use as a filename slug.
 * @param {string} title
 * @param {number} [maxLength=30]
 * @returns {string}
 */
export function toFileSlug(title, maxLength = 30) {
  return (title || 'prompt')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .substring(0, maxLength);
}
