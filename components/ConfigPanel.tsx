import React from 'react';
import { CreativeStyle, VariationCount } from '../types';
import { Sparkles, Hash, MessageSquarePlus } from 'lucide-react';

interface ConfigPanelProps {
  style: CreativeStyle;
  variationCount: VariationCount;
  customInstruction: string;
  onStyleChange: (style: CreativeStyle) => void;
  onCountChange: (count: VariationCount) => void;
  onCustomInstructionChange: (instruction: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  imagePreview: string;
  theme: 'light' | 'dark';
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  style,
  variationCount,
  customInstruction,
  onStyleChange,
  onCountChange,
  onCustomInstructionChange,
  onGenerate,
  isGenerating,
  imagePreview,
  theme
}) => {
  const glassClass = theme === 'light' 
    ? 'bg-white/80 border-white/50' 
    : 'bg-slate-900/70 border-slate-700/50 text-slate-100';

  const headingClass = theme === 'light' ? 'text-slate-800' : 'text-white';
  const subTextClass = theme === 'light' ? 'text-slate-500' : 'text-slate-400';
  const labelClass = theme === 'light' ? 'text-slate-700' : 'text-slate-300';
  const inputBgClass = theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-800/50 border-slate-600 text-white';

  return (
    <div className={`w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 p-8 rounded-3xl shadow-2xl border backdrop-blur-xl animate-fade-in ${glassClass}`}>
      
      {/* Image Preview Side */}
      <div className={`flex flex-col items-center justify-start p-4 rounded-2xl border h-full ${theme === 'light' ? 'bg-slate-50/50 border-slate-200' : 'bg-black/20 border-slate-700'}`}>
        <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 self-start ${subTextClass}`}>Selected Image</h3>
        <div className="relative w-full rounded-xl overflow-hidden shadow-lg bg-black/5" style={{ minHeight: '300px' }}>
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="absolute inset-0 w-full h-full object-contain" 
            />
        </div>
      </div>

      {/* Controls Side */}
      <div className="flex flex-col h-full">
        <div className="mb-8">
          <h2 className={`text-2xl font-bold mb-2 font-serif ${headingClass}`}>Configure Analysis</h2>
          <p className={subTextClass}>Customize how Gemini interprets your image.</p>
        </div>
          
        <div className="space-y-6 flex-grow">
          {/* Style Selection */}
          <div>
            <label className={`flex items-center text-sm font-bold mb-3 ${labelClass}`}>
              <Sparkles size={16} className="mr-2 text-indigo-500" />
              Writing Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.values(CreativeStyle).map((s) => (
                <button
                  key={s}
                  onClick={() => onStyleChange(s)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium border text-left transition-all ${
                    style === s
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500'
                      : `${theme === 'light' ? 'border-slate-200 hover:bg-slate-50' : 'border-slate-600 hover:bg-slate-800'} ${subTextClass}`
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Count Selection */}
          <div>
            <label className={`flex items-center text-sm font-bold mb-3 ${labelClass}`}>
              <Hash size={16} className="mr-2 text-indigo-500" />
              Number of Variations
            </label>
            <div className="flex gap-4">
              {[3, 5, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => onCountChange(num as VariationCount)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                    variationCount === num
                       ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500'
                      : `${theme === 'light' ? 'border-slate-200 hover:bg-slate-50' : 'border-slate-600 hover:bg-slate-800'} ${subTextClass}`
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Instruction Input */}
          <div>
            <label className={`flex items-center text-sm font-bold mb-3 ${labelClass}`}>
              <MessageSquarePlus size={16} className="mr-2 text-indigo-500" />
              Custom Instructions (Optional)
            </label>
            <textarea
              value={customInstruction}
              onChange={(e) => onCustomInstructionChange(e.target.value)}
              placeholder="E.g., 'Describe it like a 19th-century poet' or 'Focus on the emotions of the subjects'"
              className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-slate-400 min-h-[100px] resize-y ${inputBgClass}`}
            />
          </div>
        </div>

        {/* Action Button */}
        <div className={`pt-6 mt-6 border-t ${theme === 'light' ? 'border-slate-100' : 'border-slate-700'}`}>
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/30 disabled:opacity-70 disabled:cursor-wait transition-all flex items-center justify-center gap-2 transform hover:scale-[1.01]"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Creative Content
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
