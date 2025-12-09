import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AspectRatio, ImageSize, SocialContentResult } from "../types";

// Initialize the client. We will create a fresh instance in functions to ensure we pick up the latest API key if it changes.
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateSocialText = async (
  idea: string,
  tone: string
): Promise<SocialContentResult> => {
  const ai = getAiClient();
  
  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      linkedin: {
        type: Type.OBJECT,
        properties: {
          content: { type: Type.STRING, description: "The post text body." },
          imagePrompt: { type: Type.STRING, description: "A detailed prompt to generate an image for this post." },
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["content", "imagePrompt"],
      },
      twitter: {
        type: Type.OBJECT,
        properties: {
          content: { type: Type.STRING, description: "The tweet text, short and punchy." },
          imagePrompt: { type: Type.STRING, description: "A detailed prompt to generate an image for this post." },
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["content", "imagePrompt"],
      },
      instagram: {
        type: Type.OBJECT,
        properties: {
          content: { type: Type.STRING, description: "The caption text." },
          imagePrompt: { type: Type.STRING, description: "A detailed prompt to generate an image for this post." },
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["content", "imagePrompt", "hashtags"],
      },
    },
    required: ["linkedin", "twitter", "instagram"],
  };

  const prompt = `
    You are a social media expert.
    Idea: "${idea}"
    Tone: "${tone}"

    Generate 3 drafts:
    1. LinkedIn: Professional, long-form, engaging.
    2. Twitter/X: Short, punchy, under 280 chars.
    3. Instagram: Visual-focused caption with relevant hashtags.

    For each, provide a "content" string and a highly descriptive "imagePrompt" that suits the platform's aesthetic.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text response from Gemini");
    
    // Parse JSON
    const data = JSON.parse(text);

    // Map to our internal type structure
    return {
      linkedin: {
        platform: 'linkedin',
        content: data.linkedin.content,
        imagePrompt: data.linkedin.imagePrompt,
        hashtags: data.linkedin.hashtags || [],
        suggestedAspectRatio: AspectRatio.LANDSCAPE_16_9,
      },
      twitter: {
        platform: 'twitter',
        content: data.twitter.content,
        imagePrompt: data.twitter.imagePrompt,
        hashtags: data.twitter.hashtags || [],
        suggestedAspectRatio: AspectRatio.LANDSCAPE_16_9,
      },
      instagram: {
        platform: 'instagram',
        content: data.instagram.content,
        imagePrompt: data.instagram.imagePrompt,
        hashtags: data.instagram.hashtags || [],
        suggestedAspectRatio: AspectRatio.PORTRAIT_3_4,
      },
    };

  } catch (error) {
    console.error("Error generating text:", error);
    throw error;
  }
};

export const generateSocialImage = async (
  prompt: string,
  aspectRatio: AspectRatio,
  imageSize: ImageSize
): Promise<string> => {
  const ai = getAiClient();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: imageSize,
        },
      },
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};
