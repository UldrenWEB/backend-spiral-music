import express from "express";
const router = express.Router()
import SongsController from '../controllers/Songs/getSongController.js';

const songsControllerInstance = new SongsController();


// Obtener canciones por nombre

// Middleware para instanciar el controlador y llamar al método correcto
router.get('/get-songs/:name/:offset?', (req, res ) => {
    const songsControllerInstance = new SongsController();
    songsControllerInstance.getSongsbyName(req, res);
  });
  
  export default router;
