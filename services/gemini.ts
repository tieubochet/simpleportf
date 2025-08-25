import { GoogleGenAI, Type } from "@google/genai";
import { MarketIndicesData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const marketIndicesSchema = {
    type: Type.OBJECT,
    properties: {
        gold_future: {
            type: Type.OBJECT,
            description: "Data for Gold Future.",
            properties: {
                name: { type: Type.STRING, description: "Should be 'Gold Future'" },
                value: { type: Type.STRING, description: "Current price, e.g., '$2334.30'" },
                change: { type: Type.NUMBER, description: "24h percentage change" },
            },
            required: ['name', 'value', 'change']
        },
        dxy: {
            type: Type.OBJECT,
            description: "Data for US Dollar Index (DXY).",
            properties: {
                name: { type: Type.STRING, description: "Should be 'US Dollar Index'" },
                value: { type: Type.STRING, description: "Current index value, e.g., '105.572'" },
                change: { type: Type.NUMBER, description: "24h percentage change" },
            },
            required: ['name', 'value', 'change']
        },
        btc_dominance: {
            type: Type.OBJECT,
            description: "Data for Bitcoin Dominance.",
            properties: {
                name: { type: Type.STRING, description: "Should be 'Bitcoin Dominance'" },
                value: { type: Type.STRING, description: "Current dominance, e.g., '56.00%'" },
                change: { type: Type.NUMBER, description: "24h percentage change in dominance" },
            },
            required: ['name', 'value', 'change']
        },
        btc_exchange_balance: {
            type: Type.OBJECT,
            description: "Data for BTC Exchange Balance.",
            properties: {
                name: { type: Type.STRING, description: "Should be 'BTC Exchange Balance'" },
                value: { type: Type.STRING, description: "Total BTC on exchanges, e.g., '2.33M'" },
                change_24h_btc: { type: Type.STRING, description: "24h change in BTC amount, e.g., '-1.86K'" },
            },
            required: ['name', 'value', 'change_24h_btc']
        },
        fear_and_greed: {
            type: Type.OBJECT,
            description: "Data for Fear & Greed Index.",
            properties: {
                name: { type: Type.STRING, description: "Should be 'Fear & Greed Index'" },
                value: { type: Type.NUMBER, description: "Current index value" },
                sentiment: { type: Type.STRING, description: "Sentiment, e.g., 'Neutral'" },
            },
            required: ['name', 'value', 'sentiment']
        },
        open_interest: {
            type: Type.OBJECT,
            description: "Data for Open Interest.",
            properties: {
                name: { type: Type.STRING, description: "Should be 'Open Interest'" },
                value: { type: Type.STRING, description: "Total open interest, e.g., '18.31B'" },
                change: { type: Type.NUMBER, description: "24h percentage change" },
            },
            required: ['name', 'value', 'change']
        },
        liquidations: {
            type: Type.OBJECT,
            description: "Data for Liquidations.",
            properties: {
                name: { type: Type.STRING, description: "Should be 'Liquidations'" },
                value: { type: Type.STRING, description: "Total 24h liquidations, e.g., '20.63M'" },
                change: { type: Type.NUMBER, description: "24h percentage change" },
            },
            required: ['name', 'value', 'change']
        },
        avg_rsi: {
            type: Type.OBJECT,
            description: "Data for AVG RSI.",
            properties: {
                name: { type: Type.STRING, description: "Should be 'AVG RSI'" },
                value: { type: Type.NUMBER, description: "Current average RSI value" },
                sentiment: { type: Type.STRING, description: "Sentiment, e.g., 'NEUTRAL'" },
            },
            required: ['name', 'value', 'sentiment']
        },
        altcoin_season_index: {
            type: Type.OBJECT,
            description: "Data for Altcoin Season Index.",
            properties: {
                name: { type: Type.STRING, description: "Should be 'Altcoin Season Index'" },
                value: { type: Type.NUMBER, description: "Current index value" },
                sentiment: { type: Type.STRING, description: "Sentiment, e.g., 'NEUTRAL'" },
            },
            required: ['name', 'value', 'sentiment']
        },
    }
};


export async function fetchMarketDataFromGemini(): Promise<MarketIndicesData> {
    const prompt = `
        Provide the latest, most accurate real-time values for the following financial and cryptocurrency market indices.
        Use your most up-to-date knowledge and browsing capabilities.

        1.  **Gold Future**: Current price in USD and 24h percentage change.
        2.  **US Dollar Index (DXY)**: Current index value and 24h percentage change.
        3.  **Bitcoin Dominance**: Current dominance percentage and its 24h percentage change.
        4.  **BTC Exchange Balance**: Total amount of BTC on exchanges and the 24h change in the amount of BTC (e.g., +1.5K or -2.0K).
        5.  **Fear & Greed Index**: The numerical value and the corresponding sentiment text (e.g., Extreme Fear, Greed).
        6.  **Open Interest**: Total open interest for BTC futures in USD and its 24h percentage change.
        7.  **Liquidations**: Total crypto market liquidations over the last 24 hours in USD and its 24h percentage change.
        8.  **AVG RSI**: Average Relative Strength Index for BTC (typically on a 14-day period) and its sentiment (e.g., Oversold, Neutral, Overbought).
        9.  **Altcoin Season Index**: The numerical value (0-100) and its sentiment (e.g., Bitcoin Season, Altcoin Season).

        Return the data in the specified JSON format. Ensure all values are as current as possible.
        For large monetary values like open interest, liquidations, or BTC balance, use suffixes like 'M' for million and 'B' for billion.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: marketIndicesSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const marketData = JSON.parse(jsonText) as MarketIndicesData;
        
        // Basic validation
        if (!marketData.btc_dominance || !marketData.fear_and_greed) {
             throw new Error("Parsed data is missing required fields.");
        }

        return marketData;

    } catch (error) {
        console.error('Error fetching market data from Gemini:', error);
        throw error; // Re-throw to be caught by the calling function
    }
}
