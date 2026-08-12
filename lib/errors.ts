export function supabaseErrorMessage(error: unknown, fallback: string) {
  const message = error instanceof Error
    ? error.message
    : typeof error === 'object' && error && 'message' in error
      ? String(error.message)
      : fallback;

  if (/network request failed|failed to fetch|load failed/i.test(message)) {
    return 'Cannot reach Supabase. Copy the exact Project URL and publishable key from Supabase Dashboard > Connect into .env, then restart Expo with npm run start:clear.';
  }

  if (/email rate limit exceeded|over_email_send_rate_limit/i.test(message)) {
    return 'A confirmation email was requested recently. Check your inbox and junk folder, then open the confirmation link. Wait a few minutes before requesting another email.';
  }

  if (/user already registered/i.test(message)) {
    return 'An account already exists for this email. Confirm the email if needed, then continue to Login.';
  }

  if (/email not confirmed|email_not_confirmed/i.test(message)) {
    return 'Your account was created, but the email is not confirmed yet. Open the confirmation link in your inbox or junk folder, then log in again.';
  }

  return message || fallback;
}
