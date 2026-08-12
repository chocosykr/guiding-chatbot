import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { siteGraph, type SiteGraph, type TourEdge } from '../siteGraph';

interface TourState {
  active: boolean;
  steps: TourEdge[];
  stepIndex: number;
  targetSelector: string | null;
  targetRect: { top: number; left: number; width: number; height: number } | null;
}

interface ClickHandler {
  element: HTMLElement;
  fn: () => void;
}

/**
 * useTour — owns the tour lifecycle.
 *
 * Responsibilities:
 *   - Run a sequence of steps (each step = a CSS selector for a data-tour-id element)
 *   - For each step: scroll element into view, highlight it, show a "Click here" tooltip
 *   - Wait for either a click on the highlighted element OR a route change matching
 *     the next node's path before advancing
 *   - Cancel + clean up if the user manually navigates somewhere unexpected
 *   - Call onTourComplete when the last step finishes
 */
export function useTour(onTourComplete: (message: string) => void) {
  const location = useLocation();
  const [tourState, setTourState] = useState<TourState>({
    active: false,
    steps: [],
    stepIndex: -1,
    targetSelector: null,
    targetRect: null,
  });

  const clickHandlerRef = useRef<ClickHandler | null>(null);
  const expectedPathRef = useRef<string | null>(null);
  const rafRef = useRef<number | null>(null);
  const cancelledRef = useRef(false);

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
    if (clickHandlerRef.current) {
      clickHandlerRef.current.element.removeEventListener('click', clickHandlerRef.current.fn);
      clickHandlerRef.current = null;
    }
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    document.querySelectorAll('.tour-highlight').forEach((el) => {
      el.classList.remove('tour-highlight');
    });
    setTourState({
      active: false,
      steps: [],
      stepIndex: -1,
      targetSelector: null,
      targetRect: null,
    });
  }, []);

  const startTour = useCallback(
    (steps: TourEdge[]) => {
      if (!steps || steps.length === 0) {
        onTourComplete('You are already there!');
        return;
      }
      cancelledRef.current = false;
      setTourState({ active: true, steps, stepIndex: 0, targetSelector: null, targetRect: null });
    },
    [onTourComplete],
  );

  const cancelTour = useCallback(() => {
    cleanup();
  }, [cleanup]);

  // Execute a single step: find element, scroll into view, highlight, wait for click
  useEffect(() => {
    if (!tourState.active || tourState.stepIndex < 0 || tourState.stepIndex >= tourState.steps.length)
      return;

    if (cancelledRef.current) return;

    const step = tourState.steps[tourState.stepIndex];
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
      setTourState((prev) => {
        const nextIndex = prev.stepIndex + 1;
        if (nextIndex >= prev.steps.length) {
          onTourComplete('You are there!');
          return {
            active: false,
            steps: [],
            stepIndex: -1,
            targetSelector: null,
            targetRect: null,
          };
        }
        return { ...prev, stepIndex: nextIndex, targetSelector: null, targetRect: null };
      });
    };

    // Small delay to allow route transition / DOM render to settle
    findTimer = setTimeout(() => {
      if (cancelledRef.current) return;

      const element = document.querySelector(step.selector) as HTMLElement | null;
      if (!element) {
        advance();
        return;
      }

      // Remove any previous highlights
      document.querySelectorAll('.tour-highlight').forEach((el) => {
        el.classList.remove('tour-highlight');
      });

      // Scroll into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

      // Wait a beat for scroll to settle, then add highlight + measure rect
      scrollTimer = setTimeout(() => {
        if (cancelledRef.current) return;

        element.classList.add('tour-highlight');

        const updateRect = () => {
          if (cancelledRef.current) return;
          const rect = element.getBoundingClientRect();
          setTourState((prev) => ({
            ...prev,
            targetSelector: step.selector,
            targetRect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
          }));
          rafRef.current = requestAnimationFrame(updateRect);
        };
        updateRect();

        // Wait for click on this element
        const handleClick = () => {
          if (cancelledRef.current) return;
          element.removeEventListener('click', handleClick);
          clickHandlerRef.current = null;
          element.classList.remove('tour-highlight');
          if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
          }
          advance();
        };
        element.addEventListener('click', handleClick);
        clickHandlerRef.current = { element, fn: handleClick };
      }, 300);
    }, 200);

    return () => {
      clearTimeout(findTimer);
      clearTimeout(scrollTimer);
      if (clickHandlerRef.current) {
        clickHandlerRef.current.element.removeEventListener('click', clickHandlerRef.current.fn);
        clickHandlerRef.current = null;
      }
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourState.active, tourState.stepIndex, tourState.steps]);

  // Watch for route changes — advance if it matches expected, cancel if not
  useEffect(() => {
    if (!tourState.active) return;

    const expectedPath = expectedPathRef.current;
    if (expectedPath && location.pathname === expectedPath) {
      // Route change matches the next step's target — advance
      if (clickHandlerRef.current) {
        clickHandlerRef.current.element.removeEventListener('click', clickHandlerRef.current.fn);
        clickHandlerRef.current = null;
      }
      document.querySelectorAll('.tour-highlight').forEach((el) => {
        el.classList.remove('tour-highlight');
      });
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setTourState((prev) => {
        const nextIndex = prev.stepIndex + 1;
        if (nextIndex >= prev.steps.length) {
          onTourComplete('You are there!');
          return {
            active: false,
            steps: [],
            stepIndex: -1,
            targetSelector: null,
            targetRect: null,
          };
        }
        return { ...prev, stepIndex: nextIndex, targetSelector: null, targetRect: null };
      });
    } else if (expectedPath && location.pathname !== expectedPath) {
      // User navigated somewhere unexpected — cancel tour
      cleanup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, tourState.active]);

  return {
    tourState,
    startTour,
    cancelTour,
    pathnameToNodeId,
    cleanup,
  };
}
