import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PuzzleState, PuzzlePiece } from '../App';

interface PuzzleGameProps {
  puzzle: PuzzleState;
  difficulty: 'easy' | 'medium' | 'hard';
  showPreview: boolean;
  onComplete: (time: number) => void;
}

const PuzzleGame: React.FC<PuzzleGameProps> = ({
  puzzle,
  difficulty,
  showPreview,
  onComplete
}) => {
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [draggedPiece, setDraggedPiece] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isDragging, setIsDragging] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const gridSize = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5;
  const totalPieces = gridSize * gridSize;
  const PUZZLE_SIZE = 400; // Fixed puzzle board size

  // Handle image loading and get actual dimensions
  const handleImageLoad = useCallback(() => {
    const img = imageRef.current;
    if (!img) return;

    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight
    });
    setImageLoaded(true);
  }, []);

  // Initialize puzzle pieces with correct image sections
  useEffect(() => {
    if (!puzzle.image || !imageLoaded || !imageDimensions.width || !imageDimensions.height) return;

    const newPieces: PuzzlePiece[] = [];
    const pieceWidth = PUZZLE_SIZE / gridSize;
    const pieceHeight = PUZZLE_SIZE / gridSize;
    
    // Calculate source image piece dimensions
    const sourceWidth = imageDimensions.width / gridSize;
    const sourceHeight = imageDimensions.height / gridSize;

    for (let i = 0; i < totalPieces; i++) {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      
      newPieces.push({
        id: i,
        correctPosition: { 
          x: col * pieceWidth, 
          y: row * pieceHeight 
        },
        currentPosition: { 
          x: Math.random() * (PUZZLE_SIZE - pieceWidth), 
          y: Math.random() * 300 + 450 
        },
        isPlaced: false,
        imageSection: {
          x: col * sourceWidth,
          y: row * sourceHeight,
          width: sourceWidth,
          height: sourceHeight
        }
      });
    }

    setPieces(newPieces);
    setStartTime(Date.now());
    setDraggedPiece(null);
    setIsDragging(false);
  }, [puzzle.image, difficulty, gridSize, totalPieces, imageLoaded, imageDimensions, PUZZLE_SIZE]);

  // Check for completion
  useEffect(() => {
    if (pieces.length > 0 && pieces.every(piece => piece.isPlaced)) {
      const completionTime = Math.floor((Date.now() - startTime) / 1000);
      setTimeout(() => onComplete(completionTime), 500);
    }
  }, [pieces, startTime, onComplete]);

  const handleMouseDown = useCallback((e: React.MouseEvent, pieceId: number) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const piece = pieces.find(p => p.id === pieceId);
    if (!piece || piece.isPlaced) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setDraggedPiece(pieceId);
    setIsDragging(true);
    setDragOffset({
      x: mouseX - piece.currentPosition.x,
      y: mouseY - piece.currentPosition.y
    });
  }, [pieces]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || draggedPiece === null) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newX = mouseX - dragOffset.x;
    const newY = mouseY - dragOffset.y;

    setPieces(prev => prev.map(piece => 
      piece.id === draggedPiece 
        ? { ...piece, currentPosition: { x: newX, y: newY } }
        : piece
    ));
  }, [isDragging, draggedPiece, dragOffset]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging || draggedPiece === null) return;

    const piece = pieces.find(p => p.id === draggedPiece);
    if (!piece) return;

    const snapDistance = 30;
    const isNearCorrectPosition = 
      Math.abs(piece.currentPosition.x - piece.correctPosition.x) < snapDistance &&
      Math.abs(piece.currentPosition.y - piece.correctPosition.y) < snapDistance;

    if (isNearCorrectPosition) {
      setPieces(prev => prev.map(p => 
        p.id === draggedPiece 
          ? { 
              ...p, 
              currentPosition: p.correctPosition, 
              isPlaced: true 
            }
          : p
      ));
      
      // Visual feedback for successful placement
      const successElement = document.createElement('div');
      successElement.textContent = '✨';
      successElement.className = 'fixed text-2xl animate-bounce pointer-events-none z-50';
      successElement.style.left = `${piece.correctPosition.x + 25}px`;
      successElement.style.top = `${piece.correctPosition.y + 25}px`;
      document.body.appendChild(successElement);
      setTimeout(() => {
        if (document.body.contains(successElement)) {
          document.body.removeChild(successElement);
        }
      }, 1000);
    }

    setDraggedPiece(null);
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  }, [isDragging, draggedPiece, pieces]);

  const drawPuzzle = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imageRef.current;
    
    if (!canvas || !ctx || !img || !imageLoaded) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw puzzle board background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(0, 0, PUZZLE_SIZE, PUZZLE_SIZE);
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= gridSize; i++) {
      const pos = (i * PUZZLE_SIZE) / gridSize;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, PUZZLE_SIZE);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(PUZZLE_SIZE, pos);
      ctx.stroke();
    }

    // Draw pieces (non-dragged pieces first, then dragged piece on top)
    const sortedPieces = [...pieces].sort((a, b) => {
      if (a.id === draggedPiece) return 1;
      if (b.id === draggedPiece) return -1;
      return 0;
    });

    const pieceDisplayWidth = PUZZLE_SIZE / gridSize;
    const pieceDisplayHeight = PUZZLE_SIZE / gridSize;

    sortedPieces.forEach(piece => {
      const { currentPosition, imageSection, isPlaced } = piece;
      
      ctx.save();
      
      // Add shadow for dragged piece
      if (draggedPiece === piece.id && isDragging) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
      }
      
      // Add glow for correctly placed pieces
      if (isPlaced) {
        ctx.shadowColor = 'rgba(34, 197, 94, 0.5)';
        ctx.shadowBlur = 15;
      }

      // Draw the piece using the correct source coordinates and display size
      ctx.drawImage(
        img,
        imageSection.x, imageSection.y, imageSection.width, imageSection.height,
        currentPosition.x, currentPosition.y, pieceDisplayWidth, pieceDisplayHeight
      );
      
      // Draw border
      ctx.strokeStyle = isPlaced ? '#22c55e' : '#e5e7eb';
      ctx.lineWidth = isPlaced ? 3 : 2;
      ctx.strokeRect(currentPosition.x, currentPosition.y, pieceDisplayWidth, pieceDisplayHeight);
      
      ctx.restore();
    });
  }, [pieces, draggedPiece, isDragging, gridSize, imageLoaded, PUZZLE_SIZE]);

  useEffect(() => {
    drawPuzzle();
  }, [drawPuzzle]);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const pieceDisplayWidth = PUZZLE_SIZE / gridSize;
    const pieceDisplayHeight = PUZZLE_SIZE / gridSize;
    
    // Find clicked piece (check from top to bottom, so dragged pieces are prioritized)
    const sortedPieces = [...pieces].sort((a, b) => {
      if (a.id === draggedPiece) return 1;
      if (b.id === draggedPiece) return -1;
      return 0;
    });

    for (let i = sortedPieces.length - 1; i >= 0; i--) {
      const piece = sortedPieces[i];
      if (piece.isPlaced) continue;
      
      if (x >= piece.currentPosition.x && 
          x <= piece.currentPosition.x + pieceDisplayWidth &&
          y >= piece.currentPosition.y && 
          y <= piece.currentPosition.y + pieceDisplayHeight) {
        handleMouseDown(e, piece.id);
        break;
      }
    }
  }, [pieces, draggedPiece, handleMouseDown, gridSize, PUZZLE_SIZE]);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-pink-200">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main puzzle area */}
        <div className="flex-1">
          <div className="relative">
            <img
              ref={imageRef}
              src={puzzle.image}
              alt="Puzzle"
              className="hidden"
              crossOrigin="anonymous"
              onLoad={handleImageLoad}
            />
            
            <canvas
              ref={canvasRef}
              width={PUZZLE_SIZE}
              height={800}
              className="border-2 border-pink-200 rounded-2xl cursor-pointer bg-gradient-to-b from-pink-50 to-purple-50 select-none"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ touchAction: 'none' }}
            />
            
            {/* Completion overlay */}
            {pieces.length > 0 && pieces.every(piece => piece.isPlaced) && (
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center pointer-events-none">
                <div className="text-6xl animate-bounce">🎉</div>
              </div>
            )}
          </div>
        </div>

        {/* Preview panel */}
        {showPreview && (
          <div className="lg:w-48">
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-700 mb-3 text-center">
                Preview
              </h3>
              <img
                src={puzzle.image}
                alt="Preview"
                className="w-full h-auto rounded-lg border-2 border-purple-200"
              />
              <div className="mt-3 text-center">
                <div className="text-sm text-gray-600">
                  {pieces.filter(p => p.isPlaced).length} / {totalPieces} pieces
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(pieces.filter(p => p.isPlaced).length / totalPieces) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PuzzleGame;