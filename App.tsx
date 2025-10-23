import React, { useState, useCallback } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { ImageGallery } from './components/ImageGallery';
import { ImageInput } from './components/ImageInput';
import { generateImage, improvePrompt } from './services/geminiService';
import type { Platform, SubjectType, AspectRatio } from './types';
import { GithubIcon, RestartIcon } from './components/icons';

type LoadingAction = 'generate' | 'generateMore' | 'improve' | null;

const App: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [platform, setPlatform] = useState<Platform>('mercadoLivre');
  const [subjectType, setSubjectType] = useState<SubjectType>('object');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [numImages, setNumImages] = useState<number>(1);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [loadingAction, setLoadingAction] = useState<LoadingAction>(null);
  const [error, setError] = useState<string | null>(null);
  
  const initialAppState = {
      sourceImage: null,
      platform: 'mercadoLivre' as Platform,
      subjectType: 'object' as SubjectType,
      aspectRatio: '1:1' as AspectRatio,
      numImages: 1,
      customPrompt: '',
      generatedImages: [],
      loadingAction: null as LoadingAction,
      error: null,
  };

  const handleRestart = () => {
      setSourceImage(initialAppState.sourceImage);
      setPlatform(initialAppState.platform);
      setSubjectType(initialAppState.subjectType);
      setAspectRatio(initialAppState.aspectRatio);
      setNumImages(initialAppState.numImages);
      setCustomPrompt(initialAppState.customPrompt);
      setGeneratedImages(initialAppState.generatedImages);
      setLoadingAction(initialAppState.loadingAction);
      setError(initialAppState.error);
  };


  const generatePrompt = useCallback((includeCustom: boolean = true) => {
    let basePrompt = '';
    switch (platform) {
      case 'mercadoLivre':
        basePrompt = "Gere uma fotografia de produto profissional de alta qualidade, adequada para um mercado de comércio eletrônico como o Mercado Livre. O produto deve ser o foco principal, apresentado em um fundo limpo, neutro ou branco para destacar suas características. Garanta que a iluminação seja brilhante e uniforme, evitando sombras fortes.";
        break;
      case 'facebook':
        basePrompt = "Crie uma imagem de estilo de vida realista e atraente para o Facebook Marketplace. O produto deve ser mostrado em um ambiente natural e de fácil identificação. Se uma pessoa for incluída, ela deve interagir com o produto de forma autêntica. A sensação geral deve ser amigável e confiável.";
        break;
      case 'instagram':
        basePrompt = "Produza uma imagem vibrante e esteticamente agradável para uma postagem no Instagram. O estilo deve ser moderno e envolvente, adequado para um feed de mídia social. Considere o uso de uma composição visualmente interessante, boa iluminação e uma paleta de cores que se destaque. A imagem deve parecer ambiciosa e de alta qualidade.";
        break;
      case 'tiktok':
        basePrompt = "Crie uma imagem de produto que chame a atenção, otimizada para um vídeo curto do TikTok. A imagem deve ser vibrante, de alta energia e visualmente estimulante. Considere um fundo ousado ou um estilo que pareça um frame de um vídeo viral. Se uma pessoa for incluída, ela deve parecer estar se divertindo ou demonstrando o produto de forma rápida e envolvente.";
        break;
    }

    if (subjectType === 'person') {
      basePrompt += " A imagem deve apresentar uma pessoa usando ou interagindo alegremente com o produto.";
    } else {
      basePrompt += " A imagem deve apresentar apenas o produto, sem pessoas.";
    }

    if (customPrompt && includeCustom) {
      basePrompt += ` Adicionalmente: ${customPrompt}.`;
    }
    
    basePrompt += ` A proporção da imagem deve ser ${aspectRatio}.`

    return basePrompt;
  }, [platform, subjectType, customPrompt, aspectRatio]);

  const handleGenerate = async () => {
    if (!sourceImage) {
      setError('Por favor, forneça uma imagem de origem.');
      return;
    }

    setLoadingAction('generate');
    setError(null);
    setGeneratedImages([]);

    const prompt = generatePrompt();
    const imagePromises: Promise<string>[] = [];

    for (let i = 0; i < numImages; i++) {
      imagePromises.push(generateImage(prompt, sourceImage));
    }

    try {
      const results = await Promise.all(imagePromises);
      setGeneratedImages(results);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido ao gerar as imagens.');
    } finally {
      setLoadingAction(null);
    }
  };
  
  const handleGenerateMore = async () => {
    if (!sourceImage) {
      setError('Imagem de origem perdida. Por favor, recomece.');
      return;
    }

    setLoadingAction('generateMore');
    setError(null);
    
    const prompt = generatePrompt();
    const imagePromises: Promise<string>[] = [];

    for (let i = 0; i < numImages; i++) {
      imagePromises.push(generateImage(prompt, sourceImage));
    }

    try {
      const results = await Promise.all(imagePromises);
      setGeneratedImages(prevImages => [...prevImages, ...results]);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido ao gerar mais imagens.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleImprovePrompt = async () => {
    setLoadingAction('improve');
    setError(null);
    try {
        const contextPrompt = generatePrompt(false); // Get context without the custom part
        const newPrompt = await improvePrompt(customPrompt, contextPrompt);
        setCustomPrompt(newPrompt);
    } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Não foi possível melhorar o prompt.');
    } finally {
        setLoadingAction(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <main className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Gerador de Imagens para E-commerce
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Crie imagens de produtos com IA para suas lojas online.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Coluna de Controles */}
          <div className="lg:w-1/3 bg-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-100">Configurações</h2>
            
            <div className="space-y-6">
              <ImageInput sourceImage={sourceImage} onImageReady={setSourceImage} />
              
              {sourceImage && (
                <>
                  <ControlPanel
                    platform={platform}
                    setPlatform={setPlatform}
                    subjectType={subjectType}
                    setSubjectType={setSubjectType}
                    aspectRatio={aspectRatio}
                    setAspectRatio={setAspectRatio}
                    numImages={numImages}
                    setNumImages={setNumImages}
                    customPrompt={customPrompt}
                    setCustomPrompt={setCustomPrompt}
                    onImprovePrompt={handleImprovePrompt}
                    loadingAction={loadingAction}
                  />
                  
                  <div className="flex items-center gap-2">
                    <button
                        onClick={handleRestart}
                        disabled={loadingAction !== null}
                        className="p-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Recomeçar"
                      >
                       <RestartIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleGenerate}
                      disabled={loadingAction !== null || !sourceImage}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center"
                      title={generatedImages.length > 0 ? "Gerar um novo conjunto de imagens (substitui as atuais)" : "Gerar imagens com as configurações atuais"}
                    >
                      {loadingAction === 'generate' ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Gerando...
                        </>
                      ) : (
                        generatedImages.length > 0 ? 'Gerar Nova Geração' : 'Gerar Imagens'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Coluna de Galeria */}
          <div className="lg:w-2/3">
            <ImageGallery
              loadingAction={loadingAction}
              images={generatedImages}
              error={error}
              numRequested={numImages}
              onGenerateMore={handleGenerateMore}
            />
          </div>
        </div>
      </main>
      <footer className="text-center p-4 mt-8 text-gray-500 text-sm">
        <p>Desenvolvido com React, Tailwind CSS e Gemini API.</p>
        <a href="https://github.com/google-gemini-vignettes/gemini-api-cookbook" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-purple-400 transition-colors">
            <GithubIcon className="w-4 h-4" />
            Veja no GitHub
        </a>
      </footer>
    </div>
  );
};

export default App;