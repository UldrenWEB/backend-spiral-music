import Playlist from '../../models/Playlist.js';

export const modifyPlaylist = async (req, res) => {
    try {
        // Extraer la playlist a modificar
        const { idPlaylist, name, image, idSong } = req.body;
        const playlist = await Playlist.findById(idPlaylist);

        if (!playlist) {
            return res.status(404).json({ message: { code: 404, description: 'Playlist no encontrada' } });
        }

        // Modificar la playlist
        playlist.name = name;
        playlist.image = image;
        playlist.idSong = idSong;

        // Guardar la playlist modificada
        const savedPlaylist = await playlist.save();

        // Formatear la respuesta según las nuevas especificaciones
        const response = {
            message: {
                code: 200,
                description: 'Playlist modificada correctamente'
            },
            data: {
                playlist: savedPlaylist
            }
        };

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: { code: 500, description: 'Error interno del servidor' }, error: error.message });
    }
}