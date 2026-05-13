import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { postprocessingConfig } from '@/config/postprocessingConfig';

export function PostProcessing() {
  return (
    <EffectComposer>
      <Bloom 
        luminanceThreshold={postprocessingConfig.bloom.luminanceThreshold} 
        mipmapBlur 
        intensity={postprocessingConfig.bloom.intensity}
        luminanceSmoothing={postprocessingConfig.bloom.luminanceSmoothing}
      />
    </EffectComposer>
  );
}
