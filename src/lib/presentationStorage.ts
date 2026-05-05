import type { Slide } from '../types';

const STORAGE_KEY = 'ssa.presentationDraft.v1';

interface PresentationDraft {
  slides: Slide[];
  currentSlideIndex: number;
  savedAt: number;
}

export function loadPresentationDraft(): PresentationDraft | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PresentationDraft;
    if (!Array.isArray(parsed.slides)) return null;
    return {
      slides: parsed.slides,
      currentSlideIndex: parsed.currentSlideIndex || 0,
      savedAt: parsed.savedAt || 0,
    };
  } catch {
    return null;
  }
}

export function savePresentationDraft(slides: Slide[], currentSlideIndex: number) {
  const slidesForStorage = slides.map((slide) => {
    const storedSlide = { ...slide };
    delete storedSlide.imageUrl;
    return storedSlide;
  });
  const draft: PresentationDraft = {
    slides: slidesForStorage,
    currentSlideIndex,
    savedAt: Date.now(),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Browser storage can be unavailable or full; editing should continue in memory.
  }
}

export function clearPresentationDraft() {
  window.localStorage.removeItem(STORAGE_KEY);
}
