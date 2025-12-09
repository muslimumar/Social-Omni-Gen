import React, { useState, useEffect } from 'react';

// Local interface for AI Studio to avoid global type conflicts
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);

  // Helper to safely access aistudio from window
  const getAiStudio = (): AIStudio | undefined => {
    return (window as unknown as { aistudio?: AIStudio }).aistudio;
  };

  const checkKey = async () => {
    setChecking(true);
    const aistudio = getAiStudio();
    if (aistudio && aistudio.hasSelectedApiKey) {
      try {
        const selected = await aistudio.hasSelectedApiKey();
        setHasKey(selected);
        if (selected) {
          onKeySelected();
        }
      } catch (e) {
        console.error("Error checking API key", e);
      }
    }
    setChecking(false);
  };

  useEffect(() => {
    checkKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectKey = async () => {
    const aistudio = getAiStudio();
    if (aistudio && aistudio.openSelectKey) {
      try {
        await aistudio.openSelectKey();
        // Assume success as per instructions
        setHasKey(true);
        onKeySelected();
      } catch (e) {
        console.error("Error selecting key", e);
        // Retry logic could go here if needed
        alert("There was an issue selecting the key. Please try again.");
      }
    } else {
      alert("AI Studio API Key selection is not available in this environment.");
    }
  };

  if (checking) return null;

  if (hasKey) {
    return (
      <div className="flex items-center space-x-2 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
        <span>Pro API Key Active</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-amber-800">High-Quality Image Generation Required</h4>
        <p className="text-xs text-amber-700 mt-1">
          To generate 4K visuals using Gemini 3 Pro, you must select a paid API key from a Google Cloud Project.
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline ml-1 font-medium">
             Billing Documentation
          </a>
        </p>
      </div>
      <button
        onClick={handleSelectKey}
        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm whitespace-nowrap"
      >
        Select API Key
      </button>
    </div>
  );
};

export default ApiKeySelector;