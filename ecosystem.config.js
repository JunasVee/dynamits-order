module.exports = {
  apps: [
    {
      name: "driver-app",
      script: "node_modules/next/dist/bin/next", // Points to Next.js start script
      args: "start", // Command to start Next.js in production mode
      instances: 1, // Use 'max' to scale based on CPU cores
      autorestart: true, // Automatically restart if crashed
      watch: false, // Turn on if you want PM2 to watch for changes (usually off in production)
      max_memory_restart: "1G", // Restart if memory exceeds 1GB
      env: {
        NODE_ENV: "development",
        PORT: 3000, // Customize the port for development
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000, // Customize the port for production
      },
    },
  ],
};
