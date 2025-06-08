import { z } from 'zod';

// Define and validate required environment variables
const envSchema = z.object({
    POCKETBASE_URL: z.string().url(),
    CEREBRAS_API_KEY: z.string().nonempty(),
    OPENROUTER_API_KEY: z.string().nonempty(),
    NODE_ENV: z.enum(['development', 'production']).default('development'),
});

// Parse and validate
const _env = envSchema.safeParse(process.env);
if (!_env.success) {
    console.error('Environment variable validation failed:', _env.error.format());
    throw new Error('Invalid environment variables');
}
const env = _env.data;

/**
 * Centralized configuration values parsed from environment variables.
 */
export const config = {
    // Base URL for the PocketBase API
    pocketbaseUrl: env.POCKETBASE_URL,
    // API key for Cerebras Cloud SDK
    cerebrasApiKey: env.CEREBRAS_API_KEY,
    // API key for OpenRouter / OpenAI
    openRouterApiKey: env.OPENROUTER_API_KEY,
    // Current environment
    nodeEnv: env.NODE_ENV,
};