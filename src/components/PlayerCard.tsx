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
      default: // solid
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
        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group select-none touch-none"
        style={{
          left: `${x}%`,
          top: `${y}%`,
          cursor: isDrawingMode ? 'default' : 'grab',
          zIndex: hovered ? 100 : 10,
        }}
        onPointerDown={e => { if (!isDrawingMode) onPointerDown(e, player.id); }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onDoubleClick={() => onEdit(player)}
      >
        {/* Stats Tooltip */}
        {hovered && (
          <div 
            className="absolute bottom-[125%] w-[210px] p-3 rounded-xl bg-surface/95 border border-outline-variant shadow-lg animate-fade-in pointer-events-none z-[200]"
            style={{
              ...(y < 35 ? { bottom: 'auto', top: '125%' } : {}),
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

        {/* Token Circle (Jersey representation) */}
        <div 
          className="w-10 h-10 rounded-full border-2 border-white shadow-md flex items-center justify-center font-bold text-white group-hover:scale-105 transition-all relative overflow-hidden"
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
              className="font-extrabold text-sm select-none"
              style={{ color: player.textColor }}
            >
              {player.number}
            </span>
          )}

          {/* Quick Edit/Banca options on hover */}
          {hovered && !isDrawingMode && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 pointer-events-auto">
              <button
                onClick={e => { e.stopPropagation(); onEdit(player); }}
                title="Editar"
                className="text-white hover:text-primary-fixed transition-colors p-0.5"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
              </button>
              <button
                onClick={e => { e.stopPropagation(); onRemoveFromLineup(player.id); }}
                title="Enviar a banca"
                className="text-white hover:text-error-container transition-colors p-0.5"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
              </button>
            </div>
          )}
        </div>

        {/* Name Label */}
        <div className="bg-surface/90 text-on-surface px-2 py-0.5 rounded text-[11px] font-semibold shadow-sm max-w-[80px] truncate text-center border border-outline-variant/20">
          {displayName}
        </div>
      </div>
    );
  };
