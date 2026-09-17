"use client";

import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * `prefers-reduced-motion` sem mismatch de hidratação: começa `false` (igual ao servidor)
 * e só vira `true` num effect, depois do mount. Quem usa deve manter a MESMA árvore de DOM
 * nos dois estados e só mudar animação/estilo.
 */
export function useReducedMotionSafe(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}
