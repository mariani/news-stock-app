import {useEffect, useRef} from 'react';
import {useIsFocused} from '@react-navigation/native';

export function useRefreshInterval(callback: () => void, intervalMs: number) {
  const isFocused = useIsFocused();
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    const tick = () => savedCallback.current();
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [isFocused, intervalMs]);
}
