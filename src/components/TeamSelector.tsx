import React, { useState } from 'react';
import type { Team } from '../types';

interface TeamSelectorProps {
  teams: Team[];
  activeTeamId: string;
  onSelectTeam: (id: string) => void;
  onCreateTeam: (name: string) => void;
  onCreateEmptyTeam: (name: string) => void;
  onDeleteTeam: (id: string) => void;
  onUpdateTeamDetails: (id: string, updates: Partial<Team>) => void;
  onExportData: () => void;
  onImportData: (jsonData: string) => boolean;
}

export const TeamSelector: React.FC<TeamSelectorProps> = ({
  teams,
  activeTeamId,
  onSelectTeam,
  onCreateTeam,
  onCreateEmptyTeam,
  onDeleteTeam,
  onUpdateTeamDetails,
  onExportData,
  onImportData,
}) => {
  const [newTeamName, setNewTeamName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [useEmpty, setUseEmpty] = useState(false);

  const safeTeams = Array.isArray(teams) && teams.length > 0 ? teams : [];
  const activeTeam = safeTeams.find((t) => t.id === activeTeamId) || safeTeams[0];

  if (safeTeams.length === 0) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    if (useEmpty) {
      onCreateEmptyTeam(newTeamName.trim());
    } else {
      onCreateTeam(newTeamName.trim());
    }
    setNewTeamName('');
    setIsCreating(false);
    setUseEmpty(false);
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const success = onImportData(text);
      if (success) {
        alert('Datos importados con éxito.');
      } else {
        alert('Error al importar el archivo. Formato inválido.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="bg-surface rounded-xl p-md border border-outline-variant shadow-sm">
      <div className="flex justify-between items-center mb-sm">
        <h4 className="font-title-lg text-title-lg text-primary flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary text-xl">shield</span>
          Gestión de Equipos
        </h4>
        
        <div className="flex gap-2">
          <button
            onClick={onExportData}
            title="Exportar datos (JSON)"
            aria-label="Exportar datos (JSON)"
            className="w-7 h-7 bg-surface border border-outline-variant rounded-lg text-on-surface-variant flex items-center justify-center hover:bg-surface-variant/50 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">download</span>
          </button>
          <button
            onClick={handleImportClick}
            title="Importar datos (JSON)"
            aria-label="Importar datos (JSON)"
            className="w-7 h-7 bg-surface border border-outline-variant rounded-lg text-on-surface-variant flex items-center justify-center hover:bg-surface-variant/50 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">upload</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* Select and create row */}
      <div className="flex gap-2 mb-sm">
        <select
          className="flex-1 bg-surface border border-outline-variant rounded-lg px-3 py-1.5 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-shadow"
          value={activeTeamId}
          onChange={(e) => onSelectTeam(e.target.value)}
        >
          {safeTeams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-primary text-on-primary font-label-lg text-label-lg px-3 rounded-lg flex items-center justify-center hover:bg-primary-container transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>

      {/* Create Team Form */}
      {isCreating && (
        <form onSubmit={handleCreate} className="animate-fade-in flex flex-col gap-2 p-2 bg-surface-container-low rounded-lg border border-outline-variant">
          <input
            type="text"
            className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-1.5 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-shadow placeholder:text-outline"
            placeholder="Nombre del nuevo equipo..."
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            required
            autoFocus
          />
          {/* Empty vs template toggle */}
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setUseEmpty(false)}
              className={`flex-1 py-1 text-[11px] font-semibold rounded border transition-colors ${
                !useEmpty
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-variant/50'
              }`}
            >
              Con jugadores de ejemplo
            </button>
            <button
              type="button"
              onClick={() => setUseEmpty(true)}
              className={`flex-1 py-1 text-[11px] font-semibold rounded border transition-colors ${
                useEmpty
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-variant/50'
              }`}
            >
              🆕 Plantilla vacía
            </button>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-primary text-on-primary font-label-sm text-label-sm px-3 py-1.5 rounded-lg hover:bg-primary-container transition-colors shadow-sm">
              Crear
            </button>
            <button
              type="button"
              className="bg-surface border border-outline-variant text-on-surface-variant font-label-sm text-label-sm px-3 py-1.5 rounded-lg hover:bg-surface-variant/50 transition-colors"
              onClick={() => { setIsCreating(false); setUseEmpty(false); }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Team settings (Colors & Style) */}
      {activeTeam && (
        <div className="flex flex-col gap-2 mt-sm border-t border-outline-variant/30 pt-sm">
          <div className="flex justify-between items-center gap-2">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="bg-surface border border-outline-variant text-on-surface-variant font-label-sm text-label-sm py-1.5 px-3 rounded-lg flex items-center justify-center gap-xs hover:bg-surface-variant/50 transition-colors w-full"
            >
              <span className="material-symbols-outlined text-sm">palette</span>
              Personalizar Uniforme de {activeTeam.name}
            </button>
            
            {safeTeams.length > 1 && (
              <button
                onClick={() => onDeleteTeam(activeTeam.id)}
                title="Eliminar equipo"
                aria-label={`Eliminar equipo ${activeTeam.name}`}
                className="text-error hover:bg-error-container/20 p-1.5 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            )}
          </div>

          {showColorPicker && (
            <div className="animate-fade-in bg-surface-container rounded-lg p-3 flex flex-col gap-2 mt-1">
              {/* Primary Color */}
              <div className="flex justify-between items-center">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Color Local</span>
                <input
                  type="color"
                  value={activeTeam.primaryColor || '#10b981'}
                  onChange={(e) => onUpdateTeamDetails(activeTeam.id, { primaryColor: e.target.value })}
                  className="w-8 h-8 rounded border-0 cursor-pointer p-0 bg-transparent"
                />
              </div>

              {/* Secondary Color */}
              <div className="flex justify-between items-center">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Color Visitante</span>
                <input
                  type="color"
                  value={activeTeam.secondaryColor || '#ffffff'}
                  onChange={(e) => onUpdateTeamDetails(activeTeam.id, { secondaryColor: e.target.value })}
                  className="w-8 h-8 rounded border-0 cursor-pointer p-0 bg-transparent"
                />
              </div>

              {/* Style selector */}
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Estilo del Uniforme</span>
                <select
                  className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-1 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-shadow"
                  value={activeTeam.jerseyStyle || 'solid'}
                  onChange={(e) => onUpdateTeamDetails(activeTeam.id, { jerseyStyle: e.target.value as any })}
                >
                  <option value="solid">Liso / Sólido</option>
                  <option value="striped">Franjas Verticales</option>
                  <option value="gradient">Difuminado / Gradiente</option>
                  <option value="neon">Borde Neón Brillante</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
