import Replicate from "replicate";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function generateImage() {
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  });

  try {
    const output = await replicate.run(
      "google/imagen-3",
      {
        input: {
          prompt: "Generate a unique, hand-drawn vector-style illustration in the style of minimalist tattoo line art, using bold and thick black strokes only. The artwork should be playful, emotionally expressive, and symbolically rich—like stroke tattoos or flash tattoos. Avoid any shading, gradients, textures, or color fills. Design must be optimized for laser engraving on jewellery: 2D, high contrast, clean outlines, no noise, no background, no text unless instructed. Output must feel raw, iconic, and artistically imperfect—yet refined enough for engraving. Format must resemble black color on white background with visible vector stroke quality.",
          negative_prompt: "nsfw, violence, gore, blood, weapons, inappropriate content, nudity, adult content, offensive symbols, photographic, complex backgrounds, text, letters, numbers"
        }
      }
    );
    console.log("Generated image URL:", output);
  } catch (error) {
    console.error("Error generating image:", error);
  }
}

generateImage();