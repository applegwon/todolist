/**
 * @param {'info'|'warn'|'error'} level
 * @param {string} message
 * @param {object} meta
 */
function log(level, message, meta = {}) {
  const tag = `[${level.toUpperCase()}]`;
  const hasMetaKeys = Object.keys(meta).length > 0;

  if (level === 'error') {
    hasMetaKeys
      ? console.error(tag, message, meta)
      : console.error(tag, message);
  } else if (level === 'warn') {
    hasMetaKeys
      ? console.warn(tag, message, meta)
      : console.warn(tag, message);
  } else {
    hasMetaKeys
      ? console.log(tag, message, meta)
      : console.log(tag, message);
  }
}

module.exports = { log };
