export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
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
