import { useState } from 'react';
import './App.css';

const ImagePlaceholderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="error-icon">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch(
        "/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
        {
          headers: {
            Authorization: "Bearer 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",
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ inputs: prompt }),
        }
      );

      if (!response.ok) {
        let errorMessage = `API Error: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // Fallback to text or default error message
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setGeneratedImage(imageUrl);
    } catch (err) {
      console.error("Generation error:", err);
      setError(err.message || "Failed to generate image. The model might be loading—please wait and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Text to Image</h1>
        <p>Transform your imagination into visual reality</p>
      </header>

      <main className="main-content">
        <form onSubmit={handleGenerate} className="input-section">
          <div className="input-wrapper">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic city with flying cars at sunset..."
              className="prompt-input"
              disabled={isGenerating}
            />
            <button 
              type="submit" 
              className={`generate-btn ${isGenerating ? 'generating' : ''}`}
              disabled={isGenerating || !prompt.trim()}
            >
              {isGenerating ? (
                <>
                  <span className="spinner"></span>
                  Generating
                </>
              ) : (
                'Generate'
              )}
            </button>
          </div>
          {error && (
            <div className="error-message animate-fade-in">
              <AlertIcon />
              {typeof error === 'object' && error.error ? error.error : error}
            </div>
          )}
        </form>

        <div className="display-section">
          {generatedImage ? (
            <div className="image-container animate-fade-in">
              <img src={generatedImage} alt={prompt} className="generated-image" />
              <div className="image-overlay">
                <p className="image-prompt">"{prompt}"</p>
              </div>
            </div>
          ) : (
            <div className="empty-state animate-fade-in">
              <ImagePlaceholderIcon />
              <p>Your creation will appear here</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
