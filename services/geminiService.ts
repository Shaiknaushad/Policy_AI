
import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        decision: {
            type: Type.STRING,
            description: "The final decision: 'Approved', 'Rejected', or 'Further Review Required'.",
            enum: ['Approved', 'Rejected', 'Further Review Required']
        },
        amount: {
            type: Type.NUMBER,
            description: "The approved payout amount in INR. Should be 0 if the claim is rejected."
        },
        justification: {
            type: Type.ARRAY,
            description: "A list of reasons for the decision, mapping back to specific clauses from the document.",
            items: {
                type: Type.OBJECT,
                properties: {
                    clause: {
                        type: Type.STRING,
                        description: "The identifier of the clause, e.g., 'Clause 3.1'."
                    },
                    text: {
                        type: Type.STRING,
                        description: "The full text of the relevant clause from the document."
                    },
                    reasoning: {
                        type: Type.STRING,
                        description: "A clear explanation of how this clause applies to the user's query and supports the overall decision."
                    }
                },
                required: ["clause", "text", "reasoning"],
            }
        }
    },
    required: ["decision", "amount", "justification"]
};

export const analyzeQuery = async (query: string, documents: string): Promise<AnalysisResult> => {
    const model = "gemini-2.5-flash";

    const systemInstruction = `You are a highly intelligent and meticulous insurance claim processing AI. Your task is to analyze a user's claim query against a provided insurance policy document.

    Follow these steps precisely:
    1.  Thoroughly analyze the user's query to extract key information like age, medical procedure, location, and policy duration.
    2.  Carefully scan the entire provided insurance policy document to find all clauses relevant to the extracted information.
    3.  Evaluate the claim against each relevant clause to determine if the conditions are met.
    4.  Synthesize your findings into a final decision ('Approved' or 'Rejected').
    5.  If approved, calculate the payout amount based on the rules in the policy document (e.g., coverage limits, co-payments). If rejected, the amount must be 0.
    6.  Provide a detailed justification for your decision, citing each specific clause number, its text, and how it applies to the query.
    7.  You MUST format your entire output as a single, valid JSON object that adheres to the provided schema. Do not output any text before or after the JSON object.`;

    const contents = `
      Please analyze the following claim query based on the provided policy document.

      **Claim Query:**
      "${query}"

      **Policy Document:**
      ---
      ${documents}
      ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.1,
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText) as AnalysisResult;
        
        // Basic validation
        if (!result.decision || !result.justification) {
            throw new Error("Malformed response from AI. Missing required fields.");
        }

        return result;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error && error.message.includes('JSON')) {
             throw new Error("Failed to parse the analysis from the AI. The AI may have returned an invalid format.");
        }
        throw new Error("An error occurred while communicating with the AI analysis service.");
    }
};
