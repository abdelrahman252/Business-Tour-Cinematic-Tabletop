/**
 * BUSINESS TOUR — TileMesh v9
 *
 * FIXES:
 *  - Z-fighting eliminated: face plane uses polygonOffset + larger Y gap
 *  - Canvas texture redesigned: NO top band/header — just dark bg, gold border,
 *    gold engraving, city name + index at bottom. Clean like reference image.
 *  - Text is matte/dim — globalAlpha 0.80, no shadow glow, plain not bold
 *  - Portrait tiles (W × W×1.55), corners square — same as before
 *  - Hologram rises from tile center top face — correct position
 *  - Subtle edge glow only, no neon
 */

'use client';

import React, { useRef, useState, useCallback, useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { boardConfig } from '@/data/boardConfig';
import { colors }      from '@/data/colors';
import {
  makeOwnerMat,
  makeRingMat,
  cornerBaseMat,
  specialBaseMat,
  premiumBaseMat,
  tileBaseMat,
} from '@/utils/materials';
import { TileData, TileSide } from '@/data/tiles';

type n = number;

// Gold engraving — same warm gold for ALL tiles, exactly like reference
const GOLD = '#b89030';

interface TileMeshProps {
  position: [number, number, number];
  tile: TileData;
}

// ─── Tile dimensions ──────────────────────────────────────────────────────────
function getTileDims(cellSize: number, isCorner: boolean) {
  const cfg = boardConfig.tiles as any;
  const W   = cellSize - (cfg.margin ?? 0.028);
  const D   = isCorner ? W : W * (cfg.portraitRatio ?? 1.55);
  return { W, D };
}

// ─── Face plane rotation so texture is readable from outside the board ────────
const FACE_ROT: Record<TileSide, [n, n, n]> = {
  bottom: [-Math.PI / 2, 0, 0],
  top:    [-Math.PI / 2, 0, Math.PI],
  left:   [-Math.PI / 2, 0, -Math.PI / 2],
  right:  [-Math.PI / 2, 0,  Math.PI / 2],
};

// ─── Accent strip on outer side wall only ────────────────────────────────────
function getAccentStrip(side: TileSide, W: n, D: n, H: n) {
  const sH = H * 0.20, yPos = H / 2 - sH / 2, t = 0.007, hD = D / 2;
  if (side === 'bottom') return { args: [W*0.96, sH, t] as [n,n,n], pos: [0, yPos,  hD] as [n,n,n] };
  if (side === 'top')    return { args: [W*0.96, sH, t] as [n,n,n], pos: [0, yPos, -hD] as [n,n,n] };
  if (side === 'left')   return { args: [t, sH, W*0.96] as [n,n,n], pos: [-hD, yPos, 0] as [n,n,n] };
  return                        { args: [t, sH, W*0.96] as [n,n,n], pos: [ hD, yPos, 0] as [n,n,n] };
}

// ─── Landmark shape ───────────────────────────────────────────────────────────
type Shape = 'eiffel'|'arch'|'skyline'|'dome'|'pagoda'|'gate'|'palm'|'diamond'|'chance'|'pyramid'|'generic';

function getShape(tile: TileData): Shape {
  const id = tile.id;
  if (tile.kind === 'chance') return 'chance';
  if (tile.kind === 'tax')    return 'pyramid';
  if (['paris','seattle','new-york'].includes(id))              return 'eiffel';
  if (['rome','granada'].includes(id))                          return 'arch';
  if (['hong-kong','berlin','hamburg','beijing'].includes(id))  return 'skyline';
  if (['london','moscow','sydney'].includes(id))                return 'dome';
  if (['shanghai','sochi'].includes(id))                        return 'pagoda';
  if (['madrid'].includes(id))                                  return 'gate';
  if (['maldives','venice','nice','cyprus'].includes(id))       return 'palm';
  if (['milan','lyon','kazan'].includes(id))                    return 'diamond';
  return 'generic';
}

// ─── Landmark line-art ────────────────────────────────────────────────────────
function drawLandmark(ctx: CanvasRenderingContext2D, shape: Shape, cx: n, cy: n, R: n, color: string, lw: n) {
  ctx.save();
  ctx.strokeStyle = color; ctx.fillStyle = color;
  ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const x0=cx-R,x1=cx+R,y0=cy-R,y1=cy+R;
  const s=(fn:()=>void)=>{ctx.beginPath();fn();ctx.stroke();};
  const lset=(v:n)=>{ctx.lineWidth=lw*v;};

  if (shape==='eiffel'){
    s(()=>{ctx.moveTo(cx,y0+R*.05);ctx.lineTo(x0+R*.16,y1);});
    s(()=>{ctx.moveTo(cx,y0+R*.05);ctx.lineTo(x1-R*.16,y1);});
    s(()=>{ctx.moveTo(cx-R*.11,y0+R*.32);ctx.lineTo(cx+R*.11,y0+R*.32);});
    s(()=>{ctx.moveTo(cx-R*.29,y0+R*.63);ctx.lineTo(cx+R*.29,y0+R*.63);});
    s(()=>{ctx.moveTo(x0+R*.06,y1);ctx.lineTo(x1-R*.06,y1);});
    lset(.55);s(()=>{ctx.moveTo(cx,y0);ctx.lineTo(cx,y0+R*.05);});
    lset(.68);
    s(()=>{ctx.moveTo(cx-R*.12,y0+R*.32);ctx.lineTo(cx-R*.29,y0+R*.63);});
    s(()=>{ctx.moveTo(cx+R*.12,y0+R*.32);ctx.lineTo(cx+R*.29,y0+R*.63);});
    s(()=>{ctx.moveTo(cx-R*.06,y0+R*.47);ctx.lineTo(cx+R*.15,y0+R*.47);});
    s(()=>{ctx.moveTo(cx+R*.06,y0+R*.47);ctx.lineTo(cx-R*.15,y0+R*.47);});
  } else if (shape==='arch'){
    const ab=y0+R*.46;
    s(()=>{ctx.moveTo(cx-R*.40,y1);ctx.lineTo(cx-R*.40,ab);ctx.arc(cx,ab,R*.40,Math.PI,0);ctx.lineTo(cx+R*.40,y1);});
    lset(.62);const ab2=y0+R*.58;
    s(()=>{ctx.moveTo(cx-R*.24,y1);ctx.lineTo(cx-R*.24,ab2);ctx.arc(cx,ab2,R*.24,Math.PI,0);ctx.lineTo(cx+R*.24,y1);});
    lset(1);s(()=>{ctx.moveTo(cx-R*.08,y0+R*.08);ctx.lineTo(cx,y0);ctx.lineTo(cx+R*.08,y0+R*.08);});
    s(()=>{ctx.moveTo(x0+R*.05,y1);ctx.lineTo(x1-R*.05,y1);});
  } else if (shape==='skyline'){
    const bs=[{x:x0+R*.04,w:R*.30,h:R*.52},{x:x0+R*.38,w:R*.32,h:R*.76},{x:x0+R*.74,w:R*.38,h:R*.94},{x:x0+R*1.14,w:R*.30,h:R*.62},{x:x0+R*1.46,w:R*.30,h:R*.44}];
    bs.forEach(b=>{s(()=>{ctx.moveTo(b.x,y1);ctx.lineTo(b.x,y1-b.h);ctx.lineTo(b.x+b.w,y1-b.h);ctx.lineTo(b.x+b.w,y1);});});
    lset(.55);s(()=>{ctx.moveTo(bs[2].x+bs[2].w/2,y1-bs[2].h);ctx.lineTo(bs[2].x+bs[2].w/2,y0);});
    lset(1);s(()=>{ctx.moveTo(x0,y1);ctx.lineTo(x1,y1);});
  } else if (shape==='dome'){
    s(()=>{ctx.moveTo(cx-R*.26,y1);ctx.lineTo(cx-R*.26,cy+R*.02);ctx.lineTo(cx-R*.14,cy+R*.02);});
    s(()=>{ctx.moveTo(cx+R*.26,y1);ctx.lineTo(cx+R*.26,cy+R*.02);ctx.lineTo(cx+R*.14,cy+R*.02);});
    s(()=>{ctx.arc(cx,cy+R*.02,R*.14,0,Math.PI,true);});
    lset(.6);s(()=>{ctx.arc(cx,cy+R*.02,R*.09,0,Math.PI*2);});
    lset(1);s(()=>{ctx.moveTo(cx,cy-R*.12);ctx.lineTo(cx,y0);});
    s(()=>{ctx.moveTo(cx-R*.09,y0+R*.28);ctx.lineTo(cx+R*.09,y0+R*.28);});
    s(()=>{ctx.moveTo(x0+R*.04,y1);ctx.lineTo(x1-R*.04,y1);});
  } else if (shape==='pagoda'){
    const ts=[{y:y1,w:R*.84,h:R*.26},{y:y1-R*.26,w:R*.60,h:R*.24},{y:y1-R*.50,w:R*.38,h:R*.22}];
    ts.forEach(t=>{
      s(()=>{ctx.moveTo(cx-t.w-t.w*.09,t.y);ctx.lineTo(cx-t.w,t.y-t.h);ctx.lineTo(cx+t.w,t.y-t.h);ctx.lineTo(cx+t.w+t.w*.09,t.y);});
      lset(.62);
      s(()=>{ctx.moveTo(cx-t.w-t.w*.09,t.y);ctx.lineTo(cx-t.w-t.w*.19,t.y-t.h*.36);});
      s(()=>{ctx.moveTo(cx+t.w+t.w*.09,t.y);ctx.lineTo(cx+t.w+t.w*.19,t.y-t.h*.36);});
      lset(1);
    });
    lset(.6);s(()=>{ctx.moveTo(cx,ts[2].y-ts[2].h);ctx.lineTo(cx,y0);});
    s(()=>{ctx.moveTo(cx-R*.07,y0+R*.12);ctx.lineTo(cx+R*.07,y0+R*.12);});
  } else if (shape==='gate'){
    s(()=>{ctx.moveTo(x0+R*.12,y1);ctx.lineTo(x0+R*.12,y0+R*.36);ctx.lineTo(x0+R*.44,y0+R*.36);ctx.lineTo(x0+R*.44,y0+R*.52);ctx.arc(cx,y0+R*.52,R*.44,Math.PI,0);ctx.lineTo(x1-R*.44,y0+R*.36);ctx.lineTo(x1-R*.12,y0+R*.36);ctx.lineTo(x1-R*.12,y1);});
    s(()=>{ctx.moveTo(x0+R*.12,y0+R*.36);ctx.lineTo(x0+R*.12,y0+R*.18);ctx.lineTo(x1-R*.12,y0+R*.18);ctx.lineTo(x1-R*.12,y0+R*.36);});
    lset(.55);[-0.30,-0.14,0,0.14,0.30].forEach(o=>{s(()=>{ctx.moveTo(cx+R*o,y0+R*.18);ctx.lineTo(cx+R*o,y0+R*.06);});});
    lset(1);s(()=>{ctx.moveTo(x0+R*.04,y1);ctx.lineTo(x1-R*.04,y1);});
  } else if (shape==='palm'){
    s(()=>{ctx.moveTo(cx+R*.07,y1);ctx.bezierCurveTo(cx+R*.14,cy+R*.30,cx-R*.10,cy-R*.12,cx+R*.02,cy-R*.42);});
    const fr:[n,n,n,n,n,n][]=[
      [cx+R*.02,cy-R*.42,cx-R*.48,cy-R*.66,cx-R*.62,cy-R*.74],
      [cx+R*.02,cy-R*.42,cx-R*.30,cy-R*.80,cx-R*.34,cy-R*.90],
      [cx+R*.02,cy-R*.42,cx+R*.06,cy-R*.86,cx+R*.06,cy-R*.96],
      [cx+R*.02,cy-R*.42,cx+R*.36,cy-R*.70,cx+R*.52,cy-R*.72],
      [cx+R*.02,cy-R*.42,cx+R*.46,cy-R*.46,cx+R*.60,cy-R*.46],
    ];
    fr.forEach(([sx,sy,cpx,cpy,ex,ey])=>{s(()=>{ctx.moveTo(sx,sy);ctx.quadraticCurveTo(cpx,cpy,ex,ey);});});
    lset(.62);s(()=>{ctx.ellipse(cx,y1-R*.07,R*.38,R*.09,0,0,Math.PI*2);});
  } else if (shape==='diamond'){
    s(()=>{ctx.moveTo(cx,y0+R*.04);ctx.lineTo(x1-R*.04,cy);ctx.lineTo(cx,y1-R*.04);ctx.lineTo(x0+R*.04,cy);ctx.closePath();});
    lset(.58);
    s(()=>{ctx.moveTo(x0+R*.04,cy);ctx.lineTo(x1-R*.04,cy);});
    s(()=>{ctx.moveTo(cx,y0+R*.04);ctx.lineTo(cx,y1-R*.04);});
    s(()=>{ctx.moveTo(cx,y0+R*.04);ctx.lineTo(x0+R*.24,cy-R*.12);});
    s(()=>{ctx.moveTo(cx,y0+R*.04);ctx.lineTo(x1-R*.24,cy-R*.12);});
    s(()=>{ctx.moveTo(cx,y1-R*.04);ctx.lineTo(x0+R*.24,cy+R*.12);});
    s(()=>{ctx.moveTo(cx,y1-R*.04);ctx.lineTo(x1-R*.24,cy+R*.12);});
  } else if (shape==='chance'){
    ctx.font=`bold ${R*1.4}px Georgia,serif`;
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('?',cx,cy+R*.07);
  } else if (shape==='pyramid'){
    s(()=>{ctx.moveTo(cx,y0+R*.06);ctx.lineTo(x0+R*.06,y1-R*.22);ctx.lineTo(x1-R*.06,y1-R*.22);ctx.closePath();});
    lset(.58);[.30,.55,.78].forEach(t=>{s(()=>{ctx.moveTo(cx-R*.94*t,y1-R*.22-(y1-R*.22-y0-R*.06)*t);ctx.lineTo(cx+R*.94*t,y1-R*.22-(y1-R*.22-y0-R*.06)*t);});});
    lset(1);s(()=>{ctx.moveTo(x0+R*.04,y1-R*.22);ctx.lineTo(x1-R*.04,y1-R*.22);});
    lset(.62);s(()=>{ctx.moveTo(x0+R*.04,y1-R*.10);ctx.lineTo(x1-R*.04,y1-R*.10);});
  } else {
    s(()=>{ctx.moveTo(cx-R*.32,y1);ctx.lineTo(cx-R*.32,y0+R*.32);ctx.lineTo(cx,y0);ctx.lineTo(cx+R*.32,y0+R*.32);ctx.lineTo(cx+R*.32,y1);});
    lset(.65);s(()=>{ctx.moveTo(x0+R*.04,y1);ctx.lineTo(x1-R*.04,y1);});
  }
  ctx.restore();
}

// ─── Canvas tile face ─────────────────────────────────────────────────────────
// Layout (top to bottom in canvas, matching tile viewed from outside board):
//   - Gold inset border frame
//   - Landmark engraving (takes up most of the space, centered)
//   - Thin separator line
//   - City name + index number at bottom
// NO top accent band, NO category label on face — clean like reference

function makeFaceCanvas(tile: TileData, W_w: n, D_w: n): HTMLCanvasElement {
  const CW = 256;
  const CH = tile.isCorner ? 256 : Math.round(256 * (D_w / W_w));

  const canvas = document.createElement('canvas');
  canvas.width  = CW;
  canvas.height = CH;
  const ctx     = canvas.getContext('2d')!;

  // 1. Very dark background
  ctx.fillStyle = '#090711';
  ctx.fillRect(0, 0, CW, CH);

  // Subtle inner darkening toward edges
  const vig = ctx.createRadialGradient(CW*.5, CH*.5, CH*.1, CW*.5, CH*.5, CH*.72);
  vig.addColorStop(0, 'rgba(16,12,24,0)');
  vig.addColorStop(1, 'rgba(3,2,6,.50)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, CW, CH);

  const pad = CW * 0.046;
  const blw = CW * 0.009;

  // 2. Thin gold inset border
  ctx.strokeStyle = GOLD;
  ctx.lineWidth   = blw;
  ctx.globalAlpha = 0.65;
  ctx.strokeRect(pad + blw*.5, pad + blw*.5, CW - pad*2 - blw, CH - pad*2 - blw);
  ctx.globalAlpha = 1;

  // 3. Tiny accent corner dots (4 corners of border)
  const dotR = CW * 0.017;
  const dotP = pad + blw*.5;
  const acHex = '#' + new THREE.Color(tile.accentColor).getHexString();
  [[dotP,dotP],[CW-dotP,dotP],[dotP,CH-dotP],[CW-dotP,CH-dotP]].forEach(([dx,dy])=>{
    ctx.beginPath(); ctx.arc(dx, dy, dotR, 0, Math.PI*2);
    ctx.fillStyle = acHex; ctx.globalAlpha = 0.85; ctx.fill(); ctx.globalAlpha = 1;
  });

  if (tile.isCorner) {
    // Corner tiles: just the label, centered, slightly muted
    const lines = tile.label.split(' ');
    const fs    = CW * 0.150;
    ctx.font         = `${fs}px Georgia,serif`;
    ctx.fillStyle    = '#c8b870';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha  = 0.82;
    lines.forEach((ln, i) => {
      ctx.fillText(ln, CW/2, CH/2 + (i - (lines.length-1)/2) * fs * 1.20);
    });
    ctx.globalAlpha = 1;
    return canvas;
  }

  // 4. Landmark — occupies roughly 65% of canvas height, centered vertically
  const engPad = CW * 0.062;
  const engTop = pad + blw + CH * 0.04;
  const engBot = CH * 0.76;
  const engCx  = CW / 2;
  const engCy  = (engTop + engBot) / 2;
  const engR   = Math.min((engBot - engTop) / 2, (CW - engPad*2) / 2) * 0.86;

  ctx.globalAlpha = 0.88;
  drawLandmark(ctx, getShape(tile), engCx, engCy, engR, GOLD, CW * 0.013);
  ctx.globalAlpha = 1;

  // 5. Thin separator line
  ctx.strokeStyle = GOLD;
  ctx.lineWidth   = blw * 0.65;
  ctx.globalAlpha = 0.28;
  ctx.beginPath();
  ctx.moveTo(CW * 0.14, CH * 0.800);
  ctx.lineTo(CW * 0.86, CH * 0.800);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // 6. Bottom strip: index left, city name center  — muted gold, NOT glowing
  const nameY  = CH * 0.880;
  const nameFS = Math.min(CH * 0.070, CW * 0.095);
  const adjFS  = tile.label.length > 9 ? nameFS * 0.76 : nameFS;

  // City name — muted, not shiny
  ctx.font         = `${adjFS}px Georgia,serif`;
  ctx.fillStyle    = '#c8b060';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha  = 0.80;
  ctx.fillText(tile.label.toUpperCase(), CW * 0.58, nameY);
  ctx.globalAlpha  = 1;

  // Index number — small, left-aligned bottom
  const idxFS = CH * 0.055;
  ctx.font         = `${idxFS}px Georgia,serif`;
  ctx.fillStyle    = GOLD;
  ctx.textAlign    = 'left';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha  = 0.65;
  ctx.fillText(String(tile.index), CW * 0.13, nameY);
  ctx.globalAlpha  = 1;

  return canvas;
}

// ─── TileFaceTexture — no z-fighting ─────────────────────────────────────────
function TileFaceTexture({ tile, W, D }: { tile: TileData; W: n; D: n }) {
  const H   = boardConfig.tiles.height;
  const rot = FACE_ROT[tile.side];
  // Large Y offset + polygonOffset to prevent z-fighting with RoundedBox top face
  const y   = H / 2 + 0.006;

  const texture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const canvas = makeFaceCanvas(tile, W, D);
    const tex    = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    tex.colorSpace  = THREE.SRGBColorSpace;
    return tex;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tile.id, tile.accentColor, tile.ownerColor]);

  const mat = useMemo(() => {
    if (!texture) return null;
    return new THREE.MeshStandardMaterial({
      map:          texture,
      transparent:  false,
      side:         THREE.FrontSide,
      roughness:    0.92,
      metalness:    0.01,
      // Polygon offset pushes face away from camera slightly — eliminates z-fighting
      polygonOffset:      true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits:  -2,
    });
  }, [texture]);

  if (!mat) return null;

  return (
    <mesh material={mat} position={[0, y, 0]} rotation={rot} renderOrder={1}>
      <planeGeometry args={[W * 0.962, D * 0.962]} />
    </mesh>
  );
}

