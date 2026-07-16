import React, { useState } from 'react';
import { Edit2, ArrowDownToLine } from 'lucide-react';
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

const getStatColor = (v: number) => v >= 80 ? '#34d399' : v >= 60 ? '#fbbf24' : '#f87171';

/** Builds the jersey CSS background based on design & colors */
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

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        cursor: isDrawingMode ? 'default' : 'grab',
        zIndex: hovered ? 100 : 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        userSelect: 'none',
        touchAction: 'none',
      }}
      onPointerDown={e => { if (!isDrawingMode) onPointerDown(e, player.id); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDoubleClick={() => onEdit(player)}
    >
      {/* ── Stats tooltip ── */}
      {hovered && (
        // BUG-6 fix: show tooltip below token when player is near the top of the pitch
        <div className="glass-panel animate-fade-in" style={{
          ...tooltipStyle,
          ...(y < 35 ? { bottom: 'auto', top: '120%' } : {}),
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 7 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{player.name}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>#{player.number} · {player.position}{player.nationality ? ` · ${player.nationality}` : ''}</div>
            </div>
            <div style={{ background: 'rgba(16,185,129,0.15)', borderRadius: 8, padding: '3px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>OVR</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#34d399', lineHeight: 1 }}>{player.rating}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 5, textAlign: 'center' }}>
            {(['pace','shooting','passing','dribbling','defending','physical'] as const).map(k => (
              <div key={k} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 5, padding: '5px 2px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: getStatColor(player.stats[k]) }}>{player.stats[k]}</div>
                <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{k.slice(0,3)}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 6, fontSize: '0.6rem', color: 'var(--text-muted)' }}>
            <span>Pie: {player.preferredFoot}</span>
            <span>Doble clic para editar</span>
          </div>
        </div>
      )}

      {/* ── Jersey token ── */}
      <div style={{ ...tokenStyle, ...bgStyle, border: `2.5px solid ${player.secondaryJerseyColor ?? '#fff'}` }}>
        {/* Player photo (clips perfectly to circle) */}
        {player.photoUrl ? (
          <img
            src={player.photoUrl}
            alt={player.name}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              borderRadius: '50%', display: 'block',
            }}
            draggable={false}
          />
        ) : (
          <span style={{ color: player.textColor, fontWeight: 800, fontSize: '1.2rem', userSelect: 'none' }}>
            {player.number}
          </span>
        )}

        {/* Overall rating dot */}
        <div style={ratingDotStyle}>
          {player.rating}
        </div>

        {/* Quick-action strip on hover */}
        {hovered && (
          <div style={quickActionsStyle}>
            <button
              onClick={e => { e.stopPropagation(); onEdit(player); }}
              title="Editar"
              style={quickBtnStyle}
            >
              <Edit2 size={9} />
            </button>
            <button
              onClick={e => { e.stopPropagation(); onRemoveFromLineup(player.id); }}
              title="Enviar a banca"
              style={{ ...quickBtnStyle, color: '#ef4444' }}
            >
              <ArrowDownToLine size={9} />
            </button>
          </div>
        )}
      </div>

      {/* Name label */}
      {/* BUG-10 fix: show last word of name (typically surname) for cleaner pitch display */}
      <div style={nameLabelStyle}>
        {player.name.split(' ').pop()}
      </div>
    </div>
  );
};

// ─── Styles ───
const tokenStyle: React.CSSProperties = {
  width: 50, height: 50, borderRadius: '50%',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  overflow: 'hidden', position: 'relative',
  boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
};

const nameLabelStyle: React.CSSProperties = {
  marginTop: 5,
  background: 'rgba(5,10,20,0.82)',
  border: '1px solid rgba(255,255,255,0.06)',
  padding: '2px 8px', borderRadius: 5,
  fontSize: '0.7rem', fontWeight: 600, color: '#fff',
  textAlign: 'center', maxWidth: 76,
  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  backdropFilter: 'blur(4px)',
};

const ratingDotStyle: React.CSSProperties = {
  position: 'absolute', bottom: -1, right: -1,
  background: '#10b981', border: '2px solid #050a14',
  borderRadius: '50%', width: 18, height: 18,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '0.55rem', fontWeight: 800, color: '#fff',
  lineHeight: 1,
};

// BUG-7 fix: moved down further so it doesn't overlap the rating dot (which is at bottom:-1, right:-1)
const quickActionsStyle: React.CSSProperties = {
  position: 'absolute', bottom: -26, left: '50%', transform: 'translateX(-50%)',
  background: 'rgba(10,15,28,0.92)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12, padding: '3px 8px',
  display: 'flex', gap: 8, alignItems: 'center',
  pointerEvents: 'auto',
};

const quickBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', color: 'var(--text-secondary)',
  cursor: 'pointer', padding: 2,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const tooltipStyle: React.CSSProperties = {
  position: 'absolute', bottom: '120%',
  width: 200, padding: '10px 12px', borderRadius: 12,
  background: 'rgba(8,12,24,0.97)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
  pointerEvents: 'none',
  zIndex: 200,
};
