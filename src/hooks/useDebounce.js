import { useState, useEffect, useCallback } from 'react';
import { debounce } from '@utils/formatters';

export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useDebouncedCallback = (callback, delay = 500) => {
  return useCallback(debounce(callback, delay), [callback, delay]);
};

export default useDebounce;
