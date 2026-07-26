const {default: axios} = require('axios');

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9080"

export const clientServer = axios.create({
  baseURL: BASE_URL
});

/**
 * Returns the correct image URL.
 * - If the path is already a full URL (Cloudinary), return as-is.
 * - If it's a legacy local filename, prepend BASE_URL.
 * - If empty/null, return null.
 */
export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BASE_URL}/${path}`;
};