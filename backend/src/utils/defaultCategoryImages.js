/**
 * Default category images from Cloudinary
 * These images are used when a deal is created without images
 * Update these URLs with your actual Cloudinary image URLs
 */

export const defaultCategoryImages = {
  'flower': 'https://res.cloudinary.com/da6h7gmay/image/upload/v1766964555/flower_2_aa53nl.png',
  'edibles': 'https://res.cloudinary.com/da6h7gmay/image/upload/v1766964507/edibles_hcehm8.png',
  'concentrates': 'https://res.cloudinary.com/da6h7gmay/image/upload/v1767722029/concentrates_fbpwtb.png',
  'vapes': 'https://res.cloudinary.com/da6h7gmay/image/upload/v1767722028/vape_vsxl4a.png',
  'topicals': 'https://res.cloudinary.com/da6h7gmay/image/upload/v1766964436/topical_image_fvyxsa.png',
  'pre-roll': 'https://res.cloudinary.com/da6h7gmay/image/upload/v1766964459/pre-roll_kkqvgz.png',
  'tincture': 'https://res.cloudinary.com/da6h7gmay/image/upload/v1766964533/tincture_spfuz8.png',
  'beverage': 'https://res.cloudinary.com/da6h7gmay/image/upload/v1766964452/beverages_image_tvvmmz.png',
  'capsule/pill': 'https://res.cloudinary.com/da6h7gmay/image/upload/v1766964467/capsule_y7shbf.png',
  'other': 'https://res.cloudinary.com/da6h7gmay/image/upload/v1766964475/others_gvdmgl.png',
};

/**
 * Get default image URL for a category
 * @param {string} category - The deal category
 * @returns {string} - Default image URL for the category
 */
export function getDefaultCategoryImage(category) {
  const normalizedCategory = category?.toLowerCase() || 'other';
  return defaultCategoryImages[normalizedCategory] || defaultCategoryImages['other'];
}

/**
 * Ensure deal has at least one image, using default category image if needed
 * @param {string[]|undefined|null} images - Array of image URLs
 * @param {string} category - The deal category
 * @returns {string[]} - Array with at least one image URL
 */
export function ensureDealHasImage(images, category) {
  // If images exist and are not empty, return them
  if (images && Array.isArray(images) && images.length > 0 && images[0]) {
    return images;
  }
  
  // Otherwise, return array with default category image
  return [getDefaultCategoryImage(category)];
}

/**
 * Default dispensary images from Cloudinary
 * These images are used when a dispensary is created without images
 */
export const defaultDispensaryImages = {
  logo: 'https://res.cloudinary.com/da6h7gmay/image/upload/v1766964475/others_gvdmgl.png', // Default logo
  images: ['https://res.cloudinary.com/da6h7gmay/image/upload/v1766964475/others_gvdmgl.png'], // Default images array
};

/**
 * Get default logo URL for dispensary
 * @returns {string} - Default logo URL
 */
export function getDefaultDispensaryLogo() {
  return defaultDispensaryImages.logo;
}

/**
 * Get default images array for dispensary
 * @returns {string[]} - Default images array
 */
export function getDefaultDispensaryImages() {
  return defaultDispensaryImages.images;
}

/**
 * Ensure dispensary has at least one image, using default image if needed
 * @param {string[]|undefined|null} images - Array of image URLs
 * @returns {string[]} - Array with at least one image URL
 */
export function ensureDispensaryHasImages(images) {
  // If images exist and are not empty, return them
  if (images && Array.isArray(images) && images.length > 0 && images[0]) {
    return images;
  }
  
  // Otherwise, return array with default dispensary image
  return getDefaultDispensaryImages();
}

/**
 * Ensure dispensary has a logo, using default logo if needed
 * @param {string|undefined|null} logo - Logo URL
 * @returns {string} - Logo URL (default if none provided)
 */
export function ensureDispensaryHasLogo(logo) {
  // If logo exists and is not empty, return it
  if (logo && logo.trim()) {
    return logo;
  }
  
  // Otherwise, return default logo
  return getDefaultDispensaryLogo();
}

