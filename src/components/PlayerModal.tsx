import React, { useState, useEffect, useRef, useId } from 'react';
import { X, UserPlus, Save, Camera, Shirt, BarChart2, Info } from 'lucide-react';
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
  const uid = useId(); // BUG-5 fix: unique IDs for SVG defs

  // Info fields
  const [name, setName]               = useState('');
  const [nameError, setNameError]     = useState(''); // BUG-3 fix: inline error state
  const [photoHovered, setPhotoHovered] = useState(false); // BUG-9 fix: hover state for photo overlay
  const [saveToast, setSaveToast]     = useState(false); // BUG-16 fix: success feedback

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

  // Reset / load when opened
  useEffect(() => {
    if (isOpen) {
      setTab('info');
      setNameError(''); // BUG-3 fix: clear error on open
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
        const palette = ['#1e3a8a','#7c3aed','#065f46','#92400e','#881337','#0c4a6e'];
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

  const getStatColor = (v: number) => v >= 80 ? '#34d399' : v >= 60 ? '#fbbf24' : '#f87171';

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
      setNameError('El nombre del jugador es obligatorio.'); // BUG-3 fix
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
    // BUG-16 fix: show success toast before closing
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      onClose();
    }, 900);
  };

  /** Renders a small jersey SVG preview */
  const JerseyPreview = () => {
    const c1 = avatarColor;
    const c2 = secondaryJerseyColor;
    let fill: React.ReactNode;
    switch (jerseyDesign) {
      case 'striped':
        fill = (
          <>
            <defs>
              {/* BUG-5 fix: unique pattern ID per modal instance */}
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
              {/* BUG-5 fix: unique gradient ID per modal instance */}
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
      default: // solid
        fill = <path d="M10 5 L25 0 L39 5 L49 15 L42 20 L38 12 L38 55 L12 55 L12 12 L8 20 L1 15 Z" fill={c1} />;
    }
    return (
      <svg viewBox="0 0 50 60" style={{ width: 80, height: 96, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}>
        {fill}
        {/* collar */}
        <ellipse cx="25" cy="4" rx="6" ry="3" fill={c2} opacity="0.7" />
        {/* number */}
        <text x="25" y="36" textAnchor="middle" dominantBaseline="middle"
          fill={textColor} fontSize="14" fontWeight="bold" fontFamily="Outfit, sans-serif">
          {number}
        </text>
      </svg>
    );
  };

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'info',   label: 'Información', icon: <Info size={15} /> },
    { id: 'stats',  label: 'Atributos',   icon: <BarChart2 size={15} /> },
    { id: 'design', label: 'Diseño',      icon: <Shirt size={15} /> },
  ];

  const statMeta: { key: keyof PlayerStats; label: string }[] = [
    { key: 'pace',      label: 'Ritmo (PAC)' },
    { key: 'shooting',  label: 'Tiro (SHO)' },
    { key: 'passing',   label: 'Pase (PAS)' },
    { key: 'dribbling', label: 'Regate (DRI)' },
    { key: 'defending', label: 'Defensa (DEF)' },
    { key: 'physical',  label: 'Físico (PHY)' },
  ];

  return (
    <div style={overlayStyle}>
      <div className="glass-panel animate-fade-in" style={modalStyle}>

        {/* BUG-16 fix: success toast */}
        {saveToast && (
          <div style={{
            position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(16,185,129,0.95)', color: '#fff', borderRadius: 10,
            padding: '8px 20px', fontSize: '0.85rem', fontWeight: 700, zIndex: 10,
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)', whiteSpace: 'nowrap',
            animation: 'fadeIn 0.2s ease-out',
          }}>
            ✅ Jugador guardado correctamente
          </div>
        )}

        {/* ───── HEADER ───── */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: 'rgba(16,185,129,0.15)', borderRadius: 8, padding: '6px 8px' }}>
              <UserPlus size={20} color="#34d399" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>
                {playerToEdit ? 'Editar Jugador' : 'Nuevo Jugador'}
              </h3>
              {name && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{name}</span>}
            </div>
          </div>

          {/* Overall badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={overallBadgeStyle}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>MEDIA</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399', lineHeight: 1 }}>{overall}</span>
            </div>
            <button onClick={onClose} style={closeBtn}><X size={18} /></button>
          </div>
        </div>

        {/* ───── TABS ───── */}
        <div style={tabBarStyle}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              ...tabBtnStyle,
              color: tab === t.id ? '#fff' : 'var(--text-secondary)',
              borderBottom: tab === t.id ? '2px solid #10b981' : '2px solid transparent',
              background: tab === t.id ? 'rgba(16,185,129,0.06)' : 'transparent',
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ───── BODY ───── */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', flex: 1 }}>

            {/* ── TAB: INFORMACIÓN ── */}
            {tab === 'info' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Photo upload */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {/* BUG-9 fix: track hover state to show photo overlay */}
                  <div
                    style={photoCircleStyle}
                    onClick={() => fileInputRef.current?.click()}
                    onMouseEnter={() => setPhotoHovered(true)}
                    onMouseLeave={() => setPhotoHovered(false)}
                  >
                    {photoUrl
                      ? <img src={photoUrl} alt="player" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                      : (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                          <Camera size={22} />
                          <div style={{ fontSize: '0.65rem', marginTop: 4 }}>Foto</div>
                        </div>
                      )
                    }
                    <div style={{ ...photoOverlayStyle, opacity: photoHovered ? 1 : 0 }}>
                      <Camera size={16} color="#fff" />
                    </div>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />

                  <div style={{ flex: 1 }}>
                    <label className="form-label">Nombre del jugador *</label>
                    <input
                      className="form-input"
                      placeholder="Ej. Lionel Messi"
                      value={name}
                      onChange={e => { setName(e.target.value); if (nameError) setNameError(''); }}
                      maxLength={30}
                      required
                      style={nameError ? { borderColor: '#ef4444', boxShadow: '0 0 0 2px rgba(239,68,68,0.2)' } : {}}
                    />
                    {/* BUG-3 fix: inline validation error */}
                    {nameError && (
                      <div style={{ color: '#f87171', fontSize: '0.75rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                        ⚠️ {nameError}
                      </div>
                    )}
                  </div>
                </div>

                <div style={twoColGrid}>
                  <div>
                    <label className="form-label">Dorsal</label>
                    <input className="form-input" type="number" min="0" max="99" value={number}
                      onChange={e => setNumber(e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">Posición principal</label>
                    <select className="form-select" value={position} onChange={e => setPosition(e.target.value as PlayerPosition)}>
                      <option value="GK">POR – Portero</option>
                      <option value="DF">DFC – Defensa</option>
                      <option value="MF">MC – Mediocampista</option>
                      <option value="FW">DC – Delantero</option>
                    </select>
                  </div>
                </div>

                <div style={twoColGrid}>
                  <div>
                    <label className="form-label">Pie hábil</label>
                    <select className="form-select" value={preferredFoot} onChange={e => setPreferredFoot(e.target.value as any)}>
                      <option value="Derecho">Derecho</option>
                      <option value="Izquierdo">Izquierdo</option>
                      <option value="Ambidiestro">Ambidiestro</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Edad</label>
                    <input className="form-input" type="number" min="15" max="50" placeholder="—"
                      value={age} onChange={e => setAge(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="form-label">Nacionalidad</label>
                  <input className="form-input" placeholder="Ej. Argentina" value={nationality}
                    onChange={e => setNationality(e.target.value)} maxLength={30} />
                </div>

                {/* Photo remove */}
                {photoUrl && (
                  <button type="button" onClick={() => setPhotoUrl(undefined)}
                    className="btn btn-secondary" style={{ fontSize: '0.8rem', alignSelf: 'flex-start' }}>
                    Quitar foto
                  </button>
                )}
              </div>
            )}

            {/* ── TAB: ATRIBUTOS ── */}
            {tab === 'stats' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {statMeta.map(({ key, label }) => {
                  const v = stats[key];
                  return (
                    <div key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{label}</span>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: getStatColor(v) }}>{v}</span>
                      </div>
                      <div style={{ position: 'relative', height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 8 }}>
                        <div style={{
                          position: 'absolute', left: 0, top: 0, height: '100%',
                          width: `${v}%`, borderRadius: 8,
                          background: `linear-gradient(90deg, ${getStatColor(v)}88, ${getStatColor(v)})`,
                          transition: 'width 0.2s ease',
                        }} />
                      </div>
                      {/* BUG-14 fix: removed the dead invisible slider. Only keep the visible one */}
                      <input type="range" min="1" max="99" value={v}
                        onChange={e => handleStatChange(key, +e.target.value)}
                        style={{ width: '100%', marginTop: 6, cursor: 'pointer', accentColor: getStatColor(v) }} />
                    </div>
                  );
                })}

                {/* Stats radar preview */}
                <div style={{ marginTop: 8, background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 10 }}>Resumen de Atributos</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {statMeta.map(({ key, label }) => (
                      <div key={key} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 4px' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: getStatColor(stats[key]) }}>{stats[key]}</div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: 2 }}>{label.split(' ')[0]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: DISEÑO ── */}
            {tab === 'design' && (
              <div style={{ display: 'flex', gap: 24 }}>
                {/* Left: controls */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

                  <div>
                    <label className="form-label">Estilo de camiseta</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                      {JERSEY_DESIGNS.map(d => (
                        <button key={d.id} type="button" onClick={() => setJerseyDesign(d.id)}
                          style={{
                            padding: '8px 4px', borderRadius: 8, border: jerseyDesign === d.id ? '2px solid #10b981' : '1px solid var(--border-color)',
                            background: jerseyDesign === d.id ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
                            cursor: 'pointer', color: jerseyDesign === d.id ? '#34d399' : 'var(--text-secondary)',
                            fontSize: '0.65rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                          }}>
                          <span style={{ fontSize: '1.1rem' }}>{d.icon}</span>
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={twoColGrid}>
                    <div>
                      <label className="form-label">Color principal</label>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input type="color" value={avatarColor} onChange={e => setAvatarColor(e.target.value)}
                          style={{ width: 44, height: 44, borderRadius: 8, cursor: 'pointer' }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{avatarColor}</span>
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Color secundario</label>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input type="color" value={secondaryJerseyColor} onChange={e => setSecondaryJerseyColor(e.target.value)}
                          style={{ width: 44, height: 44, borderRadius: 8, cursor: 'pointer' }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{secondaryJerseyColor}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Color del número</label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)}
                        style={{ width: 44, height: 44, borderRadius: 8, cursor: 'pointer' }} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{textColor}</span>
                    </div>
                  </div>

                  {/* Quick color presets */}
                  <div>
                    <label className="form-label">Colores rápidos</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {['#1e3a8a','#dc2626','#16a34a','#ca8a04','#7c3aed','#0891b2','#fff','#000','#f97316','#db2777'].map(c => (
                        <button key={c} type="button" onClick={() => setAvatarColor(c)}
                          style={{
                            width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer',
                            border: avatarColor === c ? '3px solid #fff' : '2px solid rgba(255,255,255,0.2)',
                            flexShrink: 0,
                          }} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, minWidth: 130 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Vista previa
                  </div>

                  {/* Jersey SVG */}
                  <JerseyPreview />

                  {/* Player token preview (as seen on pitch) */}
                  <div style={{ textAlign: 'center', marginTop: 8 }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 8 }}>En cancha</div>
                    <div style={pitchTokenPreview(avatarColor, secondaryJerseyColor, jerseyDesign)}>
                      {photoUrl
                        ? <img src={photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        : <span style={{ color: textColor, fontWeight: 800, fontSize: '1.1rem' }}>{number || '?'}</span>
                      }
                    </div>
                    <div style={{ marginTop: 6, background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: 4, fontSize: '0.7rem', color: '#fff', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {name || 'Jugador'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ───── FOOTER ───── */}
          <div style={footerStyle}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <div style={{ display: 'flex', gap: 8 }}>
              {tab !== 'design' && (
                <button type="button" className="btn btn-secondary"
                  onClick={() => setTab(tab === 'info' ? 'stats' : 'design')}>
                  Siguiente →
                </button>
              )}
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Guardar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// ──────── Helper styles ────────

const pitchTokenPreview = (c1: string, c2: string, design: Player['jerseyDesign']): React.CSSProperties => {
  let background: string = c1;
  if (design === 'gradient') background = `linear-gradient(135deg, ${c1}, ${c2})`;
  if (design === 'striped') background = `repeating-linear-gradient(90deg, ${c1} 0px, ${c1} 8px, ${c2} 8px, ${c2} 16px)`;
  if (design === 'halves') background = `linear-gradient(90deg, ${c1} 50%, ${c2} 50%)`;
  // BUG-4 fix: handle chevron design
  if (design === 'chevron') background = `linear-gradient(160deg, ${c1} 55%, ${c2} 55%)`;
  return {
    width: 48, height: 48, borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    background, border: '2.5px solid rgba(255,255,255,0.3)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
  };
};


const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, backgroundColor: 'rgba(5,8,16,0.88)',
  backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center',
  alignItems: 'center', zIndex: 1000, padding: 20,
};
const modalStyle: React.CSSProperties = {
  width: '100%', maxWidth: 680, maxHeight: '92vh',
  display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 18,
};
const headerStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '18px 22px', borderBottom: '1px solid var(--border-color)',
};
const tabBarStyle: React.CSSProperties = {
  display: 'flex', borderBottom: '1px solid var(--border-color)',
};
const tabBtnStyle: React.CSSProperties = {
  flex: 1, padding: '12px 8px', border: 'none', cursor: 'pointer',
  fontSize: '0.82rem', fontWeight: 600, display: 'flex', gap: 6,
  alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
};
const closeBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)',
  borderRadius: '50%', width: 34, height: 34, display: 'flex',
  alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)',
};
const overallBadgeStyle: React.CSSProperties = {
  background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
  borderRadius: 10, padding: '4px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center',
};
const footerStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', padding: '14px 22px',
  borderTop: '1px solid var(--border-color)', gap: 10,
};
const twoColGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 };
const photoCircleStyle: React.CSSProperties = {
  width: 72, height: 72, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
  background: 'rgba(255,255,255,0.05)', border: '2px dashed rgba(255,255,255,0.2)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', position: 'relative',
};
const photoOverlayStyle: React.CSSProperties = {
  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  opacity: 0, transition: 'opacity 0.2s', borderRadius: '50%',
};
