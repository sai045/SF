import { Howl } from "howler";

// Initialize sounds once and export them for use anywhere in the app
export const playSuccessSound = () => {
  const sound = new Howl({ src: ["/audio/success.mp3"], volume: 0.5 });
  sound.play();
};

export const playLevelUpSound = () => {
  const sound = new Howl({ src: ["/audio/level-up.mp3"], volume: 0.7 });
  sound.play();
};
