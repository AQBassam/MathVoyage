/**
 * Tracks whose progress is cached in this browser's localStorage, so that
 * signing out (or a session expiring, or another account signing in) never
 * leaves one account's data visible to the next person on a shared device.
 */

export const GUEST_OWNER = 'guest';
export const LOCAL_OWNER_KEY = 'mathvoyage_progress_owner';

/**
 * Decides whether the locally cached progress must be wiped before showing
 * the progress of `identity` (a Firebase uid, or GUEST_OWNER when signed out).
 *
 * - Same owner: keep.
 * - Guest -> account: keep. The server merges the guest into the account.
 * - Unknown owner (cache written before this check existed): wipe once. It may
 *   belong to an account; the server profile is reloaded right after, so only
 *   offline-only progress could be lost from the display.
 * - Account -> anything else (guest or a different account): wipe.
 */
export function shouldClearLocal(storedOwner: string | null, identity: string): boolean {
  if (storedOwner === identity) return false;
  if (storedOwner === GUEST_OWNER && identity !== GUEST_OWNER) return false;
  return true;
}
