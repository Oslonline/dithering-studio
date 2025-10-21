import React from 'react';
import { algorithms } from '../../utils/algorithms';
import { predefinedPalettes } from '../../utils/palettes';

interface RandomizeButtonProps {
  currentPattern: number;
  setPattern: (id: number) => void;
  setThreshold: (t: number) => void;
  setWorkingResolution: (r: number) => void;
  setContrast: (c: number) => void;
  setMidtones: (m: number) => void;
  setHighlights: (h: number) => void;
  setBlurRadius: (b: number) => void;
  setPaletteId: (id: string | null) => void;
  setActivePaletteColors: React.Dispatch<React.SetStateAction<[number, number, number][] | null>>;
  setInvert: (i: boolean) => void;
  setSerpentine: (s: boolean) => void;
  title?: string;
  ariaLabel?: string;
  className?: string;
}

const RandomizeButton: React.FC<RandomizeButtonProps> = ({
  currentPattern,
  setPattern,
  setThreshold,
  setWorkingResolution,
  setContrast,
  setMidtones,
  setHighlights,
  setBlurRadius,
  setPaletteId,
  setActivePaletteColors,
  setInvert,
  setSerpentine,
  title = 'Randomize algorithm and settings',
  ariaLabel = 'Randomize algorithm and settings',
  className = 'clean-btn px-3 py-2 text-[16px]',
}) => {
  
  const randomInRange = (min: number, max: number): number => {
    return Math.random() * (max - min) + min;
  };

  const handleRandomize = () => {
    const availableAlgorithms = algorithms.filter(a => a.id !== currentPattern);
    const randomAlgo = availableAlgorithms[Math.floor(Math.random() * availableAlgorithms.length)];
    setPattern(randomAlgo.id);

    if (randomAlgo.supportsThreshold) {
      setThreshold(Math.round(randomInRange(80, 160)));
    } else {
      setThreshold(128);
    }

    setContrast(Number(randomInRange(0.8, 1.3).toFixed(2)));
    setMidtones(Number(randomInRange(0.8, 1.2).toFixed(2)));
    setHighlights(Number(randomInRange(0.85, 1.15).toFixed(2)));
    setBlurRadius(Math.random() < 0.7 ? 0 : Number(randomInRange(0.3, 1.5).toFixed(1)));
    setWorkingResolution(Math.round(randomInRange(180, 800)));

    if (Math.random() < 0.3) {
      setPaletteId(null);
      setActivePaletteColors(null);
    } else {
      const randomIndex = Math.floor(Math.random() * predefinedPalettes.length);
      const selectedPalette = predefinedPalettes[randomIndex];
      
      setPaletteId(selectedPalette.id);
      
      if (selectedPalette && selectedPalette.colors) {
        setActivePaletteColors(selectedPalette.colors.map(c => [...c] as [number, number, number]));
      }
    }

    setInvert(Math.random() < 0.2);

    if (randomAlgo.category === 'Error Diffusion') {
      setSerpentine(Math.random() < 0.5);
    } else {
      setSerpentine(false);
    }
  };

  return (
    <button
      onClick={handleRandomize}
      className={className}
      title={title}
      aria-label={ariaLabel}
    >
      🎲
    </button>
  );
};

export default RandomizeButton;
