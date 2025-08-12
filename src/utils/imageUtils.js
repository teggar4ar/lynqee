/**
 * imageUtils - Image and caching utilities
 * 
 * Utilities for handling image caching, loading, and optimization.
 * Provides cache-busting and image loading utilities for better UX.
 */

/**
 * Add cache busting parameter to an image URL
 * @param {string} url - Original image URL
 * @param {boolean} force - Force new timestamp even if URL already has parameters
 * @returns {string} URL with cache busting parameter
 */
export const addCacheBuster = (url, force = false) => {
  if (!url) return url;
  
  // If URL already has cache buster and we're not forcing, return as is
  if (!force && (url.includes('?t=') || url.includes('&t='))) {
    return url;
  }
  
  const timestamp = Date.now();
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${timestamp}`;
};

/**
 * Remove cache busting parameters from URL
 * @param {string} url - URL with potential cache busting parameters
 * @returns {string} Clean URL without cache parameters
 */
export const removeCacheBuster = (url) => {
  if (!url) return url;
  
  return url.split('?')[0];
};

/**
 * Preload an image to avoid loading delays
 * @param {string} src - Image source URL
 * @returns {Promise<HTMLImageElement>} Promise that resolves when image is loaded
 */
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    if (!src) {
      reject(new Error('No image source provided'));
      return;
    }
    
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
};

/**
 * Check if an image URL is accessible
 * @param {string} src - Image source URL
 * @returns {Promise<boolean>} Promise that resolves to true if image loads successfully
 */
export const isImageAccessible = async (src) => {
  try {
    await preloadImage(src);
    return true;
  } catch {
    return false;
  }
};

/**
 * Generate a cache-busted avatar URL from a base URL
 * @param {string} baseUrl - Base avatar URL from database
 * @returns {string} Cache-busted URL
 */
export const getCacheBustedAvatarUrl = (baseUrl) => {
  if (!baseUrl) return null;
  
  // If URL already has cache buster, update it with new timestamp
  const cleanUrl = removeCacheBuster(baseUrl);
  return addCacheBuster(cleanUrl, true);
};
