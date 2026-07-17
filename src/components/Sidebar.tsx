import React, { useState } from 'react';
import type { Player, Team } from '../types';
import { FORMATION_PRESETS } from '../utils/formations';
import { DrawingTools } from './DrawingTools';
import { TeamSelector } from './TeamSelector';

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

export const Sidebar: React.FC<SidebarProps> = ({
  team, onApplyPreset, onAddPlayer, onEditPlayer, onDeletePlayer, onTogglePlayerLineup,
  pitchTheme, setPitchTheme,
  isDrawingMode, setIsDrawingMode, brushColor, setBrushColor, brushWidth, setBrushWidth,
  onClearDrawings, onUndoDrawing, strokesCount,
  teams, activeTeamId, onSelectTeam, onCreateTeam, onDeleteTeam, onUpdateTeamDetails, onExportData, onImportData,
}) => {
  const [mainTab, setMainTab] = useState<MainTab>('squad'); // Default to squad tab
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
  const posColors: Record<string, string> = { GK: '#f59e0b', DF: '#ef4444', MF: '#10b981', FW: '#3b82f6' };

  return (
    <aside className="w-[380px] bg-surface border-l border-outline-variant flex flex-col shrink-0 h-full overflow-hidden shadow-sm z-20">
      {/* ── Sidebar Tabs ── */}
      <div className="flex border-b border-outline-variant">
        <button 
          onClick={() => setMainTab('tactics')}
          className={`flex-1 py-md font-label-lg text-label-lg flex items-center justify-center gap-sm transition-colors border-b-2 ${
            mainTab === 'tactics' 
              ? 'text-primary font-bold border-primary bg-surface-bright' 
              : 'text-on-surface-variant hover:bg-surface-variant/50 border-transparent'
          }`}
        >
          <span className="material-symbols-outlined text-lg">strategy</span>
          Tácticas
        </button>
        <button 
          onClick={() => setMainTab('squad')}
          className={`flex-1 py-md font-label-lg text-label-lg flex items-center justify-center gap-sm transition-colors border-b-2 ${
            mainTab === 'squad' 
              ? 'text-primary font-bold border-primary bg-surface-bright' 
              : 'text-on-surface-variant hover:bg-surface-variant/50 border-transparent'
          }`}
        >
          <span className="material-symbols-outlined text-lg">groups</span>
          Plantilla 
          <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full text-xs font-semibold ml-1">
            {lineupCount}/11
          </span>
        </button>
      </div>

      {/* ── Scrollable Body ── */}
      <div className="flex-1 overflow-y-auto p-md flex flex-col gap-lg bg-surface-bright">

        {/* ════════ TÁCTICAS TAB ════════ */}
        {mainTab === 'tactics' && (
          <div className="flex flex-col gap-md">
            {/* Team Management */}
            <TeamSelector
              teams={teams} activeTeamId={activeTeamId}
              onSelectTeam={onSelectTeam} onCreateTeam={onCreateTeam}
              onDeleteTeam={onDeleteTeam} onUpdateTeamDetails={onUpdateTeamDetails}
              onExportData={onExportData} onImportData={onImportData}
            />

            {/* Pitch Themes */}
            <div className="bg-surface rounded-xl p-md border border-outline-variant shadow-sm">
              <div className="font-title-lg text-title-lg text-on-surface mb-sm">🎨 Estilo de Cancha</div>
              <div className="grid grid-cols-2 gap-2">
                {PITCH_THEMES.map(t => (
                  <button 
                    key={t.id} 
                    onClick={() => setPitchTheme(t.id)}
                    className={`py-1.5 px-3 rounded-lg text-label-sm font-label-sm flex items-center gap-sm transition-all border ${
                      pitchTheme === t.id 
                        ? 'border-primary bg-secondary-container text-on-secondary-container' 
                        : 'border-outline-variant bg-surface text-on-surface-variant hover:bg-surface-variant/50'
                    }`}
                  >
                    <span>{t.emoji}</span> {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Formation Presets */}
            <div className="bg-surface rounded-xl p-md border border-outline-variant shadow-sm">
              <div className="flex justify-between items-center mb-sm">
                <div className="font-title-lg text-title-lg text-on-surface">⚽ Formaciones</div>
                <span className="font-label-sm text-label-sm text-primary font-bold">
                  {team.formationName || '—'}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {Object.keys(FORMATION_PRESETS).map(name => {
                  const active = team.formationName === name;
                  return (
                    <button 
                      key={name} 
                      onClick={() => onApplyPreset(name)}
                      className={`py-1 px-0.5 rounded text-[11px] font-bold border transition-colors ${
                        active 
                          ? 'border-primary bg-secondary-container text-on-secondary-container' 
                          : 'border-outline-variant bg-surface text-on-surface-variant hover:bg-surface-variant/50'
                      }`}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drawing Tools */}
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
          <div className="flex flex-col gap-md">
            {/* Header & Add Button */}
            <div className="flex justify-between items-center">
              <h2 className="font-title-lg text-title-lg text-on-surface">
                {team.players.length} jugadores en plantilla
              </h2>
              <button 
                onClick={onAddPlayer}
                className="bg-primary text-on-primary font-label-lg text-label-lg px-md py-sm rounded-lg flex items-center gap-sm hover:bg-primary-container transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">person_add</span>
                Nuevo Jugador
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
              <input 
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-10 pr-4 py-2 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-shadow placeholder:text-outline"
                placeholder="Buscar por nombre o dorsal..." 
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Position Filters */}
            <div className="flex gap-2">
              {(Object.keys(posLabels) as SquadFilter[]).map(pos => {
                const active = posFilter === pos;
                return (
                  <button 
                    key={pos} 
                    onClick={() => setPosFilter(pos)}
                    className={`flex-1 font-label-sm text-label-sm py-1.5 rounded-lg border transition-colors ${
                      active 
                        ? 'bg-secondary text-on-primary border-secondary' 
                        : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-variant/50'
                    }`}
                  >
                    {posLabels[pos]}
                  </button>
                );
              })}
            </div>

            {/* Status Filters */}
            <div className="flex bg-surface-container rounded-lg p-1 border border-outline-variant">
              {([['all', 'Todos', team.players.length], ['lineup', 'Titulares', lineupCount], ['bench', 'Banca', team.players.length - lineupCount]] as const).map(([id, label, count]) => {
                const active = squadTab === id;
                return (
                  <button 
                    key={id} 
                    onClick={() => setSquadTab(id)}
                    className={`flex-1 py-1.5 font-label-sm text-label-sm rounded-md transition-all ${
                      active 
                        ? 'bg-surface shadow-sm text-on-surface font-semibold' 
                        : 'text-on-surface-variant hover:bg-surface-variant/50'
                    }`}
                  >
                    {label} <span className={`${active ? 'text-on-surface' : 'text-on-surface-variant'} font-normal text-xs`}>({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Over-11 warning */}
            {lineupCount > 11 && (
              <div className="flex items-center gap-2 bg-error-container text-on-error-container border border-error/20 rounded-lg p-3 text-xs animate-fade-in">
                <span className="material-symbols-outlined text-sm">warning</span>
                <span>{lineupCount} titulares colocados. El máximo permitido es 11.</span>
              </div>
            )}

            {/* Player list */}
            <div className="flex flex-col gap-2">
              {filtered.length === 0 ? (
                <div className="text-center text-on-surface-variant py-10 text-body-md">
                  Sin jugadores que coincidan
                </div>
              ) : (
                filtered.map(player => {
                  const inLineup = activeIds.has(player.id);
                  const posBg = player.avatarColor;
                  return (
                    <div 
                      key={player.id} 
                      className={`flex items-center justify-between p-sm rounded-lg border border-outline-variant bg-surface hover:bg-surface-container-low transition-colors group ${
                        !inLineup ? 'opacity-70 hover:opacity-100' : ''
                      }`}
                    >
                      <div className="flex items-center gap-md">
                        {/* Avatar/Number */}
                        <div 
                          className="w-10 h-10 rounded-full text-white font-bold flex items-center justify-center shrink-0 shadow-sm border-l-4 overflow-hidden bg-white"
                          style={{
                            borderLeftColor: posBg || '#64748b',
                            backgroundColor: player.photoUrl ? '#fff' : posBg
                          }}
                        >
                          {player.photoUrl ? (
                            <img src={player.photoUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span style={{ color: player.textColor }}>{player.number}</span>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-label-lg text-label-lg text-on-surface truncate max-w-[140px] block">
                              {player.name}
                            </span>
                            <span 
                              className="text-[10px] px-1.5 py-0.5 rounded border font-semibold"
                              style={{
                                color: posColors[player.position],
                                borderColor: `${posColors[player.position]}44`,
                                backgroundColor: `${posColors[player.position]}11`,
                              }}
                            >
                              {player.position}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-0.5 font-medium">
                            <span className="flex items-center text-yellow-600">
                              <span className="material-symbols-outlined text-[12px] mr-[2px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> 
                              {player.rating}
                            </span>
                            <span>#{player.number}</span>
                            <span className="flex items-center gap-1">
                              <div className={`w-1.5 h-1.5 rounded-full ${inLineup ? 'bg-primary' : 'bg-outline'}`}></div>
                              {inLineup ? 'Titular' : 'Banca'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => onTogglePlayerLineup(player.id)}
                          aria-label={inLineup ? 'Enviar a banca' : 'Poner como titular'}
                          className={`text-xs px-2 py-1 rounded transition-colors font-medium border ${
                            inLineup 
                              ? 'border-tertiary-container text-tertiary hover:bg-error-container' 
                              : 'border-primary text-primary hover:bg-secondary-container'
                          }`}
                        >
                          {inLineup ? 'Banca' : 'Titular'}
                        </button>
                        <button 
                          onClick={() => onEditPlayer(player)} 
                          title="Editar"
                          aria-label={`Editar a ${player.name}`}
                          className="text-outline hover:text-on-surface flex items-center"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button 
                          onClick={() => onDeletePlayer(player.id)} 
                          title="Eliminar"
                          aria-label={`Eliminar a ${player.name}`}
                          className="text-outline hover:text-error flex items-center"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
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
