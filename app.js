import express from "express";
import { configDotenv } from "dotenv";
import { apiFetch } from "./src/services/apiFetch.js";

configDotenv();
const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Hola bebe" });
});

app.listen(PORT, async () => {
  //   const result = await apiFetch({
  //     type: "search",
  //     body: { search: "remaster", type: "track", limit: 10, offset: 0 },
  //   });
  console.log(`Server is running on Port ${PORT} on http://127.0.0.1:${PORT}`);
});
