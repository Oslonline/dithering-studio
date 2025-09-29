import React, { useEffect, useState } from "react";

interface Props {
  focusMode: boolean;
  mediaActive?: boolean;
}

const FocusHint: React.FC<Props> = ({ focusMode, mediaActive }) => {
  const [showDevice, setShowDevice] = useState(true);
  const [style, setStyle] = useState<{ left: number; top: number }>({ left: 16, top: 72 });

  // Determine if hint should display (avoid on small / coarse pointer devices)
  useEffect(() => {
    const evalDevice = () => {
      const belowMd = window.innerWidth < 768;
      const coarse = matchMedia("(pointer: coarse)").matches;
      setShowDevice(!(belowMd || coarse));
    };
    evalDevice();
    window.addEventListener("resize", evalDevice);
    return () => window.removeEventListener("resize", evalDevice);
  }, []);

  // Dynamic positioning relative to header/aside
  useEffect(() => {
    const calc = () => {
      if (focusMode) {
        setStyle({ left: 8, top: 8 });
        return;
      }
      const header = document.querySelector("#tool > header");
      const aside = document.querySelector("#tool aside");
      const headerH = header ? header.getBoundingClientRect().height : 48;
      const asideW = aside ? aside.getBoundingClientRect().width : 0;
      const top = headerH + 16;
      const left = window.innerWidth >= 768 ? asideW + 16 : 16;
      setStyle({ left, top });
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [focusMode]);

  if (!showDevice) return null;

  const text = mediaActive ? "F Focus | G Grid | Shift+G Size" : "F Focus";
  return (
    <div className="pointer-events-none fixed z-20 rounded bg-neutral-900/70 px-3 py-1 font-mono text-[10px] tracking-wide text-gray-300 shadow transition-all duration-150" style={{ left: style.left, top: style.top }} aria-label={text}>
      {text}
    </div>
  );
};

export default FocusHint;
