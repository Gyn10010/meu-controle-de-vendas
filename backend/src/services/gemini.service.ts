import { GoogleGenAI } from '@google/genai';

interface Sale {
    clientName: string;
    itemSold: string;
    value: number;
    date: string;
    status: string;
}

export const geminiService = {
    async generateFinancialInsights(sales: Sale[]): Promise<string> {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return 'Chave da API Gemini não configurada. Configure GEMINI_API_KEY no arquivo .env';
        }

        try {
            const ai = new GoogleGenAI({ apiKey });

            const pendingSales = sales.filter(s => s.status === 'pending');
            const totalPending = pendingSales.reduce((acc, s) => acc + s.value, 0);

            const prompt = `
        Analise os seguintes dados de vendas de um pequeno comerciante e forneça 3 conselhos rápidos e profissionais em português.
        
        Total de vendas em aberto: R$ ${totalPending.toFixed(2)}
        Número de clientes com dívidas: ${new Set(pendingSales.map(s => s.clientName)).size}
        Vendas pendentes detalhadas: ${JSON.stringify(pendingSales.map(s => ({
                cliente: s.clientName,
                valor: s.value,
                item: s.itemSold,
                data: s.date
            })))}
        
        Por favor, retorne apenas os 3 conselhos em formato de tópicos curtos.
      `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: prompt,
            });

            return response.text || 'Não foi possível gerar insights.';
        } catch (error) {
            console.error('Error generating insights:', error);
            return 'Erro ao gerar insights. Verifique sua conexão e chave da API.';
        }
    },
};
