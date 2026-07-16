import React, { useState } from 'react';
import { Search, UserPlus, ShieldAlert, Star, Layers, Users } from 'lucide-react';
import type { Player, Team } from '../types';
import { FORMATION_PRESETS } from '../utils/formations';
import { DrawingTools } from './DrawingTools';
import { TeamSelector } from './TeamSelector';

// ─────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────
interface SidebarProps {
  team: Team;
  onApplyPreset: (formationName: string) => void;
  onAddPlayer: () => void;
  onEditPlayer: (player: Player) => void;
  onDeletePlayer: (playerId: string) => void;
  onTogglePlayerLineup: (playerId: string) => void;

  pitchTheme: 'classic' | 'night' | 'tactical' | 'neon';
  setPitchTheme: (theme: 'classic' | 'night' | 'tactical' | 'neon') => void;

  isDrawingMode: boolean;
  setIsDrawingMode: (val: boolean) => void;
  brushColor: string;
  setBrushColor: (val: string) => void;
  brushWidth: number;
  setBrushWidth: (val: number) => void;
  onClearDrawings: () => void;
  onUndoDrawing: () => void;
  strokesCount: number;

  teams: Team[];
  activeTeamId: string;
  onSelectTeam: (id: string) => void;
  onCreateTeam: (name: string) => void;
  onDeleteTeam: (id: string) => void;
  onUpdateTeamDetails: (id: string, updates: Partial<Team>) => void;
  onExportData: () => void;
  onImportData: (jsonData: string) => boolean;
}

type MainTab = 'tactics' | 'squad';
type SquadFilter = 'ALL' | 'GK' | 'DF' | 'MF' | 'FW';
type SquadTab = 'all' | 'lineup' | 'bench';

