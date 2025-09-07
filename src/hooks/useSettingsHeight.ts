import { useEffect, useState } from 'react';

export function useSettingsHeight(headerRef: React.RefObject<HTMLElement | null>, footerRef: React.RefObject<HTMLDivElement | null>, deps: any[], focusMode: boolean) {
  const [settingsHeight, setSettingsHeight] = useState<number | null>(null);
  useEffect(() => {
    const calcHeights = () => {
      if (focusMode) { setSettingsHeight(null); return; }
      const headerH = headerRef.current ? headerRef.current.getBoundingClientRect().height : 0;
      const footerH = footerRef.current ? footerRef.current.getBoundingClientRect().height : 0;
      const vh = window.innerHeight;
      const h = vh - headerH - footerH;
      setSettingsHeight(h > 0 ? h : null);
    };
    calcHeights();
    const t = setTimeout(calcHeights, 50);
    window.addEventListener('resize', calcHeights);
    return () => { window.removeEventListener('resize', calcHeights); clearTimeout(t); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusMode, ...deps]);
  return settingsHeight;
}

export default useSettingsHeight;
