// Function to get the correct image URL based on environment
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  // Get the base URL from environment variable
  const baseUrl = import.meta.env.VITE_API_URL || 'https://mobile-app-2-s9az.onrender.com';
  
  // If the image path already includes the base URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Remove any leading slash from imagePath
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  // Combine base URL with image path
  return `${baseUrl}/${cleanPath}`;
};
