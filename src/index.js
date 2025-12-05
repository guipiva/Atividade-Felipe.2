javascript
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const routes = require("./routes");
const swaggerDocument = require("./swagger");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Database connection
const DATABASE_URL = process.env.DATABASE_URL;

let pool = null;

if (DATABASE_URL) {
  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  async function tryDbConnect() {
    try {
      await pool.query("SELECT NOW()");
      console.log("Connected to PostgreSQL");
    } catch (err) {
      console.error("Could not connect to PostgreSQL:", err.message);
    }
  }
  tryDbConnect();
} else {
  console.log("No DATABASE_URL provided, running without database");
}

app.locals.pool = pool;

// Swagger
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});