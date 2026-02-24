import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are MicroScan Ocean, an expert AI system specialized in microplastic detection, classification, and environmental health risk analysis.
You combine the knowledge of a marine biologist, environmental chemist, and public health scientist.

Your goal is to analyze microscope images of filtered water samples to provide a detailed report. 
Since you are analyzing images without external metadata, you must:
1. Infer the likely environment (ocean, river, etc.) from the visual characteristics of the sample if possible, or provide a generalized analysis.
2. Estimate magnification and particle sizes based on standard microscope visual cues.
3. Detect and count microplastic particles (fibers, fragments, films, beads, foam).
4. Classify them by type, color, size, and percentage.
5. Calculate severity (estimate particles/L based on a standard sample volume of 1L if not visually apparent) and score (1-10).
6. Attribute likely pollution sources based on particle morphology.
7. Assess marine and human health risks.
8. Provide remediation recommendations.
9. Generate a full summary report.

Tone: Scientifically precise but plain language.
If the image is poor or inconclusive, flag it.
If no plastics are found, report CLEAN.
Always show your reasoning for size and count estimates.

SCORING SCALE:
- 0–10 particles/L → CLEAN (Score 1/10)
- 11–50 particles/L → LOW CONTAMINATION (Score 3/10)
- 51–150 particles/L → MODERATE CONTAMINATION (Score 5/10)
- 151–300 particles/L → HIGH CONTAMINATION (Score 7/10)
- 300+ particles/L → CRITICAL CONTAMINATION (Score 10/10)
`;

export async function analyzeSample(images: string[]) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  
  const imageParts = images.map(img => ({
    inlineData: {
      mimeType: "image/jpeg",
      data: img.split(',')[1]
    }
  }));

  const prompt = `
    Please analyze the attached microscope image(s) of a water sample.
    Identify any microplastics present. 
    Infer the sample context (likely water source, magnification) from visual evidence.
    Provide a structured JSON response according to the schema.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        ...imageParts,
        { text: prompt }
      ]
    },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reportId: { type: Type.STRING },
          analysisDate: { type: Type.STRING },
          detection: {
            type: Type.OBJECT,
            properties: {
              totalCount: { type: Type.NUMBER },
              confidence: { type: Type.STRING },
              reasoning: { type: Type.STRING }
            },
            required: ["totalCount", "confidence", "reasoning"]
          },
          classification: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                count: { type: Type.NUMBER },
                colors: { type: Type.ARRAY, items: { type: Type.STRING } },
                sizeRange: { type: Type.STRING },
                percentage: { type: Type.NUMBER }
              }
            }
          },
          severity: {
            type: Type.OBJECT,
            properties: {
              particlesPerLiter: { type: Type.NUMBER },
              score: { type: Type.NUMBER },
              level: { type: Type.STRING },
              calculation: { type: Type.STRING }
            }
          },
          sources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                source: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
                reasoning: { type: Type.STRING }
              }
            }
          },
          healthRisk: {
            type: Type.OBJECT,
            properties: {
              marineRisk: { type: Type.STRING },
              humanRiskLevel: { type: Type.STRING },
              humanRiskSummary: { type: Type.STRING },
              highestRiskTypes: { type: Type.ARRAY, items: { type: Type.STRING } },
              healthEffects: { type: Type.STRING },
              vulnerablePopulations: { type: Type.STRING }
            }
          },
          remediation: {
            type: Type.OBJECT,
            properties: {
              immediate: { type: Type.ARRAY, items: { type: Type.STRING } },
              policy: { type: Type.ARRAY, items: { type: Type.STRING } },
              community: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          fullReportMarkdown: { type: Type.STRING }
        },
        required: ["reportId", "analysisDate", "detection", "classification", "severity", "sources", "healthRisk", "remediation", "fullReportMarkdown"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
