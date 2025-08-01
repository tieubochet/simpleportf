import { GoogleGenAI, Type } from "@google/genai";
import { Wallet, PriceData, RebalancingSuggestion } from '../types';
import { getAssetMetrics } from '../utils/calculations';

// This function should be in a secure backend in a real-world app.
// For this client-side project, we'll use an environment variable.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // We won't throw an error here to allow the app to function without the AI feature.
  // The UI will handle the case where the API key is missing.
  console.warn("API_KEY environment variable not set. AI Advisor will be disabled.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const suggestionSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "A brief, one or two-sentence summary of the rebalancing recommendation."
        },
        reasoning: {
            type: Type.STRING,
            description: "A more detailed paragraph (3-4 sentences) explaining the rationale behind the suggested changes, focusing on diversification, risk, or potential. Use markdown for formatting if needed."
        },
        suggestions: {
            type: Type.ARRAY,
            description: "A list of assets with their suggested new allocation percentage. The sum of all suggested_percentage should be 100.",
            items: {
                type: Type.OBJECT,
                properties: {
                    symbol: { type: Type.STRING, description: "The uppercase symbol of the cryptocurrency (e.g., 'BTC')." },
                    name: { type: Type.STRING, description: "The name of the cryptocurrency (e.g., 'Bitcoin')." },
                    suggested_percentage: { type: Type.NUMBER, description: "The suggested new allocation percentage for this asset in the portfolio (0-100)." }
                },
                required: ["symbol", "name", "suggested_percentage"]
            }
        }
    },
    required: ["summary", "reasoning", "suggestions"]
};

const buildPrompt = (wallets: Wallet[], prices: PriceData): string | null => {
    const assetValues = new Map<string, { name: string; value: number }>();
    let totalValue = 0;

    wallets.forEach(wallet => {
        wallet.assets.forEach(asset => {
            const price = prices[asset.id]?.usd ?? 0;
            const { marketValue } = getAssetMetrics(asset.transactions, price);

            if (marketValue > 0) {
                const existing = assetValues.get(asset.symbol.toUpperCase());
                const newValue = (existing?.value || 0) + marketValue;
                assetValues.set(asset.symbol.toUpperCase(), { name: asset.name, value: newValue });
            }
        });
    });

    assetValues.forEach(data => totalValue += data.value);

    if (totalValue === 0) {
        return null;
    }

    const portfolioString = Array.from(assetValues.entries()).map(([symbol, data]) => {
        const percentage = (data.value / totalValue) * 100;
        return `- ${data.name} (${symbol}): $${data.value.toFixed(2)} (${percentage.toFixed(2)}%)`;
    }).join('\n');

    return `
My current cryptocurrency portfolio is valued at $${totalValue.toFixed(2)} and is composed of the following assets:
${portfolioString}

Based on this composition, please provide a rebalancing suggestion. Analyze the current allocation for concentration risk and potential for diversification. Your goal is to suggest a more balanced and diversified portfolio. You can suggest reducing allocation for some assets to 0 and introducing new, popular assets if it serves the goal. The total of suggested percentages must be 100.
`;
};

export const getRebalancingSuggestion = async (wallets: Wallet[], prices: PriceData): Promise<RebalancingSuggestion> => {
    if (!ai) {
        throw new Error("AI Advisor is not configured. Please set the API_KEY.");
    }

    const prompt = buildPrompt(wallets, prices);
    if (!prompt) {
        throw new Error("Cannot generate suggestion for an empty or valueless portfolio.");
    }
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: "You are an expert crypto portfolio analyst. Your goal is to provide objective, data-driven rebalancing suggestions to help users achieve a more diversified and risk-managed portfolio. Do not give financial advice. Always base your analysis on the provided portfolio composition. Your tone should be helpful and analytical.",
            responseMimeType: "application/json",
            responseSchema: suggestionSchema,
        },
    });

    const text = response.text.trim();
    if (!text) {
        throw new Error("Received an empty response from the AI Advisor.");
    }

    try {
        // The response text should be a valid JSON string matching the schema
        const suggestion = JSON.parse(text);
        
        // Basic validation
        if (!suggestion.summary || !suggestion.reasoning || !Array.isArray(suggestion.suggestions)) {
             throw new Error("AI response is missing required fields.");
        }
        
        return suggestion as RebalancingSuggestion;
    } catch (e) {
        console.error("Failed to parse AI response:", e, "Raw text:", text);
        throw new Error("The AI Advisor returned a suggestion in an unexpected format.");
    }
};
