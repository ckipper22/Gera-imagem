// Converts a File object to a base64 string
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Fetches an image from a URL and converts it to a base64 string
export const urlToBase64 = async (url: string): Promise<string> => {
    // Using a CORS proxy to bypass browser restrictions for fetching images from other domains.
    const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;
    try {
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}. Your URL might be invalid or the server might be blocking requests.`);
        }
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                resolve(reader.result as string);
            };
            reader.onerror = (error) => {
                reject(error);
            };
        });
    } catch (error) {
        console.error("Error converting URL to Base64:", error);
        throw new Error("Não foi possível carregar a imagem da URL. O link pode estar quebrado ou bloqueado. Tente baixar a imagem e fazer o upload do arquivo.");
    }
};

// Triggers a browser download for a base64 image
export const downloadImage = (base64Image: string, fileName: string = 'imagem-gerada.png') => {
  const link = document.createElement('a');
  link.href = base64Image;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};