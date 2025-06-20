// Client-side configuration (exposed to the browser).
// At build time, build.ts injects POCKETBASE_URL into process.env.

// Retrieve the injected PocketBase URL
console.log(process.env.POCKETBASE_URL);
const _pbUrl = (process?.env?.POCKETBASE_URL ? process.env.POCKETBASE_URL : 'http://127.0.0.1:8090');
if (!_pbUrl) {
    throw new Error('Missing environment variable: POCKETBASE_URL');
}
export const pocketbaseUrl: string = _pbUrl;