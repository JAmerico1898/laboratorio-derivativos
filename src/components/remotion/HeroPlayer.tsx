"use client";

import { Player } from "@remotion/player";
import { HeroAnimation } from "./HeroAnimation";

const COMPOSITION_WIDTH = 1920;
const COMPOSITION_HEIGHT = 800;
const FPS = 30;
const DURATION_IN_FRAMES = 300;

export const HeroPlayer: React.FC = () => {
  return (
    <Player
      component={HeroAnimation}
      compositionWidth={COMPOSITION_WIDTH}
      compositionHeight={COMPOSITION_HEIGHT}
      fps={FPS}
      durationInFrames={DURATION_IN_FRAMES}
      loop
      autoPlay
      controls={false}
      style={{
        width: "100%",
        height: "100%",
      }}
    />
  );
};
