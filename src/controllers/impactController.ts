import { Request, Response } from 'express';
import { callLLM } from '../services/aiService';
import prisma from '../database/prisma';

export const generateImpactReport = async (req: Request, res: Response) => {
  try {
    const { orderId, items, isLocalSourced } = req.body;

    if (!orderId || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid input. Provide orderId and an array of items.' });
    }

    // Business Logic: Estimate Savings
    // Simple mock logic: each sustainable item saves 0.5kg of plastic and 1.2kg of carbon
    let estimatedPlasticSaved = items.length * 0.5;
    let carbonAvoided = items.length * 1.2;
    let localSourcingImpact = isLocalSourced ? 'Supported local artisans and reduced transit emissions.' : 'Standard global shipping.';

    const systemPrompt = `You are a sustainability communications expert. 
Your task is to take the environmental impact data of a B2B order and write a short, inspiring, human-readable impact statement (2-3 sentences max) that can be sent to the customer.
The output MUST be a JSON object with a single key "impactStatement".
{
  "impactStatement": "string"
}`;

    const userPrompt = `Data:
- Plastic Saved: ${estimatedPlasticSaved} kg
- Carbon Avoided: ${carbonAvoided} kg
- Local Sourcing: ${localSourcingImpact}`;

    // Prompt LLM for structured JSON
    const aiResponse = await callLLM(systemPrompt, userPrompt, 'json_object');

    // Save to Database
    const report = await prisma.orderImpact.create({
      data: {
        orderId,
        estimatedPlasticSaved,
        carbonAvoided,
        localSourcingImpact,
        impactStatement: aiResponse.impactStatement || "Thank you for shopping sustainably.",
        rawAiOutput: aiResponse
      }
    });

    return res.status(201).json({
      message: 'Impact report generated successfully.',
      report
    });

  } catch (error: any) {
    if (error.code === 'P2002') { // Prisma unique constraint violation
         return res.status(409).json({ error: 'Impact report for this orderId already exists.' });
    }
    console.error('Error generating impact report:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getImpactReports = async (req: Request, res: Response) => {
  try {
    const reports = await prisma.orderImpact.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json(reports);
  } catch (error: any) {
    console.error('Error fetching reports:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
