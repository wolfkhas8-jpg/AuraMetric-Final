import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;
    if (!amount) return res.status(400).json({ error: 'Missing amount' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });

    console.log('Payment Intent Created Successfully');
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Payment Intent creation failed' });
  }
});

// Return PayPal client id for client-side initialization
app.get('/paypal-client-id', (req, res) => {
  res.json({ clientId: process.env.PAYPAL_CLIENT_ID || '' });
});

// Save report endpoint
app.post('/save-report', (req, res) => {
  try {
    const { userId, projectData, reportData } = req.body;
    if (!userId || !projectData || !reportData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create user folder if not exists
    const userFolder = path.join('reports', userId);
    if (!fs.existsSync(userFolder)) {
      fs.mkdirSync(userFolder, { recursive: true });
    }

    // Generate project ID and filename
    const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${projectData.name}_${timestamp}.json`;

    // Save report
    const filePath = path.join(userFolder, filename);
    fs.writeFileSync(filePath, JSON.stringify({
      projectId,
      timestamp: new Date().toISOString(),
      projectData,
      reportData
    }, null, 2));

    console.log(`Report saved: ${filePath}`);
    res.json({ 
      success: true, 
      projectId,
      message: 'Report saved successfully',
      filePath: filename
    });
  } catch (err) {
    console.error('Save report error:', err);
    res.status(500).json({ error: 'Failed to save report' });
  }
});

// Generate images endpoint
app.post('/generate-images', async (req, res) => {
  try {
    const { location, specs, style, projectName } = req.body;
    if (!location || !specs || !style) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Generate 2 ultra-realistic architectural renders for a ${specs} project in ${location}, ${style} style. 
Photorealistic, 8k resolution, Architectural visualization, Golden Hour lighting, AuraMetric Aesthetic, luxury materials (Glass, Gold, Marble).
AuraMetric watermark. Show the building from different angles.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // For simplicity, return the text description (in real implementation, you'd parse images)
    // Note: Gemini can generate images, but for this demo, we'll simulate with text
    res.json({
      success: true,
      images: [
        { url: 'https://via.placeholder.com/800x600?text=Render+1', description: text },
        { url: 'https://via.placeholder.com/800x600?text=Render+2', description: text }
      ]
    });
  } catch (err) {
    console.error('Image generation error:', err);
    res.status(500).json({ error: 'Failed to generate images' });
  }
});

// Generate project endpoint (Zone A: images + report)
app.post('/api/generate-project', async (req, res) => {
  try {
    const { userId, projectData, reportData } = req.body;
    if (!userId || !projectData || !reportData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // First generate images
    const imageResult = await generateImagesForProject(projectData);
    
    // Then save report with images
    const reportResult = await saveReport(userId, projectData, { ...reportData, images: imageResult.images });

    res.json({
      success: true,
      images: imageResult.images,
      report: reportResult
    });
  } catch (err) {
    console.error('Generate project error:', err);
    res.status(500).json({ error: 'Failed to generate project' });
  }
});

// Generate asset report endpoint (Zone B: report only)
app.post('/api/generate-asset', async (req, res) => {
  try {
    const { userId, projectData, reportData } = req.body;
    if (!userId || !projectData || !reportData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Save report only (no images for current assets)
    const reportResult = await saveReport(userId, projectData, reportData);

    res.json({
      success: true,
      report: reportResult
    });
  } catch (err) {
    console.error('Generate asset report error:', err);
    res.status(500).json({ error: 'Failed to generate asset report' });
  }
});

// Helper function to generate images
async function generateImagesForProject(projectData) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Generate 2 ultra-realistic architectural renders for a ${projectData.area} sqm, ${projectData.floors} floors, ${projectData.investmentType} project in ${projectData.city}, ${projectData.country}, Luxury Modern style. 
Photorealistic, 8k resolution, Architectural visualization, Golden Hour lighting, AuraMetric Aesthetic, luxury materials (Glass, Gold, Marble).
AuraMetric watermark. Show the building from different angles.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  return {
    images: [
      { url: 'https://via.placeholder.com/800x600?text=Render+1', description: text },
      { url: 'https://via.placeholder.com/800x600?text=Render+2', description: text }
    ]
  };
}

// Helper function to save report
async function saveReport(userId, projectData, reportData) {
  // Create user folder if not exists
  const userFolder = path.join('reports', userId);
  if (!fs.existsSync(userFolder)) {
    fs.mkdirSync(userFolder, { recursive: true });
  }

  // Generate project ID and filename
  const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${projectData.name}_${timestamp}.json`;

  // Save report
  const filePath = path.join(userFolder, filename);
  fs.writeFileSync(filePath, JSON.stringify({
    projectId,
    timestamp: new Date().toISOString(),
    projectData,
    reportData
  }, null, 2));

  console.log(`Report saved: ${filePath}`);
  return {
    projectId,
    message: 'Report saved successfully',
    filePath: filename
  };
}

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
