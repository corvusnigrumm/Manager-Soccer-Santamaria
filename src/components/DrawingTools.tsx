import React from 'react';

interface DrawingToolsProps {
  isDrawingMode: boolean;
  setIsDrawingMode: (val: boolean) => void;
  brushColor: string;
  setBrushColor: (val: string) => void;
  brushWidth: number;
  setBrushWidth: (val: number) => void;
  onClear: () => void;
  onUndo: () => void;
  strokesCount: number;
}

const COLORS = [
  { name: 'Tiza Blanca', value: '#ffffff' },
  { name: 'Tiza Amarilla', value: '#fbbf24' },
  { name: 'Ataque Rojo', value: '#ef4444' },
  { name: 'Movimiento Cyan', value: '#06b6d4' },
  { name: 'Defensa Verde', value: '#10b981' },
];

export const DrawingTools: React.FC<DrawingToolsProps> = ({
  isDrawingMode,
  setIsDrawingMode,
  brushColor,
  setBrushColor,
  brushWidth,
  setBrushWidth,
  onClear,
  onUndo,
  strokesCount,
}) => {
  return (
    <div className="bg-surface rounded-xl p-md border border-outline-variant shadow-sm">
      <div className="flex justify-between items-center mb-sm">
        <h4 className="font-title-lg text-title-lg text-primary flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary text-xl">edit</span>
          Pizarrón Táctico
        </h4>
        <button
          onClick={() => setIsDrawingMode(!isDrawingMode)}
          className={`font-label-sm text-label-sm px-sm py-1.5 rounded-lg flex items-center gap-xs transition-colors border ${
            isDrawingMode
              ? 'bg-primary text-on-primary border-primary hover:bg-primary-container'
              : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-variant/50'
          }`}
        >
          <span className="material-symbols-outlined text-sm">edit</span>
          {isDrawingMode ? 'Dibujo: ON' : 'Dibujo: OFF'}
        </button>
      </div>

      {isDrawingMode && (
        <div className="animate-fade-in flex flex-col gap-sm mt-sm">
          {/* Colors Selection */}
          <div>
            <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Color del Trazo</span>
            <div className="flex gap-2 items-center flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setBrushColor(c.value)}
                  title={c.name}
                  aria-label={c.name}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    brushColor === c.value ? 'border-primary scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
              <div className="relative flex items-center" title="Color personalizado">
                <input
                  type="color"
                  value={brushColor}
                  onChange={(e) => setBrushColor(e.target.value)}
                  aria-label="Color personalizado"
                  className="w-6 h-6 rounded-full border border-outline-variant cursor-pointer p-0 bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Width Selection */}
          <div>
            <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant mb-1">
              <span>Grosor de la Línea</span>
              <span className="font-semibold text-primary">{brushWidth}px</span>
            </div>
            <input
              type="range"
              min="2"
              max="10"
              value={brushWidth}
              onChange={(e) => setBrushWidth(parseInt(e.target.value))}
              className="w-full h-1 bg-surface-container rounded-lg cursor-pointer accent-primary"
            />
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={onUndo}
              disabled={strokesCount === 0}
              className="bg-surface border border-outline-variant text-on-surface-variant font-label-sm text-label-sm py-1.5 rounded-lg flex items-center justify-center gap-xs hover:bg-surface-variant/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-sm">undo</span>
              Deshacer
            </button>
            <button
              onClick={onClear}
              disabled={strokesCount === 0}
              className="bg-surface border border-outline-variant text-error font-label-sm text-label-sm py-1.5 rounded-lg flex items-center justify-center gap-xs hover:bg-error-container/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-sm">layers_clear</span>
              Limpiar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
