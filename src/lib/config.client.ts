// Client-side configuration (exposed to the browser)

/**
 * Base URL for the PocketBase API.
 * Must be set as BUN_PUBLIC_POCKETBASE_URL in the environment.
 */
export const pocketbaseUrl: string = (() => {
  // Using import.meta.env ensures Bun inlines variables prefixed with BUN_PUBLIC_
  const url = import.meta.env.BUN_PUBLIC_POCKETBASE_URL;
  if (!url) {
    throw new Error('Missing environment variable: BUN_PUBLIC_POCKETBASE_URL');
  }
  return url;
})();