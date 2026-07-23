"use client";

import { useSyncExternalStore } from "react";

/** No client-side source ever changes; the value flips purely by hydrating. */
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * `false` during server render and the first client render, `true` afterwards.
 *
 * The usual `useState(false)` + `useEffect(() => setMounted(true))` does the
 * same job, but sets state synchronously inside an effect — an extra render
 * pass that React's compiler lint flags. `useSyncExternalStore` expresses the
 * same idea as what it actually is: a value that differs between the server and
 * client snapshots.
 */
export function useMounted() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
