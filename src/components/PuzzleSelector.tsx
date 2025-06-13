import React from 'react';
import { PuzzleState } from '../App';
import { Check, Clock, Play } from 'lucide-react';

interface PuzzleSelectorProps {
  puzzles: PuzzleState[];
  currentPuzzleId: number;
  onPuzzleSelect: (puzzleId: number) => void;
}

const PuzzleSelector: React.FC<PuzzleSelectorProps> = ({
  puzzles,
  currentPuzzleId,
  onPuzzleSelect
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-pink-200">
      <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-4 text-center">
        🎯 Puzzle Collection
      </h2>
      
      {/* Grid Layout - 2 columns */}
      <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2">
        {puzzles.map((puzzle) => (
          <div
            key={puzzle.id}
            className={`relative group transition-all duration-300 cursor-pointer ${
              currentPuzzleId === puzzle.id
                ? 'transform scale-105'
                : 'hover:transform hover:scale-102'
            }`}
            onClick={() => onPuzzleSelect(puzzle.id)}
          >
            <div
              className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                currentPuzzleId === puzzle.id
                  ? 'border-pink-400 shadow-lg shadow-pink-200'
                  : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
              }`}
            >
              {/* Puzzle Image */}
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={puzzle.image}
                  alt={`Puzzle ${puzzle.id}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                
                {/* Overlay */}
                <div className={`absolute inset-0 transition-opacity duration-300 ${
                  currentPuzzleId === puzzle.id
                    ? 'bg-gradient-to-t from-pink-500/40 to-transparent'
                    : 'bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100'
                }`} />
                
                {/* Status Badges */}
                <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                  {/* Puzzle Number */}
                  <div className="bg-white/90 backdrop-blur-sm text-gray-800 px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                    #{puzzle.id}
                  </div>
                  
                  {/* Completion Badge */}
                  {puzzle.isCompleted && (
                    <div className="bg-green-500 text-white rounded-lg p-1.5 shadow-lg">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
                
                {/* Current Playing Indicator */}
                {currentPuzzleId === puzzle.id && (
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-pink-500 text-white px-2 py-1 rounded-lg text-xs font-medium shadow-lg flex items-center justify-center gap-1">
                      <Play className="w-3 h-3 fill-current" />
                      Playing
                    </div>
                  </div>
                )}
                
                {/* Completion Time */}
                {puzzle.completionTime && !currentPuzzleId === puzzle.id && (
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-green-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-medium shadow-lg flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(puzzle.completionTime)}
                    </div>
                  </div>
                )}
                
                {/* Hover Play Button */}
                {currentPuzzleId !== puzzle.id && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
                      <Play className="w-6 h-6 text-pink-500 fill-current" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Stats Summary */}
      <div className="mt-4 p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-pink-600">{puzzles.length}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              {puzzles.filter(p => p.isCompleted).length}
            </div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">
              {puzzles.length - puzzles.filter(p => p.isCompleted).length}
            </div>
            <div className="text-xs text-gray-600">Remaining</div>
          </div>
        </div>
      </div>
      
      {/* How to Play - Compact Version */}
      <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
        <h3 className="font-semibold text-blue-800 mb-2 text-sm">🎮 Quick Guide</h3>
        <ul className="text-xs text-blue-700 space-y-0.5">
          <li>• Click any puzzle to start playing</li>
          <li>• Drag pieces to solve the puzzle</li>
          <li>• Upload custom images above</li>
          <li>• Share your best times!</li>
        </ul>
      </div>
    </div>
  );
};

export default PuzzleSelector;