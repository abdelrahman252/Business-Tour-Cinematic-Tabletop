import { colors } from '@/data/colors';

export function SceneEnvironment() {
  return (
    <>
      <color attach="background" args={[colors.environment.background]} />
      <fogExp2 attach="fog" args={[colors.environment.fog, 0.055]} />
    </>
  );
}
