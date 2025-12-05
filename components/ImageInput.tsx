import React, { useState } from 'react';
import { isBlockedDomain, isValidImageUrl } from '../utils/urlUtils';
import { searchImages } from '../services/geminiService';
import { SearchResult } from '../types';
import { AlertCircle, Link as LinkIcon, Image as ImageIcon, Search, Loader2, Globe } from 'lucide-react';

interface ImageInputProps {
  onImageSubmit: (url: string, source: string) => void;
  isLoading: boolean;
  theme: 'light' | 'dark';
}

const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80",
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80"
];

export const ImageInput: React.FC<ImageInputProps> = ({ onImageSubmit, isLoading, theme }) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'search'>('paste');
  const [url, setUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Styling based on theme for glassmorphism
  const glassClass = theme === 'light' 
    ? 'bg-white/80 border-white/50 text-slate-800' 
    : 'bg-slate-900/60 border-slate-700/50 text-slate-100';
  
  const inputClass = theme === 'light'
    ? 'bg-white/50 border-slate-200 focus:ring-indigo-500 placeholder-slate-500 text-slate-800'
    : 'bg-slate-800/50 border-slate-600 focus:ring-indigo-400 placeholder-slate-400 text-white';

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError("Please enter a URL.");
      return;
    }

    if (!isValidImageUrl(url)) {
      setError("Please enter a valid URL.");
      return;
    }

    if (isBlockedDomain(url)) {
      setError("Social media and stock photo sites are not supported due to access restrictions.");
      return;
    }

    onImageSubmit(url, "Direct Link");
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);
    setSearchResults([]);

    try {
        const results = await searchImages(searchQuery);
        if (results.length === 0) {
            setError("No suitable images found. Try a different query or specific terms like 'public domain'.");
        } else {
            setSearchResults(results);
        }
    } catch (err) {
        setError("Failed to perform search. Please try again.");
    } finally {
        setIsSearching(false);
    }
  };

  const handleSampleClick = (sampleUrl: string) => {
    onImageSubmit(sampleUrl, "Sample Gallery");
  };

  return (
    <div className={`w-full max-w-3xl mx-auto backdrop-blur-xl p-8 rounded-3xl shadow-2xl border transition-all duration-300 ${glassClass}`}>
      
      {/* Tabs */}
      <div className="flex justify-center mb-8 bg-black/5 p-1 rounded-xl w-fit mx-auto backdrop-blur-sm">
        <button
          onClick={() => { setActiveTab('paste'); setError(null); }}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'paste' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          Paste Link
        </button>
        <button
          onClick={() => { setActiveTab('search'); setError(null); }}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'search' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
        >
          <Search size={14} />
          Image Search
        </button>
      </div>

      <div className="text-center mb-6">
        <h2 className={`text-3xl font-bold font-serif mb-2 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
           {activeTab === 'paste' ? 'Analyze an Image' : 'Find Inspiration'}
        </h2>
        <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
          {activeTab === 'paste' 
            ? 'Paste a direct URL to start analyzing visuals.' 
            : 'Search Google for high-quality, open images.'}
        </p>
      </div>

      {/* Paste Mode */}
      {activeTab === 'paste' && (
        <div className="animate-fade-in">
          <form onSubmit={handlePasteSubmit} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LinkIcon className={`h-5 w-5 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`} />
              </div>
              <input
                type="url"
                className={`block w-full pl-10 pr-3 py-4 border rounded-xl transition-all ${inputClass}`}
                placeholder="https://example.com/image.jpg"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.01]"
            >
              {isLoading ? 'Verifying...' : 'Analyze Image'}
            </button>
          </form>

            <div className="mt-8 pt-6 border-t border-slate-200/20">
            <p className={`text-center text-xs uppercase tracking-widest mb-4 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>Or try a sample</p>
            <div className="flex gap-4 justify-center">
                {SAMPLE_IMAGES.map((sample, idx) => (
                <button
                    key={idx}
                    type="button"
                    onClick={() => handleSampleClick(sample)}
                    className="group relative w-16 h-16 rounded-xl overflow-hidden ring-2 ring-transparent hover:ring-indigo-500 focus:outline-none focus:ring-indigo-500 transition-all shadow-md hover:shadow-xl"
                >
                    <img src={sample} alt={`Sample ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </button>
                ))}
            </div>
            </div>
        </div>
      )}

      {/* Search Mode */}
      {activeTab === 'search' && (
        <div className="animate-fade-in">
             <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                <input
                    type="text"
                    className={`flex-grow block px-4 py-3 border rounded-xl transition-all ${inputClass}`}
                    placeholder="E.g., Alpine mountains, Cyberpunk city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={isSearching || isLoading}
                />
                <button
                    type="submit"
                    disabled={isSearching || isLoading}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-md transition-colors flex items-center justify-center min-w-[100px]"
                >
                    {isSearching ? <Loader2 className="animate-spin" /> : 'Search'}
                </button>
             </form>

             {/* Search Results Grid */}
             {searchResults.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto p-1 custom-scrollbar">
                    {searchResults.map((res, idx) => (
                        <button
                            key={idx}
                            onClick={() => onImageSubmit(res.url, res.source)}
                            className="group relative aspect-square rounded-lg overflow-hidden border border-slate-200/20 shadow-sm hover:shadow-md hover:ring-2 hover:ring-indigo-500 transition-all text-left"
                        >
                            <img src={res.url} alt={res.title} className="w-full h-full object-cover" 
                                onError={(e) => {
                                    // Hide broken images
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                                <span className="text-white text-xs truncate w-full font-medium">{res.source}</span>
                            </div>
                        </button>
                    ))}
                </div>
             )}
             
             {searchResults.length === 0 && !isSearching && !error && searchQuery && (
                 <div className={`text-center py-8 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                     Enter a topic to search for visual inspiration.
                 </div>
             )}
        </div>
      )}

      {error && (
        <div className="mt-6 flex items-center text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/50">
          <AlertCircle size={16} className="mr-2 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
};
