import { quintOut } from "svelte/easing";
import { scale, type TransitionConfig } from "svelte/transition";

export const popupScale = {
  duration: 160,
  start: 0.96,
  opacity: 0,
  easing: quintOut,
};

export function popupTransition(
  node: HTMLElement,
  _params: undefined,
  { direction }: { direction: "in" | "out" | "both" },
): TransitionConfig {
  const reducedMotion = node.ownerDocument.defaultView?.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (reducedMotion) return { duration: 0 };

  const transition = scale(node, {
    ...popupScale,
    duration: direction === "out" ? 110 : 180,
  });
  const side = node.dataset.side ?? "bottom";
  const horizontal = side === "left" || side === "right";
  const offset = side === "top" || side === "left" ? -4 : 4;

  return {
    ...transition,
    css: (t, u) =>
      `${transition.css?.(t, u)}; translate: ${horizontal ? offset * u : 0}px ${horizontal ? 0 : offset * u}px;`,
  };
}
