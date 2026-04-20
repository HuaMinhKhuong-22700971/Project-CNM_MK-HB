const createApp = require("./app");
const { env } = require("./config/env");
const { testConnection } = require("./config/database");

const app = createApp();

async function startServer() {
  try {
    const result = await testConnection();
    console.log(result.message);

    app.listen(env.port, () => {
      console.log(`API running at http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Failed to connect to MySQL:", error.message);
    process.exit(1);
  }
}

startServer();
