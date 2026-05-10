/**
 * Utility functions for image manipulation
 */

// Load an image from a URL or data URL and return a Promise that resolves with the Image object
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

// Create a composite image with a background and a logo overlay
export const createCompositeImage = async (
  backgroundSrc: string,
  logoSrc: string,
  logoPosition: { x: number; y: number; width: number; height: number }
): Promise<string> => {
  try {
    // Load the images
    const [backgroundImg, logoImg] = await Promise.all([
      loadImage(backgroundSrc),
      loadImage(logoSrc),
    ]);

    // Create canvas at the size of the background
    const canvas = document.createElement('canvas');
    canvas.width = backgroundImg.width;
    canvas.height = backgroundImg.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Draw background
    ctx.drawImage(backgroundImg, 0, 0);
    
    // Draw logo with position and size
    ctx.drawImage(
      logoImg,
      logoPosition.x,
      logoPosition.y,
      logoPosition.width,
      logoPosition.height
    );

    // Return data URL of the composite image
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error creating composite image:', error);
    throw error;
  }
};

// Helper to check if an image is within size limits
export const isImageWithinSizeLimit = (file: File, maxSizeMB: number): boolean => {
  return file.size <= maxSizeMB * 1024 * 1024;
};

// Helper to check if a file is a PNG
export const isPNG = (file: File): boolean => {
  return file.type === 'image/png';
};