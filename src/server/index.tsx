import { serve } from 'bun';
import index from '@/client/index.html';
import { config } from '@/lib/config.server';
import { getSummary } from './controllers/summaryController';
import { getPrep } from './controllers/prepController';
import { postChat } from './controllers/chatController';
import { pb } from "@/lib/db"
import pwaManifest from "@/client/manifest.json";

pb.collection('_superusers').authWithPassword(process.env["SUPER_USER_EMAIL"], process.env["SUPER_USER_PASSWORD"], { autoRefreshThreshold: 30 * 60 });

const server = serve({
    routes: {
        '/*': index,
        '/api/summary': { GET: getSummary },
        '/api/prep': { GET: getPrep },
        '/api/chat': { POST: postChat },
        '/manifest.json': Response.json(pwaManifest),
        '/service-worker.js': new Response(await Bun.file("./src/client/service-worker.js").text(), {
            headers: {
                "Content-Type": "text/javascript",
            },
        }),
        '/public/*': req => {
            const file = Bun.file(`./public/${req.url.replaceAll("..", "").replaceAll("~", "").split("/public/")[1]}`);
            return new Response(file);
        }
    },

    development: config.nodeEnv !== "production" && {
        console: true,
        hmr: false
    },
});

console.log(`🚀 Server running at ${server.url}`);
