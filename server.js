import express from 'express';
import cors from 'cors';
import { createServer } from 'vite';
import Replicate from 'replicate';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 10000;
const __dirname = dirname(fileURLToPath(import.meta.url));

// Configure CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// IMPORTANT: API endpoints must be defined BEFORE Vite middleware
app.post('/api/predictions', async (req, res) => {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN is not configured');
    }

    if (!req.body.prompt) {
      throw new Error('No prompt provided');
    }

    console.log('Received prompt:', req.body.prompt);
    
    const prediction = await replicate.run(
      "google/imagen-3",
      {
        input: {
          aspect_ratio: "1:1",
          prompt: req.body.prompt,
          negative_prompt: "nsfw, violence, gore, blood, weapons, inappropriate content, nudity, adult content, offensive symbols, photographic, complex backgrounds, text, letters, numbers, thin lines, detailed lines",
          safety_filter_level: "block_medium_and_above",
          seed: Math.floor(Math.random() * 1000000)
        }
      }
    );
    
    if (!prediction) {
      throw new Error('No prediction result received from Replicate');
    }

    const imageUrl = prediction;
    console.log('Prediction created successfully:', { imageUrl });
    
    res.json({ 
      output: [imageUrl]
    });
  } catch (error) {
    console.error('Error creating prediction:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.stack
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const startServer = async () => {
  try {
    let vite;
    
    // Only create Vite server in development
    if (process.env.NODE_ENV !== 'production') {
      vite = await createServer({
        server: { 
          middlewareMode: true,
          hmr: {
            port: 24678
          }
        }
      });
      app.use(vite.middlewares);
    }

    // Serve static files in production
    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(resolve(__dirname, 'dist')));
      app.get('*', (req, res) => {
        res.sendFile(resolve(__dirname, 'dist', 'index.html'));
      });
    }

    app.listen(port, '0.0.0.0', () => {
      console.log(`Server running at http://localhost:${port}`);
      console.log('API endpoints:');
      console.log(`  - POST http://localhost:${port}/api/predictions`);
      console.log(`  - GET  http://localhost:${port}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();