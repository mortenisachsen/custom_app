import Replicate from 'replicate';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { prompt } = JSON.parse(event.body);

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No prompt provided' }),
      };
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const prediction = await replicate.run(
      "google/imagen-3",
      {
        input: {
          aspect_ratio: "1:1",
          prompt: prompt,
          negative_prompt: "nsfw, violence, gore, blood, weapons, inappropriate content, nudity, adult content, offensive symbols, photographic, complex backgrounds, text, letters, numbers, thin lines, detailed lines",
          safety_filter_level: "block_medium_and_above",
          seed: Math.floor(Math.random() * 1000000)
        }
      }
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        output: [prediction]
      }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
    };
  }
};