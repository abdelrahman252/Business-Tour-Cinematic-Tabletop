export const colors = {
  environment: { background: '#06040a', fog: '#06040a' },
  atmosphere:  { particles: '#c8a028' },
  gold:        { primary: '#c8a028', bright: '#e8c040', dark: '#7a5a00' },
  accents:     { start: '#22c55e', danger: '#ef4444', chance: '#9b59b6', tax: '#f59e0b' },
  board: {
    // Physical surfaces
    feet:    '#1a1208',
    body:    '#09070a',
    edge:    '#c8a028',
    edgeDark:'#a07820',
    surface: '#080608',
    inset:   '#c8a028',
    felt:    '#0c0a10',
    corner:  '#0a0709',
    special: '#0c0810',
    premium: '#100c08',

    // Frame + emblem (hex numbers for Three.js Color)
    frame:   0xc8a028,
    emblem:  0xc8a028,   // ← was missing — used by CornerTiles

    // Tile base colors
    tileBase:    0x080608,
    tileCorner:  0x0a0709,
    tileSpecial: 0x0c0810,
    tilePremium: 0x100c08,
    tileInset:   0x0d0a06,

    // Text
    tileText:       0xf0dfa0,
    tileAccentText: 0xc8a028,
    tileMutedText:  0x8a7a50,

    // Special accents
    start:        0x22c55e,
    warning:      0xef4444,
    chance:       0x9b59b6,
    tax:          0xf59e0b,
    premiumColor: 0xd4af37,

    // Ownership
    ownershipEmpty: 0x1a1510,

    // Holograms
    hologramBase:   0xc8a028,
    hologramChance: 0x9b59b6,
    hologramTax:    0xf59e0b,

    // Property group accent colors (indexed 0–7, matches MONOPOLY_GROUPS)
    // 0: Founders Row     1: Pacific Trade  2: Italian Atelier  3: Industrial North
    // 4: Commonwealth     5: American Prime 6: Riviera Line     7: Eastern Crown
    groups: [
      0xb05020,  // 0 — terracotta
      0xe74c3c,  // 1 — red
      0x3498db,  // 2 — cobalt blue
      0x27ae60,  // 3 — emerald
      0x1abc9c,  // 4 — teal
      0xe67e22,  // 5 — orange
      0x9b59b6,  // 6 — purple
      0xf1c40f,  // 7 — gold yellow
    ],
  },
  tile: { city: '#c8a028', chance: '#9b59b6', start: '#22c55e', danger: '#ef4444', tax: '#f59e0b', lounge: '#22c55e', rest: '#c8a028' },
  table:   { top: '#0e0b08', side: '#0a0806', leather: '#181210' },
  pawn:    { gold: '#c8a028', glow: '#ffddaa' },
  lighting:{ key: '#fff8e8', fill: '#ffe8cc', rim: '#c0d4ff', ambient: '#1a1208', boardGlow: '#c8a028', accent: '#c8a028' },
};
