import {useState, useEffect} from 'react';

export type ResourceState<T, E = Error> = {
  isLoading: boolean;
  error: E | null;
  result: T | null;
};

export function useAsync<T, P extends readonly any[]>(
  resource: (...arg: P) => Promise<T>,
): [(...arg: P) => Promise<void>, ResourceState<T>] {
  const [state, setState] = useState<ResourceState<T>>({
    isLoading: false,
    error: null,
    result: null,
  });

  const getResource = async (...args: P) => {
    setState({
      isLoading: true,
      error: null,
      result: null,
    });

    try {
      const result = await resource(...args);
      setState({
        isLoading: false,
        error: null,
        result,
      });
    } catch (error) {
      setState({
        isLoading: false,
        error,
        result: null,
      });
    }
  };

  return [getResource, state];
}

export function useResource<T>(
  resource: () => Promise<T>,
  deps: unknown[],
): [ResourceState<T>, () => Promise<void>] {
  const [getResource, state] = useAsync(resource);

  useEffect(() => void getResource(), deps);

  return [state, getResource];
}
