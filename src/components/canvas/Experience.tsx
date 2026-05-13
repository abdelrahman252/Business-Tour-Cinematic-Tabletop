'use client';

import React from 'react';
import { SceneLighting } from '@/components/atmosphere/SceneLighting';
import { SceneEnvironment } from '@/components/atmosphere/SceneEnvironment';
import { CameraDirector } from '@/systems/camera/CameraDirector';
import { Table } from '@/components/tabletop/Table';
import { Board } from '@/components/tabletop/Board/Board';
import { FloatingParticles } from '@/components/atmosphere/FloatingParticles';
import { PostProcessing } from '@/components/cinematic/PostProcessing';
import { Miniatures } from '@/components/tabletop/Miniatures';
import { DiceCinematicController } from '@/systems/dice/DiceCinematicController';
import { PawnTraversalSystem } from '@/systems/pawn/PawnTraversalSystem';
import { PawnMotionSystem } from '@/systems/pawn/PawnMotionSystem';
import { InspectController, InspectBridge } from '@/systems/inspect/InspectController';
import { DragController } from '@/systems/camera/DragController';
import { useInteractionStore } from '@/stores/useInteractionStore';

function InteractionControllers() {
  const mode = useInteractionStore((s) => s.mode);
  return (
    <>
      <InspectBridge />
      {mode === 'INSPECT' && <InspectController />}
      {mode === 'DRAG'    && <DragController />}
    </>
  );
}

export function Experience() {
  return (
    <>
      <SceneEnvironment />
      <SceneLighting />
      <FloatingParticles />
      <CameraDirector />
      <InteractionControllers />
      <PostProcessing />
      <Table />
      <Board />
      <Miniatures />
      <DiceCinematicController />
      <PawnTraversalSystem />
      <PawnMotionSystem />
    </>
  );
}
