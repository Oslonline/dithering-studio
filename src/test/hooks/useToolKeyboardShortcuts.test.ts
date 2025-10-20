import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useToolKeyboardShortcuts } from '../../hooks/useToolKeyboardShortcuts';
import type { UploadedImage } from '../../components/panels/ImagesPanel';

describe('useToolKeyboardShortcuts', () => {
  const mockImages: UploadedImage[] = [
    { id: '1', url: 'url1', name: 'image1.png' },
    { id: '2', url: 'url2', name: 'image2.png' },
    { id: '3', url: 'url3', name: 'image3.png' },
  ];

  let setActiveImageId: ReturnType<typeof vi.fn>;
  let setFocusMode: ReturnType<typeof vi.fn>;
  let setShowGrid: ReturnType<typeof vi.fn>;
  let setGridSize: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setActiveImageId = vi.fn();
    setFocusMode = vi.fn();
    setShowGrid = vi.fn();
    setGridSize = vi.fn();
  });

  const renderHookWithDefaults = (overrides = {}) => {
    return renderHook(() =>
      useToolKeyboardShortcuts({
        images: mockImages,
        activeImageId: '1',
        setActiveImageId,
        setFocusMode,
        setShowGrid,
        setGridSize,
        mediaActive: true,
        ...overrides,
      })
    );
  };

  describe('Focus mode (F key)', () => {
    it('should toggle focus mode when F is pressed', () => {
      renderHookWithDefaults();

      const event = new KeyboardEvent('keydown', { key: 'f' });
      window.dispatchEvent(event);

      expect(setFocusMode).toHaveBeenCalledTimes(1);
      expect(setFocusMode).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should toggle focus mode when uppercase F is pressed', () => {
      renderHookWithDefaults();

      const event = new KeyboardEvent('keydown', { key: 'F' });
      window.dispatchEvent(event);

      expect(setFocusMode).toHaveBeenCalledTimes(1);
    });

    it('should not trigger when typing in input field', () => {
      renderHookWithDefaults();

      const input = document.createElement('input');
      document.body.appendChild(input);
      
      const event = new KeyboardEvent('keydown', { key: 'f', bubbles: true });
      Object.defineProperty(event, 'target', { value: input, enumerable: true });
      input.dispatchEvent(event);

      expect(setFocusMode).not.toHaveBeenCalled();
      
      document.body.removeChild(input);
    });

    it('should not trigger when typing in textarea', () => {
      renderHookWithDefaults();

      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);
      
      const event = new KeyboardEvent('keydown', { key: 'f', bubbles: true });
      Object.defineProperty(event, 'target', { value: textarea, enumerable: true });
      textarea.dispatchEvent(event);

      expect(setFocusMode).not.toHaveBeenCalled();
      
      document.body.removeChild(textarea);
    });
  });

  describe('Grid toggle (G key)', () => {
    it('should toggle grid when G is pressed', () => {
      renderHookWithDefaults();

      const event = new KeyboardEvent('keydown', { key: 'g' });
      window.dispatchEvent(event);

      expect(setShowGrid).toHaveBeenCalledTimes(1);
      expect(setShowGrid).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should not toggle grid when media is not active', () => {
      renderHookWithDefaults({ mediaActive: false });

      const event = new KeyboardEvent('keydown', { key: 'g' });
      window.dispatchEvent(event);

      expect(setShowGrid).not.toHaveBeenCalled();
    });

    it('should cycle grid size when Shift+G is pressed', () => {
      renderHookWithDefaults();

      const event = new KeyboardEvent('keydown', { key: 'g', shiftKey: true });
      window.dispatchEvent(event);

      expect(setShowGrid).toHaveBeenCalledWith(true);
      expect(setGridSize).toHaveBeenCalledTimes(1);
      expect(setGridSize).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should cycle through grid sizes in correct order', () => {
      renderHookWithDefaults();

      const event = new KeyboardEvent('keydown', { key: 'G', shiftKey: true });
      window.dispatchEvent(event);

      const gridSizeFn = setGridSize.mock.calls[0][0];
      
      expect(gridSizeFn(4)).toBe(6);
      expect(gridSizeFn(6)).toBe(8);
      expect(gridSizeFn(8)).toBe(12);
      expect(gridSizeFn(12)).toBe(16);
      expect(gridSizeFn(16)).toBe(4);
    });
  });

  describe('Image navigation (Arrow keys)', () => {
    it('should navigate to next image with ArrowRight', () => {
      renderHookWithDefaults();

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      window.dispatchEvent(event);

      expect(setActiveImageId).toHaveBeenCalledWith('2');
    });

    it('should navigate to previous image with ArrowLeft', () => {
      renderHookWithDefaults({ activeImageId: '2' });

      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      window.dispatchEvent(event);

      expect(setActiveImageId).toHaveBeenCalledWith('1');
    });

    it('should wrap around to first image when at end', () => {
      renderHookWithDefaults({ activeImageId: '3' });

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      window.dispatchEvent(event);

      expect(setActiveImageId).toHaveBeenCalledWith('1');
    });

    it('should wrap around to last image when at beginning', () => {
      renderHookWithDefaults({ activeImageId: '1' });

      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      window.dispatchEvent(event);

      expect(setActiveImageId).toHaveBeenCalledWith('3');
    });

    it('should not navigate when only one image', () => {
      renderHookWithDefaults({
        images: [{ id: '1', url: 'url1', name: 'image1.png' }],
        activeImageId: '1',
      });

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      window.dispatchEvent(event);

      expect(setActiveImageId).not.toHaveBeenCalled();
    });

    it('should not navigate when no images', () => {
      renderHookWithDefaults({
        images: [],
        activeImageId: null,
      });

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      window.dispatchEvent(event);

      expect(setActiveImageId).not.toHaveBeenCalled();
    });
  });

  describe('Event listener cleanup', () => {
    it('should remove event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const { unmount } = renderHookWithDefaults();
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      
      removeEventListenerSpy.mockRestore();
    });

    it('should not respond to events after unmount', () => {
      const { unmount } = renderHookWithDefaults();
      unmount();

      const event = new KeyboardEvent('keydown', { key: 'f' });
      window.dispatchEvent(event);

      expect(setFocusMode).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it.skip('should handle contenteditable elements (jsdom limitation)', () => {
      renderHookWithDefaults();

      const div = document.createElement('div');
      div.setAttribute('contenteditable', 'true');
      document.body.appendChild(div);
      div.focus();
      
      const event = new KeyboardEvent('keydown', { key: 'f', bubbles: true, cancelable: true });
      div.dispatchEvent(event);

      expect(setFocusMode).not.toHaveBeenCalled();
      
      document.body.removeChild(div);
    });

    it('should handle select elements', () => {
      renderHookWithDefaults();

      const select = document.createElement('select');
      document.body.appendChild(select);
      
      const event = new KeyboardEvent('keydown', { key: 'f', bubbles: true });
      Object.defineProperty(event, 'target', { value: select, enumerable: true });
      select.dispatchEvent(event);

      expect(setFocusMode).not.toHaveBeenCalled();
      
      document.body.removeChild(select);
    });

    it('should handle invalid activeImageId gracefully', () => {
      renderHookWithDefaults({ activeImageId: 'non-existent' });

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      window.dispatchEvent(event);

      expect(setActiveImageId).not.toHaveBeenCalled();
    });
  });
});
