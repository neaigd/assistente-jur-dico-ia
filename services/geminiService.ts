
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AiSuggestedTask } from '../types';
import { GEMINI_TEXT_MODEL } from '../constants';

export const summarizeTextWithGemini = async (ai: GoogleGenAI, prompt: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API error during summarization:", error);
    throw new Error(`Falha na comunicação com a IA para resumo: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const suggestTasksWithGemini = async (ai: GoogleGenAI, reportContent: string): Promise<AiSuggestedTask[]> => {
  const prompt = `Com base no seguinte relatório de andamentos processuais, sugira uma lista de providências acionáveis para um advogado. Para cada providência, indique uma prioridade (Alta, Média, Baixa) e um prazo sugerido (formato YYYY-MM-DD), se aplicável. Formate cada sugestão como um objeto JSON com as chaves "descricao" (string), "prioridade" (string: "Alta", "Média", ou "Baixa"), e "prazoSugerido" (string: "AAAA-MM-DD" ou null se não aplicável). Retorne uma LISTA desses objetos JSON. Não inclua nenhuma explicação adicional, apenas o array JSON.

Relatório:
${reportContent}

Exemplo de saída JSON esperada:
[
  {"descricao": "Elaborar petição inicial para o processo XXXXX", "prioridade": "Alta", "prazoSugerido": "2024-01-15"},
  {"descricao": "Analisar despacho do processo YYYYY", "prioridade": "Média", "prazoSugerido": null},
  {"descricao": "Agendar reunião com cliente do processo ZZZZZ", "prioridade": "Baixa", "prazoSugerido": "2024-01-10"}
]`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr);

    if (Array.isArray(parsedData)) {
      return parsedData.map((item: any, index: number) => ({
        id: `task-${Date.now()}-${index}`, // Simple unique ID
        descricao: item.descricao || "Descrição não fornecida",
        prioridade: item.prioridade || "Média",
        prazoSugerido: item.prazoSugerido || undefined,
      }));
    } else {
      console.error("Resposta da IA para sugestão de tarefas não é um array:", parsedData);
      throw new Error("Formato de resposta inesperado da IA para sugestão de tarefas.");
    }

  } catch (error) {
    console.error("Gemini API error during task suggestion:", error);
    let errorMessage = `Falha na comunicação com a IA para sugestão de tarefas: ${error instanceof Error ? error.message : String(error)}`;
    if (error instanceof SyntaxError) {
        errorMessage = `Erro ao processar resposta da IA (JSON inválido): ${error.message}. Verifique o console para a resposta crua.`;
        console.error("Raw Gemini response (task suggestion):", (error as any).response?.text || "N/A");
    }
    throw new Error(errorMessage);
  }
};
    