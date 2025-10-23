import React from 'react';
import type { Platform, SubjectType, AspectRatio } from '../types';
import { FacebookIcon, InstagramIcon, MercadoLivreIcon, PersonIcon, ProductIcon, SparklesIcon, TikTokIcon } from './icons';

interface ControlPanelProps {
  platform: Platform;
  setPlatform: (platform: Platform) => void;
  subjectType: SubjectType;
  setSubjectType: (subjectType: SubjectType) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (aspectRatio: AspectRatio) => void;
  numImages: number;
  setNumImages: (num: number) => void;
  customPrompt: string;
  setCustomPrompt: (prompt: string) => void;
  onImprovePrompt: () => void;
  loadingAction: 'generate' | 'generateMore' | 'improve' | null;
}

const platforms: { id: Platform, name: string, icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
  { id: 'mercadoLivre', name: 'Mercado Livre', icon: MercadoLivreIcon },
  { id: 'facebook', name: 'Facebook', icon: FacebookIcon },
  { id: 'instagram', name: 'Instagram', icon: InstagramIcon },
  { id: 'tiktok', name: 'TikTok', icon: TikTokIcon },
];

const subjectTypes: { id: SubjectType, name: string, icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
  { id: 'object', name: 'Apenas Objeto', icon: ProductIcon },
  { id: 'person', name: 'Com Pessoa', icon: PersonIcon },
];

const aspectRatios: AspectRatio[] = ['1:1', '16:9', '9:16', '4:3', '3:4'];

const platformDefaults: Record<Platform, AspectRatio> = {
    mercadoLivre: '1:1',
    facebook: '1:1',
    instagram: '1:1',
    tiktok: '9:16',
};


export const ControlPanel: React.FC<ControlPanelProps> = ({
  platform,
  setPlatform,
  subjectType,
  setSubjectType,
  aspectRatio,
  setAspectRatio,
  numImages,
  setNumImages,
  customPrompt,
  setCustomPrompt,
  onImprovePrompt,
  loadingAction,
}) => {
  const handlePlatformSelect = (platformId: Platform) => {
    setPlatform(platformId);
    const defaultAspectRatio = platformDefaults[platformId];
    if (defaultAspectRatio) {
      setAspectRatio(defaultAspectRatio);
    }
  };

  return (
    <div className="space-y-6">
      {/* Platform Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Plataforma</label>
        <div className="grid grid-cols-4 gap-2">
          {platforms.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePlatformSelect(p.id)}
              disabled={loadingAction !== null}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                platform === p.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <p.icon className="w-6 h-6 mb-1" />
              <span className="text-xs text-center">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Subject Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Conteúdo</label>
        <div className="grid grid-cols-2 gap-2">
          {subjectTypes.map((s) => (
            <button
              key={s.id}
              onClick={() => setSubjectType(s.id)}
              disabled={loadingAction !== null}
              className={`flex items-center justify-center p-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                subjectType === s.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <s.icon className="w-5 h-5 mr-2" />
              <span className="text-sm">{s.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Aspect Ratio */}
      <div>
        <label htmlFor="aspect-ratio" className="block text-sm font-medium text-gray-300">Proporção</label>
        <select
          id="aspect-ratio"
          value={aspectRatio}
          onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
          disabled={loadingAction !== null}
          className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm p-2 disabled:opacity-50"
        >
          {aspectRatios.map(ratio => <option key={ratio} value={ratio}>{ratio}</option>)}
        </select>
      </div>

      {/* Number of Images */}
      <div>
        <label htmlFor="num-images" className="block text-sm font-medium text-gray-300">
          Quantidade de Imagens ({numImages})
        </label>
        <input
          id="num-images"
          type="range"
          min="1"
          max="5"
          value={numImages}
          onChange={(e) => setNumImages(Number(e.target.value))}
          disabled={loadingAction !== null}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer mt-2 accent-purple-500 disabled:opacity-50"
        />
      </div>

      {/* Custom Prompt */}
      <div>
        <div className="flex justify-between items-center">
            <label htmlFor="custom-prompt" className="block text-sm font-medium text-gray-300">
            Instruções Adicionais
            </label>
            <button
              onClick={onImprovePrompt}
              disabled={loadingAction !== null}
              className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Melhorar com IA"
            >
              {loadingAction === 'improve' ? (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <SparklesIcon className="w-4 h-4" />
              )}
              <span>Melhorar com IA</span>
            </button>
        </div>
        <textarea
          id="custom-prompt"
          rows={3}
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Ex: fundo de madeira, luz do pôr do sol..."
          disabled={loadingAction !== null}
          className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm p-2 disabled:opacity-50"
        />
      </div>
    </div>
  );
};