// ─── Corner glow dots ─────────────────────────────────────────────────────────
function CornerDots({ W, D, H }: { W: n; D: n; H: n }) {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color:   new THREE.Color(GOLD), emissive: new THREE.Color(GOLD),
    emissiveIntensity: 1.8, toneMapped: false, metalness: 0, roughness: 0,
  }), []);

  const y  = H / 2 + 0.010;
  const hw = W/2 - W*0.065;
  const hd = D/2 - D*0.048;

  return (
    <group>
      {([[-hw,-hd],[hw,-hd],[-hw,hd],[hw,hd]] as [n,n][]).map(([px,pz], i) => (
        <group key={i} position={[px, y, pz]}>
          <mesh material={mat}><sphereGeometry args={[0.008, 6, 6]} /></mesh>
          <pointLight color={new THREE.Color(0xb89030)} intensity={0.16} distance={0.16} decay={2} />
        </group>
      ))}
    </group>
  );
}

// ─── Outer edge glow ─────────────────────────────────────────────────────────
function EdgeGlow({ tile, W, D, H }: { tile: TileData; W: n; D: n; H: n }) {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(tile.accentColor), emissive: new THREE.Color(tile.accentColor),
    emissiveIntensity: 0.90, toneMapped: false,
    transparent: true, opacity: 0.72, roughness: 0.4, metalness: 0,
  }), [tile.accentColor]);

  const gH = H*0.24, yP = H*0.16, sw = 0.004;
  if (tile.side==='bottom') return <mesh material={mat} position={[0,yP,D/2+sw/2]}><boxGeometry args={[W*.92,gH,sw]}/></mesh>;
  if (tile.side==='top')    return <mesh material={mat} position={[0,yP,-D/2-sw/2]}><boxGeometry args={[W*.92,gH,sw]}/></mesh>;
  if (tile.side==='left')   return <mesh material={mat} position={[-D/2-sw/2,yP,0]}><boxGeometry args={[sw,gH,W*.92]}/></mesh>;
  return                           <mesh material={mat} position={[D/2+sw/2,yP,0]}><boxGeometry args={[sw,gH,W*.92]}/></mesh>;
}

