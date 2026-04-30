/**
 * Exclude fields from an object
 * @param {Object} obj
 * @param {string[]} keys
 */
const exclude = (obj, keys) => {
  return Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k)));
};

/**
 * Paginate results
 * @param {number} page
 * @param {number} limit
 */
const getPagination = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return { limit: parseInt(limit), offset };
};

module.exports = { exclude, getPagination };
