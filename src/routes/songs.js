import express from "express";
const router = express.Router()
import SongsController from '../controllers/Songs/getSongController.js';
import SongsByArtistController from '../controllers/Songs/getSongByArtistController.js';

const songsControllerInstanceByArtist = new SongsByArtistController();

const songsControllerInstance = new SongsController();


// Obtener canciones por nombre

// Middleware para instanciar el controlador y llamar al método correcto
router.get('/get-songs/:name/:offset?', (req, res ) => {
    const songsControllerInstance = new SongsController();
    songsControllerInstance.getSongsbyName(req, res);
  });
  
  export default router;

//Middleware para instanciar el controlador y llamar al metodo correcto para getSongsByArtist  
router.get('/get-songs-by-artist/:name/:offset?', (req, res ) => {
    const songsControllerInstanceByArtist = new SongsByArtistController();
    songsControllerInstanceByArtist.getSongsByArtist(req, res);
  });
