import React, { useState } from 'react';
import { ChevronRight, ArrowLeft, Loader2, Download } from 'lucide-react';

interface Design {
  imageUrl: string;
  name: string;
  description: string;
}

type Page = 'welcome' | 'theme' | 'loading' | 'results';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('welcome');
  const [theme, setTheme] = useState<string>('');
  const [generatedDesigns, setGeneratedDesigns] = useState<Design[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [logoVisible, setLogoVisible] = useState(false);
  const [customLogoVisible, setCustomLogoVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(false);

  React.useEffect(() => {
    // Start the fade-in sequence
    setTimeout(() => setLogoVisible(true), 100);
    setTimeout(() => setCustomLogoVisible(true), 1000);
    setTimeout(() => setTextVisible(true), 2000);
    setTimeout(() => setButtonVisible(true), 3000);
  }, []);

  const generatePrompt = (theme: string) => {
    return `Generate a unique, hand-drawn vector-style illustration of ${theme} in the style of minimalist tattoo line art, using bold and thick black strokes only. No detailed thin lines. The artwork should be playful, emotionally expressive, and symbolically rich—like stroke tattoos or flash tattoos. Avoid any shading, gradients, textures, or color fills. Design must be optimized for laser engraving on jewellery: 2D, high contrast, clean outlines, no noise, no background, no text unless instructed. Output must feel raw, iconic, and artistically imperfect—yet refined enough for engraving. Format must resemble black color on white background with visible vector stroke quality.`;
  };

  const staticPrompt = "Generate a unique, hand-drawn vector-style illustration in the style of minimalist tattoo line art, using bold and thick black strokes only. The artwork should be playful, emotionally expressive, and symbolically rich—like stroke tattoos or flash tattoos. Avoid any shading, gradients, textures, or color fills. Design must be optimized for laser engraving on jewellery: 2D, high contrast, clean outlines, no noise, no background, no text unless instructed. Output must feel raw, iconic, and artistically imperfect—yet refined enough for engraving. Format must resemble black color on white background with visible vector stroke quality.";

  const generateDesigns = async (useStaticPrompt: boolean = false) => {
    setCurrentPage('loading');
    setError(null);
    
    try {
      const designPromises = Array(3).fill(null).map(async (_, index) => {
        const response = await fetch('/api/predictions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: useStaticPrompt ? staticPrompt : generatePrompt(theme)
          })
        });

        if (!response.ok) {
          throw new Error(`API request failed with status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.output) {
          throw new Error("No output received from the API");
        }

        return {
          imageUrl: data.output[0],
          name: `Custom Design ${index + 1}`,
          description: 'A unique minimalist line art design optimized for jewelry engraving'
        };
      });

      const designs = await Promise.all(designPromises);
      const successfulDesigns = designs.filter((design): design is Design => design !== null);

      if (successfulDesigns.length === 0) {
        throw new Error("Failed to generate any designs. Please try again.");
      }

      setGeneratedDesigns(successfulDesigns);
      setCurrentPage('results');
    } catch (error: any) {
      console.error('Error generating designs:', error);
      setError(error.message);
      setCurrentPage('theme');
    }
  };

  const downloadImage = async (imageUrl: string, name: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${name.toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      setError('Failed to download image');
    }
  };

  const resetApp = () => {
    setCurrentPage('welcome');
    setGeneratedDesigns([]);
    setTheme('');
    setError(null);
  };

  const renderWelcomePage = () => (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full text-center">
        <img 
          src="https://wkkpewzkacdyayvzhgnu.supabase.co/storage/v1/object/public/app-assets/logo/TomWood-Logo-Black-RGB.png"
          alt="Tom Wood"
          className={`mx-auto mb-16 w-48 transition-opacity duration-1000 ${logoVisible ? 'opacity-100' : 'opacity-0'}`}
        />
        <img 
          src="https://wkkpewzkacdyayvzhgnu.supabase.co/storage/v1/object/public/app-assets/logo/custom_logo.png"
          alt="Custom Engraving Designer"
          className={`mx-auto mb-12 w-96 transition-opacity duration-1000 ${customLogoVisible ? 'opacity-100' : 'opacity-0'}`}
        />
        <p className={`text-xs text-charcoal/60 tracking-wide mb-12 transition-opacity duration-1000 ${textVisible ? 'opacity-100' : 'opacity-0'}`}>
          Transform your Tom Wood jewelry into one-of-a-kind pieces with personalized engravings, crafted through visionary prompts by our Founder & Creative Director, Mona Jensen, and cutting-edge AI generated illustration powered by Google Imagen 3.
        </p>
        <div className={`space-y-4 transition-opacity duration-1000 ${buttonVisible ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={() => setCurrentPage('theme')}
            className="btn-primary inline-flex items-center w-full justify-center"
          >
            SET A THEME
            <ChevronRight className="h-5 w-5 ml-2" />
          </button>
          <button
            onClick={() => generateDesigns(true)}
            className="btn-secondary inline-flex items-center w-full justify-center"
          >
            SURPRISE ME
            <ChevronRight className="h-5 w-5 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderThemePage = () => (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full text-center">
        <h1 className="text-4xl tracking-wide mb-8">Set Your Theme</h1>
        <p className="text-charcoal/60 tracking-wide mb-8">
          Enter a single word that captures the essence of your design.
        </p>
        <input
          type="text"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          placeholder="e.g., DOG"
          className="w-full px-6 py-4 mb-6 border border-charcoal/20 text-center text-xl tracking-wider uppercase focus:outline-none focus:border-charcoal transition-colors duration-300"
          maxLength={20}
        />
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => setCurrentPage('welcome')}
            className="btn-secondary flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          <button
            onClick={() => generateDesigns(false)}
            disabled={!theme.trim()}
            className={`btn-primary flex items-center justify-center ${!theme.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            DO THE MAGIC
            <ChevronRight className="h-5 w-5 ml-2" />
          </button>
        </div>
        {error && (
          <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-sm text-red-700">
            <p className="font-normal mb-1 tracking-wide">Error</p>
            <p className="text-sm tracking-wide opacity-80">{error}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderLoadingPage = () => (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-charcoal mx-auto mb-6" />
        <p className="text-lg text-charcoal tracking-wide">Creating your unique designs</p>
        <p className="text-sm text-charcoal/60 mt-2 tracking-wide">This may take a moment</p>
      </div>
    </div>
  );

  const renderResultsPage = () => (
    <div className="min-h-screen bg-cream">
      <div className="max-w-6xl mx-auto p-8 md:p-12">
        <div className="mb-16">
          <h1 className="text-4xl tracking-wide mb-2">Made for You</h1>
          <p className="text-charcoal/60 tracking-wide">
            This design began as a spark of inspiration — now it's ready to become part of your story. <strong className="underline">Make sure you download the image you love</strong>, as it is totally unique and will never be made again. Share your selected image with one of our sales associates, and we'll guide you in finding the perfect style for your uniquely engraved piece.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {generatedDesigns.map((design, index) => (
            <div
              key={index}
              className="bg-white rounded-sm p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="bg-cream rounded-sm mb-6 overflow-hidden">
                <img 
                  src={design.imageUrl} 
                  alt={design.name}
                  className="w-full h-auto"
                />
              </div>
              <button 
                onClick={() => downloadImage(design.imageUrl, design.name)}
                className="btn-primary w-full flex items-center justify-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Design
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={resetApp}
            className="btn-secondary inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Start New Design
          </button>
        </div>
      </div>
    </div>
  );

  switch (currentPage) {
    case 'theme':
      return renderThemePage();
    case 'loading':
      return renderLoadingPage();
    case 'results':
      return renderResultsPage();
    default:
      return renderWelcomePage();
  }
}

export default App;