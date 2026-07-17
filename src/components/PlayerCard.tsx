import React, { useState } from 'react';
import type { Player } from '../types';

interface PlayerCardProps {
  player: Player;
  x: number;
  y: number;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>, playerId: string) => void;
  onEdit: (player: Player) => void;
  onRemoveFromLineup: (playerId: string) => void;
  isDrawingMode: boolean;
}

const getStatColor = (v: number) => v >= 80 ? 'text-primary' : v >= 60 ? 'text-secondary' : 'text-error';

const jerseyBackground = (player: Player): React.CSSProperties => {
  const c1 = player.avatarColor;
  const c2 = player.secondaryJerseyColor ?? '#ffffff';

  switch (player.jerseyDesign) {
    case 'striped':
      return {
        backgroundImage: `repeating-linear-gradient(90deg, ${c1} 0px, ${c1} 10px, ${c2} 10px, ${c2} 20px)`,
      };
    case 'halves':
      return { backgroundImage: `linear-gradient(90deg, ${c1} 50%, ${c2} 50%)` };
    case 'gradient':
      return { backgroundImage: `linear-gradient(135deg, ${c1}, ${c2})` };
    case 'chevron':
      return { backgroundImage: `linear-gradient(160deg, ${c1} 55%, ${c2} 55%)` };
    default:
      return { backgroundColor: c1 };
  }
};

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player, x, y, onPointerDown, onEdit, onRemoveFromLineup, isDrawingMode,
}) => {
  const [hovered, setHovered] = useState(false);

  const bgStyle = jerseyBackground(player);
  const displayName = player.name.split(' ').pop() || player.name;

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center select-none touch-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        cursor: isDrawingMode ? 'default' : 'grab',
        zIndex: hovered ? 100 : 10,
        gap: '3px',
      }}
      onPointerDown={e => { if (!isDrawingMode) onPointerDown(e, player.id); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDoubleClick={() => onEdit(player)}
    >
      {/* Stats Tooltip */}
      {hovered && (
        <div
          className="absolute w-[210px] p-3 rounded-xl bg-surface/95 border border-outline-variant shadow-lg animate-fade-in pointer-events-none z-[200]"
          style={{
            ...(y < 35
              ? { top: 'calc(100% + 8px)', bottom: 'auto' }
              : { bottom: 'calc(100% + 8px)', top: 'auto' }),
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <div className="flex justify-between items-center mb-2 border-b border-outline-variant/30 pb-2">
            <div className="min-w-0">
              <div className="font-bold text-sm text-on-surface truncate pr-1">{player.name}</div>
              <div className="text-[10px] text-on-surface-variant">
                #{player.number} · {player.position}{player.nationality ? ` · ${player.nationality}` : ''}
              </div>
            </div>
            <div className="bg-secondary-container/30 border border-outline-variant/40 rounded-lg px-2 py-0.5 text-center shrink-0">
              <div className="text-[8px] text-on-surface-variant font-semibold">OVR</div>
              <div className="text-sm font-extrabold text-primary leading-none">{player.rating}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center">
            {(['pace','shooting','passing','dribbling','defending','physical'] as const).map(k => (
              <div key={k} className="bg-surface-container-low rounded-md py-1 px-0.5 border border-outline-variant/10">
                <div className={`text-xs font-bold ${getStatColor(player.stats[k])}`}>{player.stats[k]}</div>
                <div className="text-[8px] text-on-surface-variant font-semibold uppercase">{k.slice(0,3)}</div>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-2 border-t border-outline-variant/20 pt-1.5 text-[9px] text-on-surface-variant font-semibold">
            <span>Pie: {player.preferredFoot}</span>
            <span>Doble clic para editar</span>
          </div>
        </div>
      )}

      {/* Token Circle — clean, no overlay icons inside */}
      <div
        className="w-11 h-11 rounded-full border-[2.5px] border-white shadow-lg flex items-center justify-center font-bold transition-transform duration-150"
        style={player.photoUrl ? { backgroundColor: '#fff' } : bgStyle}
      >
        {player.photoUrl ? (
          <img
            src={player.photoUrl}
            alt={player.name}
            className="w-full h-full object-cover rounded-full"
            draggable={false}
          />
        ) : (
          <span
            className="font-extrabold text-sm leading-none select-none"
            style={{ color: player.textColor }}
          >
            {player.number}
          </span>
        )}
      </div>

      {/* Name Label */}
      <div className="bg-black/70 text-white px-2 py-[2px] rounded-md text-[10px] font-semibold shadow-sm max-w-[80px] truncate text-center leading-tight">
        {displayName}
      </div>

      {/* Quick action buttons — appear BELOW the name label on hover, outside the circle */}
      {hovered && !isDrawingMode && (
        <div className="flex items-center gap-1 animate-fade-in">
          <button
            onClick={e => { e.stopPropagation(); onEdit(player); }}
            title="Editar jugador"
            onPointerDown={e => e.stopPropagation()}
            className="bg-surface/90 border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary rounded-md px-1.5 py-0.5 flex items-center gap-0.5 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined leading-none" style={{ fontSize: '13px' }}>edit</span>
          </button>
          <button
            onClick={e => { e.stopPropagation(); onRemoveFromLineup(player.id); }}
            title="Enviar a banca"
            onPointerDown={e => e.stopPropagation()}
            className="bg-surface/90 border border-outline-variant text-on-surface-variant hover:text-error hover:border-error rounded-md px-1.5 py-0.5 flex items-center gap-0.5 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined leading-none" style={{ fontSize: '13px' }}>person_remove</span>
          </button>
        </div>
      )}
    </div>
  );
};
