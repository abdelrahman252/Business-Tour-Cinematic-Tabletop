// Business Tour: World Capitals — 28 tiles, clockwise from START (bottom-left)
// Matches the image exactly: START corner → bottom row → right column → top row → left column

export type TileType =
  | 'start'
  | 'city'
  | 'chance'
  | 'tax'
  | 'corner_lounge'
  | 'corner_room'
  | 'corner_rest';

export interface TileData {
  id: number;
  label: string;
  sublabel?: string;
  type: TileType;
  /** Accent color for glow / border highlight */
  accentColor: string;
  /** Landmark shape key for geometry builder */
  landmark?: string;
}

export const BOARD_TILES: TileData[] = [
  // ── CORNER 0: START (bottom-left) ────────────────────────────
  { id: 0,  label: 'START',     type: 'start',         accentColor: '#22c55e', },

  // ── BOTTOM ROW: tiles 1-7 (left → right) ─────────────────────
  { id: 1,  label: 'GRANADA',   sublabel: '1',  type: 'city',    accentColor: '#b8922a', landmark: 'arch'       },
  { id: 2,  label: 'SEATTLE',   sublabel: '2',  type: 'city',    accentColor: '#b8922a', landmark: 'tower'      },
  { id: 3,  label: 'MADRID',    sublabel: '3',  type: 'city',    accentColor: '#b8922a', landmark: 'gate'       },
  { id: 4,  label: 'MALDIVES',  sublabel: '4',  type: 'city',    accentColor: '#9b59b6', landmark: 'palm'       },
  { id: 5,  label: 'HONG KONG', sublabel: '5',  type: 'city',    accentColor: '#b8922a', landmark: 'skyline'    },
  { id: 6,  label: 'BEIJING',   sublabel: '6',  type: 'city',    accentColor: '#b8922a', landmark: 'temple'     },
  { id: 7,  label: 'SHANGHAI',  sublabel: '7',  type: 'city',    accentColor: '#b8922a', landmark: 'tower2'     },

  // ── CORNER 8: REST ROOM (bottom-right) ───────────────────────
  { id: 8,  label: 'REST\nROOM', type: 'corner_rest',  accentColor: '#b8922a', },

  // ── RIGHT COLUMN: tiles 9-14 (bottom → top) ──────────────────
  { id: 9,  label: 'MILAN',    sublabel: '9',  type: 'city',    accentColor: '#b8922a', landmark: 'dome'       },
  { id: 10, label: 'ROME',     sublabel: '10', type: 'city',    accentColor: '#b8922a', landmark: 'colosseum'  },
  { id: 11, label: 'CHANCE',   sublabel: '11', type: 'chance',  accentColor: '#9b59b6',                        },
  { id: 12, label: 'HAMBURG',  sublabel: '12', type: 'city',    accentColor: '#b8922a', landmark: 'bridge'     },
  { id: 13, label: 'CYPRUS',   sublabel: '13', type: 'city',    accentColor: '#b8922a', landmark: 'ruins'      },
  { id: 14, label: 'BERLIN',   sublabel: '14', type: 'city',    accentColor: '#b8922a', landmark: 'gate2'      },

  // ── CORNER 15: GO TO ROOM (top-right) ────────────────────────
  { id: 15, label: 'GO TO\nROOM', type: 'corner_room', accentColor: '#ef4444', },

  // ── TOP ROW: tiles 16-21 (right → left) ──────────────────────
  { id: 16, label: 'LONDON',   sublabel: '15', type: 'city',    accentColor: '#b8922a', landmark: 'clock'      },
  { id: 17, label: 'SOCHI',    sublabel: '16', type: 'city',    accentColor: '#b8922a', landmark: 'mountain'   },
  { id: 18, label: 'SYDNEY',   sublabel: '17', type: 'city',    accentColor: '#b8922a', landmark: 'opera'      },
  { id: 19, label: 'CHANCE',   sublabel: '18', type: 'chance',  accentColor: '#9b59b6',                        },
  { id: 20, label: 'CHICAGO',  sublabel: '19', type: 'city',    accentColor: '#b8922a', landmark: 'tower3'     },
  { id: 21, label: 'LAS VEGAS',sublabel: '20', type: 'city',    accentColor: '#b8922a', landmark: 'sign'       },
  { id: 22, label: 'NEW YORK', sublabel: '21', type: 'city',    accentColor: '#b8922a', landmark: 'liberty'    },

  // ── CORNER 23: FREE LOUNGE (top-left) ────────────────────────
  { id: 23, label: 'FREE\nLOUNGE', type: 'corner_lounge', accentColor: '#22c55e', },

  // ── LEFT COLUMN: tiles 24-27 (top → bottom) ──────────────────
  { id: 24, label: 'NICE',    sublabel: '22', type: 'city',    accentColor: '#b8922a', landmark: 'seaside'    },
  { id: 25, label: 'LYON',    sublabel: '23', type: 'city',    accentColor: '#b8922a', landmark: 'bridge2'    },
  { id: 26, label: 'PARIS',   sublabel: '24', type: 'city',    accentColor: '#b8922a', landmark: 'eiffel'     },
  { id: 27, label: 'CHANCE',  sublabel: '25', type: 'chance',  accentColor: '#9b59b6',                        },
  { id: 28, label: 'KAZAN',   sublabel: '26', type: 'city',    accentColor: '#b8922a', landmark: 'kremlin'    },
  { id: 29, label: 'TAX',     sublabel: '27', type: 'tax',     accentColor: '#f59e0b', landmark: 'columns'    },
];
