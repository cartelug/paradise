// Delivers a form to a Formspree-compatible POST endpoint. Always resolves — a slow or
// unreachable endpoint must never hang the UI or throw past the caller.
export async function deliverEnquiry(endpoint: string, formData: FormData): Promise<boolean> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
