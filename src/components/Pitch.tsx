import React, { useRef, useEffect, useState } from 'react';
import type { Player, Team, DrawingStroke, Point } from '../types';
import { PlayerCard } from './PlayerCard';

interface PitchProps {
  team: Team;
  activePlayers: Player[];
  pitchTheme: 'classic' | 'night' | 'tactical' | 'neon';
  isDrawingMode: boolean;
  setIsDrawingMode: (val: boolean) => void;
  brushColor: string;
  brushWidth: number;
  strokes: DrawingStroke[];
  onStrokesChange: (strokes: DrawingStroke[]) => void;
  onPlayerMove: (playerId: string, x: number, y: number) => void;
  onEditPlayer: (player: Player) => void;
  onRemoveFromLineup: (playerId: string) => void;
  onDropPlayer: (playerId: string, x: number, y: number) => void;
  onClear: () => void;
  onUndo: () => void;
}

export const Pitch: React.FC<PitchProps> = ({
  team,
  activePlayers,
  pitchTheme,
  isDrawingMode,
  setIsDrawingMode,
  brushColor,
  brushWidth,
  strokes,
  onStrokesChange,
  onPlayerMove,
  onEditPlayer,
  onRemoveFromLineup,
  onDropPlayer,
  onClear,
  onUndo,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const strokesRef = useRef(strokes);
  strokesRef.current = strokes;

  const drawStrokes = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      
      const startX = (stroke.points[0].x / 100) * canvas.width;
      const startY = (stroke.points[0].y / 100) * canvas.height;
      ctx.moveTo(startX, startY);

      for (let i = 1; i < stroke.points.length; i++) {
        const x = (stroke.points[i].x / 100) * canvas.width;
        const y = (stroke.points[i].y / 100) * canvas.height;
        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    });
  };

  const handleResize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    drawStrokes();
  };

  useEffect(() => {
    handleResize();
    const onResize = () => handleResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    drawStrokes();
  }, [strokes, pitchTheme]);

  const getCanvasMousePos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode) return;
    
    if ('touches' in e) {
      e.preventDefault();
    }

    const pos = getCanvasMousePos(e);
    setIsDrawing(true);

    const newStroke: DrawingStroke = {
      id: Math.random().toString(36).substr(2, 9),
      color: brushColor,
      width: brushWidth,
      points: [pos],
    };
    onStrokesChange([...strokes, newStroke]);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode || !isDrawing) return;
    
    if ('touches' in e) {
      e.preventDefault();
    }

    const pos = getCanvasMousePos(e);
    const latestStrokes = strokesRef.current;
    if (latestStrokes.length === 0) return;

    const currentStroke = latestStrokes[latestStrokes.length - 1];
    const updatedStroke = {
      ...currentStroke,
      points: [...currentStroke.points, pos],
    };

    onStrokesChange([...latestStrokes.slice(0, -1), updatedStroke]);
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
  };

  const handlePlayerPointerDown = (e: React.PointerEvent<HTMLDivElement>, playerId: string) => {
    if (isDrawingMode) return;
    e.preventDefault();

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const container = containerRef.current;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const rawX = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      const rawY = ((moveEvent.clientY - rect.top) / rect.height) * 100;
      
      const x = Math.max(4, Math.min(96, rawX));
      const y = Math.max(4, Math.min(96, rawY));
      
      onPlayerMove(playerId, x, y);
    };

    const handlePointerUp = () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  // ── Drag from pitch back to bench ──
  const handleDragStartFromPitch = (e: React.DragEvent<HTMLDivElement>, playerId: string) => {
    e.dataTransfer.setData('text/player-id', playerId);
    e.dataTransfer.setData('text/from-pitch', 'true');
    e.dataTransfer.effectAllowed = 'move';
  };

  // ── Drag & Drop handlers ──
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const playerId = e.dataTransfer.getData('text/player-id');
    if (!playerId) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;

    const x = Math.max(4, Math.min(96, rawX));
    const y = Math.max(4, Math.min(96, rawY));

    onDropPlayer(playerId, x, y);
  };

  const getThemeOverlay = () => {
    switch (pitchTheme) {
      case 'night':
        return 'rgba(5, 20, 10, 0.55)';
      case 'tactical':
        return 'rgba(28, 29, 33, 0.65)';
      case 'neon':
        return 'rgba(2, 6, 23, 0.60)';
      case 'classic':
      default:
        return 'transparent';
    }
  };

  const overlayColor = getThemeOverlay();

  return (
    <main className="flex-1 bg-surface-container-low p-md flex flex-col relative overflow-hidden h-full">
      {/* Soccer Pitch Canvas Card */}
      <div 
        ref={containerRef}
        id="soccer-pitch"
        className="flex-1 rounded-xl relative shadow-sm border border-outline-variant overflow-hidden"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          background: '#1a3a28',
          outline: isDragOver ? '3px dashed #4ade80' : 'none',
          outlineOffset: '-4px',
          transition: 'outline 0.15s ease',
        }}
      >
        {/* PLANTILLA CANCHA image – always shown as base */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src="/PLANTILLA CANCHA.png"
            alt="Cancha de fútbol"
            className="w-full h-full object-fill"
            draggable={false}
          />
        </div>

        {/* Theme colour overlay */}
        {overlayColor !== 'transparent' && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundColor: overlayColor, mixBlendMode: 'multiply' }}
          />
        )}

        {/* Drop zone hint */}
        {isDragOver && (
          <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
            <div className="bg-black/60 text-white rounded-2xl px-6 py-3 font-semibold text-sm shadow-xl border border-green-400/60 flex items-center gap-2">
              <span className="material-symbols-outlined text-green-400">sports_soccer</span>
              Suelta para colocar en la cancha
            </div>
          </div>
        )}

        {/* Chalkboard Drawing Canvas Overlay */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full z-10"
          style={{
            cursor: isDrawingMode ? 'crosshair' : 'default',
            touchAction: 'none',
          }}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          onTouchStart={handleCanvasMouseDown}
          onTouchMove={handleCanvasMouseMove}
          onTouchEnd={handleCanvasMouseUp}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />

        {/* Render Players */}
        <div 
          className="absolute inset-0 w-full h-full z-20" 
          style={{ pointerEvents: isDrawingMode ? 'none' : 'auto' }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {team.lineup.map((pos) => {
            const player = activePlayers.find((p) => p.id === pos.playerId);
            if (!player) return null;

            return (
              <PlayerCard
                key={player.id}
                player={player}
                x={pos.x}
                y={pos.y}
                onPointerDown={handlePlayerPointerDown}
                onEdit={onEditPlayer}
                onRemoveFromLineup={onRemoveFromLineup}
                onDragStartFromPitch={handleDragStartFromPitch}
                isDrawingMode={isDrawingMode}
              />
            );
          })}
        </div>

        {/* Empty pitch state helper text */}
        {team.lineup.length === 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 text-white/70 text-center font-semibold text-sm max-w-[280px] bg-black/40 rounded-xl px-4 py-3">
            La cancha está vacía.<br/>Selecciona una formación o arrastra jugadores desde la banca.
          </div>
        )}
      </div>

      {/* Bottom Navigation / Tools Bar */}
      <nav className="mt-md bg-surface shadow-sm rounded-xl px-lg py-sm flex justify-center gap-xl border border-outline-variant shrink-0 z-30">
        <button 
          onClick={() => setIsDrawingMode(!isDrawingMode)}
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all active:scale-95 duration-150 w-16 ${
            isDrawingMode ? 'text-primary bg-secondary-container/40' : 'text-on-surface-variant hover:bg-surface-container-highest'
          }`}
        >
          <span className="material-symbols-outlined text-2xl">edit</span>
          <span className="font-label-sm text-label-sm mt-1">Lápiz</span>
        </button>
        
        <button 
          onClick={onUndo}
          disabled={strokes.length === 0}
          className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:bg-surface-container-highest transition-all active:scale-95 duration-150 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed w-16"
        >
          <span className="material-symbols-outlined text-2xl">undo</span>
          <span className="font-label-sm text-label-sm mt-1">Deshacer</span>
        </button>

        <button 
          onClick={onClear}
          disabled={strokes.length === 0}
          className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:bg-surface-container-highest transition-all active:scale-95 duration-150 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed w-16"
        >
          <span className="material-symbols-outlined text-2xl">layers_clear</span>
          <span className="font-label-sm text-label-sm mt-1">Limpiar</span>
        </button>
      </nav>
    </main>
  );
};
