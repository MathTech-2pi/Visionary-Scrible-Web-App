export const fetchImageAsBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();
    if (!blob.type.startsWith('image/')) {
      throw new Error('URL does not point to a valid image.');
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error: any) {
    console.error('Image fetch error:', error);
    // Customize error for likely CORS issues
    if (error.message && error.message.includes('Failed to fetch')) {
       throw new Error('CORS Error: Unable to access this image directly. The server hosting the image does not allow external access. Please try an image from a more open source like Wikimedia Commons or Unsplash Source, or a direct file link.');
    }
    throw error;
  }
};
