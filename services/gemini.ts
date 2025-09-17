// FIX: Use standard module import for @google/genai.
import { GoogleGenAI } from "@google/genai";
import { MarketIndicesData, GroundingSource } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export async function fetchMarketDataFromGemini(): Promise<{ data: MarketIndicesData; sources: GroundingSource[] }> {
    const prompt = `
        Provide the latest, most accurate real-time values for the financial and cryptocurrency market indices corresponding to these JSON keys: gold_future, dxy, btc_dominance, btc_exchange_balance, fear_and_greed, open_interest, liquidations, avg_rsi, altcoin_season_index, eth_gas_price.

        For eth_gas_price, return a JSON object like {"name": "ETH Gas (Fast)", "value": "X Gwei"}.

        Return ONLY a single valid JSON object that conforms to the data structure previously provided, enclosed in a \`\`\`json ... \`\`\` code block. Do not include any other text before or after the JSON block.
        Ensure all values are as current as possible. For large monetary values, use suffixes like 'M' for million and 'B' for billion.
        Example for btc_exchange_balance change_24h_btc: "-1.86K" or "+4.5K".
        Example for 'change' fields (like gold_future): return a number for the percentage change, e.g., -0.13.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        
        const text = response.text.trim();
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
        
        if (!jsonMatch || !jsonMatch[1]) {
            // Fallback for when the model doesn't use a code block
            try {
                const parsed = JSON.parse(text);
                if (parsed.btc_dominance) { // Basic check
                    // FIX: Safely extract and transform grounding sources, as 'uri' is optional.
                    const sources: GroundingSource[] = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || [])
                        .filter(c => c.web?.uri)
                        .map(c => ({
                            web: {
                                uri: c.web!.uri!,
                                title: c.web!.title || c.web!.uri!,
                            },
                        }));
                    return { data: parsed, sources };
                }
            } catch (e) {
                 throw new Error("Failed to extract or parse JSON from Gemini response.");
            }
            throw new Error("Failed to extract JSON from Gemini response.");
        }
        
        const marketData = JSON.parse(jsonMatch[1]) as MarketIndicesData;
        
        // Basic validation
        if (!marketData.btc_dominance || !marketData.fear_and_greed || !marketData.eth_gas_price) {
             throw new Error("Parsed data is missing required fields.");
        }

        // FIX: Safely extract and transform grounding sources, as 'uri' is optional and the original cast was unsafe.
        const sources: GroundingSource[] = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || [])
            .filter(c => c.web?.uri)
            .map(c => ({
                web: {
                    uri: c.web!.uri!,
                    title: c.web!.title || c.web!.uri!,
                },
            }));

        return { data: marketData, sources };

    } catch (error) {
        console.error('Error fetching market data from Gemini:', error);
        throw error; // Re-throw to be caught by the calling function
    }
}