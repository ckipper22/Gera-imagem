import React from 'react';
import { downloadImage } from '../utils/imageHelpers';
import { DownloadIcon, GenerateMoreIcon } from './icons';

interface ImageGalleryProps {
  loadingAction: 'generate' | 'generateMore' | 'improve' | null;
  images: string[];
  error: string | null;
  numRequested: number;
  onGenerateMore: () => void;
}

const SkeletonLoader: React.FC = () => (
    <div className="flex flex-col gap-2">
        <div className="aspect-square bg-gray-700 rounded-lg animate-pulse"></div>
        <div className="h-10 bg-gray-700 rounded-lg animate-pulse w-full"></div>
    </div>
);

export const ImageGallery: React.FC<ImageGalleryProps> = ({ loadingAction, images, error, numRequested, onGenerateMore }) => {
  const isLoading = loadingAction === 'generate' || loadingAction === 'generateMore';
  const isGeneratingMore = loadingAction === 'generateMore';
  const hasContent = images.length > 0 || isLoading || error;
  const canGenerateMore = !isLoading && images.length > 0;

  const handleDownload = (src: string, index: number) => {
    downloadImage(src, `imagem-gerada-${index + 1}.png`);
  };
  
  return (
    <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-700 min-h-[500px] flex flex-col">
      <div className="flex justify-center items-center mb-6 relative">
          <h2 className="text-2xl font-bold text-center text-gray-100">Resultados</h2>
          {canGenerateMore && (
            <button
                onClick={onGenerateMore}
                disabled={isLoading}
                className="absolute right-0 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-3 rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Gerar mais com a mesma configuração"
            >
                {isGeneratingMore ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Gerando...</span>
                    </>
                ) : (
                    <>
                        <GenerateMoreIcon className="w-5 h-5" />
                        <span>Gerar mais</span>
                    </>
                )}
            </button>
          )}
      </div>

      {error && (
        <div className="my-auto text-center p-4 bg-red-900/50 border border-red-500 rounded-lg">
          <h3 className="font-bold text-red-400">Erro!</h3>
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {!hasContent && (
         <div className="m-auto text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2">Suas imagens geradas aparecerão aqui.</p>
            <p className="text-sm">Configure as opções e clique em "Gerar Imagens".</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((src, index) => (
          <div key={index} className="flex flex-col gap-2">
            <div className="aspect-square rounded-lg overflow-hidden shadow-lg">
                <img
                    src={src}
                    alt={`Imagem gerada ${index + 1}`}
                    className="w-full h-full object-cover"
                />
            </div>
            <button
                onClick={() => handleDownload(src, index)}
                className="w-full bg-gray-700 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
                aria-label={`Baixar imagem ${index + 1}`}
                title="Baixar Imagem"
              >
              <DownloadIcon className="w-5 h-5" />
              <span>Baixar</span>
            </button>
          </div>
        ))}
        {isLoading &&
          Array.from({ length: numRequested }).map((_, index) => (
            <SkeletonLoader key={`skeleton-${index + images.length}`} />
          ))
        }
      </div>
    </div>
  );
};