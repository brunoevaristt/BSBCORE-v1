import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export interface ProcessedAudioResult {
  summary: string;
  extractedTransactions: Array<{
    description: string;
    amount: number;
    type: 'revenue' | 'expense';
    frequency: 'recurring' | 'one-time';
    category?: string;
  }>;
  extractedClients: Array<{
    name: string;
    monthlyValue: number;
  }>;
}

const SYSTEM_INSTRUCTION = `
  Você é um analista financeiro da BSB Core. Analise o input (texto ou transcrição) extraindo dados financeiros.
  
  Retorne APENAS um objeto JSON (sem markdown, sem \`\`\`json) com a seguinte estrutura:
  {
    "summary": "Resumo curto em texto do que foi entendido",
    "extractedTransactions": [
       { "description": "Nome da transação", "amount": 0.00, "type": "revenue" | "expense", "frequency": "recurring" | "one-time", "category": "Categoria inferida" }
    ],
    "extractedClients": [
       { "name": "Nome do cliente", "monthlyValue": 0.00 }
    ]
  }

  Regras:
  1. Se mencionar receita, venda, entrada, classifique como type: 'revenue'.
  2. Se mencionar despesa, custo, gasto, saída, type: 'expense'.
  3. Se mencionar "novo cliente" ou "fechamos contrato com X", preencha extractedClients.
  4. Se for recorrente (mensal, assinatura), frequency: 'recurring'. Caso contrário 'one-time'.
  5. Se não houver dados claros, retorne arrays vazios.
`;

export const processTextCommand = async (textInput: string): Promise<ProcessedAudioResult | null> => {
  try {
    const model = 'gemini-3-flash-preview'; 
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [{ text: textInput }]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as ProcessedAudioResult;
  } catch (error) {
    console.error("Error processing text with Gemini:", error);
    throw error;
  }
};

export const processAudioCommand = async (audioBlob: Blob): Promise<ProcessedAudioResult | null> => {
  try {
    // Convert Blob to Base64
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
    });
    reader.readAsDataURL(audioBlob);
    const base64Data = await base64Promise;

    // The previous model gemini-2.5-flash-native-audio-preview-12-2025 caused 404 errors.
    // Switching to gemini-2.0-flash-exp which supports audio input.
    const model = 'gemini-2.0-flash-exp';

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: audioBlob.type || 'audio/webm',
              data: base64Data
            }
          },
          {
             text: "Analise o áudio e extraia os dados financeiros."
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) return null;

    return JSON.parse(text) as ProcessedAudioResult;

  } catch (error) {
    console.error("Error processing audio with Gemini:", error);
    throw error;
  }
};
