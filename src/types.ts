export interface PlayerStats {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}

export type PlayerPosition = 'GK' | 'DF' | 'MF' | 'FW';

export interface Player {
  id: string;
  name: string;
  number: string;
  position: PlayerPosition;
  stats: PlayerStats;
  avatarColor: string;       // Jersey primary color
  secondaryJerseyColor: string; // Jersey secondary color
  textColor: string;         // Number text color
  rating: number;
  preferredFoot: 'Derecho' | 'Izquierdo' | 'Ambidiestro';
  photoUrl?: string;         // Base64 data URL for player photo
  // Jersey design fields
  jerseyDesign: 'solid' | 'striped' | 'halves' | 'gradient' | 'chevron';
  nationality?: string;
  age?: number;
}

export interface TeamPlayerPosition {
  playerId: string;
  x: number; // 0 - 100 relative to field width
  y: number; // 0 - 100 relative to field height
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  lineup: TeamPlayerPosition[];
  formationName: string;
  jerseyStyle: 'solid' | 'striped' | 'gradient' | 'neon';
  primaryColor: string;
  secondaryColor: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface DrawingStroke {
  id: string;
  color: string;
  width: number;
  points: Point[];
}
