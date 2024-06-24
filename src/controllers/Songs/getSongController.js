import Spotify from '../../components/Spotify.js';
import Songs from '../../models/Songs.js';

class SongsController {
    constructor() {
      console.log("Creando instancia de Spotify...");
      this.spotify = new Spotify();
      console.log("Instancia de Spotify creada:", this.spotify);
      
    }

    async getSongsbyName(req, res) {
        console.log("Accediendo a getSongsbyName, Spotify es:", this.spotify);
        try {
            const { name, offset } = req.params; // Extrae name y offset de los parámetros de la URL

            // Consulta en MongoDB para obtener las canciones existentes
            let dbSongs = await Songs.find({ name: name }, {}, { limit: parseInt(offset, 10) }); // Assumes you want to paginate results

            if (dbSongs.length < 10) {

                const spotifySongs = await this.spotify.getTracks({
                    
                    by: 'name',
                    param: name,
                    limit: 10,
                    offset: parseInt(offset),
                });
                console.log (spotifySongs)
            //     for (const song of spotifySongs) { // Corrected variable name here
            //         await Songs.create(song); // Utilizes the Songs model directly to create new entries
            //     }
             }

            return res.json({Songs: await Songs.find({}, {}, { name, offset })}) // Retorna todas las canciones encontradas o agregadas
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
    }
}

export default SongsController;