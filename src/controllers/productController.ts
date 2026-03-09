import { Request, Response } from 'express';
import { callLLM } from '../services/aiService';
import prisma from '../database/prisma';

export const categorizeProduct = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required.' });
    }

    const systemPrompt = `You are an AI product catalog expert specializing in sustainable and eco-friendly products. 
Your task is to analyze the product details provided and return a JSON object with the following structure:
{
  "primaryCategory": "string (from predefined list: Electronics, Fashion, Home & Kitchen, Health & Beauty, Other)",
  "subCategory": "string (a descriptive sub-category)",
  "seoTags": ["string", "string"], // 5-10 SEO optimization tags
  "sustainabilityTags": ["string", "string"] // E.g., plastic-free, compostable, vegan, recycled
}`;

    const userPrompt = `Product Name: ${name}\nDescription: ${description}`;

    // Prompt LLM for structured JSON
    const aiResponse = await callLLM(systemPrompt, userPrompt, 'json_object');

    // Save to Database
    const product = await prisma.product.create({
      data: {
        name,
        description,
        primaryCategory: aiResponse.primaryCategory,
        subCategory: aiResponse.subCategory,
        seoTags: aiResponse.seoTags || [],
        sustainabilityTags: aiResponse.sustainabilityTags || [],
        rawAiOutput: aiResponse,
      }
    });

    return res.status(201).json({
      message: 'Product categorized successfully.',
      product
    });

  } catch (error: any) {
    console.error('Error categorizing product:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json(products);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
