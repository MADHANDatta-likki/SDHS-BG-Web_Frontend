import { useCallback, useEffect, useState } from "react";

import { getApiErrorMessage } from "../utils/apiError";

export function useResource<T>(load: () => Promise<T>, fallbackError: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await load());
    } catch (loadError: unknown) {
      setError(getApiErrorMessage(loadError, fallbackError));
    } finally {
      setLoading(false);
    }
  }, [fallbackError, load]);

  useEffect(() => void reload(), [reload]);
  return { data, setData, error, loading, reload };
}
