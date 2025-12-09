import React, { useState } from 'react';
import { GeneratedPost, ImageGenerationResult, AspectRatio, ImageSize } from '../types';
import { LinkedInIcon, TwitterIcon, InstagramIcon, LoadingSpinner } from './Icons';
import { PLATFORM_CONFIG, ASPECT_RATIOS } from '../constants';

interface PostCardProps {
  platformKey: 'linkedin' | 'twitter' | 'instagram';
  post: GeneratedPost;
  imageResult: ImageGenerationResult;
  onRegenerateImage: (platform: string, aspectRatio: AspectRatio) => void;
  imageSize: ImageSize;
}

const PostCard: React.FC<PostCardProps> = ({ 
  platformKey, 
  post, 
  imageResult,
  onRegenerateImage
}) => {
  const config = PLATFORM_CONFIG[platformKey];
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio>(post.suggestedAspectRatio);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    let textToCopy = post.content;
    if (post.hashtags && post.hashtags.length > 0) {
      textToCopy += '\n\n' + post.hashtags.join(' ');
    }
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAspectRatioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRatio = e.target.value as AspectRatio;
    setSelectedAspectRatio(newRatio);
    onRegenerateImage(platformKey, newRatio);
  };

  const Icon = platformKey === 'linkedin' ? LinkedInIcon : 
               platformKey === 'twitter' ? TwitterIcon : InstagramIcon;

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Header */}
      <div className={`px-6 py-4 border-b border-slate-100 flex items-center justify-between ${config.color.replace('bg-', 'bg-opacity-5 ')}`}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${config.color} text-white`}>
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-800">{config.name}</h3>
        </div>
        <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          Draft
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col space-y-6">
        {/* Text Content */}
        <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Copy</h4>
            <div className="bg-slate-50 p-4 rounded-xl text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
              {post.content}
              {post.hashtags && post.hashtags.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200 text-blue-600 font-medium">
                  {post.hashtags.join(' ')}
                </div>
              )}
            </div>
            <button 
              onClick={handleCopy}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center space-x-1"
            >
              {copied ? (
                <span className="text-green-600">Copied!</span>
              ) : (
                <span>Copy to clipboard</span>
              )}
            </button>
        </div>

        {/* Image Content */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Visual</h4>
            <select 
              value={selectedAspectRatio}
              onChange={handleAspectRatioChange}
              disabled={imageResult.loading}
              className="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {ASPECT_RATIOS.map(ratio => (
                <option key={ratio} value={ratio}>{ratio}</option>
              ))}
            </select>
          </div>
          
          <div className="relative w-full bg-slate-100 rounded-xl overflow-hidden min-h-[200px] flex items-center justify-center group">
            {imageResult.loading ? (
              <div className="flex flex-col items-center space-y-2">
                <LoadingSpinner className="w-8 h-8 text-blue-600" />
                <span className="text-xs text-slate-500 animate-pulse">Generating optimal image...</span>
              </div>
            ) : imageResult.error ? (
               <div className="p-4 text-center">
                 <p className="text-red-500 text-xs mb-2">Failed to generate image</p>
                 <button 
                   onClick={() => onRegenerateImage(platformKey, selectedAspectRatio)}
                   className="text-xs bg-white border border-slate-200 px-3 py-1 rounded hover:bg-slate-50"
                 >
                   Retry
                 </button>
               </div>
            ) : imageResult.imageUrl ? (
              <>
                <img 
                  src={imageResult.imageUrl} 
                  alt={`${config.name} generated visual`} 
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <a 
                      href={imageResult.imageUrl} 
                      download={`${platformKey}-post-image.png`}
                      className="bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-medium shadow-lg hover:bg-slate-50 transform translate-y-2 group-hover:translate-y-0 transition-all"
                    >
                      Download
                    </a>
                </div>
              </>
            ) : (
              <div className="text-slate-400 text-xs">Waiting to generate...</div>
            )}
          </div>
          {imageResult.imageUrl && (
             <p className="text-[10px] text-slate-400">
               Using prompt: <span className="italic">{post.imagePrompt.slice(0, 60)}...</span>
             </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
