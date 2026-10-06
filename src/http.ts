export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = 8_000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function httpStatus(url: string, timeoutMs = 8_000): Promise<number> {
  const headers = {
    "User-Agent": "brandcheck/1.1 (+https://github.com/Soflutionltd/BrandCheck)",
    Accept: "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
  };

  try {
    const response = await fetchWithTimeout(url, { method: "HEAD", redirect: "follow", headers }, timeoutMs);
    if (response.status !== 405) return response.status;
  } catch {
    // Some services reject HEAD. Retry once with GET.
  }

  const response = await fetchWithTimeout(url, { method: "GET", redirect: "follow", headers }, timeoutMs);
  await response.body?.cancel().catch(() => undefined);
  return response.status;
}
