import React, { useState, useEffect } from 'react';
import { ImageInput } from './components/ImageInput';
import { ConfigPanel } from './components/ConfigPanel';
import { ResultsView } from './components/ResultsView';
import { AppState, CreativeStyle, VariationCount } from './types';
import { fetchImageAsBase64 } from './utils/imageUtils';
import { analyzeAndGenerate } from './services/geminiService';
import { Camera, Sun, Moon, Info } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    theme: 'light',
    step: 'input',
    imageUrl: '',
    imageSource: null,
    imageDataBase64: null,
    style: CreativeStyle.Simple,
    variationCount: 3,
    customInstruction: '',
    result: null,
    error: null,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Background Styles for the Scenery Theme
  const bgStyle = state.theme === 'light' 
    ? {
        background: 'linear-gradient(to bottom, #bae6fd 0%, #f0f9ff 40%, #dcfce7 100%)', // Day: Sky -> Horizon -> Grass
      }
    : {
        background: 'linear-gradient(to bottom, #0f172a 0%, #1e1b4b 60%, #312e81 100%)', // Night: Deep Space -> Aurora
      };

  const toggleTheme = () => {
    setState(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };

  const handleImageSubmit = async (url: string, source: string) => {
    setIsProcessing(true);
    setState(s => ({ ...s, error: null }));
    
    try {
      const base64 = await fetchImageAsBase64(url);
      setState(s => ({
        ...s,
        imageUrl: url,
        imageSource: source,
        imageDataBase64: base64,
        step: 'processing',
        error: null
      }));
    } catch (err: any) {
      setState(s => ({ ...s, error: err.message || "Failed to load image." }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerate = async () => {
    if (!state.imageDataBase64) return;
    
    setIsProcessing(true);
    setState(s => ({ ...s, error: null }));

    try {
      const result = await analyzeAndGenerate(
        state.imageDataBase64,
        state.style,
        state.variationCount,
        state.customInstruction
      );
      
      setState(s => ({
        ...s,
        result: result,
        step: 'results',
      }));
    } catch (err: any) {
       setState(s => ({ ...s, error: err.message || "Analysis failed." }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setState(prev => ({
      ...prev,
      step: 'input',
      imageUrl: '',
      imageSource: null,
      imageDataBase64: null,
      result: null,
      error: null,
    }));
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-700`} style={bgStyle}>
      
      {/* Decorative Scenery Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          {state.theme === 'light' ? (
              <>
                 <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-yellow-200/40 rounded-full blur-3xl" />
                 <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-green-100/50 to-transparent" />
              </>
          ) : (
              <>
                 <div className="absolute top-10 left-1/4 w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white]" />
                 <div className="absolute top-20 right-1/3 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_15px_white] animate-pulse" />
                 <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[100px]" />
                 <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[100px]" />
              </>
          )}
      </div>

      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${state.theme === 'light' ? 'bg-white/70 border-white/40' : 'bg-slate-900/50 border-white/10'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg shadow-indigo-500/30">
                <Camera className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-2xl font-bold tracking-tight font-serif ${state.theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
              Visionary<span className="text-indigo-500">Scribe</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
             <button 
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-all ${state.theme === 'light' ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-800 text-yellow-300 hover:bg-slate-700'}`}
                title="Toggle Theme"
             >
                 {state.theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
             </button>
             <a href="#" className={`hidden sm:flex items-center gap-1 text-sm font-medium transition-colors ${state.theme === 'light' ? 'text-slate-500 hover:text-indigo-600' : 'text-slate-400 hover:text-white'}`}>
               <Info size={16} /> About
             </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Step 1: Input */}
          {state.step === 'input' && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
                <div className="text-center mb-12 max-w-3xl">
                    <h2 className={`text-5xl md:text-6xl font-bold mb-6 font-serif tracking-tight ${state.theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                        Turn Visuals into <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">Stories</span>
                    </h2>
                    <p className={`text-xl leading-relaxed ${state.theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                        Upload or search for imagery, and let AI weave poetic descriptions, precise analyses, and creative narratives.
                    </p>
                </div>
                <ImageInput 
                  onImageSubmit={handleImageSubmit} 
                  isLoading={isProcessing} 
                  theme={state.theme}
                />
            </div>
          )}

          {/* Step 2: Configure */}
          {state.step === 'processing' && state.imageDataBase64 && (
             <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in py-8">
                <ConfigPanel
                  style={state.style}
                  variationCount={state.variationCount}
                  customInstruction={state.customInstruction}
                  onStyleChange={(s) => setState(prev => ({ ...prev, style: s }))}
                  onCountChange={(c) => setState(prev => ({ ...prev, variationCount: c }))}
                  onCustomInstructionChange={(i) => setState(prev => ({ ...prev, customInstruction: i }))}
                  onGenerate={handleGenerate}
                  isGenerating={isProcessing}
                  imagePreview={state.imageUrl}
                  theme={state.theme}
                />
                 {state.error && (
                  <div className="mt-8 max-w-md text-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-6 py-4 rounded-xl border border-red-100 dark:border-red-900/50 backdrop-blur-md">
                    {state.error}
                  </div>
                )}
             </div>
          )}

          {/* Step 3: Results */}
          {state.step === 'results' && state.result && (
            <ResultsView 
              result={state.result} 
              imageUrl={state.imageUrl}
              imageSource={state.imageSource}
              onReset={handleReset} 
              theme={state.theme}
            />
          )}
        </div>
      </main>

      <footer className={`border-t py-8 relative z-10 backdrop-blur-sm ${state.theme === 'light' ? 'border-slate-200/60 bg-white/40' : 'border-white/5 bg-slate-900/40'}`}>
        <div className={`max-w-7xl mx-auto px-4 text-center text-sm ${state.theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
          &copy; {new Date().getFullYear()} Visionary Scribe. Powered by Google Gemini.
        </div>
      </footer>
      
      {/* Global Animation Styles */}
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: rgba(156, 163, 175, 0.5);
            border-radius: 20px;
        }
      `}</style>
    </div>
  );
};

export default App;
