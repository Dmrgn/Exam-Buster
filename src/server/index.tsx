import { serve } from "bun";
import index from "@/frontend/index.html";
import { pb } from "../lib/db";

const server = serve({
    routes: {
        "/*": index,
    },

    development: process.env.NODE_ENV !== "production" && {
        console: true,
        hmr: false
    },
});

console.log(`🚀 Server running at ${server.url}`);
