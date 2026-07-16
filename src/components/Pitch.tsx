import React, { useRef, useEffect, useState } from 'react';
import type { Player, Team, DrawingStroke, Point } from '../types';
import { PlayerCard } from './PlayerCard';

interface PitchProps {
  team: Team;
  activePlayers: Player[];
  pitchTheme: 'classic' | 'night' | 'tactical' | 'neon';
  isDrawingMode: boolean;
  brushColor: string;
  brushWidth: number;
  strokes: DrawingStroke[];
  onStrokesChange: (strokes: DrawingStroke[]) => void;
  onPlayerMove: (playerId: string, x: number, y: number) => void;
  onEditPlayer: (player: Player) => void;
  onRemoveFromLineup: (playerId: string) => void;
}

export const Pitch: React.FC<PitchProps> = ({
  team,
  activePlayers,
  pitchTheme,
  isDrawingMode,
  brushColor,
  brushWidth,
  strokes,
  onStrokesChange,
  onPlayerMove,
  onEditPlayer,
  onRemoveFromLineup,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  // BUG-2 fix: keep a ref to the latest strokes so mouse handlers never read stale data
  const strokesRef = useRef(strokes);
  strokesRef.current = strokes;


  // Redraw canvas strokes when strokes, theme, or size changes
  const drawStrokes = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear previous drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      
      // Convert percentage coordinate back to actual canvas pixels
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

  // Adjust canvas resolution to match its element size
  const handleResize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    drawStrokes();
  };

  // BUG-1 fix: resize listener registered only once (empty deps), not on every stroke change
  useEffect(() => {
    handleResize();
    const onResize = () => handleResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redraw strokes whenever they change or the theme changes
  useEffect(() => {
    drawStrokes();
  }, [strokes, pitchTheme]);

  // DRAWING BOARD HANDLERS
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

    // Convert pixel position to 0-100 percentage coordinates
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode) return;
    
    // Prevent default scroll behaviors on mobile touch
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
    // BUG-2 fix: read from ref instead of prop to always get the latest strokes
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

  // DRAG AND DROP HANDLERS (FOR PLAYERS)
  const handlePlayerPointerDown = (e: React.PointerEvent<HTMLDivElement>, playerId: string) => {
    if (isDrawingMode) return;
    e.preventDefault();


    const handlePointerMove = (moveEvent: PointerEvent) => {
      const container = containerRef.current;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      // Calculate coordinates as percentage of pitch bounding box
      const rawX = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      const rawY = ((moveEvent.clientY - rect.top) / rect.height) * 100;
      
      // Restrict players to field boundaries with a small safety margin
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

  // Theme-specific CSS classes and colors
  const getThemeStyles = () => {
    switch (pitchTheme) {
      case 'night':
        return {
          containerBg: 'radial-gradient(circle at center, #0e301d 0%, #06140c 100%)',
          linesColor: 'var(--pitch-night-lines)',
          grassStyle: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.01), rgba(255,255,255,0.01) 60px, rgba(0,0,0,0.08) 60px, rgba(0,0,0,0.08) 120px)',
          border: '1px solid rgba(16, 185, 129, 0.15)',
        };
      case 'tactical':
        return {
          containerBg: '#1c1d21',
          linesColor: 'var(--pitch-tactical-lines)',
          grassStyle: 'none',
          border: '1px solid rgba(255,255,255,0.05)',
        };
      case 'neon':
        return {
          containerBg: '#020617',
          linesColor: 'var(--pitch-neon-lines)',
          grassStyle: 'none',
          border: '2px solid #0891b2',
          boxShadow: '0 0 25px rgba(6, 182, 212, 0.4)',
          glowAnimation: 'pulseNeon 4s infinite alternate',
        };
      case 'classic':
      default:
        return {
          containerBg: 'var(--pitch-classic-bg)',
          linesColor: 'var(--pitch-classic-lines)',
          grassStyle: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.06), rgba(0,0,0,0.06) 50px, rgba(255,255,255,0.02) 50px, rgba(255,255,255,0.02) 100px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        };
    }
  };

  const theme = getThemeStyles();

  return (
    <div
      ref={containerRef}
      id="soccer-pitch"
      className="glass-panel"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: theme.containerBg,
        border: theme.border,
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: theme.boxShadow || '0 10px 30px rgba(0,0,0,0.4)',
        animation: theme.glowAnimation || 'none',
        userSelect: 'none',
      }}
    >
      {/* Striped grass overlay */}
      {theme.grassStyle !== 'none' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: theme.grassStyle,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}

      {/* Soccer Field Lines SVG Overlay */}
      <svg
        viewBox="0 0 100 100"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          color: theme.linesColor,
          zIndex: 2,
        }}
      >
        {/* Outer Border */}
        <rect x="4" y="4" width="92" height="92" fill="none" stroke="currentColor" strokeWidth="0.5" />
        
        {/* Midfield Line */}
        <line x1="4" y1="50" x2="96" y2="50" stroke="currentColor" strokeWidth="0.5" />
        
        {/* Center Circle */}
        <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <circle cx="50" cy="50" r="0.6" fill="currentColor" />

        {/* Penalty Area Top */}
        <rect x="22" y="4" width="56" height="16" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <rect x="36" y="4" width="28" height="5" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <circle cx="50" cy="14" r="0.5" fill="currentColor" />
        {/* Arc Top */}
        <path d="M 40 20 A 10 10 0 0 0 60 20" fill="none" stroke="currentColor" strokeWidth="0.5" />

        {/* Penalty Area Bottom */}
        <rect x="22" y="80" width="56" height="16" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <rect x="36" y="91" width="28" height="5" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <circle cx="50" cy="86" r="0.5" fill="currentColor" />
        {/* Arc Bottom */}
        <path d="M 40 80 A 10 10 0 0 1 60 80" fill="none" stroke="currentColor" strokeWidth="0.5" />

        {/* Corner Arcs */}
        <path d="M 4 8 A 4 4 0 0 0 8 4" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <path d="M 92 4 A 4 4 0 0 0 96 8" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <path d="M 4 92 A 4 4 0 0 0 8 96" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <path d="M 92 96 A 4 4 0 0 0 96 92" fill="none" stroke="currentColor" strokeWidth="0.5" />

        {/* Goals */}
        <rect x="42" y="2" width="16" height="2" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
        <rect x="42" y="96" width="16" height="2" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
      </svg>

      {/* Chalkboard Drawing Canvas Overlay */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 5,
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
      />

      {/* Render Players */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 6,
          pointerEvents: isDrawingMode ? 'none' : 'auto',
        }}
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
              isDrawingMode={isDrawingMode}
            />
          );
        })}
      </div>
      
      {/* Empty pitch state helper text */}
      {team.lineup.length === 0 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 3,
          color: 'rgba(255,255,255,0.3)',
          textAlign: 'center',
          fontSize: '0.9rem',
          maxWidth: '300px',
        }}>
          La cancha está vacía.<br/>Selecciona una formación o arrastra jugadores desde la banca en el panel lateral.
        </div>
      )}
    </div>
  );
};
