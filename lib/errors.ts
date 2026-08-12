export function supabaseErrorMessage(error: unknown, fallback: string) {
  const message = error instanceof Error
    ? error.message
    : typeof error === 'object' && error && 'message' in error
      ? String(error.message)
      : fallback;

  if (/network request failed|failed to fetch|load failed/i.test(message)) {
    return 'Cannot reach Supabase. Copy the exact Project URL and publishable key from Supabase Dashboard > Connect into .env, then restart Expo with npm run start:clear.';
  }

  return message || fallback;
}
