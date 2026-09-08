/**
 * Resolves exactly one active navigation item from a list of items for a given pathname.
 * 
 * Rules:
 * 1. Exact match has highest priority: item.path === currentPathname
 * 2. Prefix/nested match: currentPathname.startsWith(item.path + '/')
 *    If multiple prefix matches exist, the longest (most specific) path wins.
 * 3. Returns null if no item in the list matches currentPathname.
 * 
 * @param {Array<{path: string, label: string}>} items 
 * @param {string} currentPathname 
 * @returns {string|null} The path of the single active item, or null.
 */
export function getActiveNavItemPath(items = [], currentPathname = '') {
  if (!items || items.length === 0 || !currentPathname) {
    return null;
  }

  // 1. Strict exact match check
  const exactMatch = items.find(item => item.path === currentPathname);
  if (exactMatch) {
    return exactMatch.path;
  }

  // 2. Scoped prefix / parent-child match check (item.path must be followed by '/')
  const prefixMatches = items.filter(item => {
    if (!item.path || item.path === '/') return false;
    return currentPathname.startsWith(item.path + '/');
  });

  if (prefixMatches.length > 0) {
    // Sort descending by path length to pick the most specific match
    prefixMatches.sort((a, b) => b.path.length - a.path.length);
    return prefixMatches[0].path;
  }

  return null;
}