// ─── Hover hologram ───────────────────────────────────────────────────────────
function HoverHologram({ tile, hovered, W }: { tile: TileData; hovered: boolean; W: n }) {
  const progRef = useRef(0);
  const [prog, setProg] = useState(0);
  const rotRef  = useRef(0);
  const [rotY, setRotY] = useState(0);
  const H = boardConfig.tiles.height;

  const holColor = tile.kind==='chance' ? colors.board.hologramChance
    : tile.kind==='tax' ? colors.board.hologramTax
    : 0xb89030;

  const shape = getShape(tile);
  const hex   = '#' + new THREE.Color(holColor).getHexString();

  const ringMat = useMemo(() => {
    const c = new THREE.Color(holColor);
    return new THREE.MeshStandardMaterial({
      color:c, emissive:c, emissiveIntensity:2.0,
      transparent:true, opacity:0, side:THREE.DoubleSide,
      depthWrite:false, roughness:0, metalness:0, toneMapped:false,
    });
  }, [holColor]);

  const holTex = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const S = 512;
    const c = document.createElement('canvas'); c.width=c.height=S;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0,0,S,S);
    drawLandmark(ctx, shape, S/2, S/2, S*.44, hex, S*.016);
    const t = new THREE.CanvasTexture(c); t.needsUpdate=true; return t;
  }, [shape, hex]);

  const holMat = useMemo(() => {
    if (!holTex) return null;
    const c = new THREE.Color(holColor);
    return new THREE.MeshStandardMaterial({
      map:holTex, alphaMap:holTex, transparent:true, depthWrite:false,
      side:THREE.DoubleSide, emissive:c, emissiveIntensity:2.8,
      emissiveMap:holTex, roughness:0, metalness:0, toneMapped:false, opacity:0,
    });
  }, [holTex, holColor]);

  useFrame((state, delta) => {
    const t = hovered ? 1 : 0;
    progRef.current = THREE.MathUtils.lerp(progRef.current, t, 1-Math.exp(-3*delta));
    if (Math.abs(progRef.current-prog) > .004) setProg(progRef.current);
    rotRef.current = state.clock.elapsedTime * 0.45;
    if (prog > 0.01) setRotY(rotRef.current);
  });

  ringMat.opacity = prog * 0.60;
  if (holMat) holMat.opacity = prog * 0.90;
  if (prog < 0.01) return null;

  const holY = H/2 + 0.05 + prog * 0.62;
  const sc   = 0.20 + prog * 0.80;

  return (
    <>
      {/* Scan ring on tile surface */}
      <mesh material={ringMat} rotation={[Math.PI/2,0,0]}
        position={[0, H/2+0.008, 0]} scale={[sc,sc,1]}>
        <torusGeometry args={[W*.34, 0.006, 6, 52]} />
      </mesh>
      {/* Rising crossed planes for volumetric look */}
      {holMat && (
        <group position={[0, holY, 0]} scale={[sc,sc,sc]}>
          <mesh material={holMat} rotation={[0,rotY,0]}>
            <planeGeometry args={[W*.82, W*.82]} />
          </mesh>
          <mesh material={holMat} rotation={[0,rotY+Math.PI/2,0]}>
            <planeGeometry args={[W*.82, W*.82]} />
          </mesh>
        </group>
      )}
    </>
  );
}

