// Client-side configuration (exposed to the browser).
// At build time, build.ts injects POCKETBASE_URL into process.env.

// Retrieve the injected PocketBase URL
const _pbUrl = typeof window !== "undefined" ? (window.location.origin.startsWith("http") ? 'http://127.0.0.1:8090' : 'https://pocketbase.danielmorgan.xyz') : process.env.POCKETBASE_URL;
if (!_pbUrl) {
    throw new Error('Missing environment variable: POCKETBASE_URL');
}
export const pocketbaseUrl: string = _pbUrl;