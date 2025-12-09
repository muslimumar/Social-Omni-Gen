import React, { useState, useRef } from 'react';
import { Tone, ImageSize, AppState, AspectRatio } from './types';
import { generateSocialText, generateSocialImage } from './services/gemini';
import { TONES, IMAGE_SIZES, DEFAULT_TONE, DEFAULT_IMAGE_SIZE } from './constants';
import PostCard from './components/PostCard';
import ApiKeySelector from './components/ApiKeySelector';
import { MagicIcon, LoadingSpinner } from './components/Icons';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    idea: '',
    tone: DEFAULT_TONE,
    imageSize: DEFAULT_IMAGE_SIZE,
    results: null,
    generatedImages: {},
    isGeneratingText: false,
    isGeneratingImages: false,
    error: null,
  });

  const [hasApiKey, setHasApiKey] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!state.idea.trim()) return;
    
    setState(prev => ({ ...prev, isGeneratingText: true, error: null, results: null, generatedImages: {} }));

    try {
      // 1. Generate Text Content
      const results = await generateSocialText(state.idea, state.tone);
      
      setState(prev => ({ 
        ...prev, 
        results, 
        isGeneratingText: false,
        // Initialize loading states for images
        generatedImages: {
          linkedin: { platform: 'linkedin', imageUrl: '', loading: true },
          twitter: { platform: 'twitter', imageUrl: '', loading: true },
          instagram: { platform: 'instagram', imageUrl: '', loading: true },
        }
      }));

      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

      // 2. Trigger Image Generations in Parallel
      const platforms = ['linkedin', 'twitter', 'instagram'] as const;
      
      // We fire and forget individually to update UI progressively
      platforms.forEach(platform => {
        const post = results[platform];
        generateImageForPlatform(platform, post.imagePrompt, post.suggestedAspectRatio, state.imageSize);
      });

    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isGeneratingText: false, 
        error: err.message || "Something went wrong. Please try again." 
      }));
    }
  };

  const generateImageForPlatform = async (
    platform: string, 
    prompt: string, 
    aspectRatio: AspectRatio,
    size: ImageSize
  ) => {
    setState(prev => ({
      ...prev,
      generatedImages: {
        ...prev.generatedImages,
        [platform]: { platform, imageUrl: '', loading: true, error: undefined }
      }
    }));

    try {
      const imageUrl = await generateSocialImage(prompt, aspectRatio, size);
      setState(prev => ({
        ...prev,
        generatedImages: {
          ...prev.generatedImages,
          [platform]: { platform, imageUrl, loading: false }
        }
      }));
    } catch (error) {
      console.error(`Failed to generate image for ${platform}`, error);
      setState(prev => ({
        ...prev,
        generatedImages: {
          ...prev.generatedImages,
          [platform]: { platform, imageUrl: '', loading: false, error: 'Failed' }
        }
      }));
    }
  };

  const handleRegenerateImage = (platform: string, newAspectRatio: AspectRatio) => {
    if (!state.results) return;
    const post = state.results[platform as keyof typeof state.results];
    generateImageForPlatform(platform, post.imagePrompt, newAspectRatio, state.imageSize);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-10">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
            <MagicIcon className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Social Omni-Gen</h1>
        </div>
        <ApiKeySelector onKeySelected={() => setHasApiKey(true)} />
      </div>

      {/* Main Input Card */}
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 mb-12">
        <div className="space-y-8">
          
          {/* Idea Input */}
          <div className="space-y-3">
            <label htmlFor="idea" className="block text-sm font-semibold text-slate-700 ml-1">
              What do you want to post about?
            </label>
            <textarea
              id="idea"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800 placeholder:text-slate-400 resize-none text-lg"
              placeholder="e.g. Launching a new eco-friendly coffee mug line..."
              value={state.idea}
              onChange={(e) => setState(prev => ({ ...prev, idea: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Tone Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700 ml-1">Tone of Voice</label>
              <div className="grid grid-cols-3 gap-3">
                {TONES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setState(prev => ({ ...prev, tone: t }))}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                      state.tone === t
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Resolution */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700 ml-1">Image Quality</label>
              <div className="grid grid-cols-3 gap-3">
                {IMAGE_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setState(prev => ({ ...prev, imageSize: size }))}
                    disabled={!hasApiKey && size !== ImageSize.SIZE_1K} // Enforce API Key requirement visually
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                      state.imageSize === size
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {!hasApiKey && (
                  <p className="text-[10px] text-amber-600 ml-1">
                    * Select API key to unlock 2K & 4K
                  </p>
              )}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={state.isGeneratingText || !state.idea.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg font-semibold py-4 rounded-xl shadow-lg shadow-blue-600/20 transform transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {state.isGeneratingText ? (
              <>
                <LoadingSpinner className="w-6 h-6" />
                <span>Drafting Content...</span>
              </>
            ) : (
              <>
                <MagicIcon className="w-6 h-6" />
                <span>Generate Campaign</span>
              </>
            )}
          </button>

           {state.error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
              {state.error}
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {state.results && (
        <div ref={resultsRef} className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 pb-20">
          <PostCard
            platformKey="linkedin"
            post={state.results.linkedin}
            imageResult={state.generatedImages.linkedin}
            onRegenerateImage={handleRegenerateImage}
            imageSize={state.imageSize}
          />
          <PostCard
            platformKey="twitter"
            post={state.results.twitter}
            imageResult={state.generatedImages.twitter}
            onRegenerateImage={handleRegenerateImage}
            imageSize={state.imageSize}
          />
          <PostCard
            platformKey="instagram"
            post={state.results.instagram}
            imageResult={state.generatedImages.instagram}
            onRegenerateImage={handleRegenerateImage}
            imageSize={state.imageSize}
          />
        </div>
      )}
    </div>
  );
};

export default App;
