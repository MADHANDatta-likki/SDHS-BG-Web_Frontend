import { useResource } from "../../../hooks/useResource";
import { getApiErrorMessage } from "../../../utils/apiError";

export const getStudentApiError = getApiErrorMessage;

export function useStudentResource<T>(load: () => Promise<T>, fallbackError: string) {
  const { data, error, loading, reload } = useResource(load, fallbackError);
  return { data, error, loading, reload };
}
