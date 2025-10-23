import { GoogleGenAI, Modality } from "@google/genai";

// Helper to extract base64 data from a data URL
const getBase64Data = (dataUrl: string): string => {
    const parts = dataUrl.split(',');
    if (parts.length !== 2) {
        throw new Error('Invalid data URL');
    }
    return parts[1];
};

// Helper to extract MIME type from a data URL
const getMimeType = (dataUrl: string): string => {
    const match = dataUrl.match(/^data:(.*?);base64,/);
    if (!match || match.length < 2) {
        throw new Error('Could not extract MIME type from data URL');
    }
    return match[1];
};

export const generateImage = async (
  prompt: string,
  sourceImageBase64: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("A variável de ambiente API_KEY não está definida.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePart = {
    inlineData: {
      data: getBase64Data(sourceImageBase64),
      mimeType: getMimeType(sourceImageBase64),
    },
  };

  const textPart = {
    text: prompt,
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [imagePart, textPart] },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  // Check for prompt feedback and safety blocks
  if (response.promptFeedback?.blockReason) {
    throw new Error(
      `Sua solicitação foi bloqueada. Motivo: ${response.promptFeedback.blockReason}. Por favor, ajuste a imagem ou o texto.`
    );
  }

  if (!response.candidates || response.candidates.length === 0) {
    throw new Error("Nenhuma imagem foi gerada. A resposta do modelo estava vazia, possivelmente devido a filtros de segurança de conteúdo.");
  }

  const candidate = response.candidates[0];

  if (candidate.finishReason && candidate.finishReason !== 'STOP') {
    let errorMessage = `A geração de imagem não foi concluída. Motivo: ${candidate.finishReason}.`;
    
    switch (candidate.finishReason) {
        case 'SAFETY':
            errorMessage = 'A imagem não pôde ser gerada porque o resultado violaria nossa política de segurança. Tente ajustar seu prompt ou imagem de origem.';
            break;
        case 'RECITATION':
             errorMessage = 'A geração foi interrompida para evitar a repetição de conteúdo protegido. Por favor, modifique seu prompt.';
             break;
        case 'NO_IMAGE':
            errorMessage = 'A IA não conseguiu criar uma imagem com base na sua solicitação. Isso pode acontecer com prompts ou imagens muito específicas ou complexas. Tente ser mais geral ou usar uma imagem de origem diferente.';
            break;
        default:
             errorMessage = `A geração de imagem falhou por um motivo inesperado (${candidate.finishReason}). Por favor, tente novamente.`;
    }
    throw new Error(errorMessage);
  }

  if (!candidate.content || !candidate.content.parts) {
      throw new Error("A resposta não continha conteúdo de imagem. Isso pode ser devido a políticas de segurança.");
  }


  for (const part of candidate.content.parts) {
    if (part.inlineData) {
      const base64ImageBytes: string = part.inlineData.data;
      const mimeType = part.inlineData.mimeType;
      return `data:${mimeType};base64,${base64ImageBytes}`;
    }
  }

  throw new Error("Nenhuma imagem foi encontrada na resposta da API. A resposta pode ter sido bloqueada por políticas de segurança.");
};


export const improvePrompt = async (
    currentPrompt: string,
    context: string
): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("A variável de ambiente API_KEY não está definida.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const systemInstruction = `Você é um assistente de IA especialista em criar prompts para geração de imagens. Sua tarefa é melhorar o prompt do usuário.
    - O contexto geral é: "${context}".
    - O usuário forneceu as seguintes instruções adicionais: "${currentPrompt}".
    - Reescreva e expanda as instruções do usuário para serem mais descritivas, vívidas e detalhadas, incorporando o contexto.
    - Retorne APENAS o texto do prompt melhorado, sem nenhuma introdução ou explicação.
    - Se o prompt do usuário estiver vazio, crie um prompt criativo com base apenas no contexto.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: systemInstruction,
    });
    
    return response.text.trim();
};