// ─────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────
export const Sidebar: React.FC<SidebarProps> = ({
  team, onApplyPreset, onAddPlayer, onEditPlayer, onDeletePlayer, onTogglePlayerLineup,
  pitchTheme, setPitchTheme,
  isDrawingMode, setIsDrawingMode, brushColor, setBrushColor, brushWidth, setBrushWidth,
  onClearDrawings, onUndoDrawing, strokesCount,
  teams, activeTeamId, onSelectTeam, onCreateTeam, onDeleteTeam, onUpdateTeamDetails, onExportData, onImportData,
}) => {
  const [mainTab, setMainTab] = useState<MainTab>('tactics');
  const [search, setSearch] = useState('');
  const [posFilter, setPosFilter] = useState<SquadFilter>('ALL');
  const [squadTab, setSquadTab] = useState<SquadTab>('all');

  const activeIds = new Set(team.lineup.map(p => p.playerId));
  const lineupCount = team.lineup.length;

  const filtered = team.players.filter(p => {
    const matchName = p.name.toLowerCase().includes(search.toLowerCase()) || p.number.includes(search);
    const matchPos  = posFilter === 'ALL' || p.position === posFilter;
    const inLineup  = activeIds.has(p.id);
    const matchTab  = squadTab === 'all' ? true : squadTab === 'lineup' ? inLineup : !inLineup;
    return matchName && matchPos && matchTab;
  });

  const PITCH_THEMES = [
    { id: 'classic',  label: 'Clásico',  emoji: '🌿' },
    { id: 'night',    label: 'Noche',    emoji: '🌙' },
    { id: 'tactical', label: 'Pizarra',  emoji: '📋' },
    { id: 'neon',     label: 'Neón',     emoji: '⚡' },
  ] as const;

  const posLabels: Record<SquadFilter, string> = { ALL: 'Todos', GK: 'POR', DF: 'DEF', MF: 'MED', FW: 'DEL' };
  const posColors: Record<string, string> = { GK: '#f59e0b', DF: '#3b82f6', MF: '#10b981', FW: '#ef4444' };

  return (
    <aside style={sidebarShell}>
      {/* ── Brand ── */}
      <div style={brandBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={brandIcon}>⚽</span>
          <div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.15rem', color: '#fff', lineHeight: 1.1 }}>
              Tactix
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Soccer Formation Designer</div>
          </div>
        </div>
      </div>

      {/* ── Main tab switcher ── */}
      <div style={mainTabBar}>
        <button style={mainTabBtn(mainTab === 'tactics')} onClick={() => setMainTab('tactics')}>
          <Layers size={14} /> Tácticas
        </button>
        <button style={mainTabBtn(mainTab === 'squad')} onClick={() => setMainTab('squad')}>
          <Users size={14} /> Plantilla
          <span style={badgePill(lineupCount >= 11 ? '#10b981' : '#64748b')}>{lineupCount}/11</span>
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div style={scrollBody}>

        {/* ════════ TÁCTICAS TAB ════════ */}
        {mainTab === 'tactics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Team management */}
            <TeamSelector
              teams={teams} activeTeamId={activeTeamId}
              onSelectTeam={onSelectTeam} onCreateTeam={onCreateTeam}
              onDeleteTeam={onDeleteTeam} onUpdateTeamDetails={onUpdateTeamDetails}
              onExportData={onExportData} onImportData={onImportData}
            />

            {/* Pitch themes */}
            <div style={card}>
              <div style={cardTitle}>🎨 Estilo de Cancha</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {PITCH_THEMES.map(t => (
                  <button key={t.id} onClick={() => setPitchTheme(t.id)}
                    style={themeBtn(pitchTheme === t.id)}>
                    <span>{t.emoji}</span> {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Formation presets */}
            <div style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={cardTitle}>⚽ Formaciones</div>
                <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>
                  {team.formationName || '—'}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5 }}>
                {Object.keys(FORMATION_PRESETS).map(name => {
                  const active = team.formationName === name;
                  return (
                    <button key={name} onClick={() => onApplyPreset(name)}
                      style={{
                        padding: '7px 2px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 700,
                        border: active ? '1.5px solid #10b981' : '1px solid rgba(255,255,255,0.07)',
                        background: active ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.02)',
                        color: active ? '#34d399' : 'var(--text-secondary)', cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}>
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drawing tools */}
            <DrawingTools
              isDrawingMode={isDrawingMode} setIsDrawingMode={setIsDrawingMode}
              brushColor={brushColor} setBrushColor={setBrushColor}
              brushWidth={brushWidth} setBrushWidth={setBrushWidth}
              onClear={onClearDrawings} onUndo={onUndoDrawing} strokesCount={strokesCount}
            />
          </div>
        )}

        {/* ════════ PLANTILLA TAB ════════ */}
        {mainTab === 'squad' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {team.players.length} jugadores en plantilla
              </span>
              <button onClick={onAddPlayer} className="btn btn-primary"
                style={{ padding: '7px 14px', fontSize: '0.78rem', display: 'flex', gap: 6, alignItems: 'center' }}>
                <UserPlus size={14} /> Nuevo Jugador
              </button>
            </div>

            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="form-input" placeholder="Buscar por nombre o dorsal…" value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 32, fontSize: '0.82rem' }} />
            </div>

            {/* Position filter pills */}
            <div style={{ display: 'flex', gap: 5 }}>
              {(Object.keys(posLabels) as SquadFilter[]).map(pos => (
                <button key={pos} onClick={() => setPosFilter(pos)}
                  style={{
                    flex: 1, padding: '5px 2px', borderRadius: 8, fontSize: '0.65rem', fontWeight: 700,
                    border: posFilter === pos ? `1.5px solid ${posColors[pos] ?? '#10b981'}` : '1px solid rgba(255,255,255,0.06)',
                    background: posFilter === pos ? `${posColors[pos] ?? '#10b981'}22` : 'transparent',
                    color: posFilter === pos ? (posColors[pos] ?? '#10b981') : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}>
                  {posLabels[pos]}
                </button>
              ))}
            </div>

            {/* Squad sub-tabs */}
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 3, gap: 2 }}>
              {([['all', 'Todos'], ['lineup', `Titulares`], ['bench', 'Banca']] as const).map(([id, label]) => (
                <button key={id} onClick={() => setSquadTab(id)}
                  style={{
                    flex: 1, padding: '6px 4px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 600,
                    border: 'none', cursor: 'pointer',
                    background: squadTab === id ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: squadTab === id ? '#fff' : 'var(--text-secondary)',
                    transition: 'all 0.15s',
                  }}>
                  {label}
                  <span style={{ marginLeft: 4, fontSize: '0.6rem', opacity: 0.7 }}>
                    ({id === 'all' ? team.players.length : id === 'lineup' ? lineupCount : team.players.length - lineupCount})
                  </span>
                </button>
              ))}
            </div>

            {/* Over-11 warning */}
            {lineupCount > 11 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '8px 12px', fontSize: '0.75rem', color: '#f87171' }}>
                <ShieldAlert size={14} /> {lineupCount} titulares. El máximo es 11.
              </div>
            )}

            {/* Player list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '28px 0', fontSize: '0.82rem' }}>
                  Sin jugadores que coincidan
                </div>
              ) : (
                filtered.map(player => {
                  const inLineup = activeIds.has(player.id);
                  const posColor = posColors[player.position] ?? '#64748b';
                  return (
                    <div key={player.id} style={playerRow(player.avatarColor)}>

                      {/* Avatar / photo */}
                      <div style={avatarCircle(player.avatarColor)}>
                        {player.photoUrl
                          ? <img src={player.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                          : <span style={{ color: player.textColor, fontWeight: 800, fontSize: '0.85rem' }}>{player.number}</span>
                        }
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {player.name}
                          </span>
                          <span style={{ flexShrink: 0, fontSize: '0.6rem', fontWeight: 700, color: posColor, background: `${posColor}22`, border: `1px solid ${posColor}44`, borderRadius: 4, padding: '1px 5px' }}>
                            {player.position}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 10, fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Star size={9} color="#f59e0b" fill="#f59e0b" /> {player.rating}
                          </span>
                          <span>#{player.number}</span>
                          <span style={{ color: inLineup ? '#34d399' : 'var(--text-muted)' }}>
                            {inLineup ? '● Titular' : '○ Banca'}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 3, alignItems: 'center', flexShrink: 0 }}>
                        <button
                          onClick={() => onTogglePlayerLineup(player.id)}
                          title={inLineup ? 'Enviar a banca' : 'Poner como titular'}
                          aria-label={inLineup ? `Enviar ${player.name} a banca` : `Poner a ${player.name} como titular`}
                          style={{
                            padding: '4px 9px', borderRadius: 7, fontSize: '0.68rem', fontWeight: 600,
                            border: inLineup ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(16,185,129,0.3)',
                            background: inLineup ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
                            color: inLineup ? '#f87171' : '#34d399', cursor: 'pointer',
                          }}>
                          {inLineup ? 'Banca' : 'Titular'}
                        </button>
                        <button onClick={() => onEditPlayer(player)} title="Editar" aria-label={`Editar a ${player.name}`}
                          style={iconBtn}>✏️</button>
                        <button onClick={() => onDeletePlayer(player.id)} title="Eliminar" aria-label={`Eliminar a ${player.name}`}
                          style={{ ...iconBtn, opacity: 0.75 }}>🗑️</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

