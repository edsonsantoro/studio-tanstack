import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export async function analyzeTestimonyForMaterials(text: string): Promise<string[]> {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        console.error("GOOGLE_GENERATIVE_AI_API_KEY is not set");
        return [];
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
      Você é um assistente especializado em identificar menções a materiais de estudo, cursos e livros do evangelista Reinhard Bonnke ou do ministério de Daniel Kolenda (CfaN).
      
      Analise o seguinte testemunho e identifique se o autor menciona ter assistido ou lido algum material específico (ex: "Curso Fé", "Curso do Coração", "Kit do Coração", "Evangelismo por Fogo", etc.).
      
      Retorne APENAS uma lista separada por vírgulas com os nomes dos materiais identificados. Se nenhum for encontrado, retorne "NENHUM".
      
      Testemunho:
      "${text}"
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const resultText = response.text().trim();

        if (resultText === "NENHUM") return [];

        return resultText.split(",").map(item => item.trim());
    } catch (error) {
        console.error("Error analyzing testimony with Gemini:", error);
        return [];
    }
}
