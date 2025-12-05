import React from 'react';
import { AnalysisResult } from '../types';
import { Download, Tag, Palette, Eye, Copy, Check, ExternalLink } from 'lucide-react';

interface ResultsViewProps {
  result: AnalysisResult;
  imageUrl: string;
  imageSource: string | null;
  onReset: () => void;
  theme: 'light' | 'dark';
}

export const ResultsView: React.FC<ResultsViewProps> = ({ result, imageUrl, imageSource, onReset, theme }) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const glassClass = theme === 'light' 
    ? 'bg-white/90 border-white/50' 
    : 'bg-slate-900/80 border-slate-700/50 text-slate-100';

  const cardClass = theme === 'light'
    ? 'bg-white border-slate-100 shadow-sm'
    : 'bg-slate-800/50 border-slate-700 shadow-lg';

  const headingClass = theme === 'light' ? 'text-slate-800' : 'text-white';
  const textClass = theme === 'light' ? 'text-slate-600' : 'text-slate-300';

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownload = () => {
    const content = `
VISIONARY SCRIBE ANALYSIS
=========================
Source: ${imageSource || 'Uploaded Image'}
URL: ${imageUrl}

VISUAL DETAILS
--------------
${result.visualDetails}

TAGS
----
${result.tags.join(', ')}

COLORS
------
${result.colors.join(', ')}

CREATIVE OUTPUTS
----------------
${result.creativeOutputs.map((output, i) => `
[${i + 1}] ${output.title}
${output.content}
`).join('\n')}
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'visionary-scribe-results.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      
      {/* Header Actions */}
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6 backdrop-blur-md p-4 rounded-2xl bg-white/10 border border-white/20">
        <h2 className={`text-3xl font-bold font-serif ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Analysis Results</h2>
        <div className="flex gap-3">
            <button
              onClick={onReset}
              className={`px-4 py-2 font-medium border rounded-lg transition-colors ${theme === 'light' ? 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200' : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-600'}`}
            >
              Analyze Another
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium shadow-sm transition-colors"
            >
              <Download size={18} />
              Download Text
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Image & Meta */}
        <div className="space-y-6">
            <div className={`p-4 rounded-2xl border ${glassClass}`}>
                <div className="relative aspect-auto rounded-xl overflow-hidden mb-4 bg-black/5">
                    <img src={imageUrl} alt="Analyzed" className="w-full h-auto object-contain" />
                </div>
                {imageSource && (
                    <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-slate-200/20">
                        <span className={`font-semibold uppercase tracking-wider ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>Source</span>
                        <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-500 hover:text-indigo-400 truncate max-w-[200px]">
                            <span className="truncate">{imageSource}</span>
                            <ExternalLink size={12} />
                        </a>
                    </div>
                )}
            </div>

             {/* Colors */}
             <div className={`p-6 rounded-2xl border ${glassClass}`}>
                <div className="flex items-center gap-2 mb-4 text-indigo-500 font-bold">
                <Palette size={20} />
                <h3>Palette</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                {result.colors.map((color, idx) => (
                    <div key={idx} className="group relative">
                        <div 
                            className="w-12 h-12 rounded-xl border border-white/20 shadow-lg cursor-help transition-transform hover:scale-110"
                            style={{ backgroundColor: color }}
                        />
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-black/80 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                            {color}
                        </span>
                    </div>
                ))}
                </div>
            </div>

            {/* Tags */}
            <div className={`p-6 rounded-2xl border ${glassClass}`}>
                <div className="flex items-center gap-2 mb-4 text-indigo-500 font-bold">
                <Tag size={20} />
                <h3>Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                {result.tags.map((tag, idx) => (
                    <span key={idx} className={`px-3 py-1.5 text-sm rounded-lg font-medium border ${theme === 'light' ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                    #{tag}
                    </span>
                ))}
                </div>
            </div>
        </div>

        {/* Right Column: Content */}
        <div className="lg:col-span-2 space-y-6">
            
             {/* Visual Details */}
            <div className={`p-6 rounded-2xl border ${glassClass}`}>
                <div className="flex items-center gap-2 mb-3 text-indigo-500 font-bold">
                    <Eye size={20} />
                    <h3>Visual Analysis</h3>
                </div>
                <p className={`leading-relaxed text-justify ${textClass}`}>
                    {result.visualDetails}
                </p>
            </div>

            <h3 className={`text-2xl font-bold font-serif pt-4 flex items-center gap-3 ${headingClass}`}>
                <span className="bg-gradient-to-r from-indigo-500 to-purple-500 h-8 w-1.5 rounded-full"></span>
                Creative Variations
            </h3>
            
            <div className="grid grid-cols-1 gap-6">
            {result.creativeOutputs.map((item, idx) => (
                <div key={idx} className={`p-6 rounded-2xl border transition-all hover:shadow-xl relative group ${cardClass}`}>
                <div className="flex justify-between items-start mb-4">
                    <h4 className={`text-xl font-bold font-serif ${headingClass}`}>{item.title}</h4>
                    <button
                        onClick={() => handleCopy(item.content, idx)}
                        className={`p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${theme === 'light' ? 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50' : 'text-slate-500 hover:text-indigo-400 hover:bg-slate-700'}`}
                        title="Copy to clipboard"
                    >
                        {copiedIndex === idx ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                    </button>
                </div>
                <div className={`leading-relaxed whitespace-pre-line font-serif ${textClass}`}>
                    {item.content}
                </div>
                </div>
            ))}
            </div>
        </div>
      </div>
    </div>
  );
};