// ─────────────────────────────────────────────
//  Style helpers
// ─────────────────────────────────────────────
const sidebarShell: React.CSSProperties = {
  height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden',
  background: 'rgba(10,15,28,0.85)', backdropFilter: 'blur(20px)',
  borderLeft: '1px solid rgba(255,255,255,0.07)',
};

const brandBar: React.CSSProperties = {
  padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)',
  flexShrink: 0,
};

const brandIcon: React.CSSProperties = {
  background: 'rgba(16,185,129,0.15)', borderRadius: 10,
  padding: '6px 7px', fontSize: '1.2rem',
};

const mainTabBar: React.CSSProperties = {
  display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0,
};

const mainTabBtn = (active: boolean): React.CSSProperties => ({
  flex: 1, padding: '11px 8px', border: 'none', cursor: 'pointer', fontSize: '0.82rem',
  fontWeight: 700, display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center',
  background: active ? 'rgba(16,185,129,0.07)' : 'transparent',
  color: active ? '#fff' : 'var(--text-secondary)',
  borderBottom: active ? '2px solid #10b981' : '2px solid transparent',
  transition: 'all 0.2s',
});

const badgePill = (color: string): React.CSSProperties => ({
  background: `${color}33`, border: `1px solid ${color}66`,
  color, borderRadius: 20, padding: '1px 7px', fontSize: '0.6rem', fontWeight: 700,
});

const scrollBody: React.CSSProperties = {
  flex: 1, overflowY: 'auto', padding: '14px 14px 20px',
};

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: 12, padding: '12px 14px',
};

const cardTitle: React.CSSProperties = {
  fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)',
  textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10,
};

const themeBtn = (active: boolean): React.CSSProperties => ({
  padding: '8px 10px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600,
  border: active ? '1.5px solid #10b981' : '1px solid rgba(255,255,255,0.07)',
  background: active ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.02)',
  color: active ? '#34d399' : 'var(--text-secondary)', cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s',
});

const playerRow = (accentColor: string): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px',
  background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.04)`,
  borderLeft: `3px solid ${accentColor}`,
  borderRadius: 10, transition: 'background 0.15s',
});

const avatarCircle = (bg: string): React.CSSProperties => ({
  width: 36, height: 36, borderRadius: '50%', background: bg, flexShrink: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  overflow: 'hidden', border: '2px solid rgba(255,255,255,0.15)',
  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
});

const iconBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: '0.8rem', padding: '3px 2px', lineHeight: 1,
};
