import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CreativeStyle, VariationCount, AnalysisResult, SearchResult } from '../types';
import { BLOCKED_DOMAINS } from '../utils/urlUtils';

const getSystemInstruction = () => `
You are a highly perceptive and creative visual analyst. Your goal is to analyze images deeply and generate creative text based on them.
You must be precise in identifying visual elements and versatile in writing styles ranging from simple descriptions to abstract poetry.
`;

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "5-10 descriptive tags related to the image content, mood, and lighting.",
    },
    colors: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "5 dominant hex color codes from the image.",
    },
    visualDetails: {
      type: Type.STRING,
      description: "A concise but detailed paragraph (approx 50-80 words) objectively describing the visual components, composition, and lighting. MUST include hex codes for colors mentioned.",
    },
    creativeOutputs: {
      type: Type.ARRAY,
      description: "A list of creative text variations based on the requested style.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "A short, catchy title for this specific variation." },
          content: { type: Type.STRING, description: "The generated creative text content. MUST include hex codes for colors mentioned." },
        },
        required: ["title", "content"],
      },
    },
  },
  required: ["tags", "colors", "visualDetails", "creativeOutputs"],
};

export const analyzeAndGenerate = async (
  imageBase64: string,
  style: CreativeStyle,
  count: VariationCount,
  customInstruction: string
): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Analyze the attached image.
    
    1. Extract a list of relevant tags.
    2. Extract the main color palette (hex codes).
    3. Write a detailed objective visual description.
    4. Generate exactly ${count} distinct creative text outputs in the style of: "${style}".
       - If the style is 'Poetic', create evocative verses.
       - If 'Simple', focus on clarity and accessibility.
       - If 'Complex', use sophisticated vocabulary and focus on atmosphere and hidden meanings.
       - If 'Caption', make them engaging for social media with emojis.

    ${customInstruction ? `
    [USER CUSTOM INSTRUCTION]
    The user has provided specific guidance for this analysis: "${customInstruction}"
    Please integrate this instruction intelligently into the creative outputs and description style.
    ` : ''}

    [CRITICAL FORMATTING RULE - HEX CODES]
    You MUST identify the specific colors in the image. 
    Whenever you mention a color in the 'visualDetails' or 'creativeOutputs' text (e.g., 'blue sky', 'rustic red brick'), you MUST immediately append the approximate Hex Code for that color in parentheses.
    
    Example format:
    "The bright azure (#007FFF) sky contrasts with the golden (#FFD700) wheat fields."
    
    This rule is mandatory for ALL text generated.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', 
              data: imageBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        systemInstruction: getSystemInstruction(),
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7, 
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini.");

    const result = JSON.parse(text) as AnalysisResult;
    return result;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to analyze image. Please try again.");
  }
};

export const searchImages = async (query: string): Promise<SearchResult[]> => {
    if (!process.env.API_KEY) {
        throw new Error("API Key is missing.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // We ask the model to perform a Google Search and then structure the findings into JSON
    // strictly filtering out blocked domains.
    const prompt = `
    Perform a Google Search to find 5-8 high-quality, publicly accessible image URLs matching the query: "${query}".
    
    [CRITICAL FILTERING RULES]
    1. EXCLUDE all results from these blocked domains: ${BLOCKED_DOMAINS.join(', ')}.
    2. Prefer images from Wikipedia, Wikimedia Commons, Public Domain sites, or open educational resources.
    3. Ensure the URLs are direct image links (ending in .jpg, .png, .webp) if possible, or high-quality source pages.

    Return the result as a strictly formatted JSON object with this schema:
    {
      "images": [
        { "url": "string (the image url)", "title": "string (a short title)", "source": "string (the root domain source)" }
      ]
    }
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                // responseMimeType: "application/json", // Removed because it is not supported with googleSearch
            }
        });

        let text = response.text;
        if (!text) return [];

        // Clean markdown if present to ensure JSON parsing works
        const jsonBlock = text.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonBlock) {
            text = jsonBlock[1];
        } else {
             text = text.replace(/```/g, '').trim();
        }

        const parsed = JSON.parse(text);
        if (parsed.images && Array.isArray(parsed.images)) {
            // Client-side double check to filter blocked domains just in case
            return parsed.images.filter((img: SearchResult) => {
                 try {
                     const hostname = new URL(img.url).hostname.toLowerCase();
                     return !BLOCKED_DOMAINS.some(blocked => hostname.includes(blocked));
                 } catch (e) { return false; }
            });
        }
        return [];
    } catch (error) {
        console.error("Image Search Error:", error);
        throw new Error("Failed to search for images.");
    }
};
