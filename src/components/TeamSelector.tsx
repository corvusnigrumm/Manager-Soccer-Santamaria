import React, { useState } from 'react';
import { Shield, Plus, Trash2, Download, Upload, Palette } from 'lucide-react';
import type { Team } from '../types';

interface TeamSelectorProps {
  teams: Team[];
  activeTeamId: string;
  onSelectTeam: (id: string) => void;
  onCreateTeam: (name: string) => void;
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
  onDeleteTeam,
  onUpdateTeamDetails,
  onExportData,
  onImportData,
}) => {
  const [newTeamName, setNewTeamName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Guard against undefined/empty teams array
  const safeTeams = Array.isArray(teams) && teams.length > 0 ? teams : [];
  const activeTeam = safeTeams.find((t) => t.id === activeTeamId) || safeTeams[0];

  // Don't render if no teams are loaded yet
  if (safeTeams.length === 0) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    onCreateTeam(newTeamName.trim());
    setNewTeamName('');
    setIsCreating(false);
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
    // Clear input
    e.target.value = '';
  };

  return (
    <div className="glass-panel" style={containerStyle}>
      <div style={headerStyle}>
        <h4 style={{ fontSize: '0.9rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <Shield size={16} className="text-primary" />
          Gestión de Equipos
        </h4>
        
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={onExportData}
            title="Exportar datos (JSON)"
            style={iconButtonStyle}
          >
            <Download size={14} />
          </button>
          <button
            onClick={handleImportClick}
            title="Importar datos (JSON)"
            style={iconButtonStyle}
          >
            <Upload size={14} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Select and create */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <select
          className="form-select"
          style={{ flex: 1 }}
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
          className="btn btn-secondary"
          style={{ padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Create Team Form */}
      {isCreating && (
        <form onSubmit={handleCreate} className="animate-fade-in" style={createFormStyle}>
          <input
            type="text"
            className="form-input"
            placeholder="Nombre del nuevo equipo..."
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            required
            autoFocus
          />
          <div style={{ display: 'flex', gap: '6px' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              Crear
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              onClick={() => setIsCreating(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Team settings (Colors & Style) */}
      {activeTeam && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', gap: '6px', width: '100%' }}
            >
              <Palette size={14} />
              Personalizar Uniforme de {activeTeam.name}
            </button>
            
            {safeTeams.length > 1 && (
              <button
                onClick={() => onDeleteTeam(activeTeam.id)}
                title="Eliminar equipo"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: '8px',
                }}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          {showColorPicker && (
            <div className="glass-panel animate-fade-in" style={colorPanelStyle}>
              {/* Primary Color */}
              <div style={colorRowStyle}>
                <span className="form-label" style={{ margin: 0 }}>Color Local</span>
                <input
                  type="color"
                  value={activeTeam.primaryColor || '#10b981'}
                  onChange={(e) => onUpdateTeamDetails(activeTeam.id, { primaryColor: e.target.value })}
                  style={colorPickerStyle}
                />
              </div>

              {/* Secondary Color */}
              <div style={colorRowStyle}>
                <span className="form-label" style={{ margin: 0 }}>Color Visitante</span>
                <input
                  type="color"
                  value={activeTeam.secondaryColor || '#ffffff'}
                  onChange={(e) => onUpdateTeamDetails(activeTeam.id, { secondaryColor: e.target.value })}
                  style={colorPickerStyle}
                />
              </div>

              {/* Style selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span className="form-label">Estilo del Uniforme</span>
                <select
                  className="form-select"
                  value={activeTeam.jerseyStyle || 'solid'}
                  onChange={(e) => onUpdateTeamDetails(activeTeam.id, { jerseyStyle: e.target.value as any })}
                  style={{ fontSize: '0.8rem', padding: '6px 8px' }}
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

const containerStyle: React.CSSProperties = {
  padding: '16px',
  marginBottom: '16px',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px',
};

const iconButtonStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid var(--border-color)',
  borderRadius: '6px',
  color: 'var(--text-secondary)',
  width: '28px',
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

const createFormStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: '10px',
  backgroundColor: 'rgba(0,0,0,0.15)',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
};

const colorPanelStyle: React.CSSProperties = {
  padding: '12px',
  backgroundColor: 'rgba(15, 23, 42, 0.4)',
  borderRadius: '10px',
  marginTop: '4px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const colorRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const colorPickerStyle: React.CSSProperties = {
  border: 'none',
  width: '32px',
  height: '32px',
  borderRadius: '4px',
  cursor: 'pointer',
  background: 'transparent',
};
