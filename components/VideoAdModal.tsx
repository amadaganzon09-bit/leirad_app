
import React, { useState, useRef } from 'react';
import { X, Upload, Clapperboard, Loader2, Play, AlertCircle, Film, CheckCircle2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { AddToastFunction, ToastType } from '../types';

interface VideoAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  addToast: AddToastFunction;
}

const VideoAdModal: React.FC<VideoAdModalProps> = ({ isOpen, onClose, addToast }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        addToast("Image size should be less than 5MB", ToastType.WARNING);
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
      setGeneratedVideoUrl(null); // Reset previous video if new image selected
    }
  };

  const fileToGenerativePart = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data url prefix (e.g. "data:image/jpeg;base64,")
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleGenerate = async () => {
    if (!imageFile) return;

    // 1. Check API Key Selection
    // Cast window to any to avoid type conflicts with existing global definitions of aistudio
    const aiStudio = (window as any).aistudio;
    
    if (aiStudio) {
      const hasKey = await aiStudio.hasSelectedApiKey();
      if (!hasKey) {
        try {
          await aiStudio.openSelectKey();
          // Race condition check: give it a moment or check again
          const hasKeyNow = await aiStudio.hasSelectedApiKey();
          if (!hasKeyNow) {
             addToast("API Key selection is required to generate videos.", ToastType.WARNING);
             return;
          }
        } catch (e) {
          console.error(e);
          addToast("Failed to select API Key.", ToastType.ERROR);
          return;
        }
      }
    }

    setIsGenerating(true);
    setGeneratedVideoUrl(null);
    setStatusMessage('Initializing Veo model...');

    try {
      // 2. Prepare Input
      const imageBase64 = await fileToGenerativePart(imageFile);
      
      // 3. Initialize Client
      // Note: process.env.API_KEY is injected by the environment after the user selects it via window.aistudio
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      setStatusMessage('Sending request to Veo...');

      // 4. Start Generation
      // Prompt designed for an app advertisement
      const prompt = "A sleek, high-quality cinematic commercial for a modern productivity application called TaskMaster. The video features smooth camera movements, showcasing organization, clarity, and success. Professional lighting, 4k resolution, tech aesthetic.";

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: {
          imageBytes: imageBase64,
          mimeType: imageFile.type,
        },
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: '16:9'
        }
      });

      // 5. Poll for Completion
      setStatusMessage('Generating video (this may take a minute)...');
      
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
        operation = await ai.operations.getVideosOperation({ operation: operation });
        console.log('Polling video status...', operation);
      }

      if (operation.error) {
        throw new Error(String(operation.error.message || "Video generation failed"));
      }

      // 6. Download Video
      const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!videoUri) {
        throw new Error("No video URI returned");
      }

      setStatusMessage('Downloading generated video...');
      
      // Append API key to fetch from the URI
      const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
      if (!response.ok) throw new Error("Failed to download video file");
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      setGeneratedVideoUrl(url);
      addToast("Advertisement generated successfully!", ToastType.SUCCESS);

    } catch (error: any) {
      console.error("Video generation error:", error);
      
      const errorMessage = error instanceof Error ? error.message : String(error?.message || error);
      
      if (errorMessage.includes("Requested entity was not found")) {
         addToast("Session expired. Please select API Key again.", ToastType.WARNING);
         const aiStudio = (window as any).aistudio;
         if (aiStudio) aiStudio.openSelectKey();
      } else {
         addToast(`Error: ${errorMessage}`, ToastType.ERROR);
      }
    } finally {
      setIsGenerating(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden ring-1 ring-black/5 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Clapperboard className="w-5 h-5" />
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-900">Create Video Ad</h3>
                <p className="text-xs text-gray-500">Powered by Google Veo</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          {!generatedVideoUrl && !isGenerating && (
             <div className="space-y-6">
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/30 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group min-h-[200px]"
                >
                    {imagePreview ? (
                        <div className="relative w-full h-full flex justify-center">
                            <img src={imagePreview} alt="Preview" className="max-h-64 rounded-lg shadow-md object-contain" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg text-white font-medium">
                                Change Image
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="p-4 bg-gray-50 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="w-8 h-8 text-gray-400 group-hover:text-indigo-500" />
                            </div>
                            <p className="text-gray-700 font-medium">Upload a screenshot or logo</p>
                            <p className="text-sm text-gray-400 mt-1">JPG or PNG, max 5MB</p>
                        </>
                    )}
                    <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/png, image/jpeg" 
                        className="hidden" 
                        onChange={handleFileSelect}
                    />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg flex gap-3 border border-blue-100">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <p className="text-sm text-blue-800">
                        This will use the <strong>Veo 3.1</strong> model to generate a 1080p cinematic video advertisement based on your uploaded image. Generation usually takes 1-2 minutes.
                    </p>
                </div>
             </div>
          )}

          {isGenerating && (
             <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                 <div className="relative">
                    <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Film className="w-8 h-8 text-indigo-600 animate-pulse" />
                    </div>
                 </div>
                 <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1">Creating your Masterpiece</h4>
                    <p className="text-gray-500 text-sm animate-pulse">{statusMessage}</p>
                 </div>
                 <div className="w-full max-w-xs bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full animate-[progress_2s_ease-in-out_infinite] w-1/2"></div>
                 </div>
             </div>
          )}

          {generatedVideoUrl && (
             <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="relative rounded-xl overflow-hidden shadow-lg bg-black aspect-video">
                    <video 
                        src={generatedVideoUrl} 
                        controls 
                        autoPlay 
                        loop
                        className="w-full h-full object-contain" 
                    />
                 </div>
                 <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-green-600 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Video Generated Successfully
                    </p>
                    <button 
                        onClick={() => {
                            setGeneratedVideoUrl(null);
                            setIsGenerating(false);
                        }}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
                    >
                        Create Another
                    </button>
                 </div>
             </div>
          )}

        </div>

        {/* Footer Controls */}
        {!isGenerating && !generatedVideoUrl && (
            <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-100">
                <button
                onClick={handleGenerate}
                disabled={!imageFile}
                className={`
                    flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl shadow-lg transition-all active:scale-95
                    ${!imageFile 
                        ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                    }
                `}
                >
                <Play className="w-4 h-4 fill-current" />
                Generate Ad
                </button>
            </div>
        )}
      </div>
      
      {/* Custom styling for the indeterminate progress bar */}
      <style>{`
        @keyframes progress {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

export default VideoAdModal;
