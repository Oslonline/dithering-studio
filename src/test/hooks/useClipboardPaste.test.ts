import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useClipboardPaste } from "../../hooks/useClipboardPaste";

vi.mock("../../utils/validation", () => ({
  validateImage: vi.fn().mockResolvedValue({ valid: true }),
  validateVideo: vi.fn().mockResolvedValue({ valid: true }),
}));

function createMockFile(name: string, type: string): File {
  const blob = new Blob(["test"], { type });
  return new File([blob], name, { type });
}

function createMockClipboardItem(file: File): DataTransferItem {
  return {
    kind: "file",
    type: file.type,
    getAsFile: () => file,
    getAsString: vi.fn(),
    webkitGetAsEntry: () => null,
  } as unknown as DataTransferItem;
}

function createPasteEvent(items: DataTransferItem[]): ClipboardEvent {
  const event = new Event("paste") as ClipboardEvent;
  Object.defineProperty(event, "clipboardData", {
    value: {
      items,
      files: items
        .filter((i) => i.kind === "file")
        .map((i) => i.getAsFile())
        .filter(Boolean),
      types: items.map((i) => i.type),
      getData: () => "",
      setData: vi.fn(),
      clearData: vi.fn(),
    },
    enumerable: true,
  });
  return event;
}

describe("useClipboardPaste", () => {
  let addImages: ReturnType<typeof vi.fn>;
  let addVideos: ReturnType<typeof vi.fn>;
  let setVideoMode: ReturnType<typeof vi.fn>;
  let navigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    addImages = vi.fn();
    addVideos = vi.fn();
    setVideoMode = vi.fn();
    navigate = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderHookWithDefaults = (overrides: Partial<{ videoMode: boolean }> = {}) => {
    return renderHook(() =>
      useClipboardPaste({
        videoMode: false,
        setVideoMode,
        navigate,
        activeLang: "en",
        addImages,
        addVideos,
        ...overrides,
      }),
    );
  };

  describe("image paste in image mode", () => {
    it("should call addImages when image is pasted in image mode", async () => {
      renderHookWithDefaults({ videoMode: false });

      const file = createMockFile("test.png", "image/png");
      const event = createPasteEvent([createMockClipboardItem(file)]);

      await act(async () => {
        document.dispatchEvent(event);
        await new Promise((r) => setTimeout(r, 10));
      });

      expect(addImages).toHaveBeenCalledTimes(1);
      expect(addImages).toHaveBeenCalledWith([expect.objectContaining({ name: "test.png", file })]);
      expect(setVideoMode).not.toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
    });

    it("should use fallback name for unnamed clipboard images", async () => {
      renderHookWithDefaults({ videoMode: false });

      const blob = new Blob(["test"], { type: "image/png" });
      const file = new File([blob], "", { type: "image/png" });
      const event = createPasteEvent([createMockClipboardItem(file)]);

      await act(async () => {
        document.dispatchEvent(event);
        await new Promise((r) => setTimeout(r, 10));
      });

      expect(addImages).toHaveBeenCalledWith([expect.objectContaining({ name: "clipboard-image.png" })]);
    });
  });

  describe("video paste in video mode", () => {
    it("should call addVideos when video is pasted in video mode", async () => {
      renderHookWithDefaults({ videoMode: true });

      const file = createMockFile("test.mp4", "video/mp4");
      const event = createPasteEvent([createMockClipboardItem(file)]);

      await act(async () => {
        document.dispatchEvent(event);
      });

      expect(addVideos).toHaveBeenCalledTimes(1);
      expect(addVideos).toHaveBeenCalledWith([expect.objectContaining({ name: "test.mp4", file })]);
      expect(setVideoMode).not.toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  describe("cross-mode paste", () => {
    it("should switch to image mode when image is pasted in video mode", async () => {
      renderHookWithDefaults({ videoMode: true });

      const file = createMockFile("test.png", "image/png");
      const event = createPasteEvent([createMockClipboardItem(file)]);

      await act(async () => {
        document.dispatchEvent(event);
      });

      expect(setVideoMode).toHaveBeenCalledWith(false);
      expect(navigate).toHaveBeenCalledWith("/en/Dithering/Image");
    });

    it("should switch to video mode when video is pasted in image mode", async () => {
      renderHookWithDefaults({ videoMode: false });

      const file = createMockFile("test.mp4", "video/mp4");
      const event = createPasteEvent([createMockClipboardItem(file)]);

      await act(async () => {
        document.dispatchEvent(event);
      });

      expect(setVideoMode).toHaveBeenCalledWith(true);
      expect(navigate).toHaveBeenCalledWith("/en/Dithering/Video");
    });
  });

  describe("paste ignored when focused on editable elements", () => {
    it("should not process paste when input is focused", () => {
      renderHookWithDefaults();

      const input = document.createElement("input");
      document.body.appendChild(input);

      const file = createMockFile("test.png", "image/png");
      const event = createPasteEvent([createMockClipboardItem(file)]);
      Object.defineProperty(event, "target", { value: input, enumerable: true });

      input.dispatchEvent(event);

      expect(addImages).not.toHaveBeenCalled();
      expect(addVideos).not.toHaveBeenCalled();

      document.body.removeChild(input);
    });

    it("should not process paste when textarea is focused", () => {
      renderHookWithDefaults();

      const textarea = document.createElement("textarea");
      document.body.appendChild(textarea);

      const file = createMockFile("test.png", "image/png");
      const event = createPasteEvent([createMockClipboardItem(file)]);
      Object.defineProperty(event, "target", { value: textarea, enumerable: true });

      textarea.dispatchEvent(event);

      expect(addImages).not.toHaveBeenCalled();

      document.body.removeChild(textarea);
    });

    it("should not process paste when select is focused", () => {
      renderHookWithDefaults();

      const select = document.createElement("select");
      document.body.appendChild(select);

      const file = createMockFile("test.png", "image/png");
      const event = createPasteEvent([createMockClipboardItem(file)]);
      Object.defineProperty(event, "target", { value: select, enumerable: true });

      select.dispatchEvent(event);

      expect(addImages).not.toHaveBeenCalled();

      document.body.removeChild(select);
    });
  });

  describe("no-ops", () => {
    it("should do nothing when paste has no file items", () => {
      renderHookWithDefaults();

      const event = createPasteEvent([]);

      document.dispatchEvent(event);

      expect(addImages).not.toHaveBeenCalled();
      expect(addVideos).not.toHaveBeenCalled();
      expect(setVideoMode).not.toHaveBeenCalled();
    });

    it("should do nothing for non-file clipboard items", () => {
      renderHookWithDefaults();

      const textItem = {
        kind: "string",
        type: "text/plain",
        getAsFile: () => null,
        getAsString: vi.fn(),
      } as unknown as DataTransferItem;

      const event = createPasteEvent([textItem]);
      document.dispatchEvent(event);

      expect(addImages).not.toHaveBeenCalled();
      expect(addVideos).not.toHaveBeenCalled();
    });
  });

  describe("event listener cleanup", () => {
    it("should remove paste listener on unmount", () => {
      const spy = vi.spyOn(document, "removeEventListener");

      const { unmount } = renderHookWithDefaults();
      unmount();

      expect(spy).toHaveBeenCalledWith("paste", expect.any(Function));

      spy.mockRestore();
    });

    it("should not respond to paste after unmount", () => {
      const { unmount } = renderHookWithDefaults();
      unmount();

      const file = createMockFile("test.png", "image/png");
      const event = createPasteEvent([createMockClipboardItem(file)]);
      document.dispatchEvent(event);

      expect(addImages).not.toHaveBeenCalled();
    });
  });

  describe("multiple files", () => {
    it("should handle multiple pasted images", async () => {
      renderHookWithDefaults({ videoMode: false });

      const file1 = createMockFile("a.png", "image/png");
      const file2 = createMockFile("b.jpg", "image/jpeg");
      const event = createPasteEvent([createMockClipboardItem(file1), createMockClipboardItem(file2)]);

      await act(async () => {
        document.dispatchEvent(event);
        await new Promise((r) => setTimeout(r, 10));
      });

      expect(addImages).toHaveBeenCalledTimes(1);
      expect(addImages).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ name: "a.png" }), expect.objectContaining({ name: "b.jpg" })]));
    });

    it("should prefer images when mixed image and video are pasted", async () => {
      renderHookWithDefaults({ videoMode: false });

      const imgFile = createMockFile("a.png", "image/png");
      const vidFile = createMockFile("b.mp4", "video/mp4");
      const event = createPasteEvent([createMockClipboardItem(imgFile), createMockClipboardItem(vidFile)]);

      await act(async () => {
        document.dispatchEvent(event);
        await new Promise((r) => setTimeout(r, 10));
      });

      expect(addImages).toHaveBeenCalledTimes(1);
      expect(addVideos).not.toHaveBeenCalled();
    });
  });

  describe("file type detection from extension", () => {
    it("should detect image type from extension when MIME type is empty", async () => {
      renderHookWithDefaults({ videoMode: false });

      const blob = new Blob(["test"], { type: "" });
      const file = new File([blob], "photo.webp", { type: "" });
      const event = createPasteEvent([createMockClipboardItem(file)]);

      await act(async () => {
        document.dispatchEvent(event);
        await new Promise((r) => setTimeout(r, 10));
      });

      expect(addImages).toHaveBeenCalledTimes(1);
    });

    it("should detect video type from extension when MIME type is empty", () => {
      renderHookWithDefaults({ videoMode: true });

      const blob = new Blob(["test"], { type: "" });
      const file = new File([blob], "clip.webm", { type: "" });
      const event = createPasteEvent([createMockClipboardItem(file)]);

      document.dispatchEvent(event);

      expect(setVideoMode).not.toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
    });
  });
});
