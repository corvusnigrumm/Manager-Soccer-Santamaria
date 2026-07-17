import { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import type { Player, Team, DrawingStroke } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { FORMATION_PRESETS, loadCustomFormations } from './utils/formations';
import { Pitch } from './components/Pitch';
import { Sidebar } from './components/Sidebar';
import { PlayerModal } from './components/PlayerModal';

// Legendary Initial Players List
const mkP = (id: string, name: string, num: string, pos: Player['position'], stats: Player['stats'],
  c1: string, c2: string, txt: string, rating: number, foot: Player['preferredFoot'],
  design: Player['jerseyDesign'] = 'solid'): Player =>
  ({ id, name, number: num, position: pos, stats, avatarColor: c1, secondaryJerseyColor: c2, textColor: txt, rating, preferredFoot: foot, jerseyDesign: design });

const INITIAL_PLAYERS: Player[] = [
  mkP('p1',  'Iker Casillas',     '1',  'GK', { pace:83, shooting:70, passing:75, dribbling:78, defending:88, physical:82 }, '#f59e0b','#000','#000', 89,'Izquierdo','solid'),
  mkP('p2',  'Sergio Ramos',      '4',  'DF', { pace:78, shooting:68, passing:74, dribbling:72, defending:90, physical:89 }, '#ef4444','#fff','#fff', 88,'Derecho',  'solid'),
  mkP('p3',  'Carles Puyol',      '5',  'DF', { pace:72, shooting:55, passing:68, dribbling:65, defending:92, physical:91 }, '#10b981','#fff','#fff', 87,'Derecho',  'solid'),
  mkP('p4',  'Gerard Piqué',      '3',  'DF', { pace:70, shooting:61, passing:78, dribbling:70, defending:86, physical:84 }, '#ef4444','#000','#fff', 85,'Derecho',  'halves'),
  mkP('p5',  'Jordi Alba',        '18', 'DF', { pace:90, shooting:69, passing:81, dribbling:82, defending:77, physical:72 }, '#3b82f6','#fff','#fff', 84,'Izquierdo','solid'),
  mkP('p6',  'Dani Alves',        '2',  'DF', { pace:85, shooting:71, passing:84, dribbling:84, defending:81, physical:78 }, '#1d4ed8','#f59e0b','#fff',86,'Derecho', 'striped'),
  mkP('p7',  'Sergio Busquets',   '5',  'MF', { pace:62, shooting:65, passing:86, dribbling:80, defending:87, physical:81 }, '#3b82f6','#fff','#fff', 86,'Derecho',  'solid'),
  mkP('p8',  'Andrés Iniesta',    '8',  'MF', { pace:82, shooting:78, passing:92, dribbling:94, defending:70, physical:68 }, '#3b82f6','#fff','#fff', 90,'Derecho',  'solid'),
  mkP('p9',  'Xavi Hernández',    '6',  'MF', { pace:73, shooting:76, passing:95, dribbling:88, defending:72, physical:70 }, '#3b82f6','#fff','#fff', 89,'Derecho',  'solid'),
  mkP('p10', 'Ronaldinho Gaucho', '10', 'MF', { pace:91, shooting:88, passing:90, dribbling:96, defending:42, physical:79 }, '#f59e0b','#000','#000', 92,'Derecho',  'gradient'),
  mkP('p11', 'Lionel Messi',      '10', 'FW', { pace:92, shooting:94, passing:91, dribbling:97, defending:39, physical:72 }, '#3b82f6','#fff','#fff', 94,'Izquierdo','solid'),
  mkP('p12', 'Cristiano Ronaldo', '7',  'FW', { pace:93, shooting:93, passing:82, dribbling:88, defending:35, physical:89 }, '#ef4444','#000','#fff', 92,'Derecho',  'solid'),
  mkP('p13', 'Luis Suárez',       '9',  'FW', { pace:82, shooting:90, passing:80, dribbling:84, defending:50, physical:85 }, '#10b981','#fff','#fff', 89,'Derecho',  'solid'),
  mkP('p14', 'Luka Modric',       '10', 'MF', { pace:76, shooting:76, passing:89, dribbling:90, defending:72, physical:68 }, '#ef4444','#fff','#fff', 87,'Derecho',  'chevron'),
  mkP('p15', 'Neymar Jr',         '11', 'FW', { pace:89, shooting:83, passing:86, dribbling:93, defending:38, physical:64 }, '#000','#f59e0b','#f59e0b',89,'Derecho', 'halves'),
];

const DEFAULT_LINEUP = [
  { playerId: 'p1', x: 8, y: 50 },   // Casillas (GK) - left aligned for horizontal view
  { playerId: 'p5', x: 25, y: 20 },  // Alba (LI)
  { playerId: 'p3', x: 25, y: 40 },  // Puyol (DFC)
  { playerId: 'p2', x: 25, y: 60 },  // Ramos (DFC)
  { playerId: 'p6', x: 25, y: 80 },  // Alves (LD)
  { playerId: 'p8', x: 50, y: 30 },  // Iniesta (MC)
  { playerId: 'p7', x: 50, y: 50 },  // Busquets (MCD)
  { playerId: 'p9', x: 50, y: 70 },  // Xavi (MC)
  { playerId: 'p12', x: 75, y: 20 }, // Cristiano (EI)
  { playerId: 'p11', x: 75, y: 50 }, // Messi (DC)
  { playerId: 'p10', x: 75, y: 80 }, // Ronaldinho (ED)
];

const INITIAL_TEAM: Team = {
  id: 'team-classic',
  name: 'COLOMBIA',
  players: INITIAL_PLAYERS,
  lineup: DEFAULT_LINEUP,
  formationName: '4-3-3',
  jerseyStyle: 'striped',
  primaryColor: '#006948',
  secondaryColor: '#ffffff',
};

export default function App() {
  // App states
  const [teams, setTeams] = useLocalStorage<Team[]>('tactix_teams', [INITIAL_TEAM]);
  const [activeTeamId, setActiveTeamId] = useLocalStorage<string>('tactix_active_team_id', 'team-classic');
  const [pitchTheme, setPitchTheme] = useLocalStorage<'classic' | 'night' | 'tactical' | 'neon'>('tactix_pitch_theme', 'classic');

  // Drawing strokes
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [brushColor, setBrushColor] = useState('#ffffff');
  const [brushWidth, setBrushWidth] = useState(4);

  // Modal control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playerToEdit, setPlayerToEdit] = useState<Player | null>(null);

  // Sync drawing strokes from LocalStorage per team
  useEffect(() => {
    try {
      const storedStrokes = window.localStorage.getItem(`tactix_strokes_${activeTeamId}`);
      if (storedStrokes) {
        setStrokes(JSON.parse(storedStrokes));
      } else {
        setStrokes([]);
      }
    } catch (e) {
      setStrokes([]);
    }
  }, [activeTeamId]);

  const saveStrokes = (updatedStrokes: DrawingStroke[]) => {
    setStrokes(updatedStrokes);
    window.localStorage.setItem(`tactix_strokes_${activeTeamId}`, JSON.stringify(updatedStrokes));
  };

  // Find active team details
  const activeTeam = teams.find((t) => t.id === activeTeamId) || teams[0] || INITIAL_TEAM;

  // Update team fields inside global teams state
  const updateTeamDetails = (teamId: string, updates: Partial<Team>) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, ...updates } : t))
    );
  };

  // TEAM ACTIONS
  const handleSelectTeam = (id: string) => {
    setActiveTeamId(id);
    setIsDrawingMode(false);
  };

  const handleCreateTeam = (name: string) => {
    const newId = `team-${Math.random().toString(36).substr(2, 9)}`;
    const curated = ['#006948','#1e3a8a','#7c3aed','#9b3e3b','#92400e','#0c4a6e','#1e1b4b','#164e63','#4c1d95'];
    const primaryColor = curated[Math.floor(Math.random() * curated.length)];
    const newTeam: Team = {
      id: newId,
      name: name.toUpperCase(),
      players: [...INITIAL_PLAYERS],
      lineup: [...DEFAULT_LINEUP],
      formationName: '4-3-3',
      jerseyStyle: 'solid',
      primaryColor,
      secondaryColor: '#ffffff',
    };
    setTeams((prev) => [...prev, newTeam]);
    setActiveTeamId(newId);
  };

  // Create a completely empty team (no players, blank slate)
  const handleCreateEmptyTeam = (name: string) => {
    const newId = `team-${Math.random().toString(36).substr(2, 9)}`;
    const curated = ['#006948','#1e3a8a','#7c3aed','#9b3e3b','#92400e','#0c4a6e','#1e1b4b','#164e63','#4c1d95'];
    const primaryColor = curated[Math.floor(Math.random() * curated.length)];
    const newTeam: Team = {
      id: newId,
      name: name.toUpperCase(),
      players: [],
      lineup: [],
      formationName: '—',
      jerseyStyle: 'solid',
      primaryColor,
      secondaryColor: '#ffffff',
    };
    setTeams((prev) => [...prev, newTeam]);
    setActiveTeamId(newId);
  };

  const handleDeleteTeam = (id: string) => {
    if (teams.length <= 1) return;
    const confirmDelete = window.confirm('¿Seguro que deseas eliminar este equipo?');
    if (!confirmDelete) return;

    window.localStorage.removeItem(`tactix_strokes_${id}`);
    
    const remainingTeams = teams.filter((t) => t.id !== id);
    setTeams(remainingTeams);
    if (activeTeamId === id) {
      setActiveTeamId(remainingTeams[0].id);
    }
  };

  // PLAYER CRUD OPERATIONS
  const handleAddPlayerClick = () => {
    setPlayerToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditPlayerClick = (player: Player) => {
    setPlayerToEdit(player);
    setIsModalOpen(true);
  };

  const handleSavePlayer = (player: Player) => {
    const playerExists = activeTeam.players.some((p) => p.id === player.id);
    let updatedPlayers: Player[];

    if (playerExists) {
      updatedPlayers = activeTeam.players.map((p) => (p.id === player.id ? player : p));
    } else {
      updatedPlayers = [...activeTeam.players, player];
    }

    updateTeamDetails(activeTeam.id, { players: updatedPlayers });
  };

  const handleDeletePlayer = (playerId: string) => {
    const confirmDelete = window.confirm('¿Seguro que deseas eliminar este jugador?');
    if (!confirmDelete) return;

    const updatedPlayers = activeTeam.players.filter((p) => p.id !== playerId);
    const updatedLineup = activeTeam.lineup.filter((pos) => pos.playerId !== playerId);

    updateTeamDetails(activeTeam.id, {
      players: updatedPlayers,
      lineup: updatedLineup,
    });
  };

  const handleTogglePlayerLineup = (playerId: string) => {
    const isCurrentlyActive = activeTeam.lineup.some((pos) => pos.playerId === playerId);
    
    if (isCurrentlyActive) {
      const updatedLineup = activeTeam.lineup.filter((pos) => pos.playerId !== playerId);
      updateTeamDetails(activeTeam.id, { lineup: updatedLineup, formationName: 'Personalizado' });
    } else {
      if (activeTeam.lineup.length >= 11) {
        alert('Ya tienes 11 jugadores en el campo. Envía a uno a la banca antes de colocar a otro.');
        return;
      }

      const count = activeTeam.lineup.length;
      const rowSize = 3;
      const col = count % rowSize;
      const row = Math.floor(count / rowSize);
      const x = 30 + row * 15;
      const y = 20 + col * 30;
      const updatedLineup = [...activeTeam.lineup, { playerId, x, y }];
      updateTeamDetails(activeTeam.id, { lineup: updatedLineup, formationName: 'Personalizado' });
    }
  };

  const handleRemoveFromLineup = (playerId: string) => {
    const updatedLineup = activeTeam.lineup.filter((pos) => pos.playerId !== playerId);
    updateTeamDetails(activeTeam.id, { lineup: updatedLineup, formationName: 'Personalizado' });
  };

  const handlePlayerMove = (playerId: string, x: number, y: number) => {
    const updatedLineup = activeTeam.lineup.map((pos) =>
      pos.playerId === playerId ? { ...pos, x, y } : pos
    );
    updateTeamDetails(activeTeam.id, { lineup: updatedLineup, formationName: 'Personalizado' });
  };

  // FORMATION PRESET APPLICATIONS
  const handleApplyPreset = (presetName: string) => {
    // Look up built-in presets first, then custom ones stored in localStorage
    const preset = FORMATION_PRESETS[presetName] ?? loadCustomFormations()[presetName];
    if (!preset) return;

    const playersByPos = {
      GK: activeTeam.players.filter((p) => p.position === 'GK'),
      DF: activeTeam.players.filter((p) => p.position === 'DF'),
      MF: activeTeam.players.filter((p) => p.position === 'MF'),
      FW: activeTeam.players.filter((p) => p.position === 'FW'),
    };

    const usedIds = new Set<string>();
    const newLineup: { playerId: string; x: number; y: number }[] = [];

    preset.positions.forEach((pos) => {
      const posType = pos.defaultPos;
      let matchedPlayer = playersByPos[posType].find((p) => !usedIds.has(p.id));

      if (!matchedPlayer) {
        matchedPlayer = activeTeam.players.find((p) => !usedIds.has(p.id));
      }

      if (matchedPlayer) {
        usedIds.add(matchedPlayer.id);
        // Map preset vertical coordinates to horizontal field layout:
        // GK (y≈88) -> X=8 | DF (y≈70) -> X=25 | MF (y≈50) -> X=50 | FW (y≈20) -> X=75
        let relativeX = 50;
        if (pos.defaultPos === 'GK') relativeX = 8;
        else if (pos.defaultPos === 'DF') relativeX = 25;
        else if (pos.defaultPos === 'MF') relativeX = 50;
        else if (pos.defaultPos === 'FW') relativeX = 75;

        const relativeY = pos.x;

        newLineup.push({
          playerId: matchedPlayer.id,
          x: relativeX,
          y: relativeY,
        });
      }
    });

    updateTeamDetails(activeTeam.id, {
      lineup: newLineup,
      formationName: presetName,
    });
  };

  // DROP PLAYER FROM BENCH ONTO PITCH
  const handleDropPlayer = (playerId: string, x: number, y: number) => {
    const isAlreadyOnPitch = activeTeam.lineup.some((pos) => pos.playerId === playerId);
    if (isAlreadyOnPitch) {
      // Player already on pitch – just move them
      const updatedLineup = activeTeam.lineup.map((pos) =>
        pos.playerId === playerId ? { ...pos, x, y } : pos
      );
      updateTeamDetails(activeTeam.id, { lineup: updatedLineup, formationName: 'Personalizado' });
      return;
    }

    if (activeTeam.lineup.length >= 11) {
      alert('Ya tienes 11 jugadores en el campo. Envía a uno a la banca antes de colocar a otro.');
      return;
    }

    const updatedLineup = [...activeTeam.lineup, { playerId, x, y }];
    updateTeamDetails(activeTeam.id, { lineup: updatedLineup, formationName: 'Personalizado' });
  };

  const handleClearDrawings = () => {
    saveStrokes([]);
  };

  const handleUndoDrawing = () => {
    saveStrokes(strokes.slice(0, -1));
  };

  // EXPORT PNG IMAGE
  const handleExportImage = async () => {
    const pitchElement = document.getElementById('soccer-pitch');
    if (!pitchElement) return;

    try {
      const controls = pitchElement.querySelectorAll('.player-quick-controls') as NodeListOf<HTMLElement>;
      controls.forEach((c) => (c.style.opacity = '0'));

      const canvas = await html2canvas(pitchElement, {
        useCORS: true,
        backgroundColor: null,
        scale: 2,
      });

      controls.forEach((c) => (c.style.opacity = ''));

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${activeTeam.name}_${activeTeam.formationName || 'formacion'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error(e);
      alert('Error al generar la captura táctica.');
    }
  };

  // EXPORT FULL STATE TO JSON
  const handleExportJSON = () => {
    const dataToExport = {
      version: '1.0.0',
      teams,
      activeTeamId,
      pitchTheme,
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(dataToExport, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', 'tactix_tacticas_backup.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // IMPORT JSON BACKUP
  const handleImportJSON = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed && Array.isArray(parsed.teams) && parsed.activeTeamId) {
        setTeams(parsed.teams);
        setActiveTeamId(parsed.activeTeamId);
        if (parsed.pitchTheme) {
          setPitchTheme(parsed.pitchTheme);
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error importing backup:', e);
      return false;
    }
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col overflow-hidden w-screen h-screen">
      {/* Top Navigation */}
      <header className="bg-surface-bright shadow-sm flex justify-between items-center px-lg w-full h-16 shrink-0 z-10 border-b border-outline-variant">
        <div className="flex items-center gap-md">
          <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            sports_soccer
          </span>
          <div>
            <h1 className="font-headline-md text-headline-md text-primary leading-tight">Manager Soccer Santamaría</h1>
            <p className="font-label-sm text-label-sm text-on-surface-variant leading-tight">Arme su sueño inmundo favorito</p>
          </div>
        </div>
        
        {/* Active Team display */}
        <div className="flex items-center gap-xl hidden md:flex">
          <div className="flex items-center gap-sm font-label-lg text-label-lg text-on-surface-variant">
            <span>Equipo:</span>
            <span className="font-bold text-on-surface uppercase">{activeTeam.name}</span>
            <span className="text-primary ml-2 font-semibold">{activeTeam.formationName}</span>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-md">
          <button 
            onClick={handleExportImage}
            className="bg-primary text-on-primary font-label-lg text-label-lg px-lg py-sm rounded-lg flex items-center gap-sm hover:bg-primary-container transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">photo_camera</span>
            Exportar PNG
          </button>
        </div>
      </header>

      {/* Main Workspace split-screen */}
      <div className="flex flex-1 h-[calc(100vh-64px)] overflow-hidden">
        {/* Left Side: Interactive Pitch */}
        <Pitch
          team={activeTeam}
          activePlayers={activeTeam.players}
          pitchTheme={pitchTheme}
          isDrawingMode={isDrawingMode}
          setIsDrawingMode={setIsDrawingMode}
          brushColor={brushColor}
          brushWidth={brushWidth}
          strokes={strokes}
          onStrokesChange={saveStrokes}
          onPlayerMove={handlePlayerMove}
          onEditPlayer={handleEditPlayerClick}
          onRemoveFromLineup={handleRemoveFromLineup}
          onDropPlayer={handleDropPlayer}
          onClear={handleClearDrawings}
          onUndo={handleUndoDrawing}
        />

        {/* Right Side: Control Panel Sidebar */}
        <Sidebar
          team={activeTeam}
          onApplyPreset={handleApplyPreset}
          onAddPlayer={handleAddPlayerClick}
          onEditPlayer={handleEditPlayerClick}
          onDeletePlayer={handleDeletePlayer}
          onTogglePlayerLineup={handleTogglePlayerLineup}
          pitchTheme={pitchTheme}
          setPitchTheme={setPitchTheme}
          isDrawingMode={isDrawingMode}
          setIsDrawingMode={setIsDrawingMode}
          brushColor={brushColor}
          setBrushColor={setBrushColor}
          brushWidth={brushWidth}
          setBrushWidth={setBrushWidth}
          onClearDrawings={handleClearDrawings}
          onUndoDrawing={handleUndoDrawing}
          strokesCount={strokes.length}
          teams={teams}
          activeTeamId={activeTeamId}
          onSelectTeam={handleSelectTeam}
          onCreateTeam={handleCreateTeam}
          onCreateEmptyTeam={handleCreateEmptyTeam}
          onDeleteTeam={handleDeleteTeam}
          onUpdateTeamDetails={updateTeamDetails}
          onExportData={handleExportJSON}
          onImportData={handleImportJSON}
          onRemoveFromLineup={handleRemoveFromLineup}
        />
      </div>

      {/* Player Creation & Edit Modal */}
      <PlayerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePlayer}
        playerToEdit={playerToEdit}
      />
    </div>
  );
}
