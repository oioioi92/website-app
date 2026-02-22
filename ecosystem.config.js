// PM2 entrypoint (no secrets).
// Reads all runtime secrets from environment (.env.production sourced by deploy script).

module.exports = {
  apps: [
    {
      name: process.env.PM2_APP_NAME || "web",
      // Start Next.js directly so PM2 cluster works correctly.
      // (If we cluster "npm start", PM2 will fork multiple npm processes and they can fight over PORT=3000.)
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      exec_mode: "cluster",
      instances: Number(process.env.PM2_INSTANCES || "2"),
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};

