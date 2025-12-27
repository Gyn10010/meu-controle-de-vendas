
import { GoogleGenAI } from "@google/genai";
import { Sale } from "../types";

export const getFinancialInsights = async (sales: Sale[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const pendingSales = sales.filter(s => s.status === 'pending');
  const totalPending = pendingSales.reduce((acc, s) => acc + s.value, 0);
  
  const prompt = `
    Analise os seguintes dados de vendas de um pequeno comerciante e forneça 3 conselhos rápidos e profissionais em português.
    
    Total de vendas em aberto: R$ ${totalPending.toFixed(2)}
    Número de clientes com dívidas: ${new Set(pendingSales.map(s => s.clientName)).size}
    Vendas pendentes detalhadas: ${JSON.stringify(pendingSales.map(s => ({ cliente: s.clientName, valor: s.value, item: s.itemSold, data: s.date })))}
    
    Por favor, retorne apenas os 3 conselhos em formato de tópicos curtos.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching insights:", error);
    return "Não foi possível gerar insights no momento. Verifique sua conexão.";
  }
};
