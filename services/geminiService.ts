
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the GoogleGenerativeAI client with the API key from environment variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Helper function to convert a File object to a base64 string
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const analyzeImage = async (imageFile: File): Promise<{ category: string, description: string }> => {
    const imagePart = await fileToGenerativePart(imageFile);
    const prompt = `Bu görseldeki ürünün kategorisini (giyim, mobilya, ev dekorasyonu, aksesuar, kozmetik arasından) ve kısa bir ürün açıklamasını JSON formatında {"category": "...", "description": "..."} olarak ver. Kategori değeri sadece belirtilen seçeneklerden biri olmalıdır.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts: [imagePart, {text: prompt}] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        category: { type: Type.STRING },
                        description: { type: Type.STRING }
                    },
                    required: ["category", "description"]
                }
            }
        });

        const resultText = response.text.trim();
        const resultJson = JSON.parse(resultText);
        
        return {
            category: resultJson.category || "unknown",
            description: resultJson.description || "A product"
        };
    } catch (error) {
        console.error("Error analyzing image with Gemini:", error);
        throw new Error("Failed to analyze image. Please try again.");
    }
};

export const getSceneForCategory = (category: string): string => {
    const lowerCaseCategory = category.toLowerCase();
    if (lowerCaseCategory.includes("giyim") || lowerCaseCategory.includes("clothing")) {
        return "manken üzerinde, sade stüdyo fonu";
    }
    if (lowerCaseCategory.includes("mobilya") || lowerCaseCategory.includes("furniture")) {
        return "iç mekan, modern ve aydınlık bir odada";
    }
    if (lowerCaseCategory.includes("ev dekorasyonu") || lowerCaseCategory.includes("home decor")) {
        return "şık bir raf, masa veya duvar sahnesinde";
    }
    if (lowerCaseCategory.includes("aksesuar") || lowerCaseCategory.includes("accessory")) {
        return "yakın plan, lüks bir sunum yüzeyinde";
    }
    if (lowerCaseCategory.includes("kozmetik") || lowerCaseCategory.includes("cosmetic")) {
        return "temiz ve minimalist bir stüdyo ortamında, su damlalarıyla";
    }
    return "sade ve aydınlık bir arka plan";
};

export const generateProductImages = async (productDescription: string, sceneDescription: string): Promise<{prompt: string, images: string[]}> => {
    const prompt = `Profesyonel e-ticaret ürün tanıtım fotoğrafı: ${productDescription}, ${sceneDescription} içinde sergileniyor. Yüksek çözünürlük, fotogerçekçi, doğal ve parlak ışıklandırma, e-ticaret kataloğu tarzında.`;

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 4,
                aspectRatio: '1:1',
                outputMimeType: 'image/jpeg'
            }
        });

        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("Image generation failed, no images were returned.");
        }
        
        const base64Images = response.generatedImages.map(img => img.image.imageBytes);
        return { prompt, images: base64Images };

    } catch (error) {
        console.error("Error generating images with Gemini:", error);
        throw new Error("Failed to generate product images. The model may have refused the prompt. Please try a different image.");
    }
};
