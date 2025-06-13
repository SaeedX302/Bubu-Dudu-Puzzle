import React, { useRef, useCallback } from 'react';
import { X, Share2, MessageCircle, Instagram, Facebook, Download } from 'lucide-react';

interface CompletionModalProps {
  completionTime: number;
  puzzleImage: string;
  difficulty: string;
  onClose: () => void;
}

const CompletionModal: React.FC<CompletionModalProps> = ({
  completionTime,
  puzzleImage,
  difficulty,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyInfo = (diff: string) => {
    switch (diff) {
      case 'easy': return { pieces: 9, emoji: '🟢' };
      case 'medium': return { pieces: 16, emoji: '🟡' };
      case 'hard': return { pieces: 25, emoji: '🔴' };
      default: return { pieces: 9, emoji: '🟢' };
    }
  };

  const difficultyInfo = getDifficultyInfo(difficulty);

  // Create achievement image with puzzle and stats
  const createAchievementImage = useCallback(async (): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        resolve('');
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve('');
        return;
      }

      // Set canvas size for sharing (Instagram square format)
      canvas.width = 1080;
      canvas.height = 1080;

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
      gradient.addColorStop(0, '#fdf2f8');
      gradient.addColorStop(0.5, '#f3e8ff');
      gradient.addColorStop(1, '#dbeafe');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1080, 1080);

      // Load and draw the puzzle image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Draw puzzle image (centered, with padding)
        const imageSize = 600;
        const imageX = (1080 - imageSize) / 2;
        const imageY = 100;
        
        // Add shadow for image
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 10;
        
        // Draw rounded rectangle background for image
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.roundRect(imageX - 20, imageY - 20, imageSize + 40, imageSize + 40, 20);
        ctx.fill();
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Draw the puzzle image
        ctx.drawImage(img, imageX, imageY, imageSize, imageSize);
        
        // Add completion overlay
        ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
        ctx.fillRect(imageX, imageY, imageSize, imageSize);
        
        // Draw title
        ctx.fillStyle = '#ec4899';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🧩 Puzzle Completed! 🎉', 540, 60);
        
        // Draw achievement stats background
        const statsY = imageY + imageSize + 60;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.roundRect(140, statsY, 800, 200, 20);
        ctx.fill();
        
        // Draw stats
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Time: ${formatTime(completionTime)}`, 540, statsY + 60);
        
        ctx.font = '36px Arial';
        ctx.fillText(`${difficultyInfo.emoji} ${difficulty.toUpperCase()} (${difficultyInfo.pieces} pieces)`, 540, statsY + 110);
        
        // Add achievement badge
        const badge = completionTime < 60 ? '🏃‍♂️ Speed Demon!' : 
                     completionTime < 180 ? '🚀 Quick Solver!' : '🎯 Puzzle Master!';
        ctx.font = '32px Arial';
        ctx.fillStyle = '#7c3aed';
        ctx.fillText(badge, 540, statsY + 150);
        
        // Add watermark
        ctx.font = '24px Arial';
        ctx.fillStyle = '#9ca3af';
        ctx.textAlign = 'center';
        ctx.fillText('Bubu Dudu Puzzle Adventure', 540, 1040);
        
        // Convert to data URL
        resolve(canvas.toDataURL('image/png', 0.9));
      };
      
      img.onerror = () => resolve('');
      img.src = puzzleImage;
    });
  }, [puzzleImage, completionTime, difficulty, difficultyInfo]);

  const shareText = `🧩 I just completed a Bubu Dudu puzzle in ${formatTime(completionTime)}! 
${difficultyInfo.emoji} Difficulty: ${difficulty.toUpperCase()} (${difficultyInfo.pieces} pieces)
Can you beat my time? 🎉`;

  const shareUrl = window.location.href;

  const handleShare = async (platform: string) => {
    let url = '';
    
    switch (platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
        window.open(url, '_blank', 'width=600,height=400');
        break;
        
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank', 'width=600,height=400');
        break;
        
      case 'instagram':
        // Create and download achievement image for Instagram
        const achievementImage = await createAchievementImage();
        if (achievementImage) {
          // Create download link
          const link = document.createElement('a');
          link.download = `bubu-dudu-puzzle-achievement-${Date.now()}.png`;
          link.href = achievementImage;
          link.click();
          
          // Copy text to clipboard
          navigator.clipboard.writeText(shareText);
          alert('🎉 Achievement image downloaded and text copied to clipboard!\nYou can now post both on Instagram! 📸');
        }
        break;
        
      case 'download':
        // Download achievement image
        const downloadImage = await createAchievementImage();
        if (downloadImage) {
          const link = document.createElement('a');
          link.download = `bubu-dudu-puzzle-achievement-${Date.now()}.png`;
          link.href = downloadImage;
          link.click();
        }
        break;
        
      default:
        return;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 relative animate-in zoom-in duration-300">
        {/* Hidden canvas for creating achievement images */}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        {/* Celebration Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-2">
            Puzzle Completed!
          </h2>
          <p className="text-gray-600">
            Amazing work! You solved it in
          </p>
          <div className="text-4xl font-bold text-pink-500 mt-2">
            {formatTime(completionTime)}
          </div>
        </div>
        
        {/* Completed Puzzle Preview */}
        <div className="mb-6">
          <img
            src={puzzleImage}
            alt="Completed puzzle"
            className="w-full h-48 object-cover rounded-2xl border-4 border-pink-200 shadow-lg"
          />
        </div>
        
        {/* Achievement Stats */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 text-center">
            🏆 Your Achievement
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-2xl font-bold text-pink-500">
                {formatTime(completionTime)}
              </div>
              <div className="text-xs text-gray-600">Time</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-500">
                {difficultyInfo.emoji}
              </div>
              <div className="text-xs text-gray-600">{difficulty.toUpperCase()}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-500">
                {difficultyInfo.pieces}
              </div>
              <div className="text-xs text-gray-600">Pieces</div>
            </div>
          </div>
          <div className="text-center mt-3">
            <div className="text-lg">
              {completionTime < 60 ? '🏃‍♂️ Speed Demon!' : completionTime < 180 ? '🚀 Quick Solver!' : '🎯 Puzzle Master!'}
            </div>
          </div>
        </div>
        
        {/* Share Section */}
        <div className="text-center">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center justify-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Your Achievement
          </h3>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => handleShare('whatsapp')}
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-full transition-all duration-200 hover:scale-105 shadow-lg text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </button>
            
            <button
              onClick={() => handleShare('facebook')}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-full transition-all duration-200 hover:scale-105 shadow-lg text-sm"
            >
              <Facebook className="w-4 h-4" />
              Facebook
            </button>
            
            <button
              onClick={() => handleShare('instagram')}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-3 py-2 rounded-full transition-all duration-200 hover:scale-105 shadow-lg text-sm"
            >
              <Instagram className="w-4 h-4" />
              Instagram
            </button>
            
            <button
              onClick={() => handleShare('download')}
              className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-full transition-all duration-200 hover:scale-105 shadow-lg text-sm"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
          
          <p className="text-sm text-gray-500 mb-4">
            Challenge your friends to beat your time! 🏁
          </p>
        </div>
        
        {/* Continue Button */}
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-3 rounded-full font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
        >
          Continue Playing 🎮
        </button>
      </div>
    </div>
  );
};

export default CompletionModal;