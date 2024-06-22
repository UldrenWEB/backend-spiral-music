import express from "express";
import { configDotenv } from "dotenv";
import { apiFetch } from "./src/services/apiFetch.js";
import Spotify from "./src/components/Spotify.js";
import {connectDB} from "./db.js";
import userRoutes from './src/routes/users.js';
import rolRoutes from './src/routes/rol.js';


connectDB();

const spotify = new Spotify();

configDotenv();
const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(express.json());

app.use('/api/rol', rolRoutes);

app.use('/api/users', userRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Hola bebe" });
});

app.listen(PORT, async () => {
  const result = await spotify.getAlbums({
    by: "name",
    param: "estrella",
  });




  console.log(`Server is running on Port ${PORT} on http://127.0.0.1:${PORT}`);
});
