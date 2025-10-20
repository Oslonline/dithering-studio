import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSettingsHeight } from '../../hooks/useSettingsHeight';
import { createRef } from 'react';

describe('useSettingsHeight', () => {
  let headerRef: React.RefObject<HTMLElement>;
  let footerRef: React.RefObject<HTMLDivElement>;
  
  beforeEach(() => {
    vi.useFakeTimers();
    
    headerRef = { current: document.createElement('header') };
    footerRef = { current: document.createElement('div') };
    
    vi.spyOn(headerRef.current!, 'getBoundingClientRect').mockReturnValue({
      height: 60,
      width: 1000,
      top: 0,
      left: 0,
      bottom: 60,
      right: 1000,
      x: 0,
      y: 0,
      toJSON: () => ({})
    } as DOMRect);
    
    vi.spyOn(footerRef.current!, 'getBoundingClientRect').mockReturnValue({
      height: 40,
      width: 1000,
      top: 0,
      left: 0,
      bottom: 40,
      right: 1000,
      x: 0,
      y: 0,
      toJSON: () => ({})
    } as DOMRect);
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 800,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should calculate settings height correctly', () => {
    const { result } = renderHook(() =>
      useSettingsHeight(headerRef, footerRef, [], false)
    );
    
    act(() => {
      act(() => { vi.runAllTimers(); });
    });
    
    expect(result.current).toBe(700);
  });

  it('should return null when in focus mode', () => {
    const { result } = renderHook(() =>
      useSettingsHeight(headerRef, footerRef, [], true)
    );
    
    act(() => { vi.runAllTimers(); });
    
    expect(result.current).toBeNull();
  });

  it('should handle missing header ref', () => {
    const nullHeaderRef = { current: null };
    
    const { result } = renderHook(() =>
      useSettingsHeight(nullHeaderRef, footerRef, [], false)
    );
    
    act(() => { vi.runAllTimers(); });
    
    expect(result.current).toBe(760);
  });

  it('should handle missing footer ref', () => {
    const nullFooterRef = { current: null };
    
    const { result } = renderHook(() =>
      useSettingsHeight(headerRef, nullFooterRef, [], false)
    );
    
    act(() => { vi.runAllTimers(); });
    
    expect(result.current).toBe(740);
  });

  it('should handle both refs null', () => {
    const nullHeaderRef = { current: null };
    const nullFooterRef = { current: null };
    
    const { result } = renderHook(() =>
      useSettingsHeight(nullHeaderRef, nullFooterRef, [], false)
    );
    
    act(() => { vi.runAllTimers(); });
    
    expect(result.current).toBe(800);
  });

  it('should recalculate on window resize', () => {
    const { result } = renderHook(() =>
      useSettingsHeight(headerRef, footerRef, [], false)
    );
    
    act(() => {
      act(() => { vi.runAllTimers(); });
    });
    expect(result.current).toBe(700);
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1000,
    });
    
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    
    expect(result.current).toBe(900);
  });

  it('should update when dependencies change', () => {
    const { result, rerender } = renderHook(
      ({ deps }) => useSettingsHeight(headerRef, footerRef, deps, false),
      { initialProps: { deps: [1] } }
    );
    
    act(() => { vi.runAllTimers(); });
    const initialHeight = result.current;
    
    vi.spyOn(footerRef.current!, 'getBoundingClientRect').mockReturnValue({
      height: 80,
      width: 1000,
      top: 0,
      left: 0,
      bottom: 80,
      right: 1000,
      x: 0,
      y: 0,
      toJSON: () => ({})
    } as DOMRect);
    
    rerender({ deps: [2] });
    act(() => { vi.runAllTimers(); });
    
    expect(result.current).not.toBe(initialHeight);
    expect(result.current).toBe(660);
  });

  it('should update when focus mode changes', () => {
    const { result, rerender } = renderHook(
      ({ focusMode }) => useSettingsHeight(headerRef, footerRef, [], focusMode),
      { initialProps: { focusMode: false } }
    );
    
    act(() => { vi.runAllTimers(); });
    expect(result.current).toBe(700);
    
    rerender({ focusMode: true });
    act(() => { vi.runAllTimers(); });
    
    expect(result.current).toBeNull();
    
    rerender({ focusMode: false });
    act(() => { vi.runAllTimers(); });
    
    expect(result.current).toBe(700);
  });

  it('should return null if calculated height is negative or zero', () => {
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 50,
    });
    
    const { result } = renderHook(() =>
      useSettingsHeight(headerRef, footerRef, [], false)
    );
    
    act(() => { vi.runAllTimers(); });
    
    expect(result.current).toBeNull();
  });

  it('should cleanup event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    
    const { unmount } = renderHook(() =>
      useSettingsHeight(headerRef, footerRef, [], false)
    );
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it.skip('should calculate height after 50ms timeout (mock limitation)', () => {
    const { result } = renderHook(() =>
      useSettingsHeight(headerRef, footerRef, [], false)
    );
    
    act(() => {
      act(() => { vi.runAllTimers(); });
    });
    expect(result.current).toBe(700);
    
    vi.spyOn(headerRef.current!, 'getBoundingClientRect').mockReturnValue({
      height: 80,
      width: 1000,
      top: 0,
      left: 0,
      bottom: 80,
      right: 1000,
      x: 0,
      y: 0,
      toJSON: () => ({})
    } as DOMRect);
    
    act(() => {
      vi.advanceTimersByTime(50);
    });
    
    expect(result.current).toBe(680);
  });

  it('should handle rapid dependency changes', () => {
    const { result, rerender } = renderHook(
      ({ deps }) => useSettingsHeight(headerRef, footerRef, deps, false),
      { initialProps: { deps: [1] } }
    );
    
    rerender({ deps: [2] });
    rerender({ deps: [3] });
    rerender({ deps: [4] });
    
    act(() => { vi.runAllTimers(); });
    
    expect(result.current).toBe(700);
  });

  it('should handle window resize during focus mode', () => {
    const { result } = renderHook(() =>
      useSettingsHeight(headerRef, footerRef, [], true)
    );
    
    act(() => { vi.runAllTimers(); });
    expect(result.current).toBeNull();
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1000,
    });
    
    window.dispatchEvent(new Event('resize'));
    
    expect(result.current).toBeNull();
  });
});
