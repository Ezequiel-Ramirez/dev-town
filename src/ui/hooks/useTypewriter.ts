import { useCallback, useEffect, useState } from 'react';

/** Classic RPG text reveal. Disabled automatically for reduced-motion users. */
export function useTypewriter(text: string, enabled: boolean, speed = 12) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(enabled ? 0 : text.length);
  }, [text, enabled]);

  useEffect(() => {
    if (!enabled || count >= text.length) return;
    const id = window.setTimeout(() => setCount((current) => current + 1), speed);
    return () => window.clearTimeout(id);
  }, [count, text, enabled, speed]);

  const skip = useCallback(() => setCount(text.length), [text.length]);

  return { shown: text.slice(0, count), done: count >= text.length, skip };
}
