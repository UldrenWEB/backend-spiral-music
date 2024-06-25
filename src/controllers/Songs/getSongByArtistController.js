import Spotify from '../../components/Spotify.js';
import Songs from '../../models/Songs.js';
import Artist from '../../models/Artist.js';

class SongsByArtistController {
    constructor() {
        console.log("Creating Spotify instance...");
        this.spotify = new Spotify();
        console.log("Spotify instance created:", this.spotify);
    }

    async getSongsByArtist(req, res) {
        console.log("Accessing getSongsByArtist, Spotify is:", this.spotify);
        try {
            const { name, offset } = req.params;
    
            const limit = 10; // Límite total de canciones a retornar
            const skipAmount = parseInt(offset); // Saltar el número especificado de canciones
    
            // Ajustar la expresión regular para coincidir solo con canciones que comiencen con el nombre especificado
            let regex = new RegExp("^" + name, "i");
    
            // Buscar canciones en la base de datos
            let dbSongs = await Songs.find({ name: { $regex: regex } }).skip(skipAmount).limit(limit);
            console.log("Primary songs", dbSongs.length);
    
            // Verificar si se necesita buscar más canciones en Spotify
            if (dbSongs.length < limit) {
                const spotifyResponse = await this.spotify.getTracks({
                    by: 'artist',
                    param: name,
                    limit: limit - dbSongs.length, // Solicitar solo la cantidad restante de canciones para completar el límite
                    offset: skipAmount,
                });
    
                console.log("Datos obtenidos de Spotify:", spotifyResponse);
    
                if (!spotifyResponse.error && Array.isArray(spotifyResponse.data)) {
                    for (const artistData of spotifyResponse.data) {
                        const artistName = artistData.name;
                        const tracks = artistData.tracks || [];
    
                        for (const track of tracks) {
                            let existingSong = await Songs.findOne({
                                name: track.name,
                                'artists.name': artistName
                            });
    
                            if (!existingSong) {
                                const songDoc = await Songs.create({
                                   ...track,
                                    idArtist: [] // Inicializar como un array vacío
                                });
    
                                let existingArtist = await Artist.findOne({ name: artistName });
                                if (!existingArtist) {
                                    existingArtist = new Artist({
                                        name: artistName,
                                        genres: artistData.genres,
                                        image: artistData.image,
                                        popularity: artistData.popularity
                                    });
                                    await existingArtist.save(); // Guardar el nuevo artista en la base de datos
    
                                    songDoc.idArtist.push(existingArtist._id);
                                }
    
                                await songDoc.save();
                            }
                        }
                    }
                } else {
                    console.error('Error fetching songs from Spotify:', spotifyResponse.error);
                    return res.status(500).json({ message: 'Failed to fetch songs from Spotify' });
                }
            }
    
            // Recargar las canciones de la base de datos para incluir las recién guardadas
            dbSongs = await Songs.find({ name: { $regex: regex }}).skip(skipAmount).limit(limit);
    
            // Finalmente, retorna todas las canciones encontradas o añadidas
            return res.json({ Songs: dbSongs });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}

export default SongsByArtistController;