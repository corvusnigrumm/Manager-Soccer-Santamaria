export interface PresetPosition {
  role: string;
  defaultPos: 'GK' | 'DF' | 'MF' | 'FW';
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
}

export interface FormationPreset {
  name: string;
  positions: PresetPosition[];
  isCustom?: boolean;
}

export const FORMATION_PRESETS: Record<string, FormationPreset> = {
  '4-4-2': {
    name: '4-4-2',
    positions: [
      { role: 'POR', defaultPos: 'GK', x: 50, y: 88 }, // Goalkeeper
      { role: 'LD', defaultPos: 'DF', x: 85, y: 70 },  // Right Back
      { role: 'DFC', defaultPos: 'DF', x: 62, y: 72 }, // Right Center Back
      { role: 'DFC', defaultPos: 'DF', x: 38, y: 72 }, // Left Center Back
      { role: 'LI', defaultPos: 'DF', x: 15, y: 70 },  // Left Back
      { role: 'MD', defaultPos: 'MF', x: 85, y: 48 },  // Right Midfielder
      { role: 'MC', defaultPos: 'MF', x: 60, y: 50 },  // Right Center Mid
      { role: 'MC', defaultPos: 'MF', x: 40, y: 50 },  // Left Center Mid
      { role: 'MI', defaultPos: 'MF', x: 15, y: 48 },  // Left Midfielder
      { role: 'DC', defaultPos: 'FW', x: 60, y: 22 },  // Right Striker
      { role: 'DC', defaultPos: 'FW', x: 40, y: 22 },  // Left Striker
    ],
  },
  '4-3-3': {
    name: '4-3-3',
    positions: [
      { role: 'POR', defaultPos: 'GK', x: 50, y: 88 },
      { role: 'LD', defaultPos: 'DF', x: 85, y: 70 },
      { role: 'DFC', defaultPos: 'DF', x: 62, y: 72 },
      { role: 'DFC', defaultPos: 'DF', x: 38, y: 72 },
      { role: 'LI', defaultPos: 'DF', x: 15, y: 70 },
      { role: 'MC', defaultPos: 'MF', x: 65, y: 52 },  // Right Mid
      { role: 'MCD', defaultPos: 'MF', x: 50, y: 58 }, // Defensive Mid
      { role: 'MC', defaultPos: 'MF', x: 35, y: 52 },  // Left Mid
      { role: 'ED', defaultPos: 'FW', x: 80, y: 25 },  // Right Winger
      { role: 'DC', defaultPos: 'FW', x: 50, y: 20 },  // Striker
      { role: 'EI', defaultPos: 'FW', x: 20, y: 25 },  // Left Winger
    ],
  },
  '3-5-2': {
    name: '3-5-2',
    positions: [
      { role: 'POR', defaultPos: 'GK', x: 50, y: 88 },
      { role: 'DFC', defaultPos: 'DF', x: 65, y: 72 },
      { role: 'DFC', defaultPos: 'DF', x: 50, y: 74 },
      { role: 'DFC', defaultPos: 'DF', x: 35, y: 72 },
      { role: 'CAD', defaultPos: 'MF', x: 85, y: 52 }, // Right Wingback
      { role: 'MC', defaultPos: 'MF', x: 63, y: 54 },
      { role: 'MCD', defaultPos: 'MF', x: 50, y: 60 },
      { role: 'MC', defaultPos: 'MF', x: 37, y: 54 },
      { role: 'CAI', defaultPos: 'MF', x: 15, y: 52 }, // Left Wingback
      { role: 'DC', defaultPos: 'FW', x: 60, y: 22 },
      { role: 'DC', defaultPos: 'FW', x: 40, y: 22 },
    ],
  },
  '4-2-3-1': {
    name: '4-2-3-1',
    positions: [
      { role: 'POR', defaultPos: 'GK', x: 50, y: 88 },
      { role: 'LD', defaultPos: 'DF', x: 85, y: 70 },
      { role: 'DFC', defaultPos: 'DF', x: 62, y: 72 },
      { role: 'DFC', defaultPos: 'DF', x: 38, y: 72 },
      { role: 'LI', defaultPos: 'DF', x: 15, y: 70 },
      { role: 'MCO', defaultPos: 'MF', x: 62, y: 58 }, // Right Def Mid
      { role: 'MCO', defaultPos: 'MF', x: 38, y: 58 }, // Left Def Mid
      { role: 'MD', defaultPos: 'MF', x: 78, y: 40 },  // Right Attacking Mid
      { role: 'MCO', defaultPos: 'MF', x: 50, y: 42 }, // Center Attacking Mid
      { role: 'MI', defaultPos: 'MF', x: 22, y: 40 },  // Left Attacking Mid
      { role: 'DC', defaultPos: 'FW', x: 50, y: 20 },  // Striker
    ],
  },
  '5-3-2': {
    name: '5-3-2',
    positions: [
      { role: 'POR', defaultPos: 'GK', x: 50, y: 88 },
      { role: 'CAD', defaultPos: 'DF', x: 85, y: 62 }, // Right Wingback
      { role: 'DFC', defaultPos: 'DF', x: 65, y: 72 },
      { role: 'DFC', defaultPos: 'DF', x: 50, y: 74 },
      { role: 'DFC', defaultPos: 'DF', x: 35, y: 72 },
      { role: 'CAI', defaultPos: 'DF', x: 15, y: 62 }, // Left Wingback
      { role: 'MC', defaultPos: 'MF', x: 65, y: 48 },
      { role: 'MCD', defaultPos: 'MF', x: 50, y: 54 },
      { role: 'MC', defaultPos: 'MF', x: 35, y: 48 },
      { role: 'DC', defaultPos: 'FW', x: 60, y: 22 },
      { role: 'DC', defaultPos: 'FW', x: 40, y: 22 },
    ],
  },
  '4-1-4-1': {
    name: '4-1-4-1',
    positions: [
      { role: 'POR', defaultPos: 'GK', x: 50, y: 88 },
      { role: 'LD', defaultPos: 'DF', x: 85, y: 70 },
      { role: 'DFC', defaultPos: 'DF', x: 62, y: 73 },
      { role: 'DFC', defaultPos: 'DF', x: 38, y: 73 },
      { role: 'LI', defaultPos: 'DF', x: 15, y: 70 },
      { role: 'MCD', defaultPos: 'MF', x: 50, y: 62 },
      { role: 'MD', defaultPos: 'MF', x: 80, y: 48 },
      { role: 'MC', defaultPos: 'MF', x: 60, y: 45 },
      { role: 'MC', defaultPos: 'MF', x: 40, y: 45 },
      { role: 'MI', defaultPos: 'MF', x: 20, y: 48 },
      { role: 'DC', defaultPos: 'FW', x: 50, y: 20 },
    ],
  },
  '3-4-3': {
    name: '3-4-3',
    positions: [
      { role: 'POR', defaultPos: 'GK', x: 50, y: 88 },
      { role: 'DFC', defaultPos: 'DF', x: 65, y: 72 },
      { role: 'DFC', defaultPos: 'DF', x: 50, y: 74 },
      { role: 'DFC', defaultPos: 'DF', x: 35, y: 72 },
      { role: 'MD', defaultPos: 'MF', x: 80, y: 52 },
      { role: 'MC', defaultPos: 'MF', x: 60, y: 55 },
      { role: 'MC', defaultPos: 'MF', x: 40, y: 55 },
      { role: 'MI', defaultPos: 'MF', x: 20, y: 52 },
      { role: 'ED', defaultPos: 'FW', x: 78, y: 22 },
      { role: 'DC', defaultPos: 'FW', x: 50, y: 18 },
      { role: 'EI', defaultPos: 'FW', x: 22, y: 22 },
    ],
  },
};

// Helper to load custom formations from localStorage
export const loadCustomFormations = (): Record<string, FormationPreset> => {
  try {
    const stored = localStorage.getItem('tactix_custom_formations');
    if (!stored) return {};
    return JSON.parse(stored) as Record<string, FormationPreset>;
  } catch {
    return {};
  }
};

export const saveCustomFormation = (name: string, preset: FormationPreset) => {
  const existing = loadCustomFormations();
  existing[name] = { ...preset, isCustom: true };
  localStorage.setItem('tactix_custom_formations', JSON.stringify(existing));
};

export const deleteCustomFormation = (name: string) => {
  const existing = loadCustomFormations();
  delete existing[name];
  localStorage.setItem('tactix_custom_formations', JSON.stringify(existing));
};
