import React, { useState, useEffect } from 'react';
import PuzzleGame from './components/PuzzleGame';
import PuzzleSelector from './components/PuzzleSelector';
import CompletionModal from './components/CompletionModal';
import UploadSection from './components/UploadSection';
import { Timer, Eye } from 'lucide-react';

const defaultImages = [
  '/3cab3bbd565d803e4f56d49d2c231591.jpg',
  '/07ddfc69abe01641f9911df6aa2012e8.jpg',
  '/a3de72f68cacc5f82b8695326252e5b8.jpg',
  '/pc-wallpapers-v0-sf1wz1hh16xc1.jpg',
  '/pc-wallpapers-v0-6q5bm9ch16xc1.webp'
];

export interface PuzzleState {
  id: number;
  image: string;
  pieces: PuzzlePiece[];
  isCompleted: boolean;
  completionTime?: number;
}

export interface PuzzlePiece {
  id: number;
  correctPosition: { x: number; y: number };
  currentPosition: { x: number; y: number };
  isPlaced: boolean;
  imageSection: { x: number; y: number; width: number; height: number };
}

function App() {
  const [puzzles, setPuzzles] = useState<PuzzleState[]>([]);
  const [currentPuzzleId, setCurrentPuzzleId] = useState<number>(1);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionData, setCompletionData] = useState<{ time: number; image: string; difficulty: string } | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  // Initialize puzzles with default images
  useEffect(() => {
    const initialPuzzles = defaultImages.map((image, index) => ({
      id: index + 1,
      image,
      pieces: [],
      isCompleted: false
    }));
    setPuzzles(initialPuzzles);
  }, []);

  // Timer effect - FIXED: Proper cleanup and control
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isTimerRunning && gameStarted) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerRunning, gameStarted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePuzzleSelect = (puzzleId: number) => {
    // FIXED: Properly stop and reset timer
    setIsTimerRunning(false);
    setGameStarted(false);
    setCurrentPuzzleId(puzzleId);
    setTimer(0);
    
    // Start timer after a brief delay to ensure proper state reset
    setTimeout(() => {
      setGameStarted(true);
      setIsTimerRunning(true);
    }, 100);
  };

  const handlePuzzleComplete = (completionTime: number) => {
    // FIXED: Immediately stop timer and game
    setIsTimerRunning(false);
    setGameStarted(false);
    
    const currentPuzzle = puzzles.find(p => p.id === currentPuzzleId);
    if (currentPuzzle) {
      setCompletionData({
        time: completionTime,
        image: currentPuzzle.image,
        difficulty: difficulty
      });
      setShowCompletion(true);
      
      // Update puzzle state
      setPuzzles(prev => prev.map(p => 
        p.id === currentPuzzleId 
          ? { ...p, isCompleted: true, completionTime }
          : p
      ));
    }
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      
      // Find the next available puzzle slot or create a new one
      const nextId = puzzles.length + 1;
      const newPuzzle: PuzzleState = {
        id: nextId,
        image: imageUrl,
        pieces: [],
        isCompleted: false
      };
      
      setPuzzles(prev => [...prev, newPuzzle]);
      
      // Automatically select the new puzzle
      handlePuzzleSelect(nextId);
    };
    reader.readAsDataURL(file);
  };

  const handleModalClose = () => {
    setShowCompletion(false);
    // FIXED: Ensure timer stays stopped after closing modal
    setIsTimerRunning(false);
    setGameStarted(false);
  };

  const currentPuzzle = puzzles.find(p => p.id === currentPuzzleId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100">
      {/* Cute floating elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-8 h-8 bg-pink-300 rounded-full opacity-60 animate-bounce"></div>
        <div className="absolute top-20 right-20 w-6 h-6 bg-purple-300 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-10 h-10 bg-blue-300 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-10 right-10 w-4 h-4 bg-yellow-300 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-4">
            🧩 Bubu Dudu Puzzle Adventure 🧩
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join Bubu and Dudu in their puzzle adventure! Solve beautiful puzzles and share your achievements with friends.
          </p>
        </div>

        <div className="flex flex-col xl:flex-row gap-8">
          {/* Main Game Area */}
          <div className="flex-1">
            {/* Game Controls */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 mb-6 shadow-lg border border-pink-200">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-pink-100 px-4 py-2 rounded-full">
                    <Timer className="w-5 h-5 text-pink-600" />
                    <span className="font-mono text-lg font-semibold text-pink-700">
                      {formatTime(timer)}
                    </span>
                    {!gameStarted && (
                      <span className="text-xs text-pink-500 ml-2">Ready</span>
                    )}
                  </div>
                  
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                    className="bg-purple-100 border border-purple-200 rounded-full px-4 py-2 text-purple-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-300"
                  >
                    <option value="easy">Easy (9 pieces)</option>
                    <option value="medium">Medium (16 pieces)</option>
                    <option value="hard">Hard (25 pieces)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                      showPreview 
                        ? 'bg-blue-500 text-white shadow-lg' 
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                </div>
              </div>
            </div>

            {/* Puzzle Game */}
            {currentPuzzle && (
              <PuzzleGame
                puzzle={currentPuzzle}
                difficulty={difficulty}
                showPreview={showPreview}
                onComplete={handlePuzzleComplete}
              />
            )}
          </div>

          {/* Right Sidebar */}
          <div className="xl:w-80 space-y-6">
            {/* Upload Section */}
            <UploadSection onImageUpload={handleImageUpload} />
            
            {/* Puzzle Selector */}
            <PuzzleSelector
              puzzles={puzzles}
              currentPuzzleId={currentPuzzleId}
              onPuzzleSelect={handlePuzzleSelect}
            />
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {showCompletion && completionData && (
        <CompletionModal
          completionTime={completionData.time}
          puzzleImage={completionData.image}
          difficulty={completionData.difficulty}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}

export default App;