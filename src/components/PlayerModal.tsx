import React, { useState, useEffect, useRef, useId } from 'react';
import type { Player, PlayerPosition, PlayerStats } from '../types';

interface PlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (player: Player) => void;
  playerToEdit?: Player | null;
}

const DEFAULT_STATS: PlayerStats = {
  pace: 75, shooting: 70, passing: 72,
  dribbling: 75, defending: 50, physical: 68,
};

const JERSEY_DESIGNS = [
  { id: 'solid',    label: 'Liso',       icon: '⬛' },
  { id: 'striped',  label: 'Franjas',    icon: '🟦' },
  { id: 'halves',   label: 'Mitades',    icon: '◧' },
  { id: 'gradient', label: 'Degradado',  icon: '🌈' },
  { id: 'chevron',  label: 'Chevron',    icon: '🔻' },
] as const;

type Tab = 'info' | 'stats' | 'design';

export const PlayerModal: React.FC<PlayerModalProps> = ({
  isOpen, onClose, onSave, playerToEdit,
}) => {
  const [tab, setTab] = useState<Tab>('info');
  const uid = useId();

  // Info fields
  const [name, setName]               = useState('');
  const [nameError, setNameError]     = useState('');
  const [photoHovered, setPhotoHovered] = useState(false);
  const [saveToast, setSaveToast]     = useState(false);

  const [number, setNumber]           = useState('10');
  const [position, setPosition]       = useState<PlayerPosition>('MF');
  const [preferredFoot, setPreferredFoot] = useState<Player['preferredFoot']>('Derecho');
  const [nationality, setNationality] = useState('');
  const [age, setAge]                 = useState<string>('');

  // Stats
  const [stats, setStats]   = useState<PlayerStats>({ ...DEFAULT_STATS });

  // Design
  const [avatarColor, setAvatarColor]               = useState('#1e3a8a');
  const [secondaryJerseyColor, setSecondaryJerseyColor] = useState('#ef4444');
  const [textColor, setTextColor]                   = useState('#ffffff');
  const [jerseyDesign, setJerseyDesign]             = useState<Player['jerseyDesign']>('solid');
  const [photoUrl, setPhotoUrl]                     = useState<string | undefined>(undefined);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTab('info');
      setNameError('');
      setSaveToast(false);
      if (playerToEdit) {
        setName(playerToEdit.name);
        setNumber(playerToEdit.number);
        setPosition(playerToEdit.position);
        setPreferredFoot(playerToEdit.preferredFoot);
        setNationality(playerToEdit.nationality ?? '');
        setAge(playerToEdit.age !== undefined ? String(playerToEdit.age) : '');
        setStats({ ...playerToEdit.stats });
        setAvatarColor(playerToEdit.avatarColor);
        setSecondaryJerseyColor(playerToEdit.secondaryJerseyColor ?? '#ffffff');
        setTextColor(playerToEdit.textColor);
        setJerseyDesign(playerToEdit.jerseyDesign ?? 'solid');
        setPhotoUrl(playerToEdit.photoUrl);
      } else {
        setName('');
        setNumber(String(Math.floor(Math.random() * 98) + 1));
        setPosition('MF');
        setPreferredFoot('Derecho');
        setNationality('');
        setAge('');
        setStats({ ...DEFAULT_STATS });
        const palette = ['#006c4a','#1e3a8a','#7c3aed','#9b3e3b','#92400e','#0c4a6e'];
        setAvatarColor(palette[Math.floor(Math.random() * palette.length)]);
        setSecondaryJerseyColor('#ffffff');
        setTextColor('#ffffff');
        setJerseyDesign('solid');
        setPhotoUrl(undefined);
      }
    }
  }, [playerToEdit, isOpen]);

  if (!isOpen) return null;

  const handleStatChange = (key: keyof PlayerStats, val: number) =>
    setStats(p => ({ ...p, [key]: val }));

  const overall = Math.round(Object.values(stats).reduce((a, b) => a + b, 0) / 6);

  const getStatColor = (v: number) => v >= 80 ? '#006c4a' : v >= 60 ? '#ca8a04' : '#ba1a1a';

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('La imagen no debe superar 2 MB.'); return; }
    const reader = new FileReader();
    reader.onload = ev => setPhotoUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setTab('info');
      setNameError('El nombre del jugador es obligatorio.');
      return;
    }
    setNameError('');
    const player: Player = {
      id: playerToEdit?.id ?? Math.random().toString(36).slice(2, 11),
      name: name.trim(),
      number: number.trim() || '0',
      position,
      stats,
      avatarColor,
      secondaryJerseyColor,
      textColor,
      jerseyDesign,
      rating: overall,
      preferredFoot,
      photoUrl,
      nationality: nationality.trim() || undefined,
      age: age ? parseInt(age) : undefined,
    };
    onSave(player);
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      onClose();
    }, 900);
  };

  const JerseyPreview = () => {
    const c1 = avatarColor;
    const c2 = secondaryJerseyColor;
    let fill: React.ReactNode;
    switch (jerseyDesign) {
      case 'striped':
        fill = (
          <>
            <defs>
              <pattern id={`stripes-${uid}`} x="0" y="0" width="8" height="40" patternUnits="userSpaceOnUse">
                <rect width="4" height="40" fill={c1} />
                <rect x="4" width="4" height="40" fill={c2} />
              </pattern>
            </defs>
            <path d="M10 5 L25 0 L39 5 L49 15 L42 20 L38 12 L38 55 L12 55 L12 12 L8 20 L1 15 Z" fill={`url(#stripes-${uid})`} />
          </>
        );
        break;
      case 'halves':
        fill = (
          <>
            <path d="M10 5 L25 0 L25 55 L12 55 L12 12 L8 20 L1 15 Z" fill={c1} />
            <path d="M25 0 L39 5 L49 15 L42 20 L38 12 L38 55 L25 55 Z" fill={c2} />
          </>
        );
        break;
      case 'gradient':
        fill = (
          <>
            <defs>
              <linearGradient id={`grad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={c1} />
                <stop offset="100%" stopColor={c2} />
              </linearGradient>
            </defs>
            <path d="M10 5 L25 0 L39 5 L49 15 L42 20 L38 12 L38 55 L12 55 L12 12 L8 20 L1 15 Z" fill={`url(#grad-${uid})`} />
          </>
        );
        break;
      case 'chevron':
        fill = (
          <>
            <path d="M10 5 L25 0 L39 5 L49 15 L42 20 L38 12 L38 55 L12 55 L12 12 L8 20 L1 15 Z" fill={c1} />
            <polygon points="1,35 25,26 49,35 49,45 25,36 1,45" fill={c2} opacity="0.85" />
          </>
        );
        break;
      default:
        fill = <path d="M10 5 L25 0 L39 5 L49 15 L42 20 L38 12 L38 55 L12 55 L12 12 L8 20 L1 15 Z" fill={c1} />;
    }
    return (
      <svg viewBox="0 0 50 60" className="w-[80px] h-[96px] drop-shadow-md">
        {fill}
        <ellipse cx="25" cy="4" rx="6" ry="3" fill={c2} opacity="0.7" />
        <text x="25" y="36" textAnchor="middle" dominantBaseline="middle"
          fill={textColor} fontSize="14" fontWeight="bold" fontFamily="Outfit, sans-serif">
          {number}
        </text>
      </svg>
    );
  };

  const pitchTokenPreview = (c1: string, c2: string, design: Player['jerseyDesign']): React.CSSProperties => {
    let background: string = c1;
    if (design === 'gradient') background = `linear-gradient(135deg, ${c1}, ${c2})`;
    if (design === 'striped') background = `repeating-linear-gradient(90deg, ${c1} 0px, ${c1} 8px, ${c2} 8px, ${c2} 16px)`;
    if (design === 'halves') background = `linear-gradient(90deg, ${c1} 50%, ${c2} 50%)`;
    if (design === 'chevron') background = `linear-gradient(160deg, ${c1} 55%, ${c2} 55%)`;
    return {
      background,
    };
  };

  const TABS = [
    { id: 'info',   label: 'Información', icon: 'info' },
    { id: 'stats',  label: 'Atributos',   icon: 'bar_chart' },
    { id: 'design', label: 'Diseño',      icon: 'checkroom' },
  ] as const;

  const statMeta: { key: keyof PlayerStats; label: string }[] = [
    { key: 'pace',      label: 'Ritmo (PAC)' },
    { key: 'shooting',  label: 'Tiro (SHO)' },
    { key: 'passing',   label: 'Pase (PAS)' },
    { key: 'dribbling', label: 'Regate (DRI)' },
    { key: 'defending', label: 'Defensa (DEF)' },
    { key: 'physical',  label: 'Físico (PHY)' },
  ];

  return (
    <div className="fixed inset-0 bg-inverse-surface/85 backdrop-blur-sm flex justify-center items-center z-[1000] p-md">
      <div className="bg-surface border border-outline-variant w-full max-w-[680px] max-h-[92vh] flex flex-col overflow-hidden rounded-xl shadow-xl relative animate-fade-in text-on-surface">
        
        {/* Success Toast */}
        {saveToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary text-on-primary rounded-lg px-5 py-2 font-bold text-sm z-50 shadow-lg flex items-center gap-2 animate-fade-in">
            <span className="material-symbols-outlined text-base">check_circle</span>
            Jugador guardado correctamente
          </div>
        )}

        {/* ───── HEADER ───── */}
        <div className="flex justify-between items-center px-lg py-md border-b border-outline-variant">
          <div className="flex items-center gap-md">
            <div className="bg-secondary-container text-primary p-2 rounded-lg">
              <span className="material-symbols-outlined text-xl">person</span>
            </div>
            <div>
              <h3 className="font-title-lg text-title-lg text-primary">
                {playerToEdit ? 'Editar Jugador' : 'Nuevo Jugador'}
              </h3>
              {name && <span className="text-xs text-on-surface-variant">{name}</span>}
            </div>
          </div>

          <div className="flex items-center gap-md">
            <div className="bg-secondary-container text-on-secondary-container rounded-lg px-3 py-1 flex flex-col items-center">
              <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Media</span>
              <span className="text-lg font-black text-primary leading-none">{overall}</span>
            </div>
            <button 
              onClick={onClose} 
              className="bg-surface-container hover:bg-surface-variant/80 border border-outline-variant rounded-full w-8 h-8 flex items-center justify-center cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant">close</span>
            </button>
          </div>
        </div>

        {/* ───── TABS ───── */}
        <div className="flex border-b border-outline-variant bg-surface-bright">
          {TABS.map(t => (
            <button 
              key={t.id} 
              type="button"
              onClick={() => setTab(t.id)} 
              className={`flex-1 py-3 font-semibold font-label-lg text-label-lg flex items-center justify-center gap-sm transition-all border-b-2 ${
                tab === t.id 
                  ? 'text-primary border-primary bg-surface-container-low' 
                  : 'text-on-surface-variant hover:bg-surface-variant/50 border-transparent'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{t.icon}</span> 
              {t.label}
            </button>
          ))}
        </div>

        {/* ───── FORM BODY ───── */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
          <div className="p-lg flex-1">

            {/* ── TAB: INFORMACIÓN ── */}
            {tab === 'info' && (
              <div className="flex flex-col gap-md animate-fade-in">
                {/* Photo Upload Row */}
                <div className="flex items-center gap-md">
                  <div 
                    className="w-[72px] h-[72px] rounded-full shrink-0 overflow-hidden bg-surface-container border-2 border-dashed border-outline-variant flex items-center justify-center cursor-pointer relative"
                    onClick={() => fileInputRef.current?.click()}
                    onMouseEnter={() => setPhotoHovered(true)}
                    onMouseLeave={() => setPhotoHovered(false)}
                  >
                    {photoUrl ? (
                      <img src={photoUrl} alt="player" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <div className="text-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-2xl block">add_a_photo</span>
                        <div className="text-[10px] mt-0.5">Foto</div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full transition-opacity" style={{ opacity: photoHovered ? 1 : 0 }}>
                      <span className="material-symbols-outlined text-white text-lg">add_a_photo</span>
                    </div>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />

                  <div className="flex-1">
                    <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Nombre del jugador *</label>
                    <input 
                      className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-shadow placeholder:text-outline"
                      placeholder="Ej. Lionel Messi" 
                      value={name}
                      onChange={e => { setName(e.target.value); if (nameError) setNameError(''); }} 
                      maxLength={30} 
                      required 
                      style={nameError ? { borderColor: '#ba1a1a', boxShadow: '0 0 0 2px rgba(186,26,26,0.2)' } : {}}
                    />
                    {nameError && (
                      <div className="text-error text-xs mt-1 flex items-center gap-1 font-medium">
                        ⚠️ {nameError}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-md">
                  <div>
                    <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Dorsal</label>
                    <input 
                      className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-shadow"
                      type="number" 
                      min="0" 
                      max="99" 
                      value={number}
                      onChange={e => setNumber(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Posición principal</label>
                    <select 
                      className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-shadow"
                      value={position} 
                      onChange={e => setPosition(e.target.value as PlayerPosition)}
                    >
                      <option value="GK">POR – Portero</option>
                      <option value="DF">DFC – Defensa</option>
                      <option value="MF">MC – Mediocampista</option>
                      <option value="FW">DC – Delantero</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-md">
                  <div>
                    <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Pie hábil</label>
                    <select 
                      className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-shadow"
                      value={preferredFoot} 
                      onChange={e => setPreferredFoot(e.target.value as any)}
                    >
                      <option value="Derecho">Derecho</option>
                      <option value="Izquierdo">Izquierdo</option>
                      <option value="Ambidiestro">Ambidiestro</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Edad</label>
                    <input 
                      className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-shadow"
                      type="number" 
                      min="15" 
                      max="50" 
                      placeholder="—"
                      value={age} 
                      onChange={e => setAge(e.target.value)} 
                    />
                  </div>
                </div>

                <div>
                  <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Nacionalidad</label>
                  <input 
                    className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-shadow placeholder:text-outline"
                    placeholder="Ej. Argentina" 
                    value={nationality}
                    onChange={e => setNationality(e.target.value)} 
                    maxLength={30} 
                  />
                </div>

                {photoUrl && (
                  <button 
                    type="button" 
                    onClick={() => setPhotoUrl(undefined)}
                    className="bg-surface border border-outline-variant text-error hover:bg-error-container/20 font-label-sm text-label-sm px-3 py-1.5 rounded-lg transition-colors self-start"
                  >
                    Quitar foto
                  </button>
                )}
              </div>
            )}

            {/* ── TAB: ATRIBUTOS ── */}
            {tab === 'stats' && (
              <div className="flex flex-col gap-md animate-fade-in">
                {statMeta.map(({ key, label }) => {
                  const v = stats[key];
                  return (
                    <div key={key}>
                      <div className="flex justify-between mb-1 font-label-sm text-label-sm">
                        <span className="text-on-surface-variant">{label}</span>
                        <span className="font-bold text-sm" style={{ color: getStatColor(v) }}>{v}</span>
                      </div>
                      <div className="relative h-2 bg-surface-container rounded-lg">
                        <div 
                          className="absolute left-0 top-0 h-full rounded-lg transition-all"
                          style={{
                            width: `${v}%`,
                            background: `linear-gradient(90deg, ${getStatColor(v)}88, ${getStatColor(v)})`,
                          }} 
                        />
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="99" 
                        value={v}
                        onChange={e => handleStatChange(key, +e.target.value)}
                        className="w-full mt-2 cursor-pointer h-1"
                        style={{ accentColor: getStatColor(v) }}
                      />
                    </div>
                  );
                })}

                {/* Stats Summary Roster */}
                <div className="mt-4 bg-surface-container rounded-xl p-4 text-center border border-outline-variant/30">
                  <div className="font-label-sm text-label-sm text-on-surface-variant mb-3">Resumen de Atributos</div>
                  <div className="grid grid-cols-6 gap-2">
                    {statMeta.map(({ key, label }) => (
                      <div key={key} className="bg-surface rounded-lg p-2 border border-outline-variant/10 shadow-sm">
                        <div className="text-lg font-black" style={{ color: getStatColor(stats[key]) }}>{stats[key]}</div>
                        <div className="text-[9px] text-on-surface-variant font-bold mt-1 uppercase">{label.split(' ')[0]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: DISEÑO ── */}
            {tab === 'design' && (
              <div className="flex gap-lg animate-fade-in">
                {/* Left controls */}
                <div className="flex-1 flex flex-col gap-md">
                  <div>
                    <label className="font-label-sm text-label-sm text-on-surface-variant block mb-2">Estilo de camiseta</label>
                    <div className="grid grid-cols-5 gap-2">
                      {JERSEY_DESIGNS.map(d => (
                        <button 
                          key={d.id} 
                          type="button" 
                          onClick={() => setJerseyDesign(d.id)}
                          className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition-all ${
                            jerseyDesign === d.id 
                              ? 'border-primary bg-secondary-container text-on-secondary-container' 
                              : 'border-outline-variant bg-surface text-on-surface-variant hover:bg-surface-variant/50'
                          }`}
                        >
                          <span className="text-lg">{d.icon}</span>
                          <span className="text-[10px] font-semibold">{d.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-md">
                    <div>
                      <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Color principal</label>
                      <div className="flex gap-2 items-center">
                        <input 
                          type="color" 
                          value={avatarColor} 
                          onChange={e => setAvatarColor(e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer p-0 bg-transparent border-0" 
                        />
                        <span className="text-xs text-on-surface-variant font-mono">{avatarColor}</span>
                      </div>
                    </div>
                    <div>
                      <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Color secundario</label>
                      <div className="flex gap-2 items-center">
                        <input 
                          type="color" 
                          value={secondaryJerseyColor} 
                          onChange={e => setSecondaryJerseyColor(e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer p-0 bg-transparent border-0" 
                        />
                        <span className="text-xs text-on-surface-variant font-mono">{secondaryJerseyColor}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Color del número</label>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="color" 
                        value={textColor} 
                        onChange={e => setTextColor(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer p-0 bg-transparent border-0" 
                      />
                      <span className="text-xs text-on-surface-variant font-mono">{textColor}</span>
                    </div>
                  </div>

                  {/* Preset Colors */}
                  <div>
                    <label className="font-label-sm text-label-sm text-on-surface-variant block mb-2">Colores rápidos</label>
                    <div className="flex flex-wrap gap-2">
                      {['#006c4a','#dc2626','#16a34a','#ca8a04','#7c3aed','#0891b2','#ffffff','#000000','#f97316','#db2777'].map(c => (
                        <button 
                          key={c} 
                          type="button" 
                          onClick={() => setAvatarColor(c)}
                          className={`w-6 h-6 rounded-full transition-transform ${
                            avatarColor === c ? 'scale-110 border-2 border-primary' : 'border border-outline-variant/30'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Preview */}
                <div className="flex flex-col items-center gap-md min-w-[140px] bg-surface-container rounded-xl p-4 border border-outline-variant/30 self-start">
                  <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-[10px]">
                    Vista previa
                  </div>

                  {/* Jersey SVG */}
                  <JerseyPreview />

                  {/* Token Preview */}
                  <div className="text-center mt-2 flex flex-col items-center">
                    <div className="font-label-sm text-label-sm text-on-surface-variant text-[10px] mb-2">En cancha</div>
                    <div 
                      className="w-11 h-11 rounded-full border-2 border-white shadow-md flex items-center justify-center font-bold text-white relative overflow-hidden shrink-0"
                      style={photoUrl ? { backgroundColor: '#fff' } : pitchTokenPreview(avatarColor, secondaryJerseyColor, jerseyDesign)}
                    >
                      {photoUrl ? (
                        <img src={photoUrl} alt="" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <span style={{ color: textColor }} className="font-extrabold text-sm">{number || '?'}</span>
                      )}
                    </div>
                    <div className="mt-2 bg-surface text-on-surface px-2 py-0.5 rounded text-[10px] font-semibold max-w-[90px] truncate border border-outline-variant/20 shadow-sm">
                      {name || 'Jugador'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ───── FOOTER ───── */}
          <div className="flex justify-between items-center px-lg py-md border-t border-outline-variant bg-surface-bright">
            <button 
              type="button" 
              className="bg-surface border border-outline-variant text-on-surface-variant font-label-lg text-label-lg px-lg py-sm rounded-lg hover:bg-surface-variant/50 transition-colors"
              onClick={onClose}
            >
              Cancelar
            </button>
            <div className="flex gap-2">
              {tab !== 'design' && (
                <button 
                  type="button" 
                  className="bg-surface border border-outline-variant text-primary font-label-lg text-label-lg px-lg py-sm rounded-lg hover:bg-surface-variant/50 transition-colors"
                  onClick={() => setTab(tab === 'info' ? 'stats' : 'design')}
                >
                  Siguiente
                </button>
              )}
              <button 
                type="submit" 
                className="bg-primary text-on-primary font-label-lg text-label-lg px-lg py-sm rounded-lg hover:bg-primary-container transition-colors shadow-sm flex items-center gap-xs"
              >
                <span className="material-symbols-outlined text-sm">save</span>
                Guardar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
