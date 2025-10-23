import React, { useState, useRef, useCallback, useEffect } from 'react';
import { fileToBase64, urlToBase64 } from '../utils/imageHelpers';
import { UploadIcon, LinkIcon } from './icons';

interface ImageInputProps {
  sourceImage: string | null;
  onImageReady: (base64: string | null) => void;
}

export const ImageInput: React.FC<ImageInputProps> = ({ sourceImage, onImageReady }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sourceImage === null) {
      setPreview(null);
      setImageUrl('');
      setError(null);
      // Reset file input value
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [sourceImage]);


  const processImage = useCallback(async (processor: () => Promise<string>) => {
    setIsLoading(true);
    setError(null);
    try {
      const base64 = await processor();
      setPreview(base64);
      onImageReady(base64);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Falha ao processar imagem.';
      setError(errorMessage);
      setPreview(null);
      onImageReady(null);
    } finally {
      setIsLoading(false);
    }
  }, [onImageReady]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageUrl('');
      processImage(() => fileToBase64(file));
    }
  };

  const handleUrlLoad = () => {
    if (imageUrl) {
        try {
            // Validate URL format
            const url = new URL(imageUrl);
            if (url.protocol !== "http:" && url.protocol !== "https:") {
                throw new Error("URL deve começar com http:// ou https://");
            }
            if (fileInputRef.current) fileInputRef.current.value = '';
            processImage(() => urlToBase64(imageUrl));
        } catch (err) {
            setError("Por favor, insira uma URL válida.");
            onImageReady(null);
        }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">1. Imagem de Origem</label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleUrlLoad(); }}
            placeholder="Ou cole uma URL de imagem"
            className="flex-grow bg-gray-700 border-gray-600 text-white rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm p-2"
            disabled={isLoading}
          />
          <button onClick={handleUrlLoad} disabled={isLoading || !imageUrl} className="p-2 bg-gray-600 rounded-md hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed">
            <LinkIcon className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-xs text-gray-500 my-2">OU</p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
          disabled={isLoading}
        />
        <button
          onClick={handleUploadClick}
          disabled={isLoading}
          className="w-full flex items-center justify-center p-2 border-2 border-dashed border-gray-600 rounded-md text-gray-400 hover:border-purple-500 hover:text-purple-400 transition-colors disabled:opacity-50"
        >
          <UploadIcon className="w-5 h-5 mr-2" />
          <span>Carregar um arquivo</span>
        </button>
      </div>

      {isLoading && <p className="text-center text-purple-400">Carregando imagem...</p>}
      {error && <p className="text-center text-red-400 text-sm">{error}</p>}

      {preview && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Pré-visualização</label>
          <img src={preview} alt="Preview" className="w-full rounded-lg shadow-md" />
        </div>
      )}
    </div>
  );
};