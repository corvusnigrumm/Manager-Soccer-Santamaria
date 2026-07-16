import React from 'react';
import { Pencil, Trash2, RotateCcw, Paintbrush } from 'lucide-react';

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
    <div className="glass-panel" style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h4 style={{ fontSize: '0.9rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <Paintbrush size={16} className="text-primary" />
          Pizarrón Táctico
        </h4>
        <button
          onClick={() => setIsDrawingMode(!isDrawingMode)}
          className="btn"
          style={{
            padding: '6px 12px',
            fontSize: '0.8rem',
            backgroundColor: isDrawingMode ? 'var(--accent-primary)' : 'rgba(255,255,255,0.06)',
            color: '#fff',
            border: isDrawingMode ? 'none' : '1px solid var(--border-color)',
          }}
        >
          <Pencil size={12} />
          {isDrawingMode ? 'Modo Táctico: ON' : 'Dibujo Desactivado'}
        </button>
      </div>

      {isDrawingMode && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Colors Selection */}
          <div>
            <span className="form-label" style={{ fontSize: '0.75rem', marginBottom: '6px' }}>Color del Trazo</span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setBrushColor(c.value)}
                  title={c.name}
                  aria-label={c.name}
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: c.value,
                    border: brushColor === c.value ? '2px solid #fff' : '2px solid transparent',
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                    transition: 'transform 0.1s',
                    transform: brushColor === c.value ? 'scale(1.15)' : 'scale(1)',
                  }}
                />
              ))}
              {/* BUG-11 fix: custom color picker so users aren't limited to 5 preset colors */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }} title="Color personalizado">
                <input
                  type="color"
                  value={brushColor}
                  onChange={(e) => setBrushColor(e.target.value)}
                  aria-label="Color personalizado"
                  style={{
                    width: '26px', height: '26px', borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.3)', cursor: 'pointer',
                    padding: 0, background: 'transparent',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Width Selection */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
              <span className="form-label" style={{ margin: 0 }}>Grosor de la Línea</span>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{brushWidth}px</span>
            </div>
            <input
              type="range"
              min="2"
              max="10"
              value={brushWidth}
              onChange={(e) => setBrushWidth(parseInt(e.target.value))}
              style={{
                width: '100%',
                height: '4px',
                background: 'rgba(255,255,255,0.1)',
                cursor: 'pointer',
                WebkitAppearance: 'none',
                borderRadius: '2px',
              }}
            />
          </div>

          {/* Action buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
            <button
              onClick={onUndo}
              disabled={strokesCount === 0}
              className="btn btn-secondary"
              style={{ padding: '6px 8px', fontSize: '0.75rem', display: 'flex', gap: '4px', justifyContent: 'center', opacity: strokesCount === 0 ? 0.4 : 1, cursor: strokesCount === 0 ? 'not-allowed' : 'pointer' }}
            >
              <RotateCcw size={12} />
              Deshacer
            </button>
            <button
              onClick={onClear}
              disabled={strokesCount === 0}
              className="btn btn-secondary"
              style={{ padding: '6px 8px', fontSize: '0.75rem', display: 'flex', gap: '4px', justifyContent: 'center', color: '#ef4444', opacity: strokesCount === 0 ? 0.4 : 1, cursor: strokesCount === 0 ? 'not-allowed' : 'pointer' }}
            >
              <Trash2 size={12} />
              Limpiar
            </button>
          </div>
          
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', marginTop: '2px' }}>
            * Haz clic y arrastra sobre la cancha para trazar movimientos y flechas tácticas.
          </div>
        </div>
      )}
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  padding: '16px',
  marginBottom: '16px',
};
