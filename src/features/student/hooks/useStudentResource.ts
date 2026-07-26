import { useCallback, useEffect, useState } from "react";

interface StudentResource<T> {
  data: T | null;
  error: string;
  loading: boolean;
  reload: () => Promise<void>;
}

export function getStudentApiError(error: unknown, fallback: string): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = error.response;
    if (typeof response === "object" && response !== null && "data" in response) {
      const data = response.data;
      if (typeof data === "object" && data !== null) {
        if ("error" in data && typeof data.error === "string") return data.error;
        if ("message" in data && typeof data.message === "string") return data.message;
      }
    }
  }

  return fallback;
}

export function useStudentResource<T>(
  load: () => Promise<T>,
  fallbackError: string,
): StudentResource<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await load());
    } catch (loadError: unknown) {
      setError(getStudentApiError(loadError, fallbackError));
    } finally {
      setLoading(false);
    }
  }, [fallbackError, load]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, error, loading, reload };
}
