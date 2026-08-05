import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getProductRecommendations = async (userPreferences) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Based on these user preferences: ${userPreferences}
    
    Provide personalized recommendations for Himalayan organic products (honey, dry fruits, herbs, tea, oils, supplements).
    Return a JSON array with 5 product recommendations including:
    - Product name
    - Category
    - Why it's recommended
    - Price range
    
    Return only valid JSON.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return [];
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to get product recommendations');
  }
};

export const generateProductDescription = async (productName, category) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Generate a compelling product description for a Himalayan organic product:
    
    Product Name: ${productName}
    Category: ${category}
    
    The description should be 2-3 sentences, highlight health benefits, origin, and authenticity.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate description');
  }
};

export const generateHealthAdvice = async (query) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Provide brief health advice related to Himalayan organic products for this query: "${query}"
    
    Keep the response to 2-3 sentences and focus on the benefits of natural, organic products.
    Do not provide medical advice.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate advice');
  }
};
