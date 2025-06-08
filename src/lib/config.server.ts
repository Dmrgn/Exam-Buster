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

export const config = {
    pocketbaseUrl: env.POCKETBASE_URL,
    cerebrasApiKey: env.CEREBRAS_API_KEY,
    openRouterApiKey: env.OPENROUTER_API_KEY,
    nodeEnv: env.NODE_ENV,
};