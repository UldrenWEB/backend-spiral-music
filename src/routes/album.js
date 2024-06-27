import express from "express";
const router = express.Router();

import AlbumsController from '../controllers/Album/getAlbumByName.js';

const AlbumsControllerInstance = new AlbumsController();

// Obtener álbumes por nombre
router.get('/get-album', (req, res) => {
    AlbumsControllerInstance.getAlbumsByName(req, res);
});

export default router;
