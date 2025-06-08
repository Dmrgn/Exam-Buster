import { serve } from 'bun';
import index from '@/client/index.html';
import { config } from '../lib/config.server';
import { getSummary } from './controllers/summaryController';
import { getPrep } from './controllers/prepController';
import { postChat } from './controllers/chatController';

const server = serve({
    routes: {
        '/*': index,
        '/api/summary': { GET: getSummary },
        '/api/prep': { GET: getPrep },
        '/api/chat': { POST: postChat },
    },

    development: config.nodeEnv !== "production" && {
        console: true,
        hmr: false
    },
});

console.log(`🚀 Server running at ${server.url}`);
