export type ApiResult<T = Record<string, unknown>> = { ok: boolean; message?: string } & T;

/** Same-origin JSON POST to the admin auth API. Never throws; failures come back as { ok: false }. */
export async function post<T = Record<string, unknown>>(step: string, body: Record<string, unknown> = {}): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`/api/admin/auth/${step}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body),
    });
    return (await res.json()) as ApiResult<T>;
  } catch {
    return { ok: false, message: "Network problem. Try again." } as ApiResult<T>;
  }
}
