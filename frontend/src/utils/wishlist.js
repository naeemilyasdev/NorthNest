const WISHLIST_KEY = 'wishlist';

const normalizeWishlist = (items) => {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item) => item != null)
    .map((item) => String(item));
};

export const getWishlist = () => {
  try {
    return normalizeWishlist(JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]'));
  } catch {
    return [];
  }
};

export const setWishlist = (items) => {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(normalizeWishlist(items)));
};

export const toggleWishlist = (id) => {
  const nextId = id == null ? '' : String(id);
  const current = getWishlist();
  const next = current.includes(nextId)
    ? current.filter((item) => item !== nextId)
    : [...current, nextId];

  setWishlist(next);
  return next;
};

export const clearWishlist = () => {
  localStorage.removeItem(WISHLIST_KEY);
};

export const removeFromWishlist = (id) => {
  const nextId = id == null ? '' : String(id);
  const next = getWishlist().filter((item) => item !== nextId);
  setWishlist(next);
  return next;
};

export const isInWishlist = (id) => {
  const nextId = id == null ? '' : String(id);
  return getWishlist().includes(nextId);
};