import PocketBase from 'pocketbase';

// export const pb = new PocketBase('https://pocketbase.danielmorgan.xyz');
import { pocketbaseUrl } from './config.client';

// PocketBase client, configured via environment
// Use client-side config for browser and default for server
export const pb = new PocketBase(pocketbaseUrl);