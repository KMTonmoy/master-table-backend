import dns from "node:dns";

try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch {}

import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

connectDB().catch((err) => {
  console.error("Failed to connect to DB:", err.message);
});

if (!env.IS_VERCEL) {
  app.listen(env.PORT, () => {
    console.log(
      `🚀 Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`,
    );
  });
}

export default app;
