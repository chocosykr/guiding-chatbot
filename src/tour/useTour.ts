import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { siteGraph, type SiteGraph, type TourEdge } from '../siteGraph';

interface TourState {
  active: boolean;
  steps: TourEdge[];
  stepIndex: number;
  targetSelector: string | null;
  targetRect: { top: number; left: number; width: number; height: number } | null;
  message: string | null;
  completionMessage: string | null;
}

interface ClickHandler {
  element: HTMLElement;
  fn: () => void;
}

const EMPTY_STATE: TourState = {
  active: false,
  steps: [],
  stepIndex: -1,
  targetSelector: null,
  targetRect: null,
  message: null,
  completionMessage: null,
};

export interface TourSegment {
  steps: TourEdge[];
  startMessage?: string | null;
  completionMessage?: string | null;
}

export function useTour(onTourComplete: (message: string) => void) {
  const location = useLocation();
  const [tourState, setTourState] = useState<TourState>(EMPTY_STATE);

  const clickHandlerRef = useRef<ClickHandler | null>(null);
  const expectedPathRef = useRef<string | null>(null);
  const rafRef = useRef<number | null>(null);
  const cancelledRef = useRef(false);
  const segmentQueueRef = useRef<TourSegment[]>([]);

  const pathnameToNodeId = useCallback(
    (pathname: string, graph: SiteGraph = siteGraph): string | null => {
      for (const [nodeId, node] of Object.entries(graph)) {
        if (node.path === pathname) return nodeId;
      }
      return null;
    },
    [],
  );

  const cleanup = useCallback(() => {
    cancelledRef.current = true;
    segmentQueueRef.current = [];
    if (clickHandlerRef.current) {
      clickHandlerRef.current.fn();
      clickHandlerRef.current = null;
    }
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    document.querySelectorAll('.tour-highlight').forEach((el) => {
      el.classList.remove('tour-highlight');
    });
    setTourState({ ...EMPTY_STATE });
  }, []);

  const startTour = useCallback(
    (steps: TourEdge[], completionMessage?: string) => {
      segmentQueueRef.current = [];
      if (!steps || steps.length === 0) {
        onTourComplete(completionMessage || 'You are already there!');
        return;
      }
      cancelledRef.current = false;
      setTourState({ 
        active: true, 
        steps, 
        stepIndex: 0, 
        targetSelector: null, 
        targetRect: null, 
        message: null,
        completionMessage: completionMessage || null
      });
    },
    [onTourComplete],
  );

  const finishCurrentSegment = useCallback((currentCompletionMessage?: string | null) => {
  const hasNext = segmentQueueRef.current.length > 0;

  if (currentCompletionMessage) {
    onTourComplete(currentCompletionMessage);
  } else if (!hasNext) {
    onTourComplete('You are there!');
  }

  let next: TourSegment | undefined;
  while ((next = segmentQueueRef.current.shift())) {
    if (next.startMessage) onTourComplete(next.startMessage);
    if (next.steps.length > 0) {
      setTourState({
        active: true,
        steps: next.steps,
        stepIndex: 0,
        targetSelector: null,
        targetRect: null,
        message: null,
        completionMessage: next.completionMessage || null,
      });
      return;
    }
    // message-only segment (e.g. "already on that page") — announce and keep going
    if (next.completionMessage) onTourComplete(next.completionMessage);
  }
  setTourState({ ...EMPTY_STATE });
}, [onTourComplete]);

const startChainedTour = useCallback((segments: TourSegment[]) => {
  const real = segments.filter((s) => s.steps.length > 0 || s.completionMessage || s.startMessage);
  if (real.length === 0) {
    onTourComplete('You are already there!');
    return;
  }
  cancelledRef.current = false;
  segmentQueueRef.current = real;
  finishCurrentSegment(null);
}, [finishCurrentSegment, onTourComplete]);

  const cancelTour = useCallback(() => {
    cleanup();
  }, [cleanup]);

  // Step executor — finds the element, highlights it, and waits for click/blur/Enter/selection/change
  useEffect(() => {
    if (!tourState.active || tourState.stepIndex < 0 || tourState.stepIndex >= tourState.steps.length) return;

    const step = tourState.steps[tourState.stepIndex];
    if (!step) return;

    // If the step has no selector (e.g. it's an implicit route redirect edge), auto-advance!
    if (!step.selector) {
      const nextIndex = tourState.stepIndex + 1;
      if (nextIndex >= tourState.steps.length) {
        finishCurrentSegment(tourState.completionMessage);
      } else {
        setTourState((prev) => ({ ...prev, stepIndex: nextIndex }));
      }
      return;
    }

    const expectedPath = siteGraph[step.to]?.path ?? null;
    expectedPathRef.current = expectedPath;

    let findTimer: ReturnType<typeof setTimeout>;
    let scrollTimer: ReturnType<typeof setTimeout>;

    const advance = () => {
      clearTimeout(findTimer);
      clearTimeout(scrollTimer);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      const nextIndex = tourState.stepIndex + 1;
      if (nextIndex >= tourState.steps.length) {
        finishCurrentSegment(tourState.completionMessage);
      } else {
        setTourState((prev) => ({ ...prev, stepIndex: nextIndex, targetSelector: null, targetRect: null, message: null }));
      }
    };

    let findAttempts = 0;
    const MAX_FIND_ATTEMPTS = 5;

    const tryFindElement = () => {
      if (cancelledRef.current) return;

      const element = document.querySelector(step.selector) as HTMLElement | null;

      if (!element) {
        if (++findAttempts < MAX_FIND_ATTEMPTS) {
          findTimer = setTimeout(tryFindElement, 200);
        } else {
          advance();
        }
        return;
      }

      document.querySelectorAll('.tour-highlight').forEach((el) => {
        el.classList.remove('tour-highlight');
      });

      const isTextInput =
        element.tagName === 'INPUT' || element.tagName === 'TEXTAREA';

      const isMuiSelect =
        element.getAttribute('role') === 'combobox' ||
        element.getAttribute('aria-haspopup') === 'listbox';

      const isRadioGroup = element.getAttribute('role') === 'radiogroup';

      // Skip already-filled text fields entirely — no highlight, no wait
      if (isTextInput) {
        const value = (element as HTMLInputElement | HTMLTextAreaElement).value;
        if (value && value.trim().length > 0) {
          advance();
          return;
        }
      }

      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

      scrollTimer = setTimeout(() => {
        if (cancelledRef.current) return;

        element.classList.add('tour-highlight');

        const updateRect = () => {
          if (cancelledRef.current) return;

          // Element was removed from the DOM
          if (!element.isConnected) {
            if (rafRef.current !== null) {
              cancelAnimationFrame(rafRef.current);
              rafRef.current = null;
            }
            cleanup();
            onTourComplete("Looks like you navigated away — let me know if you'd like to continue!");
            return;
          }

          const rect = element.getBoundingClientRect();
          
          setTourState((prev) => {
            // OPTIMIZATION: Bail out if coordinates haven't changed!
            // This prevents React from re-rendering the component 60 times a second.
            if (
              prev.targetRect &&
              prev.targetRect.top === rect.top &&
              prev.targetRect.left === rect.left &&
              prev.targetRect.width === rect.width &&
              prev.targetRect.height === rect.height &&
              prev.targetSelector === step.selector &&
              prev.message === step.message
            ) {
              return prev; 
            }

            return {
              ...prev,
              targetSelector: step.selector,
              targetRect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
              message: step.message ?? null,
            };
          });
          
          rafRef.current = requestAnimationFrame(updateRect);
        };
        updateRect();

        const finishStep = () => {
          if (cancelledRef.current) return;
          element.classList.remove('tour-highlight');
          if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
          }
          advance();
        };

        if (isTextInput) {
          const handleBlur = () => {
            element.removeEventListener('blur', handleBlur);
            element.removeEventListener('keydown', handleKeydown);
            clickHandlerRef.current = null;
            finishStep();
          };
          const handleKeydown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
              e.preventDefault(); // stop native form submission — tour handles Enter itself
              handleBlur();
            }
          };
          element.addEventListener('blur', handleBlur);
          element.addEventListener('keydown', handleKeydown);
          clickHandlerRef.current = {
            element,
            fn: () => {
              element.removeEventListener('blur', handleBlur);
              element.removeEventListener('keydown', handleKeydown);
            },
          };
        } else if (isMuiSelect) {
          const handleDropdownClosed = () => {
            element.removeEventListener('tour:dropdown-closed', handleDropdownClosed);
            clickHandlerRef.current = null;
            finishStep();
          };
          element.addEventListener('tour:dropdown-closed', handleDropdownClosed);
          clickHandlerRef.current = {
            element,
            fn: () => element.removeEventListener('tour:dropdown-closed', handleDropdownClosed),
          };
        } else if (isRadioGroup) {
          const handleChange = () => {
            element.removeEventListener('change', handleChange);
            clickHandlerRef.current = null;
            finishStep();
          };
          element.addEventListener('change', handleChange);
          clickHandlerRef.current = {
            element,
            fn: () => element.removeEventListener('change', handleChange),
          };
        } else {
          const handleClick = () => {
            if (cancelledRef.current) return;
            element.removeEventListener('click', handleClick);
            clickHandlerRef.current = null;
            finishStep();
          };
          element.addEventListener('click', handleClick);
          clickHandlerRef.current = { element, fn: handleClick };
        }
      }, 300);
    };

    findTimer = setTimeout(tryFindElement, 200);

    return () => {
      clearTimeout(findTimer);
      clearTimeout(scrollTimer);
      if (clickHandlerRef.current) {
        clickHandlerRef.current.fn();
        clickHandlerRef.current = null;
      }
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourState.active, tourState.stepIndex, tourState.steps]);

  // Watch for route changes
  useEffect(() => {
    if (!tourState.active) return;

    const expectedPath = expectedPathRef.current;
    if (expectedPath && location.pathname === expectedPath) {
      if (clickHandlerRef.current) {
        clickHandlerRef.current.fn();
        clickHandlerRef.current = null;

        document.querySelectorAll('.tour-highlight').forEach((el) => {
          el.classList.remove('tour-highlight');
        });
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }

        const nextIndex = tourState.stepIndex + 1;
        if (nextIndex >= tourState.steps.length) {
          finishCurrentSegment(tourState.completionMessage);
        } else {
          setTourState((prev) => ({ ...prev, stepIndex: nextIndex, targetSelector: null, targetRect: null, message: null }));
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, tourState.active]);

  return {
  tourState,
  startTour,
  startChainedTour,   // add this
  cancelTour,
  pathnameToNodeId,
  cleanup,
};
}