// ─── Tile body material ───────────────────────────────────────────────────────
function getBodyMat(tile: TileData) {
  if (tile.isCorner)                              return cornerBaseMat;
  if (tile.kind==='chance'||tile.kind==='tax')    return specialBaseMat;
  if (tile.isPremium)                             return premiumBaseMat;
  return tileBaseMat;
}

// ─── TileMesh — Main export ───────────────────────────────────────────────────
export function TileMesh({ position, tile }: TileMeshProps) {
  const { width }     = boardConfig.dimensions;
  const { thickness } = boardConfig.frame;
  const cells         = boardConfig.grid.lineCount;
  const cellSize      = (width - thickness*2) / cells;
  const { height, chamfer, chamferSmooth } = boardConfig.tiles;

  const { W, D }    = getTileDims(cellSize, tile.isCorner);
  const strip       = getAccentStrip(tile.side, W, D, height);
  const ownerColor  = tile.ownerColor ?? colors.board.ownershipEmpty;

  const accentMat = useMemo(() => new THREE.MeshStandardMaterial({
    color:   new THREE.Color(tile.accentColor),
    emissive: new THREE.Color(tile.accentColor),
    emissiveIntensity: 0.50,
    metalness: 0.2, roughness: 0.55,
  }), [tile.accentColor]);

  const ownerMat = useMemo(() => makeOwnerMat(ownerColor, !!tile.ownerColor), [ownerColor, tile.ownerColor]);
  const bodyMat  = getBodyMat(tile);

  const [hovered, setHovered] = useState(false);
  const onPointerEnter = useCallback(() => setHovered(true),  []);
  const onPointerLeave = useCallback(() => setHovered(false), []);

  return (
    <group position={position} onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave}>

      {/* Tile slab — portrait rectangle (corners square) */}
      <RoundedBox
        args={[W, height, D]}
        radius={chamfer}
        smoothness={chamferSmooth}
        castShadow receiveShadow
        material={bodyMat}
      />

      {/* Canvas face texture — no z-fighting */}
      <TileFaceTexture tile={tile} W={W} D={D} />

      {/* Accent strip on outer side wall */}
      <mesh position={strip.pos} material={accentMat}>
        <boxGeometry args={strip.args} />
      </mesh>

      {/* Ownership indicator */}
      <mesh position={strip.pos} material={ownerMat}>
        <boxGeometry args={strip.args} />
      </mesh>

      {/* Gold corner dots */}
      <CornerDots W={W} D={D} H={height} />

      {/* Outer edge colored glow */}
      <EdgeGlow tile={tile} W={W} D={D} H={height} />

      {/* Accent light for corners + special tiles */}
      {(tile.isCorner || tile.kind==='chance' || tile.kind==='tax') && (
        <pointLight
          color={new THREE.Color(tile.accentColor)}
          intensity={0.45} distance={1.2} decay={2}
          position={[0, 0.45, 0]}
        />
      )}

      {/* Hover hologram */}
      <HoverHologram tile={tile} hovered={hovered} W={W} />
    </group>
  );
}
