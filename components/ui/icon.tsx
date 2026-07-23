import { createElement } from "react";

import { getIcon } from "@/lib/icons";

/**
 * Render a registry icon by name.
 *
 * Content refers to icons by string, so the component has to be resolved at
 * render time. Doing that lookup once, here, keeps every caller from holding a
 * component in a local variable — which is both repetitive and the pattern
 * React's compiler lint (rightly) warns about, since a component identity that
 * changes between renders resets its subtree.
 */
export function Icon({
  name,
  className,
  size,
}: {
  name: string;
  className?: string;
  size?: number | string;
}) {
  return createElement(getIcon(name), { className, size });
}
