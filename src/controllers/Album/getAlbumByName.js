import Album from '../../models/Album.js'; // Asegúrate de que la ruta sea correcta
import Songs from '../../models/Songs.js'; // Importar el modelo Songs
import Artist from '../../models/Artist.js'; // Importar el modelo Artist
import Spotify from '../../components/Spotify.js'; // Asegúrate de que la ruta sea correcta

class AlbumsController {
    constructor() {
        this.Spotify = new Spotify();
    }

    async getAlbumsByName(req, res) {
        const { name } = req.query; // Cambiado para usar req.query
        const offset = req.query.offset || '0';
        const limit = req.query.limit || '10';

        if (!name) {
            console.error('El nombre del álbum es requerido');
            return res.status(400).json({
                message: {
                    description: 'El nombre del álbum es requerido',
                    code: 2
                },
                data: {}
            });
        }

        console.log(`Buscando álbumes por nombre: ${name}, offset: ${offset}, limit: ${limit}`);

        try {
            console.log('Consultando álbumes en la base de datos local...');
            let albumsFromDB = await Album.find({ name: { $regex: new RegExp(name, 'i') }})
              .skip(parseInt(offset))
              .limit(parseInt(limit))
              .populate('tracks', 'name duration image') // Corregido para usar 'tracks' en lugar de 'idSong'
              .exec();

            console.log(`Álbumes obtenidos de la base de datos: ${albumsFromDB.length}`);

            let totalFromDB = albumsFromDB.length;

            console.log(`Total de álbumes desde la base de datos: ${totalFromDB}`);

            let combinedAlbums = albumsFromDB;

            if (totalFromDB < parseInt(limit)) {
                const remaining = parseInt(limit) - totalFromDB;
                console.log(`Faltan ${remaining} álbumes, consultando a Spotify...`);

                const spotifyAlbums = await this.Spotify.getAlbums({ by: 'name', param: name, limit: remaining, offset: offset });
                console.log(`Álbumes obtenidos de Spotify: ${spotifyAlbums.length}`);

                for (const spotifyAlbum of spotifyAlbums) {
                    const trackIds = [];

                    for (const track of spotifyAlbum.tracks) {
                        let existingSong = await Songs.findOne({ name: track.name });
                        if (!existingSong) {
                            const newSong = new Songs({
                                name: track.name,
                                genres: track.genre,
                                duration: track.duration,
                                image: track.image,
                                url_cancion: track.url,
                                idArtist: track.idArtist
                            });
                            await newSong.save();
                            trackIds.push(newSong._id);
                        } else {
                            trackIds.push(existingSong._id);
                        }
                    }

                    const artistIds = [];
                    for (const artist of spotifyAlbum.artists) {
                        let existingArtist = await Artist.findOne({ name: artist.name });
                        if (!existingArtist) {
                            const newArtist = new Artist({
                                name: artist.name,
                                genres: artist.genres,
                                image: artist.image,
                                popularity: artist.popularity
                            });
                            await newArtist.save();
                            artistIds.push(newArtist._id);
                        } else {
                            artistIds.push(existingArtist._id);
                        }
                    }

                    const newAlbum = new Album({
                        idAlbum: spotifyAlbum.id, // Asegúrate de que esto se asigna correctamente
                        name: spotifyAlbum.name,
                        tracks: trackIds,
                        genre: spotifyAlbum.genres,
                        image: spotifyAlbum.image,
                        idArtist: artistIds // Manejado correctamente como ObjectIds
                    });

                    try {
                        await newAlbum.save();
                        console.log(`Álbum guardado en la base de datos: ${newAlbum.name}`);
                        combinedAlbums.push(newAlbum); // Asegúrate de hacer push del álbum solo después de guardar
                    } catch (error) {
                        console.error(`Error al guardar el álbum ${spotifyAlbum.name} en la base de datos: ${error}`);
                    }
                }
                console.log(`Total de álbumes combinados: ${combinedAlbums.length}`);
            } else {
                console.log(`Usando solo álbumes de la base de datos.`);
            }

            const responseAlbums = combinedAlbums.map(album => ({
                name: album.name,
                duration: (album.tracks || []).reduce((acc, track) => acc + track.duration, 0) / (album.tracks || []).length,
                genres: album.genre || [],
                image: album.image,
                Artist: (album.idArtist || []).map(artist => artist.name)
            }));

            console.log('Respuesta preparada para enviar:', responseAlbums);

            res.json({
                message: {
                    description: "Se obtuvieron los álbumes correctamente",
                    code: 0
                },
                data: responseAlbums
            });
        } catch (error) {
            console.error('Error en getAlbumsByName:', error);
            res.status(500).json({
                message: {
                    description: 'Error interno del servidor',
                    code: 1
                },
                data: {}
            });
        }
    }
}

export default AlbumsController;
